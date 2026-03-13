// ── Inline SVG Stickers ───────────────────────────────
export const STICKERS = [
  { name: 'star',        svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><polygon points="32,4 40,24 62,26 46,40 50,62 32,50 14,62 18,40 2,26 24,24" fill="#f7c948" stroke="#e6b422" stroke-width="1.5"/></svg>' },
  { name: 'heart',       svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M32 56 C16 42 4 30 4 18 A14 14 0 0 1 32 14 A14 14 0 0 1 60 18 C60 30 48 42 32 56Z" fill="#e87461" stroke="#c9533f" stroke-width="1.5"/></svg>' },
  { name: 'flower',      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="20" r="10" fill="#f0a0c0"/><circle cx="20" cy="32" r="10" fill="#f0a0c0"/><circle cx="44" cy="32" r="10" fill="#f0a0c0"/><circle cx="26" cy="44" r="10" fill="#f0a0c0"/><circle cx="38" cy="44" r="10" fill="#f0a0c0"/><circle cx="32" cy="32" r="7" fill="#f7c948"/></svg>' },
  { name: 'cloud',       svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 40"><ellipse cx="24" cy="26" rx="16" ry="12" fill="white" stroke="#ccc" stroke-width="1"/><ellipse cx="40" cy="24" rx="14" ry="14" fill="white" stroke="#ccc" stroke-width="1"/><ellipse cx="32" cy="14" rx="12" ry="10" fill="white" stroke="#ccc" stroke-width="1"/></svg>' },
  { name: 'moon',        svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M40 8 A24 24 0 1 0 40 56 A18 18 0 1 1 40 8Z" fill="#f7e78a" stroke="#d4c35a" stroke-width="1.5"/></svg>' },
  { name: 'rainbow',     svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 44"><path d="M8 40 A32 32 0 0 1 72 40" fill="none" stroke="#e54" stroke-width="4"/><path d="M12 40 A28 28 0 0 1 68 40" fill="none" stroke="#f90" stroke-width="4"/><path d="M16 40 A24 24 0 0 1 64 40" fill="none" stroke="#fd0" stroke-width="4"/><path d="M20 40 A20 20 0 0 1 60 40" fill="none" stroke="#4b4" stroke-width="4"/><path d="M24 40 A16 16 0 0 1 56 40" fill="none" stroke="#48f" stroke-width="4"/><path d="M28 40 A12 12 0 0 1 52 40" fill="none" stroke="#a4e" stroke-width="4"/></svg>' },
  { name: 'sparkle',     svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M32 2 L36 26 L60 32 L36 38 L32 62 L28 38 L4 32 L28 26 Z" fill="#f7c948" stroke="#d4a820" stroke-width="1"/></svg>' },
  { name: 'butterfly',   svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><ellipse cx="20" cy="22" rx="14" ry="16" fill="#c490e0" stroke="#9060b0" stroke-width="1" transform="rotate(-15 20 22)"/><ellipse cx="44" cy="22" rx="14" ry="16" fill="#c490e0" stroke="#9060b0" stroke-width="1" transform="rotate(15 44 22)"/><ellipse cx="22" cy="42" rx="10" ry="14" fill="#e0a0d0" stroke="#9060b0" stroke-width="1" transform="rotate(-10 22 42)"/><ellipse cx="42" cy="42" rx="10" ry="14" fill="#e0a0d0" stroke="#9060b0" stroke-width="1" transform="rotate(10 42 42)"/><line x1="32" y1="12" x2="32" y2="58" stroke="#555" stroke-width="2"/></svg>' },
  { name: 'leaf',        svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M10 54 Q10 20 32 8 Q54 20 54 54 Z" fill="#6ab04c" stroke="#3a7a2c" stroke-width="1.5"/><line x1="32" y1="12" x2="32" y2="54" stroke="#3a7a2c" stroke-width="1.5"/></svg>' },
  { name: 'music',       svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><ellipse cx="18" cy="50" rx="10" ry="7" fill="#555"/><ellipse cx="50" cy="44" rx="10" ry="7" fill="#555"/><line x1="28" y1="50" x2="28" y2="10" stroke="#555" stroke-width="3"/><line x1="60" y1="44" x2="60" y2="8" stroke="#555" stroke-width="3"/><path d="M28 10 Q44 4 60 8" fill="none" stroke="#555" stroke-width="3"/></svg>' },
];

// ── Vector Shapes ────────────────────────────────────
export const SHAPES = [
  { name: 'circle',       svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
  { name: 'semicircle',   svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 44"><path d="M4 40 A28 28 0 0 1 60 40 Z" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
  { name: 'oval',         svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 64"><ellipse cx="24" cy="32" rx="20" ry="28" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
  { name: 'square',       svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="4" y="4" width="56" height="56" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
  { name: 'rectangle',    svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 56"><rect x="4" y="4" width="72" height="48" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
  { name: 'rounded rect', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect x="4" y="4" width="56" height="56" rx="12" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
  { name: 'diamond',      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><polygon points="32,4 60,32 32,60 4,32" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
  { name: 'triangle',     svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 60"><polygon points="32,4 60,56 4,56" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
  { name: 'right triangle', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><polygon points="4,60 60,60 4,4" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
  { name: 'pentagon',     svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><polygon points="32,4 61,24 50,58 14,58 3,24" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
  { name: 'hexagon',      svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 58"><polygon points="16,2 48,2 62,29 48,56 16,56 2,29" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
  { name: 'star',         svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><polygon points="32,4 40,24 62,26 46,40 50,60 32,50 14,60 18,40 2,26 24,24" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
  { name: 'heart',        svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M32 56 C16 42 4 30 4 18 A14 14 0 0 1 32 14 A14 14 0 0 1 60 18 C60 30 48 42 32 56Z" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
  { name: 'cross',        svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><polygon points="24,4 40,4 40,24 60,24 60,40 40,40 40,60 24,60 24,40 4,40 4,24 24,24" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
  { name: 'arrow right',  svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48"><polygon points="4,16 40,16 40,4 60,24 40,44 40,32 4,32" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
  { name: 'arch',         svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M4 60 L4 28 A28 28 0 0 1 60 28 L60 60" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
  { name: 'crescent',     svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M40 8 A24 24 0 1 0 40 56 A18 18 0 1 1 40 8Z" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
  { name: 'speech bubble', svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 56"><rect x="4" y="4" width="56" height="36" rx="8" fill="none" stroke="currentColor" stroke-width="2.5"/><polygon points="16,40 24,52 32,40" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>' },
];

// ── File-based stickers (PNG assets) ─────────────────
// Dynamically loaded from assets/stickers/manifest.json
export let FILE_STICKERS = [];
