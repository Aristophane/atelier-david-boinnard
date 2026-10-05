// Open the best locally preserved source photograph without upscaling its pixels.
const escape = value => String(value).replace(/[&<>"']/g, char => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[char]));

export function renderInstrumentImage(record, className, lang) {
  const src = record.image;
  if (!src) return '';
  const title = record.title || record.titre || '';
  const label = lang === 'en' ? `View photograph: ${title} (new tab)` : `Agrandir la photo : ${title} (nouvel onglet)`;
  return `<a class="instrument-image-link" href="${escape(src)}" target="_blank" rel="noopener noreferrer" aria-label="${escape(label)}" title="${escape(label)}"><img class="${className}" src="${escape(src)}" alt="${escape(title)}" loading="lazy" decoding="async" /></a>`;
}
