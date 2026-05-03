/**
 * Внешние CDN не используются: иконки меню — из assets/icons репозитория.
 * Иконки контактов (Telegram, WhatsApp, звонок) — инлайн-SVG в index.html (currentColor).
 * Если появятся недостающие категории меню — зафиксируйте здесь подключаемый набор, например:
 * Font Awesome 6 (cdnjs): https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css
 */
export const EXTERNAL_ASSETS_DOC = {
  menuIcons: 'Локально: assets/icons (coffee.svg, teapot.svg, tea-cup.svg, RUM.svg, hotchoc.png, expresso.png).',
  contactIcons: 'Инлайн SVG в contacts.js; URL — contact-links.js.',
  backupIconsNote:
    'Папка backup_icons в текущей рабочей копии отсутствует; при появлении в репозитории приоритет — согласовать пути в ASSETS и site-content.json.'
};
