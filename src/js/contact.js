// ==========================================================================
// CONTACT FORM CONTROLLER - ATELIER DAVID BOINNARD
// ==========================================================================

import { getLang } from './i18n.js';

export function initContact() {
  const form = document.getElementById('workshop-contact-form');
  const feedback = document.getElementById('contact-form-feedback');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const lang = getLang();

    const name = form.querySelector('[name="name"]').value.trim();
    const email = form.querySelector('[name="email"]').value.trim();
    const subject = form.querySelector('[name="subject"]').value;
    const message = form.querySelector('[name="message"]').value.trim();

    if (!name || !email || !message) {
      alert(lang === 'fr' ? 'Veuillez remplir tous les champs obligatoires.' : 'Please fill in all required fields.');
      return;
    }

    // Prepare a draft; sending remains an explicit action in the user's mail app.
    const recipient = 'contact@david-boinnard.com';
    const body = `${message}\n\n${name}\n${email}`;
    const mailto = `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    if (feedback) {
      feedback.className = 'form-feedback success';
      feedback.style.display = 'block';
      feedback.textContent = lang === 'fr' 
        ? 'Votre brouillon est prêt. Ouvrez votre messagerie pour l’envoyer : '
        : 'Your draft is ready. Open your email app to send it: ';
      const draftLink = document.createElement('a');
      draftLink.href = mailto;
      draftLink.textContent = lang === 'fr' ? 'Ouvrir le courriel' : 'Open the email draft';
      feedback.append(draftLink);
      draftLink.focus({ preventScroll: true });
    }
  });

  // Handle direct contact buttons from showroom
  window.prefillContactSubject = function(subjectText) {
    const subjectSelect = form.querySelector('[name="subject"]');
    const messageArea = form.querySelector('[name="message"]');
    if (subjectSelect) {
      // Find matching or set default to buy/rent
      if (subjectText.toLowerCase().includes('location') || subjectText.toLowerCase().includes('louer')) {
        subjectSelect.value = "Location pour concert / enregistrement";
      } else {
        subjectSelect.value = "Achat d'un instrument disponible";
      }
    }
    if (messageArea) {
      messageArea.value = getLang() === 'fr'
        ? `Bonjour David Boinnard,\n\nJe souhaiterais avoir plus d'informations au sujet de l'instrument : ${subjectText} (disponibilité, essai à l'atelier, conditions).\n\nBien cordialement,`
        : `Dear David Boinnard,\n\nI would like more information regarding the instrument: ${subjectText} (availability, workshop appointment, conditions).\n\nKind regards,`;
    }
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };
}
