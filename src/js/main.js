// ==========================================================================
// MAIN APP ORCHESTRATOR - ATELIER DAVID BOINNARD
// ==========================================================================

import { initI18n, setLang, getLang } from './i18n.js';
import { initCatalog } from './catalog.js';
import { initGlossary } from './glossary.js';
import { initModal } from './modal.js';
import { initContact } from './contact.js';
import { renderInstrumentVideos, renderVideoLinks } from './videos.js';
import { renderInstrumentImage } from './images.js';

let siteData = null;
let allNewsVisible = false;

async function bootstrap() {
  try {
    const res = await fetch('./data/site_data.json');
    siteData = await res.json();

    // Initialize modules
    initI18n();
    initModal();
    initContact();

    // Render dynamic sections
    renderActualites(siteData.news);
    renderDisponibles(siteData.available);
    renderPublications(siteData.publications);
    renderPartenaires(siteData.partners);

    // Initialize interactive search & filter controllers
    initCatalog(siteData.catalog);
    initGlossary(siteData.glossary);

    // Setup global UI listeners
    setupHeaderScroll();
    setupMobileMenu();
    setupLanguageSwitcher();
    setupBackToTop();

  } catch (err) {
    console.error("Failed to load site data:", err);
  }
}

// 1. Render Actualités
function renderActualites(newsList) {
  const container = document.getElementById('actualites-grid');
  if (!container || !newsList) return;

  const lang = getLang();

  const visibleNews = allNewsVisible ? newsList : newsList.slice(0, 3);
  container.innerHTML = visibleNews.map(item => `
    <article class="actu-card">
      <div class="actu-media">
        ${renderInstrumentImage(item, 'actu-img', lang)}
        <span class="actu-date-badge">${item.date}</span>
        ${item.badge ? `<span class="actu-status-badge">${item.badge}</span>` : ''}
      </div>
      <div class="actu-body">
        <h3 class="actu-title">${item.title}</h3>
        <p class="actu-desc">${item.description}</p>
        ${renderInstrumentVideos(item, lang)}
        <div class="actu-footer">
          ${item.link_pdf ? `
            <a href="${item.link_pdf}" class="btn btn-sm btn-outline" target="_blank" rel="noopener">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>
              <span>${lang === 'fr' ? 'Fiche PDF' : 'PDF Sheet'}</span>
            </a>
          ` : `<span></span>`}
          <a href="#contact" class="btn btn-sm btn-gold news-contact-btn">
            ${lang === 'fr' ? 'Se renseigner' : 'Inquire'}
          </a>
        </div>
      </div>
    </article>
  `).join('');
  container.querySelectorAll('.news-contact-btn').forEach((button, index) => {
    button.addEventListener('click', () => window.prefillContactSubject(visibleNews[index].title));
  });

  let moreButton = document.getElementById('news-show-more');
  if (newsList.length > 3) {
    if (!moreButton) {
      moreButton = document.createElement('button');
      moreButton.id = 'news-show-more';
      moreButton.type = 'button';
      moreButton.className = 'btn btn-outline news-more';
      moreButton.setAttribute('aria-controls', container.id);
      container.after(moreButton);
    }
    moreButton.textContent = allNewsVisible
      ? (lang === 'fr' ? 'Réduire les actualités' : 'Show fewer news items')
      : (lang === 'fr' ? 'Toutes les actualités' : 'All workshop news');
    moreButton.setAttribute('aria-expanded', String(allNewsVisible));
    moreButton.onclick = () => {
      allNewsVisible = !allNewsVisible;
      renderActualites(newsList);
      if (!allNewsVisible) container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
  }
}

// 2. Render Disponibles (Showroom Vente / Location)
function renderDisponibles(availableList) {
  const container = document.getElementById('disponibles-list');
  if (!container || !availableList) return;

  const lang = getLang();

  container.innerHTML = availableList.map(item => {
    const isRent = item.type.toLowerCase().includes('location');
    const badgeText = isRent ? (lang === 'fr' ? 'Disponible à la location' : 'Available for rental') : (lang === 'fr' ? 'Disponible à la vente' : 'For sale');
    const badgeClass = isRent ? 'badge-rent' : 'badge-sale';
    const details = (lang === 'en' && item.details_en) ? item.details_en : item.details_fr;

    return `
      <article class="disp-card ${isRent ? 'rent-card' : ''}">
        <div class="disp-media">
          ${renderInstrumentImage(item, 'disp-img', lang)}
          <div class="disp-badge-corner ${badgeClass}">${badgeText}</div>
        </div>
        <div class="disp-info">
          <div class="disp-header">
            <div>
              <span class="badge badge-gold" style="margin-bottom: 0.5rem;">${item.numero || 'Facture d’art'}</span>
              <h3 class="disp-title">${item.titre}</h3>
              <p class="disp-subtitle">${item.sous_titre}</p>
            </div>
            <div class="disp-price-tag">${item.prix}</div>
          </div>
          <ul class="disp-specs-list">
            ${details.map(spec => `<li class="disp-spec-item">${spec}</li>`).join('')}
          </ul>
          ${renderInstrumentVideos(item, lang)}
          <div class="disp-actions">
            <button class="btn btn-gold disp-reserve-btn" type="button">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
              <span>${lang === 'fr' ? 'Réserver / Essayer à l’Atelier' : 'Reserve / Workshop Trial'}</span>
            </button>
            <a href="#contact" class="btn btn-outline disp-question-btn">
              ${lang === 'fr' ? 'Poser une question' : 'Ask a question'}
            </a>
          </div>
        </div>
      </article>
    `;
  }).join('');
  container.querySelectorAll('.disp-card').forEach((card, index) => {
    const item = availableList[index];
    card.querySelector('.disp-reserve-btn').addEventListener('click', () => {
      window.prefillContactSubject(`${item.titre} (${item.numero})`);
    });
    card.querySelector('.disp-question-btn').addEventListener('click', () => {
      window.prefillContactSubject(`Informations sur ${item.titre}`);
    });
  });
}

// 3. Render Publications
function renderPublications(pubsList) {
  const container = document.getElementById('publications-grid');
  if (!container || !pubsList) return;

  const lang = getLang();

  container.innerHTML = pubsList.map(pub => {
    let actionButtons = '';
    if (pub.pdf) {
      actionButtons += `
        <a href="${pub.pdf}" class="btn btn-sm btn-gold" target="_blank" rel="noopener">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          <span>${lang === 'fr' ? 'Télécharger PDF' : 'Download PDF'}</span>
        </a>
      `;
    }
    if (pub.pdf_list) {
      pub.pdf_list.forEach(item => {
        actionButtons += `
          <a href="${item.file}" class="btn btn-sm btn-outline" target="_blank" rel="noopener">
            ${item.name} (PDF)
          </a>
        `;
      });
    }
    actionButtons += renderVideoLinks(pub, lang, { publication: true });

    return `
      <article class="pub-card">
        <div class="pub-media">
          <img class="pub-img" src="${pub.image || 'anim-index.gif'}" alt="${pub.title}" loading="lazy" />
          <span class="pub-year-badge">${pub.year}</span>
        </div>
        <div class="pub-body">
          <span class="pub-type">${pub.type}</span>
          <h3 class="pub-title">${pub.title}</h3>
          <p class="pub-desc">${pub.description}</p>
          <div class="pub-actions">
            ${actionButtons}
          </div>
        </div>
      </article>
    `;
  }).join('');
}

// 4. Render Partenaires
function renderPartenaires(partnersList) {
  const container = document.getElementById('partenaires-grid');
  if (!container || !partnersList) return;

  const lang = getLang();

  container.innerHTML = partnersList.map(partner => `
    <a href="${partner.url}" class="partner-card" target="_blank" rel="noopener">
      <div class="partner-header">
        <span class="partner-category">${partner.cat}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
      </div>
      <h3 class="partner-name">${partner.name}</h3>
      <p class="partner-desc">${partner.desc}</p>
      <span class="partner-link-text">
        <span>${lang === 'fr' ? 'Découvrir le site' : 'Visit website'}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
      </span>
    </a>
  `).join('');
}

// 5. Setup Header Scroll Effect
function setupHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const links = [...document.querySelectorAll('.main-nav .nav-link, .mobile-drawer .nav-link')];
  const sections = [...document.querySelectorAll('main > section[id]')];
  let scheduled = false;
  const update = () => {
    scheduled = false;
    header.classList.toggle('scrolled', window.scrollY > 40);
    const threshold = header.offsetHeight + 80;
    let activeId = 'accueil';
    for (const section of sections) {
      if (section.getBoundingClientRect().top <= threshold) activeId = section.id;
    }
    for (const link of links) {
      const active = link.hash === `#${activeId}`;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  };
  window.addEventListener('scroll', () => {
    if (!scheduled) { scheduled = true; requestAnimationFrame(update); }
  }, { passive: true });
  update();
}

// 6. Setup Mobile Drawer Menu
function setupMobileMenu() {
  const toggleBtn = document.querySelector('.mobile-toggle');
  const drawer = document.querySelector('.mobile-drawer');
  if (!toggleBtn || !drawer) return;

  let previousOverflow = '';
  drawer.id ||= 'mobile-navigation';
  drawer.setAttribute('role', 'navigation');
  drawer.setAttribute('aria-hidden', 'true');
  drawer.inert = true;
  toggleBtn.setAttribute('aria-controls', drawer.id);
  toggleBtn.setAttribute('aria-expanded', 'false');

  const setOpen = (isOpen, restoreFocus = false) => {
    if (isOpen) previousOverflow = document.body.style.overflow;
    drawer.classList.toggle('open', isOpen);
    toggleBtn.classList.toggle('open', isOpen);
    toggleBtn.setAttribute('aria-expanded', String(isOpen));
    drawer.setAttribute('aria-hidden', String(!isOpen));
    drawer.inert = !isOpen;
    document.body.style.overflow = isOpen ? 'hidden' : previousOverflow;

    if (isOpen) drawer.querySelector('a[href]')?.focus();
    else if (restoreFocus) toggleBtn.focus({ preventScroll: true });
  };

  toggleBtn.addEventListener('click', () => setOpen(!drawer.classList.contains('open')));

  // Close when clicking nav links
  drawer.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      setOpen(false);
      const target = document.getElementById(link.hash.slice(1));
      if (target) {
        if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      }
    });
  });

  document.addEventListener('keydown', (event) => {
    if (!drawer.classList.contains('open')) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      setOpen(false, true);
    } else if (event.key === 'Tab') {
      const controls = [toggleBtn, ...drawer.querySelectorAll('a[href], button:not([disabled])')];
      const currentIndex = controls.indexOf(document.activeElement);
      const nextIndex = (currentIndex + (event.shiftKey ? -1 : 1) + controls.length) % controls.length;
      event.preventDefault();
      controls[nextIndex].focus();
    }
  });

  window.addEventListener('resize', () => {
    if (drawer.classList.contains('open') && getComputedStyle(toggleBtn).display === 'none') {
      const focusWasInside = drawer.contains(document.activeElement);
      setOpen(false);
      if (focusWasInside) document.querySelector('.main-nav a[href]')?.focus({ preventScroll: true });
    }
  });
}

// 7. Setup Language Switcher
function setupLanguageSwitcher() {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const selected = btn.dataset.lang;
      setLang(selected);
      // Re-render components with translated static strings
      if (siteData) {
        renderActualites(siteData.news);
        renderDisponibles(siteData.available);
        renderPublications(siteData.publications);
        renderPartenaires(siteData.partners);
        initCatalog(siteData.catalog);
        initGlossary(siteData.glossary);
      }
    });
  });
}

// 8. Setup Back to Top
function setupBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (btn) {
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}

// Start
document.addEventListener('DOMContentLoaded', bootstrap);
