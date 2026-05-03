# ☕ Нервная Лола - Веб-сайт кофейни

<img src="assets/images/logo.png" alt="Нервная Лола" width="200"/>

Современный, стильный и многоязычный веб-сайт для кофейни "Нервная Лола" с уникальной атмосферой и золотыми акцентами.

## 🌟 Особенности

- ✨ **Креативные анимации** - GSAP-powered анимации и интерактивные эффекты
- 🌍 **Многоязычность** - Поддержка русского, английского и китайского языков
- 📱 **Адаптивный дизайн** - Идеально работает на всех устройствах
- 🎨 **Современный UI/UX** - Элегантный дизайн с золотыми акцентами
- 🚀 **Оптимизированная производительность** - Быстрая загрузка и плавная работа
- ♿ **Доступность** - Соответствие стандартам WCAG

## 🚀 Быстрый старт

### Предварительные требования

- Node.js (версия 14 или выше)
- npm или yarn

### Установка

1. Клонируйте репозиторий:
```bash
git clone <repository-url>
cd nervouslola-website
```

2. Установите зависимости:
```bash
npm install
```

3. Запустите локальный сервер разработки:
```bash
npm run dev
```

4. Откройте браузер по адресу `http://localhost:8080`

## 📦 Сборка для продакшена

Создайте оптимизированную сборку:

```bash
npm run build
```

Результат будет в папке `dist/`

## 🛠️ Технологический стек

### Frontend
- **HTML5** - Семантическая разметка
- **CSS3** - ITCSS архитектура, CSS Custom Properties
- **JavaScript (ES6+)** - Модульная структура
- **GSAP** - Анимации и интерактивность

### Сборка и инструменты
- **Webpack 5** - Сборщик модулей
- **Babel** - Транспиляция ES6+
- **PostCSS** - Обработка CSS
- **Stylelint** - Линтинг CSS
- **ESLint** - Линтинг JavaScript

### Оптимизация
- **Image optimization** - Автоматическая оптимизация изображений
- **CSS minification** - Минификация и оптимизация CSS
- **JS minification** - Минификация и обфускация JavaScript
- **Critical CSS** - Извлечение критического CSS

## 📂 Структура проекта

```
nervouslola-website/
├── index.html              # Главная страница
├── package.json            # Зависимости и скрипты
├── webpack.config.js       # Конфигурация Webpack
├── .gitignore             # Git исключения
├── README.md              # Этот файл
│
├── assets/                # Ресурсы проекта
│   ├── css/              # Стили (ITCSS архитектура)
│   │   ├── main.css      # Точка входа CSS
│   │   ├── variables.css # CSS переменные
│   │   ├── animations.css
│   │   ├── breakpoints.css
│   │   ├── components/   # Компоненты
│   │   └── itcss/        # ITCSS слои
│   │
│   ├── js/               # JavaScript
│   │   ├── main.js       # Точка входа JS
│   │   ├── modules/      # Модули
│   │   └── fallback.js   # Фолбэки
│   │
│   ├── images/           # Изображения
│   ├── videos/           # Видео
│   ├── fonts/            # Шрифты
│   └── data/             # Данные (переводы)
│       └── translations/ # JSON файлы переводов
│
├── docs/                 # Документация
│   ├── README.md
│   ├── architecture/     # Техническая документация
│   ├── implementation/   # Отчеты о реализации
│   ├── reports/         # QA отчеты
│   └── reflection/      # Рефлексия проекта
│
├── demos/               # Демо и тесты
│   ├── effects/        # Демо эффектов
│   ├── menu-variants/  # Варианты меню
│   └── tests/          # Тестовые страницы
│
├── scripts/            # Утилиты и скрипты
│   ├── optimize-*.js   # Скрипты оптимизации
│   ├── *-analyzer.js   # Анализаторы
│   └── *-test.js       # Тестовые скрипты
│
└── dist/               # Production сборка (генерируется)
```

## 📜 Доступные скрипты

### Разработка
```bash
npm run dev              # Запуск dev-сервера
npm run build:dev        # Dev-сборка
```

### Production
```bash
npm run build            # Production сборка
npm run production:build # Сборка + полное тестирование
```

### Линтинг и проверка качества
```bash
npm run lint:css         # Проверка CSS
npm run lint:css:fix     # Исправление CSS
npm run analyze:css      # Анализ CSS
npm run test:html        # Валидация HTML
npm run test:js          # Анализ JavaScript
npm run qa:full          # Полное тестирование
```

### Оптимизация
```bash
npm run optimize:images  # Оптимизация изображений
npm run optimize:css     # Оптимизация CSS
npm run optimize:js      # Оптимизация JavaScript
npm run optimize:all     # Оптимизация всего
npm run css:extract-critical # Извлечение критического CSS
```

## 🌍 Многоязычность

Сайт поддерживает три языка:
- 🇷🇺 Русский (по умолчанию)
- 🇬🇧 English
- 🇨🇳 中文 (Китайский)

Переводы хранятся в `assets/data/translations/`:
- `ru.json` - Русский
- `en.json` - English
- `zh.json` - 中文

### Добавление нового языка

1. Создайте новый JSON файл в `assets/data/translations/`
2. Скопируйте структуру из существующего файла
3. Переведите все ключи
4. Добавьте язык в переключатель в `index.html`

## 🎨 CSS Архитектура (ITCSS)

Проект использует ITCSS (Inverted Triangle CSS) методологию:

1. **Settings** - Переменные и настройки
2. **Tools** - Миксины и функции
3. **Generic** - Сброс стилей и нормализация
4. **Elements** - Базовые HTML элементы
5. **Objects** - Объекты компоновки
6. **Components** - Компоненты UI
7. **Utilities** - Утилитарные классы

## 📱 Основные компоненты

- **Navigation** - Адаптивная навигация с мобильным меню
- **Hero Section** - Главный баннер с видео
- **Carousel** - Карусель отзывов с автопрокруткой
- **Menu** - Интерактивное меню кофейни
- **Contact Form** - Форма обратной связи
- **Maps** - Интеграция с картами
- **Footer** - Подвал с контактами и соцсетями
- **Language Switcher** - Переключатель языков

## 🧪 Тестирование

Запустите полный набор тестов:

```bash
npm run qa:full
```

Это включает:
- ✅ Валидацию HTML
- ✅ Линтинг CSS
- ✅ Анализ JavaScript
- ✅ Тесты производительности
- ✅ Проверку безопасности
- ✅ Тесты доступности

## 📊 Производительность

- ⚡ **First Contentful Paint**: < 1s
- ⚡ **Largest Contentful Paint**: < 2.5s
- ⚡ **First Input Delay**: < 100ms
- ⚡ **Cumulative Layout Shift**: < 0.1

## 📖 Дополнительная документация

- [Техническая документация](docs/architecture/TECHNICAL_REPORT.md)
- [Документация по реализации](docs/implementation/IMPLEMENTATION_SUMMARY.md)
- [QA отчеты](docs/reports/QA_REPORT.md)
- [Демо и примеры](demos/README.md)

## 🤝 Разработка

### Соглашения о коде

- **CSS**: BEM методология, ITCSS архитектура
- **JavaScript**: ES6+ модули, чистый функциональный стиль
- **HTML**: Семантическая разметка, доступность
- **Commits**: Conventional Commits

### Работа с Git

```bash
# Создайте ветку для новой функции
git checkout -b feature/your-feature

# Внесите изменения и закоммитьте
git add .
git commit -m "feat: add your feature"

# Push и создайте Pull Request
git push origin feature/your-feature
```

## 🐛 Известные проблемы

- Некоторые CSS селекторы имеют повышенную специфичность (не критично)
- Требуется ручная проверка анимаций на старых браузерах

## 📝 TODO

- [ ] Добавить больше тестов
- [ ] Улучшить accessibility
- [ ] Оптимизировать изображения
- [ ] Добавить Service Worker для PWA

## 📄 Лицензия

Copyright © 2025 Нервная Лола. Все права защищены.

## 👥 Авторы

Команда разработки "Нервная Лола"

## 📞 Контакты

- 🌐 Website: [nervnayalola.ru](https://nervnayalola.ru)
- 📧 Email: info@nervnayalola.ru
- 📱 WhatsApp: +7 (XXX) XXX-XX-XX

---

**Создано с ❤️ для кофейни "Нервная Лола"**

