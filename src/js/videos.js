// Shared, accessible links to the workshop's instrument recordings.
const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]));

export function getVideos(record) {
  const candidates = [...(record.videos || []), record.video, record.video_url].filter(Boolean);
  const seen = new Set();
  return candidates.flatMap(candidate => {
    const video = typeof candidate === 'string' ? { url: candidate } : candidate;
    try {
      const url = new URL(video.url.replace(/&amp;/g, '&'));
      if (!['https:', 'http:'].includes(url.protocol) || seen.has(url.href)) return [];
      seen.add(url.href);
      return [{ ...video, url: url.href }];
    } catch {
      return [];
    }
  });
}

export function renderVideoLinks(record, lang, { publication = false } = {}) {
  const videos = getVideos(record);
  const action = publication
    ? (lang === 'fr' ? 'Voir la vidéo' : 'Watch video')
    : (lang === 'fr' ? 'Écouter l’instrument' : 'Hear the instrument');
  const newTab = lang === 'fr' ? 'nouvel onglet' : 'new tab';

  return videos.map((video, index) => {
    const detail = video[`label_${lang}`] || video.label_fr || (videos.length > 1 ? `${index + 1}` : '');
    const label = `${action}${detail ? ` · ${detail}` : ''}`;
    return `
      <a href="${escapeHtml(video.url)}" class="btn btn-sm btn-outline instrument-video-link" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(`${label} (${newTab})`)}">
        <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"><circle cx="12" cy="12" r="10"></circle><path d="m10 8 6 4-6 4z" fill="currentColor" stroke="none"></path></svg>
        <span>${escapeHtml(label)}</span>
      </a>
    `;
  }).join('');
}

export function renderInstrumentVideos(record, lang) {
  const links = renderVideoLinks(record, lang);
  return links ? `<div class="instrument-videos">${links}</div>` : '';
}
