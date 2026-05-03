import { iconPath, imagePath } from '../config/assets-paths.js';

/**
 * @param {number | number[]} priceRub
 * @returns {string}
 */
function formatPriceRub(priceRub) {
  if (typeof priceRub === 'number' && Number.isFinite(priceRub)) {
    return `${priceRub}\u00a0₽`;
  }
  if (Array.isArray(priceRub) && priceRub.length) {
    return `${priceRub.join(' / ')}\u00a0₽`;
  }
  return '';
}

/**
 * @param {HTMLElement} row
 * @param {{ name: string, description?: string, priceRub?: number | number[], noteRu?: string, tags?: string[] }} item
 */
function appendMenuItem(row, item) {
  const main = document.createElement('div');
  main.className = 'menu-item__main';

  const nameEl = document.createElement('span');
  nameEl.className = 'menu-item__name';
  nameEl.textContent = item.name;

  main.appendChild(nameEl);

  if (item.description) {
    const desc = document.createElement('span');
    desc.className = 'menu-item__desc';
    desc.textContent = item.description;
    main.appendChild(desc);
  }

  if (item.noteRu) {
    const note = document.createElement('span');
    note.className = 'menu-item__note';
    note.textContent = item.noteRu;
    main.appendChild(note);
  }

  row.appendChild(main);

  const priceStr = formatPriceRub(item.priceRub);
  if (priceStr) {
    const price = document.createElement('span');
    price.className = 'menu-item__price';
    price.textContent = priceStr;
    price.setAttribute('aria-label', `цена ${priceStr.replace(/\u00a0/g, ' ')}`);
    row.appendChild(price);
  }
}

/**
 * @param {HTMLElement} list
 * @param {Array<{ name: string, description?: string, priceRub?: number | number[], noteRu?: string, tags?: string[] }>} items
 */
function renderItemRows(list, items) {
  (items || []).forEach((item) => {
    const li = document.createElement('li');
    li.className = 'menu-item';
    appendMenuItem(li, item);
    list.appendChild(li);
  });
}

/**
 * @param {ParentNode} article
 * @param {{ title: string, iconFile?: string, noteRu?: string, items?: unknown[] }} subsection
 */
function renderSubsection(article, subsection) {
  const wrap = document.createElement('div');
  wrap.className = 'menu-subsection';

  if (subsection.iconFile) {
    const headRow = document.createElement('div');
    headRow.className = 'menu-subsection__head';
    const subIcon = document.createElement('img');
    subIcon.className = 'menu-subsection__icon';
    subIcon.src = iconPath(subsection.iconFile);
    subIcon.alt = '';
    subIcon.loading = 'lazy';
    subIcon.decoding = 'async';
    headRow.appendChild(subIcon);
    const h4 = document.createElement('h4');
    h4.className = 'menu-subsection__title';
    h4.textContent = subsection.title;
    headRow.appendChild(h4);
    wrap.appendChild(headRow);
  } else {
    const h4 = document.createElement('h4');
    h4.className = 'menu-subsection__title';
    h4.textContent = subsection.title;
    wrap.appendChild(h4);
  }

  if (subsection.noteRu) {
    const p = document.createElement('p');
    p.className = 'menu-subsection__note';
    p.textContent = subsection.noteRu;
    wrap.appendChild(p);
  }

  const list = document.createElement('ul');
  list.className = 'menu-item-list';
  renderItemRows(list, subsection.items || []);
  wrap.appendChild(list);

  article.appendChild(wrap);
}

/**
 * @param {HTMLElement | null} container
 * @param {{ section?: { heading?: string, calloutRu?: string }, categories?: unknown[] }} catalog
 */
export function renderMenu(container, catalog) {
  if (!container || !catalog || !catalog.categories) return;

  const panel = document.createElement('div');
  panel.className = 'menu-panel';

  catalog.categories.forEach((cat) => {
    const hasItems = (cat.items && cat.items.length) || (cat.subsections && cat.subsections.length);
    if (!hasItems) return;

    const article = document.createElement('article');
    article.className = 'menu-category';
    article.id = `menu-cat-${cat.id}`;

    const layoutTwoColLeft = cat.layout === 'two-col-left';
    if (layoutTwoColLeft) {
      article.classList.add('menu-category--layout-two-col-left');
    }

    const bgFile = typeof cat.backgroundImage === 'string' ? cat.backgroundImage.trim() : '';
    if (bgFile) {
      const url = imagePath(`menu/${bgFile}`);
      article.style.setProperty('--menu-category-bg-image', `url('${url}')`);
    }

    const bg = document.createElement('div');
    bg.className = 'menu-category__bg';
    bg.setAttribute('aria-hidden', 'true');

    const overlay = document.createElement('div');
    overlay.className = 'menu-category__overlay';
    overlay.setAttribute('aria-hidden', 'true');

    const inner = document.createElement('div');
    inner.className = 'menu-category__inner';

    const omitLeadingIcon = cat.omitLeadingIcon === true;
    if (omitLeadingIcon) {
      article.classList.add('menu-category--no-leading-icon');
    } else {
      const iconFile = cat.iconFile;
      if (iconFile) {
        const icon = document.createElement('img');
        icon.className = 'menu-category__icon';
        icon.src = iconPath(iconFile);
        icon.alt = '';
        icon.loading = 'lazy';
        icon.decoding = 'async';
        inner.appendChild(icon);
      } else {
        const iconPh = document.createElement('span');
        iconPh.className = 'menu-category__icon-placeholder';
        iconPh.setAttribute('aria-hidden', 'true');
        inner.appendChild(iconPh);
      }
    }

    const head = document.createElement('div');
    head.className = 'menu-category__head';

    const title = document.createElement('h3');
    title.className = 'menu-category__title';
    title.id = `menu-cat-title-${cat.id}`;
    title.textContent = cat.title;
    head.appendChild(title);

    if (cat.subtitle) {
      const sub = document.createElement('p');
      sub.className = 'menu-category__subtitle';
      sub.textContent = cat.subtitle;
      head.appendChild(sub);
    }

    inner.appendChild(head);

    if (cat.categoryNoteRu) {
      const cn = document.createElement('p');
      cn.className = 'menu-category__note';
      cn.textContent = cat.categoryNoteRu;
      inner.appendChild(cn);
    }

    article.setAttribute('aria-labelledby', `menu-cat-title-${cat.id}`);

    if (cat.subsections && cat.subsections.length) {
      cat.subsections.forEach((sub) => renderSubsection(inner, sub));
    } else {
      const list = document.createElement('ul');
      list.className = 'menu-item-list';
      renderItemRows(list, cat.items || []);
      inner.appendChild(list);
    }

    if (layoutTwoColLeft) {
      const card = document.createElement('div');
      card.className = 'menu-category__card';
      card.append(bg, overlay, inner);
      article.appendChild(card);

      const asideFile = typeof cat.asideLogoFile === 'string' ? cat.asideLogoFile.trim() : '';
      if (asideFile) {
        const aside = document.createElement('div');
        aside.className = 'menu-category__aside';
        const mark = document.createElement('img');
        mark.className = 'menu-category__aside-logo';
        mark.src = iconPath(asideFile);
        mark.alt = '';
        mark.decoding = 'async';
        mark.loading = 'lazy';
        aside.appendChild(mark);
        article.appendChild(aside);
      }
    } else {
      article.append(bg, overlay, inner);
    }
    panel.appendChild(article);
  });

  container.replaceChildren(panel);
}
