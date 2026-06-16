import { WORLD_CUP_TEAMS } from '@/types';

const COUNTRY_CODE_TO_TEAM: Record<string, string> = {
  AR: 'Argentina',
  AU: 'Austrália',
  BE: 'Bélgica',
  BR: 'Brasil',
  CA: 'Canadá',
  CH: 'Suíça',
  CM: 'Camarões',
  CR: 'Costa Rica',
  DE: 'Alemanha',
  DK: 'Dinamarca',
  EC: 'Equador',
  ES: 'Espanha',
  FR: 'França',
  GB: 'Inglaterra',
  GH: 'Gana',
  HR: 'Croácia',
  IR: 'Irã',
  IT: 'Itália',
  JP: 'Japão',
  KR: 'Coreia do Sul',
  MA: 'Marrocos',
  MX: 'México',
  NL: 'Holanda',
  PL: 'Polônia',
  PT: 'Portugal',
  QA: 'Qatar',
  RS: 'Sérvia',
  SA: 'Arábia Saudita',
  SN: 'Senegal',
  US: 'EUA',
  UY: 'Uruguai',
  WA: 'Gales',
};

const TIMEZONE_TO_TEAM: Record<string, string> = {
  'America/Argentina': 'Argentina',
  'Australia/': 'Austrália',
  'Europe/Brussels': 'Bélgica',
  'America/Sao_Paulo': 'Brasil',
  'America/Fortaleza': 'Brasil',
  'America/Manaus': 'Brasil',
  'America/Rio_Branco': 'Brasil',
  'America/Noronha': 'Brasil',
  'America/Toronto': 'Canadá',
  'America/Vancouver': 'Canadá',
  'America/Montreal': 'Canadá',
  'Europe/Zurich': 'Suíça',
  'Africa/Douala': 'Camarões',
  'America/Costa_Rica': 'Costa Rica',
  'Europe/Berlin': 'Alemanha',
  'Europe/Copenhagen': 'Dinamarca',
  'America/Guayaquil': 'Equador',
  'Europe/Madrid': 'Espanha',
  'Europe/Paris': 'França',
  'Europe/London': 'Inglaterra',
  'Africa/Accra': 'Gana',
  'Europe/Zagreb': 'Croácia',
  'Asia/Tehran': 'Irã',
  'Europe/Rome': 'Itália',
  'Asia/Tokyo': 'Japão',
  'Asia/Seoul': 'Coreia do Sul',
  'Africa/Casablanca': 'Marrocos',
  'America/Mexico_City': 'México',
  'Europe/Amsterdam': 'Holanda',
  'Europe/Warsaw': 'Polônia',
  'Europe/Lisbon': 'Portugal',
  'Asia/Qatar': 'Qatar',
  'Europe/Belgrade': 'Sérvia',
  'Asia/Riyadh': 'Arábia Saudita',
  'Africa/Dakar': 'Senegal',
  'America/New_York': 'EUA',
  'America/Chicago': 'EUA',
  'America/Denver': 'EUA',
  'America/Los_Angeles': 'EUA',
  'America/Phoenix': 'EUA',
  'America/Anchorage': 'EUA',
  'Pacific/Honolulu': 'EUA',
  'America/Montevideo': 'Uruguai',
};

function getTeamByTimezone(): string | null {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (!timezone) return null;

  const exactMatch = TIMEZONE_TO_TEAM[timezone];
  if (exactMatch) return exactMatch;

  const prefixMatch = Object.entries(TIMEZONE_TO_TEAM).find(([prefix]) => timezone.startsWith(prefix));
  return prefixMatch?.[1] ?? null;
}

function getTeamByBrowserLocale(): string | null {
  const locales = navigator.languages?.length ? navigator.languages : [navigator.language];

  for (const locale of locales) {
    try {
      const region = new Intl.Locale(locale).region;
      if (region && COUNTRY_CODE_TO_TEAM[region]) return COUNTRY_CODE_TO_TEAM[region];
    } catch {
      // Ignore invalid browser locale strings.
    }
  }

  return null;
}

export function getLocalTeam(): string | null {
  const localTeam = getTeamByTimezone() ?? getTeamByBrowserLocale();
  return localTeam && WORLD_CUP_TEAMS.includes(localTeam) ? localTeam : null;
}

export function getOrderedWorldCupTeams() {
  const sortedTeams = [...WORLD_CUP_TEAMS].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  const localTeam = getLocalTeam();

  if (!localTeam) return sortedTeams;

  return [localTeam, ...sortedTeams.filter((team) => team !== localTeam)];
}
