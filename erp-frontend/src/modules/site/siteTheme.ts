export interface SiteTheme {
  main: string;
  glow: string;
  text: string;
  border: string;
  bg: string;
  accent: string;
}

export const SITE_COLORS: SiteTheme[] = [
  { main: '#10b981', glow: 'transparent', text: 'text-emerald-500', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5', accent: 'bg-emerald-500' }, // Emerald
  { main: '#6366f1', glow: 'transparent', text: 'text-indigo-500', border: 'border-indigo-500/20', bg: 'bg-indigo-500/5', accent: 'bg-indigo-500' }, // Indigo
  { main: '#0ea5e9', glow: 'transparent', text: 'text-sky-500', border: 'border-sky-500/20', bg: 'bg-sky-500/5', accent: 'bg-sky-500' },     // Sky
  { main: '#14b8a6', glow: 'transparent', text: 'text-teal-500', border: 'border-teal-500/20', bg: 'bg-teal-500/5', accent: 'bg-teal-500' },    // Teal
  { main: '#a855f7', glow: 'transparent', text: 'text-violet-500', border: 'border-violet-500/20', bg: 'bg-violet-500/5', accent: 'bg-violet-500' }, // Violet
  { main: '#06b6d4', glow: 'transparent', text: 'text-cyan-500', border: 'border-cyan-500/20', bg: 'bg-cyan-500/5', accent: 'bg-cyan-500' }, // Cyan
  { main: '#3b82f6', glow: 'transparent', text: 'text-blue-500', border: 'border-blue-500/20', bg: 'bg-blue-500/5', accent: 'bg-blue-500' },   // Blue
  { main: '#22c55e', glow: 'transparent', text: 'text-green-500', border: 'border-green-500/20', bg: 'bg-green-500/5', accent: 'bg-green-500' }, // Green
  { main: '#8b5cf6', glow: 'transparent', text: 'text-purple-500', border: 'border-purple-500/20', bg: 'bg-purple-500/5', accent: 'bg-purple-500' }, // Purple
  { main: '#2dd4bf', glow: 'transparent', text: 'text-teal-400', border: 'border-teal-500/20', bg: 'bg-teal-500/5', accent: 'bg-teal-500' },   // Light Teal
  { main: '#4f46e5', glow: 'transparent', text: 'text-indigo-600', border: 'border-indigo-600/20', bg: 'bg-indigo-600/5', accent: 'bg-indigo-600' }, // Dark Indigo
  { main: '#059669', glow: 'transparent', text: 'text-emerald-600', border: 'border-emerald-600/20', bg: 'bg-emerald-600/5', accent: 'bg-emerald-600' }, // Dark Emerald
];

export const getSiteTheme = (id: number | null): SiteTheme | null => {
  if (id === null) return null;
  // Using a larger prime or just a bigger array reduces collisions
  return SITE_COLORS[id % SITE_COLORS.length];
};
