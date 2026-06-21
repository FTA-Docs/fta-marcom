// Hand-drawn "emotion" line motifs (concentric arc shapes) shared by the
// homepage line animation and the About page figures. Pulls each motif's raw
// SVG, strips the <svg> wrapper + white background <rect>, and keeps just the
// <path>s — evenly downsampled to `maxArcs` so dense shapes stay calm rather
// than "scribbling in place".
const emotionSvgs = import.meta.glob('/public/emotions/*.svg', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

export const emotionPaths = (name: string, maxArcs = 8): string => {
  const raw = (emotionSvgs[`/public/emotions/${name}.svg`] ?? '')
    .replace(/<svg[^>]*>/, '')
    .replace(/<\/svg>/, '')
    .replace(/<rect[^>]*\/>/g, '');
  const paths = raw.match(/<path[\s\S]*?\/>/g) ?? [];
  if (paths.length <= maxArcs) return paths.join('');
  const kept: string[] = [];
  for (let i = 0; i < maxArcs; i++) {
    kept.push(paths[Math.round((i * (paths.length - 1)) / (maxArcs - 1))]);
  }
  return kept.join('');
};
