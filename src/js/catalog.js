// ==========================================================================
// CATALOG CONTROLLER & SEARCH - ATELIER DAVID BOINNARD
// ==========================================================================

import { openModal } from './modal.js';
import { getLang } from './i18n.js';
import { renderInstrumentVideos } from './videos.js';

let allInstruments = [];
let currentPeriod = 'all';
let currentType = 'all';
let searchQuery = '';
let catalogListeners = null;
const PAGE_SIZE = 9;
let visibleCount = PAGE_SIZE;

export function initCatalog(instruments) {
  allInstruments = instruments || [];
  catalogListeners?.abort();
  catalogListeners = new AbortController();
  const { signal } = catalogListeners;
  
  const periodTabs = document.querySelectorAll('.period-tab');
  const typeFilter = document.getElementById('catalog-type-filter');
  const searchInput = document.getElementById('catalog-search-input');

  // Period tabs
  periodTabs.forEach(tab => {
    tab.setAttribute('aria-pressed', String(tab.dataset.period === currentPeriod));
    tab.addEventListener('click', () => {
      periodTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-pressed', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-pressed', 'true');
      currentPeriod = tab.dataset.period;
      visibleCount = PAGE_SIZE;
      filterAndRenderCatalog();
    }, { signal });
  });

  // Type filter
  if (typeFilter) {
    typeFilter.addEventListener('change', (e) => {
      currentType = e.target.value;
      visibleCount = PAGE_SIZE;
      filterAndRenderCatalog();
    }, { signal });
  }

  // Search input
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      visibleCount = PAGE_SIZE;
      filterAndRenderCatalog();
    }, { signal });
  }

  filterAndRenderCatalog();
}

export function filterAndRenderCatalog() {
  const grid = document.getElementById('catalog-instruments-grid');
  const counter = document.getElementById('catalog-results-count');
  if (!grid) return;

  const lang = getLang();

  // Filter instruments
  const filtered = allInstruments.filter(inst => {
    // Period filter
    if (currentPeriod !== 'all') {
      const p = inst.period.toLowerCase();
      if (currentPeriod === 'medieval' && !p.includes('médiéval') && !p.includes('medieval')) return false;
      if (currentPeriod === 'renaissance' && !p.includes('renaissance')) return false;
      if (currentPeriod === 'xvii' && !p.includes('xviie') && !p.includes('17')) return false;
      if (currentPeriod === 'xviii' && !p.includes('xviiie') && !p.includes('18')) return false;
      if (currentPeriod === 'actuel' && !p.includes('actuel') && !p.includes('midi')) return false;
    }

    // Type filter
    if (currentType !== 'all') {
      const t = (inst.type || '').toLowerCase();
      if (currentType === 'clavecin' && !t.includes('clavecin')) return false;
      if (currentType === 'clavicytherium' && !t.includes('clavicytherium')) return false;
      if (currentType === 'clavicorde' && !t.includes('clavicorde')) return false;
      if (currentType === 'epinette' && !t.includes('épinette') && !t.includes('epinette')) return false;
      if (currentType === 'virginal' && !t.includes('virginal') && !t.includes('muselaar')) return false;
      if (currentType === 'lautenwerk' && !t.includes('lautenwerk')) return false;
      if (currentType === 'midi' && !t.includes('midi') && !t.includes('contemporain')) return false;
    }

    // Search query
    if (searchQuery) {
      const fullText = `${inst.title} ${inst.number} ${inst.description} ${inst.period} ${inst.type}`.toLowerCase();
      if (!fullText.includes(searchQuery)) return false;
    }

    return true;
  });

  const visibleInstruments = filtered.slice(0, visibleCount);

  // Update counter
  if (counter) {
    counter.setAttribute('aria-live', 'polite');
    counter.textContent = lang === 'fr'
      ? `${visibleInstruments.length} sur ${filtered.length} instruments`
      : `${visibleInstruments.length} of ${filtered.length} instruments`;
  }

  // Render cards
  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-muted);">
        <p style="font-size: 1.25rem; font-family: var(--font-serif-display); margin-bottom: 0.5rem;">
          ${lang === 'fr' ? 'Aucun instrument ne correspond à vos critères.' : 'No instrument matches your criteria.'}
        </p>
        <p style="font-size: 0.9375rem;">
          ${lang === 'fr' ? 'Essayez de réinitialiser vos filtres ou de modifier votre recherche.' : 'Try resetting your filters or modifying your search query.'}
        </p>
      </div>
    `;
    return;
  }

  grid.innerHTML = visibleInstruments.map(inst => `
    <article class="catalog-card" data-id="${inst.id}">
      <div class="catalog-card-media">
        <img class="catalog-card-img" src="${inst.image || 'anim-index.gif'}" alt="${inst.title}" loading="lazy" />
        ${inst.number ? `<span class="catalog-opus-badge">${inst.number}</span>` : ''}
        <span class="catalog-period-badge">${inst.period}</span>
      </div>
      <div class="catalog-card-body">
        <h3 class="catalog-card-title">${inst.title}</h3>
        <p class="catalog-card-desc">${inst.description || (lang === 'fr' ? 'Facture d’art et restitution historique sur mesure.' : 'Bespoke fine art building and historical craft.')}</p>
        ${renderInstrumentVideos(inst, lang)}
        <div class="catalog-card-footer">
          <span class="catalog-card-price">${inst.price || (lang === 'fr' ? 'Sur demande' : 'On request')}</span>
          <div class="catalog-card-actions">
            ${inst.pdf ? `
              <a href="${inst.pdf}" class="icon-btn" title="Télécharger la Fiche PDF" target="_blank" rel="noopener">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
              </a>
            ` : ''}
            <button class="btn btn-sm btn-outline view-details-btn" type="button">
              ${lang === 'fr' ? 'Détails' : 'Details'}
            </button>
          </div>
        </div>
      </div>
    </article>
  `).join('');

  // Bind click handlers to cards
  grid.querySelectorAll('.catalog-card').forEach(cardEl => {
    cardEl.addEventListener('click', event => {
      if (event.target.closest('a')) return;
      const instId = cardEl.dataset.id;
      const found = allInstruments.find(i => i.id === instId);
      if (found) openModal(found, cardEl.querySelector('.view-details-btn'));
    });
  });

  if (visibleInstruments.length < filtered.length) {
    const more = document.createElement('div');
    more.className = 'catalog-more';
    more.style.gridColumn = '1 / -1';
    const button = document.createElement('button');
    button.className = 'btn btn-outline catalog-load-more';
    button.type = 'button';
    button.textContent = lang === 'fr' ? 'Voir plus d’instruments' : 'See more instruments';
    button.setAttribute('aria-controls', grid.id);
    button.addEventListener('click', () => {
      const firstNewIndex = visibleInstruments.length;
      visibleCount += PAGE_SIZE;
      filterAndRenderCatalog();
      grid.querySelectorAll('.view-details-btn')[firstNewIndex]?.focus({ preventScroll: true });
    });
    more.append(button);
    grid.append(more);
  }
}
