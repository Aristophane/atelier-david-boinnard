// ==========================================================================
// MODAL & LIGHTBOX VIEWER - ATELIER DAVID BOINNARD
// ==========================================================================

import { getLang } from './i18n.js';
import { renderVideoLinks } from './videos.js';

let modalBackdrop = null;
let previousFocus = null;
let previousOverflow = '';
let modalListeners = null;
const inertElements = new Map();

function getFocusableElements() {
  return [...modalBackdrop.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex="0"]')]
    .filter(element => element.getClientRects().length > 0);
}

export function initModal() {
  modalBackdrop = document.getElementById('instrument-modal');
  if (!modalBackdrop) return;
  modalListeners?.abort();
  modalListeners = new AbortController();
  const { signal } = modalListeners;
  const title = modalBackdrop.querySelector('.modal-title');
  if (title) {
    title.id ||= 'instrument-modal-title';
    modalBackdrop.setAttribute('aria-labelledby', title.id);
  }
  modalBackdrop.tabIndex = -1;
  modalBackdrop.inert = !modalBackdrop.classList.contains('active');
  const oldVideoButton = modalBackdrop.querySelector('.modal-video-btn');
  if (oldVideoButton) {
    const videos = document.createElement('div');
    videos.className = 'instrument-videos modal-videos';
    oldVideoButton.replaceWith(videos);
  }

  const closeBtn = modalBackdrop.querySelector('.modal-close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal, { signal });
  }

  modalBackdrop.addEventListener('click', (e) => {
    if (e.target === modalBackdrop) {
      closeModal();
    }
  }, { signal });

  modalBackdrop.querySelector('.modal-contact-btn')?.addEventListener('click', () => {
    closeModal();
    const contact = document.getElementById('contact');
    if (contact) {
      if (!contact.hasAttribute('tabindex')) contact.tabIndex = -1;
      contact.focus({ preventScroll: true });
    }
  }, { signal });

  window.addEventListener('keydown', (e) => {
    if (!modalBackdrop.classList.contains('active')) return;
    if (e.key === 'Escape') {
      e.preventDefault();
      closeModal();
    } else if (e.key === 'Tab') {
      const elements = getFocusableElements();
      const first = elements[0];
      const last = elements[elements.length - 1];
      if (!first) {
        e.preventDefault();
        modalBackdrop.focus();
      } else if (e.shiftKey && (document.activeElement === first || !elements.includes(document.activeElement))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (document.activeElement === last || !elements.includes(document.activeElement))) {
        e.preventDefault();
        first.focus();
      }
    }
  }, { signal });
}

export function openModal(instrument, trigger = document.activeElement) {
  if (!modalBackdrop || !instrument) return;
  if (!modalBackdrop.classList.contains('active')) {
    previousFocus = trigger;
    previousOverflow = document.body.style.overflow;
  }

  const lang = getLang();
  const imgEl = modalBackdrop.querySelector('.modal-img');
  const opusEl = modalBackdrop.querySelector('.modal-opus');
  const periodEl = modalBackdrop.querySelector('.modal-period');
  const titleEl = modalBackdrop.querySelector('.modal-title');
  const priceEl = modalBackdrop.querySelector('.modal-price');
  const descEl = modalBackdrop.querySelector('.modal-desc');
  const pdfBtn = modalBackdrop.querySelector('.modal-pdf-btn');
  const videosEl = modalBackdrop.querySelector('.modal-videos');
  const contactBtn = modalBackdrop.querySelector('.modal-contact-btn');

  // Fill data
  if (imgEl) {
    imgEl.src = instrument.image || 'anim-index.gif';
    imgEl.alt = instrument.title;
    const imageLink = imgEl.closest('.modal-image-link');
    if (imageLink) {
      imageLink.href = imgEl.src;
      imageLink.setAttribute('aria-label', lang === 'en' ? 'Open the full photograph (new tab)' : 'Ouvrir la photo en grand (nouvel onglet)');
      imageLink.querySelector('span').textContent = lang === 'en' ? 'Open the full photograph ↗' : 'Ouvrir la photo en grand ↗';
    }
  }
  if (opusEl) {
    opusEl.textContent = instrument.number || 'Facture d’art';
    opusEl.style.display = instrument.number ? 'inline-flex' : 'none';
  }
  if (periodEl) {
    periodEl.textContent = instrument.period || '';
  }
  if (titleEl) {
    titleEl.textContent = instrument.title;
  }
  if (priceEl) {
    priceEl.textContent = instrument.price || (lang === 'fr' ? 'Nous consulter pour tarif et délai' : 'Price on request');
  }
  if (descEl) {
    descEl.textContent = instrument.description || (lang === 'fr' ? 'Instrument de facture historique réalisé à l\'atelier selon les règles de l\'art.' : 'Historical instrument built in the workshop following authentic craft rules.');
  }

  // PDF link
  if (pdfBtn) {
    if (instrument.pdf) {
      pdfBtn.href = instrument.pdf;
      pdfBtn.style.display = 'inline-flex';
      pdfBtn.textContent = lang === 'fr' ? 'Consulter la Fiche PDF originale' : 'Download Original PDF Sheet';
    } else {
      pdfBtn.style.display = 'none';
    }
  }

  // Keep every recording accessible, including instruments with several videos.
  if (videosEl) {
    videosEl.innerHTML = renderVideoLinks(instrument, lang);
    videosEl.hidden = !videosEl.innerHTML;
  }

  // Contact button
  if (contactBtn) {
    contactBtn.href = '#contact';
  }

  modalBackdrop.classList.add('active');
  modalBackdrop.setAttribute('aria-hidden', 'false');
  modalBackdrop.inert = false;
  document.body.style.overflow = 'hidden';
  for (const element of document.body.children) {
    if (element === modalBackdrop || element.contains(modalBackdrop) || element.tagName === 'SCRIPT') continue;
    if (!inertElements.has(element)) inertElements.set(element, element.inert);
    element.inert = true;
  }
  (getFocusableElements()[0] || modalBackdrop).focus({ preventScroll: true });
}

export function closeModal() {
  if (!modalBackdrop?.classList.contains('active')) return;
  document.body.style.overflow = previousOverflow;
  inertElements.forEach((wasInert, element) => { element.inert = wasInert; });
  inertElements.clear();
  if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
  previousFocus = null;
  modalBackdrop.classList.remove('active');
  modalBackdrop.inert = true;
  modalBackdrop.setAttribute('aria-hidden', 'true');
}
