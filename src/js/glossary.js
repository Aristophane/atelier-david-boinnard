// ==========================================================================
// GLOSSARY CONTROLLER & SEARCH - ATELIER DAVID BOINNARD
// ==========================================================================

import { getLang } from './i18n.js';

let allGlossary = [];
let currentLetter = null;
let searchQuery = '';
let glossaryListeners = null;

export function initGlossary(glossaryData) {
  allGlossary = glossaryData || [];
  const existingLetters = new Set(allGlossary.map(item => item.letter));
  currentLetter ??= existingLetters.has('A') ? 'A' : ([...existingLetters].sort()[0] || 'all');
  glossaryListeners?.abort();
  glossaryListeners = new AbortController();
  const { signal } = glossaryListeners;

  const alphaContainer = document.getElementById('alphabet-bar');
  const searchInput = document.getElementById('glossary-search-input');

  // Build alphabet bar dynamically based on existing letters
  if (alphaContainer) {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    let html = `
      <button class="alpha-letter-btn ${currentLetter === 'all' ? 'active' : ''}" data-letter="all" aria-pressed="${currentLetter === 'all'}" type="button">
        ${getLang() === 'fr' ? 'Tous' : 'All'}
      </button>
    `;

    letters.forEach(letter => {
      const exists = existingLetters.has(letter);
      html += `
        <button class="alpha-letter-btn ${currentLetter === letter ? 'active' : ''} ${!exists ? 'disabled' : ''}" 
          data-letter="${letter}" 
          aria-pressed="${currentLetter === letter}"
          ${!exists ? 'disabled' : ''}
          type="button">
          ${letter}
        </button>
      `;
    });

    alphaContainer.innerHTML = html;

    alphaContainer.querySelectorAll('.alpha-letter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (btn.classList.contains('disabled')) return;
        alphaContainer.querySelectorAll('.alpha-letter-btn').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-pressed', 'false');
        });
        btn.classList.add('active');
        btn.setAttribute('aria-pressed', 'true');
        currentLetter = btn.dataset.letter;
        searchQuery = '';
        if (searchInput) searchInput.value = '';
        renderGlossary();
      }, { signal });
    });
  }

  // Live search input
  if (searchInput) {
    if (!searchInput.hasAttribute('aria-label') && !searchInput.hasAttribute('aria-labelledby') && !searchInput.labels.length) {
      searchInput.setAttribute('aria-label', getLang() === 'fr' ? 'Rechercher dans le glossaire' : 'Search the glossary');
    }
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      currentLetter = 'all';
      alphaContainer?.querySelectorAll('.alpha-letter-btn').forEach(button => {
        const isSelected = button.dataset.letter === 'all';
        button.classList.toggle('active', isSelected);
        button.setAttribute('aria-pressed', String(isSelected));
      });
      renderGlossary();
    }, { signal });
  }

  // Interactive cards "Les mots cachés du clavecin" (Stitch MCP)
  document.querySelectorAll('.mot-cache-item').forEach(item => {
    const handleTrigger = () => {
      const term = item.dataset.term;
      if (searchInput && term) {
        searchInput.value = term;
        searchQuery = term.toLowerCase().trim();
        currentLetter = 'all';
        if (alphaContainer) {
          alphaContainer.querySelectorAll('.alpha-letter-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.letter === 'all');
            b.setAttribute('aria-pressed', String(b.dataset.letter === 'all'));
          });
        }
        renderGlossary();
        searchInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        searchInput.focus();
      }
    };

    item.addEventListener('click', handleTrigger, { signal });
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleTrigger();
      }
    }, { signal });
  });

  renderGlossary();
}

export function renderGlossary() {
  const container = document.getElementById('glossary-list-container');
  const countEl = document.getElementById('glossary-count');
  if (!container) return;

  const lang = getLang();

  // Filter glossary
  const filtered = allGlossary.filter(item => {
    // Letter filter
    if (currentLetter !== 'all' && item.letter !== currentLetter) {
      return false;
    }
    // Search query
    if (searchQuery) {
      const full = `${item.term} ${item.definition}`.toLowerCase();
      if (!full.includes(searchQuery)) return false;
    }
    return true;
  });

  // Update count
  if (countEl) {
    const label = lang === 'fr' ? 'termes affichés sur 225' : 'terms displayed out of 225';
    countEl.textContent = `${filtered.length} ${label}`;
  }

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="glossary-empty-state">
        <p style="font-family: var(--font-serif-display); font-size: 1.25rem; margin-bottom: 0.5rem;">
          ${lang === 'fr' ? 'Aucun terme technique ne correspond à votre recherche.' : 'No technical term matches your search.'}
        </p>
        <p style="font-size: 0.9375rem; color: var(--text-muted);">
          ${lang === 'fr' ? 'Essayez de chercher un autre mot-clé ou sélectionnez "Tous".' : 'Try searching for another keyword or select "All".'}
        </p>
      </div>
    `;
    return;
  }

  // Group by letter
  const groups = {};
  filtered.forEach(item => {
    if (!groups[item.letter]) {
      groups[item.letter] = [];
    }
    groups[item.letter].push(item);
  });

  const sortedLetters = Object.keys(groups).sort();

  container.innerHTML = sortedLetters.map(letter => `
    <div class="glossary-group" id="glossary-letter-${letter}">
      <div class="glossary-group-header">
        <span class="glossary-group-letter">${letter}</span>
        <span class="glossary-group-count">${groups[letter].length} ${lang === 'fr' ? 'terme(s)' : 'term(s)'}</span>
      </div>
      <div class="glossary-terms-grid">
        ${groups[letter].map(t => `
          <div class="glossary-term-card">
            <h4 class="glossary-term-title">
              <span>${highlightText(t.term, searchQuery)}</span>
              <span class="glossary-term-letter-badge">${t.letter}</span>
            </h4>
            <p class="glossary-term-def">${highlightText(t.definition, searchQuery)}</p>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');
}

function highlightText(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
  return text.replace(regex, '<mark style="background: rgba(200, 155, 60, 0.35); padding: 0 2px; border-radius: 2px;">$1</mark>');
}

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
