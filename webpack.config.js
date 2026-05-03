const fs = require('fs');
const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

function loadDotEnv() {
  const envPath = path.join(__dirname, '.env');
  try {
    if (!fs.existsSync(envPath)) return;
    const text = fs.readFileSync(envPath, 'utf8');
    text.split(/\r?\n/).forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eq = trimmed.indexOf('=');
      if (eq === -1) return;
      const key = trimmed.slice(0, eq).trim();
      let val = trimmed.slice(eq + 1).trim();
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1);
      }
      if (key && process.env[key] === undefined) {
        process.env[key] = val;
      }
    });
  } catch {
    /* игнорируем отсутствие или ошибку чтения .env */
  }
}

loadDotEnv();

/**
 * Канонический и og:url задаются только при сборке с HTTPS-источником, например:
 *   cross-env SITE_URL=https://example.com npm run build
 * (без завершающего слэша в SITE_URL).
 */
function sanitizeSiteUrl(raw) {
  if (!raw || typeof raw !== 'string') {
    return '';
  }
  const trimmed = raw.trim().replace(/\/+$/, '');
  if (!/^https:\/\//i.test(trimmed)) {
    return '';
  }
  try {
    const u = new URL(trimmed);
    return u.protocol === 'https:' ? trimmed : '';
  } catch {
    return '';
  }
}
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    mode: isProduction ? 'production' : 'development',
    entry: {
      main: './assets/js/main.js'
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: isProduction ? '[name].[contenthash].js' : '[name].js',
      clean: true,
      assetModuleFilename: 'assets/[name].[contenthash][ext]'
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        },
        {
          test: /\.css$/,
          use: [
            isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
            'postcss-loader'
          ]
        },
        {
          test: /\.(png|jpg|jpeg|gif|svg|webp)$/,
          type: 'asset/resource',
          generator: {
            filename: 'assets/images/[name].[contenthash][ext]'
          }
        },
        {
          test: /\.(woff|woff2|eot|ttf|otf)$/,
          type: 'asset/resource',
          generator: {
            filename: 'assets/fonts/[name].[contenthash][ext]'
          }
        }
      ]
    },
    plugins: [
      new CleanWebpackPlugin(),
      new HtmlWebpackPlugin({
        template: './index.html',
        filename: 'index.html',
        minify: isProduction ? {
          removeComments: true,
          collapseWhitespace: true,
          removeRedundantAttributes: true,
          useShortDoctype: true,
          removeEmptyAttributes: true,
          removeStyleLinkTypeAttributes: true,
          keepClosingSlash: true,
          minifyJS: true,
          minifyCSS: true,
          minifyURLs: true
        } : false
      }),
      {
        apply(compiler) {
          compiler.hooks.compilation.tap('LolaSiteUrlInject', (compilation) => {
            HtmlWebpackPlugin.getHooks(compilation).beforeEmit.tapAsync(
              'LolaSiteUrlInject',
              (data, cb) => {
                /* Для file:// — hero-carousel-inline.js; в dist остаётся только бандл Webpack (см. entry main.js). */
                data.html = data.html.replace(
                  /<script\b[^>]*\bsrc=["'](?:\.\/)?assets\/js\/hero-carousel-inline\.js["'][^>]*>\s*<\/script>/gi,
                  ''
                );

                const yandexKey = process.env.YANDEX_MAP_API_KEY || '';
                const runtimeCfg = `<script>window.__NL_ENV=window.__NL_ENV||{};window.__NL_ENV.YANDEX_MAP_API_KEY=${JSON.stringify(yandexKey)};</script>`;
                data.html = data.html.replace(/<head>/i, `<head>${runtimeCfg}`);
                data.html = data.html.replace(/<!--\s*__NL_RUNTIME_ENV_INJECT__\s*-->/g, '');

                const siteUrl = sanitizeSiteUrl(process.env.SITE_URL);
                if (siteUrl) {
                  const ld = JSON.stringify({
                    '@context': 'https://schema.org',
                    '@type': 'WebSite',
                    name: 'Нервная Лола',
                    url: `${siteUrl}/`,
                    description: 'Нервная Лола — уникальная кофейня с характером.'
                  });
                  const block = `\n    <link rel="canonical" href="${siteUrl}/">\n    <meta property="og:url" content="${siteUrl}/">\n    <script type="application/ld+json">${ld}</script>`;
                  const titleEnd = data.html.indexOf('</title>');
                  if (titleEnd !== -1) {
                    const pos = titleEnd + '</title>'.length;
                    data.html = data.html.slice(0, pos) + block + data.html.slice(pos);
                  }
                }
                cb(null, data);
              }
            );
          });
        }
      },
      ...(isProduction ? [
        new MiniCssExtractPlugin({
          filename: '[name].[contenthash].css'
        }),
        new CopyWebpackPlugin({
          patterns: [
            {
              from: 'assets',
              to: 'assets',
              noErrorOnMissing: false
            }
          ]
        })
      ] : [])
    ],
    optimization: {
      minimize: isProduction,
      minimizer: [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: isProduction, // Удаляет console.log в продакшене
              drop_debugger: isProduction,
              pure_funcs: isProduction ? ['console.log', 'console.info', 'console.debug'] : []
            },
            mangle: isProduction,
            format: {
              comments: false
            }
          },
          extractComments: false
        }),
        new CssMinimizerPlugin()
      ],
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 5,
            reuseExistingChunk: true
          }
        }
      },
      runtimeChunk: {
        name: 'runtime'
      }
    },
    devtool: isProduction ? 'source-map' : 'eval-source-map',
    devServer: {
      static: [
        {
          directory: path.join(__dirname, '.'),
          publicPath: '/'
        }
      ],
      compress: true,
      port: 8080,
      hot: true,
      open: true,
      /* Статический лендинг без клиентских маршрутов — false снижает риск отдачи index.html вместо CSS/ассетов. */
      historyApiFallback: false
    },
    performance: {
      hints: isProduction ? 'warning' : false,
      maxEntrypointSize: 512000,
      maxAssetSize: 512000
    }
  };
};
