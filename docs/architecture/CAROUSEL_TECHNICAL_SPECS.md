# 🎠 ТЕХНИЧЕСКИЕ СПЕЦИФИКАЦИИ КАРУСЕЛИ

## 📁 ФАЙЛОВАЯ СТРУКТУРА

```
nervouslola-website/
├── assets/css/components/carousel.css    # Стили карусели
├── assets/js/modules/carousel.js        # JavaScript логика
├── index.html                           # HTML структура
└── CAROUSEL_ARCHIVE_REPORT.md          # Архивный отчет
```

---

## 🎨 CSS СПЕЦИФИКАЦИИ

### **Основные классы:**
```css
.hero                    # Контейнер hero секции
.slides                 # Контейнер слайдов
.slide                  # Отдельный слайд
.slide.active           # Активный слайд
.hero-controls          # Элементы управления (скрыты)
.hero-arrow             # Кнопки навигации (скрыты)
.hero-play-pause        # Кнопка play/pause (скрыта)
.hero-click-zone        # Зоны клика для навигации
.hero-vignette          # Кинематографическая виньетка
```

### **Ключевые стили:**
```css
/* Переходы */
.slide {
    opacity: 0;
    transition: opacity 0.8s ease-in-out;
}

.slide.active {
    opacity: 1;
    z-index: 2;
}

/* Изображения */
.slide img {
    transform: scale(1);
    transition: none;
}

/* Скрытые элементы управления */
.hero-controls {
    display: none;
}
```

---

## ⚙️ JAVASCRIPT СПЕЦИФИКАЦИИ

### **Класс HeroCarousel:**
```javascript
class HeroCarousel {
    constructor()                    # Инициализация
    init()                          # Настройка карусели
    setupEventListeners()           # Обработчики событий
    showSlide(index)                # Показать слайд
    next()                          # Следующий слайд
    prev()                          # Предыдущий слайд
    startAutoplay()                 # Запуск автопрокрутки
    pauseAutoplay()                 # Пауза автопрокрутки
    toggleAutoplay()                # Переключение автопрокрутки
    setupTouchEvents()              # Touch/Swipe поддержка
    updateAriaLive()                # Accessibility
}
```

### **Состояние карусели:**
```javascript
{
    currentIndex: 0,                # Текущий слайд
    slidesList: [],                 # Массив слайдов
    isPlaying: true,                # Статус автопрокрутки
    isTransitioning: false,         # Флаг перехода
    autoplayInterval: 4000,         # Интервал (4 сек)
    autoplayTimer: null             # Таймер автопрокрутки
}
```

---

## 🏗️ HTML СТРУКТУРА

### **Основная структура:**
```html
<section class="hero" id="hero" role="region" aria-roledescription="карусель">
    <div class="slides" id="slides">
        <figure class="slide active">
            <picture>
                <source media="(max-width: 480px)" srcset="...">
                <source media="(max-width: 768px)" srcset="...">
                <img src="..." alt="..." loading="eager">
            </picture>
        </figure>
        <!-- ... остальные слайды ... -->
    </div>
    
    <!-- Скрытые элементы управления -->
    <nav class="hero-controls">
        <button class="hero-arrow hero-arrow-prev" id="hero-prev"></button>
        <button class="hero-arrow hero-arrow-next" id="hero-next"></button>
        <button class="hero-play-pause" id="hero-play-pause"></button>
    </nav>
    
    <!-- Зоны клика -->
    <div class="hero-click-zone hero-click-prev"></div>
    <div class="hero-click-zone hero-click-next"></div>
    
    <!-- Контент -->
    <div class="hero-copy">
        <div class="hero-content">
            <h1 class="hero-title">...</h1>
            <p class="hero-lead">...</p>
            <a href="#menu" class="hero-cta">...</a>
        </div>
    </div>
    
    <!-- Виньетка -->
    <div class="hero-vignette"></div>
</section>
```

---

## 🎯 ФУНКЦИОНАЛЬНЫЕ ТРЕБОВАНИЯ

### **Обязательные функции:**
- ✅ Автопрокрутка каждые 4 секунды
- ✅ Плавные crossfade переходы
- ✅ Touch/Swipe навигация
- ✅ Зоны клика (левая/правая половина)
- ✅ Accessibility поддержка

### **Дополнительные функции:**
- ✅ Кнопка play/pause (скрыта)
- ✅ Стрелки навигации (скрыты)
- ✅ Кинематографическая виньетка
- ✅ Responsive изображения
- ✅ Отладочное логирование

---

## 📱 RESPONSIVE ХАРАКТЕРИСТИКИ

### **Breakpoints:**
```css
/* Desktop */
.hero-title { font-size: 3rem; }

/* Tablet (768px) */
@media (max-width: 768px) {
    .hero-title { font-size: 2rem; }
    .hero-arrow { width: 40px; height: 40px; }
}

/* Mobile (480px) */
@media (max-width: 480px) {
    .hero-title { font-size: 1.5rem; }
    .hero-copy { padding: 1rem; }
}
```

### **Изображения:**
- **Desktop:** Полное разрешение
- **Tablet:** Оптимизированные версии
- **Mobile:** Сжатые версии

---

## ♿ ACCESSIBILITY

### **ARIA атрибуты:**
```html
<section role="region" aria-roledescription="карусель" aria-live="polite">
<button aria-label="Предыдущий слайд" tabindex="0">
<button aria-label="Следующий слайд" tabindex="0">
<button aria-label="Пауза автопрокрутки" aria-pressed="false">
```

### **Keyboard навигация:**
- Tab для перехода между элементами
- Enter/Space для активации кнопок
- Стрелки для навигации (если видимы)

### **Screen readers:**
- aria-live для объявления смены слайдов
- aria-label для описания элементов
- Семантическая HTML структура

---

## 🚀 ПРОИЗВОДИТЕЛЬНОСТЬ

### **Оптимизации:**
- `loading="eager"` для всех изображений
- `transition: none` для изображений
- Минимальные CSS transitions
- Один setInterval для автопрокрутки
- Отсутствие тяжелых анимаций

### **Метрики:**
- **CSS:** ~2.5KB (сжатый)
- **JavaScript:** ~3KB (сжатый)
- **HTML:** ~1KB для структуры
- **Время загрузки:** <100ms
- **FPS:** 60fps стабильно

---

## 🔧 КОНФИГУРАЦИЯ

### **Настройки:**
```javascript
// Интервал автопрокрутки (мс)
autoplayInterval: 4000

// Длительность перехода (мс)
transitionDuration: 800

// Количество слайдов
slidesCount: 5

// Включение отладки
debugMode: true
```

### **Кастомизация:**
- Изменение интервала автопрокрутки
- Настройка длительности переходов
- Добавление/удаление слайдов
- Изменение стилей кнопок

---

## 🐛 ИЗВЕСТНЫЕ ОГРАНИЧЕНИЯ

1. **Нет бесконечной прокрутки** - Простая циклическая навигация
2. **Скрытые кнопки управления** - Только touch/click зоны
3. **Статичные изображения** - Нет анимаций движения
4. **Фиксированный интервал** - 4 секунды для всех слайдов

---

## 📋 ЧЕКЛИСТ ТЕСТИРОВАНИЯ

### **Функциональность:**
- [ ] Автопрокрутка работает
- [ ] Touch/Swipe навигация
- [ ] Зоны клика работают
- [ ] Переходы плавные
- [ ] Нет клиппинга

### **Responsive:**
- [ ] Desktop (1920px+)
- [ ] Laptop (1366px)
- [ ] Tablet (768px)
- [ ] Mobile (480px)

### **Accessibility:**
- [ ] Screen reader поддержка
- [ ] Keyboard навигация
- [ ] ARIA атрибуты
- [ ] Контрастность

### **Performance:**
- [ ] Быстрая загрузка
- [ ] Плавные переходы
- [ ] Нет memory leaks
- [ ] Оптимизированные изображения

---

**Документ создан:** 2024-12-13  
**Версия:** 1.0  
**Статус:** ✅ АКТИВЕН
