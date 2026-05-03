/**
 * Единая база путей к медиа и иконкам (относительно корня сайта).
 * Источник: реальные файлы в репозитории.
 */
export const ASSETS = {
  base: '',
  images: 'assets/images',
  imagesWebp: 'assets/images/webp',
  videos: 'assets/videos',
  icons: 'assets/icons'
};

export function imagePath(filename) {
  return `${ASSETS.images}/${filename}`;
}

export function imageWebpPath(filename) {
  return `${ASSETS.imagesWebp}/${filename}`;
}

export function videoPath(filename) {
  return `${ASSETS.videos}/${filename}`;
}

export function iconPath(filename) {
  return `${ASSETS.icons}/${filename}`;
}
