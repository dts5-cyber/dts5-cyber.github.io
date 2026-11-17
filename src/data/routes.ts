// Роуты сайта. Ещё не собранные направления ведут на '#' (заглушки, см. README-HANDOFF → «Открытые вопросы»).
export const ROUTES = {
  home: '/',
  career: '/career',
  directions: '/#directions',
  etalon: '/solutions/etalon',
  quality: '/solutions/quality',
  supply: '/solutions/supply',
} as const;

/** Ссылка на направление по его названию в макете. */
export function directionHref(name: string): string {
  if (name.includes('Эталон')) return ROUTES.etalon;
  if (name === 'Сертификация') return ROUTES.quality;
  if (name === 'Снабжение') return ROUTES.supply;
  return '#';
}
