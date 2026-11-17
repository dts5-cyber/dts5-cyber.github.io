export const careerIcons: Record<string, string> = {
  quality: '<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/>',
  code: '<rect x="3" y="4" width="18" height="14" rx="2"/><path d="m9 9-3 3 3 3m6-6 3 3-3 3M8 22h8m-4-4v4"/>',
  measure: '<path d="M4 3v18h16V3M4 8h4m-4 5h6m-6 5h4m8-15v18M12 3v4m0 10v4"/>',
  jobs: '<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v3M3 12c5 3 13 3 18 0m-9 0v4"/>',
  medical: '<path d="M12 21s-8-4.6-8-10.5A4.8 4.8 0 0 1 12 7a4.8 4.8 0 0 1 8 3.5C20 16.4 12 21 12 21Z"/><path d="M12 9v6m-3-3h6"/>',
  health: '<path d="M12 21s-8-4.6-8-10.5A4.8 4.8 0 0 1 12 7a4.8 4.8 0 0 1 8 3.5C20 16.4 12 21 12 21Z"/><path d="M3 12h5l2-3 3 6 2-3h6"/>',
  sport: '<path d="M7 12h10M4 8v8m3-10v12m10-12v12m3-10v8"/>',
  compensation: '<path d="M3 6h4m4 0h10M3 12h10m4 0h4M3 18h4m4 0h10"/><circle cx="9" cy="6" r="2"/><circle cx="15" cy="12" r="2"/><circle cx="9" cy="18" r="2"/>',
  support: '<path d="M3 21v-7h4l3 2h5a2 2 0 0 1 0 4h-5m7-3 3-2a2 2 0 0 1 2 3l-5 4H7"/><path d="M15 12s-5-2.7-5-6a3 3 0 0 1 5-2 3 3 0 0 1 5 2c0 3.3-5 6-5 6Z"/>',
  gift: '<path d="M4 11h16v10H4zM3 7h18v4H3zM12 7v14"/><path d="M12 7C8 7 5 6 5 3.8 5 1 10 2 12 7Zm0 0c4 0 7-1 7-3.2C19 1 14 2 12 7Z"/>',
  home: '<path d="m3 11 9-8 9 8M5 9v12h14V9m-10 12v-7h6v7"/>',
  pension: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 10c0 1.7 3.6 3 8 3s8-1.3 8-3M4 15c0 1.7 3.6 3 8 3s8-1.3 8-3"/>',
  growth: '<path d="m3 9 9-5 9 5-9 5-9-5Zm4 3v6c3 3 7 3 10 0v-6M21 9v7"/>',
};
export function vacancyIcon(direction: string): string {
  if (/цифров|программ/i.test(direction)) return 'code';
  if (/метролог/i.test(direction)) return 'measure';
  if (/качество|качества|приёмк|приемк/i.test(direction)) return 'quality';
  return 'jobs';
}
