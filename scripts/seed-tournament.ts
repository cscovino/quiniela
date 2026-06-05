import admin from 'firebase-admin';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

if (admin.apps.length === 0) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: process.env.PUBLIC_FIREBASE_PROJECT_ID,
    });
  }
}

const db = getFirestore();

const TOURNAMENT_ID = 'world-cup-2026';

const stadiums: Record<string, { name: string; city: string; capacity: number }> = {
  'dallas-stadium': { name: 'Dallas Stadium', city: 'Dallas', capacity: 94000 },
  'mexico-city-stadium': { name: 'Mexico City Stadium', city: 'Mexico City', capacity: 83000 },
  'ny-nj-stadium': { name: 'New York New Jersey Stadium', city: 'New York', capacity: 82500 },
  'atlanta-stadium': { name: 'Atlanta Stadium', city: 'Atlanta', capacity: 75000 },
  'kansas-city-stadium': { name: 'Kansas City Stadium', city: 'Kansas City', capacity: 73000 },
  'houston-stadium': { name: 'Houston Stadium', city: 'Houston', capacity: 72000 },
  'sf-bay-area-stadium': {
    name: 'San Francisco Bay Area Stadium',
    city: 'San Francisco',
    capacity: 71000,
  },
  'la-stadium': { name: 'Los Angeles Stadium', city: 'Los Angeles', capacity: 70000 },
  'philadelphia-stadium': { name: 'Philadelphia Stadium', city: 'Philadelphia', capacity: 69000 },
  'seattle-stadium': { name: 'Seattle Stadium', city: 'Seattle', capacity: 69000 },
  'boston-stadium': { name: 'Boston Stadium', city: 'Boston', capacity: 65000 },
  'miami-stadium': { name: 'Miami Stadium', city: 'Miami', capacity: 65000 },
  'bc-place-vancouver': { name: 'BC Place Vancouver', city: 'Vancouver', capacity: 54000 },
  'estadio-monterrey': { name: 'Estadio Monterrey', city: 'Monterrey', capacity: 53500 },
  'estadio-guadalajara': { name: 'Estadio Guadalajara', city: 'Guadalajara', capacity: 48000 },
  'toronto-stadium': { name: 'Toronto Stadium', city: 'Toronto', capacity: 45000 },
};

const groups = [
  { slug: 'group-a', name: 'Group A', order: 1 },
  { slug: 'group-b', name: 'Group B', order: 2 },
  { slug: 'group-c', name: 'Group C', order: 3 },
  { slug: 'group-d', name: 'Group D', order: 4 },
  { slug: 'group-e', name: 'Group E', order: 5 },
  { slug: 'group-f', name: 'Group F', order: 6 },
  { slug: 'group-g', name: 'Group G', order: 7 },
  { slug: 'group-h', name: 'Group H', order: 8 },
  { slug: 'group-i', name: 'Group I', order: 9 },
  { slug: 'group-j', name: 'Group J', order: 10 },
  { slug: 'group-k', name: 'Group K', order: 11 },
  { slug: 'group-l', name: 'Group L', order: 12 },
];

const teams = [
  // Group A
  {
    fifaCode: 'MEX',
    name: { es: 'México', en: 'Mexico' },
    flagUrl: '/flags/mex.svg',
    groupId: 'group-a',
  },
  {
    fifaCode: 'RSA',
    name: { es: 'Sudáfrica', en: 'South Africa' },
    flagUrl: '/flags/rsa.svg',
    groupId: 'group-a',
  },
  {
    fifaCode: 'KOR',
    name: { es: 'Corea del Sur', en: 'South Korea' },
    flagUrl: '/flags/kor.svg',
    groupId: 'group-a',
  },
  {
    fifaCode: 'CZE',
    name: { es: 'Chequia', en: 'Czechia' },
    flagUrl: '/flags/cze.svg',
    groupId: 'group-a',
  },
  // Group B
  {
    fifaCode: 'CAN',
    name: { es: 'Canadá', en: 'Canada' },
    flagUrl: '/flags/can.svg',
    groupId: 'group-b',
  },
  {
    fifaCode: 'BIH',
    name: { es: 'Bosnia y Herzegovina', en: 'Bosnia and Herzegovina' },
    flagUrl: '/flags/bih.svg',
    groupId: 'group-b',
  },
  {
    fifaCode: 'QAT',
    name: { es: 'Catar', en: 'Qatar' },
    flagUrl: '/flags/qat.svg',
    groupId: 'group-b',
  },
  {
    fifaCode: 'SUI',
    name: { es: 'Suiza', en: 'Switzerland' },
    flagUrl: '/flags/sui.svg',
    groupId: 'group-b',
  },
  // Group C
  {
    fifaCode: 'BRA',
    name: { es: 'Brasil', en: 'Brazil' },
    flagUrl: '/flags/bra.svg',
    groupId: 'group-c',
  },
  {
    fifaCode: 'MAR',
    name: { es: 'Marruecos', en: 'Morocco' },
    flagUrl: '/flags/mar.svg',
    groupId: 'group-c',
  },
  {
    fifaCode: 'HAI',
    name: { es: 'Haití', en: 'Haiti' },
    flagUrl: '/flags/hai.svg',
    groupId: 'group-c',
  },
  {
    fifaCode: 'SCO',
    name: { es: 'Escocia', en: 'Scotland' },
    flagUrl: '/flags/sco.svg',
    groupId: 'group-c',
  },
  // Group D
  {
    fifaCode: 'USA',
    name: { es: 'Estados Unidos', en: 'United States' },
    flagUrl: '/flags/usa.svg',
    groupId: 'group-d',
  },
  {
    fifaCode: 'PAR',
    name: { es: 'Paraguay', en: 'Paraguay' },
    flagUrl: '/flags/par.svg',
    groupId: 'group-d',
  },
  {
    fifaCode: 'AUS',
    name: { es: 'Australia', en: 'Australia' },
    flagUrl: '/flags/aus.svg',
    groupId: 'group-d',
  },
  {
    fifaCode: 'TUR',
    name: { es: 'Turquía', en: 'Turkey' },
    flagUrl: '/flags/tur.svg',
    groupId: 'group-d',
  },
  // Group E
  {
    fifaCode: 'GER',
    name: { es: 'Alemania', en: 'Germany' },
    flagUrl: '/flags/ger.svg',
    groupId: 'group-e',
  },
  {
    fifaCode: 'CUW',
    name: { es: 'Curazao', en: 'Curaçao' },
    flagUrl: '/flags/cuw.svg',
    groupId: 'group-e',
  },
  {
    fifaCode: 'CIV',
    name: { es: 'Costa de Marfil', en: 'Ivory Coast' },
    flagUrl: '/flags/civ.svg',
    groupId: 'group-e',
  },
  {
    fifaCode: 'ECU',
    name: { es: 'Ecuador', en: 'Ecuador' },
    flagUrl: '/flags/ecu.svg',
    groupId: 'group-e',
  },
  // Group F
  {
    fifaCode: 'NED',
    name: { es: 'Países Bajos', en: 'Netherlands' },
    flagUrl: '/flags/ned.svg',
    groupId: 'group-f',
  },
  {
    fifaCode: 'JPN',
    name: { es: 'Japón', en: 'Japan' },
    flagUrl: '/flags/jpn.svg',
    groupId: 'group-f',
  },
  {
    fifaCode: 'SWE',
    name: { es: 'Suecia', en: 'Sweden' },
    flagUrl: '/flags/swe.svg',
    groupId: 'group-f',
  },
  {
    fifaCode: 'TUN',
    name: { es: 'Túnez', en: 'Tunisia' },
    flagUrl: '/flags/tun.svg',
    groupId: 'group-f',
  },
  // Group G
  {
    fifaCode: 'BEL',
    name: { es: 'Bélgica', en: 'Belgium' },
    flagUrl: '/flags/bel.svg',
    groupId: 'group-g',
  },
  {
    fifaCode: 'EGY',
    name: { es: 'Egipto', en: 'Egypt' },
    flagUrl: '/flags/egy.svg',
    groupId: 'group-g',
  },
  {
    fifaCode: 'IRN',
    name: { es: 'Irán', en: 'Iran' },
    flagUrl: '/flags/irn.svg',
    groupId: 'group-g',
  },
  {
    fifaCode: 'NZL',
    name: { es: 'Nueva Zelanda', en: 'New Zealand' },
    flagUrl: '/flags/nzl.svg',
    groupId: 'group-g',
  },
  // Group H
  {
    fifaCode: 'ESP',
    name: { es: 'España', en: 'Spain' },
    flagUrl: '/flags/esp.svg',
    groupId: 'group-h',
  },
  {
    fifaCode: 'CPV',
    name: { es: 'Cabo Verde', en: 'Cape Verde' },
    flagUrl: '/flags/cpv.svg',
    groupId: 'group-h',
  },
  {
    fifaCode: 'KSA',
    name: { es: 'Arabia Saudita', en: 'Saudi Arabia' },
    flagUrl: '/flags/ksa.svg',
    groupId: 'group-h',
  },
  {
    fifaCode: 'URU',
    name: { es: 'Uruguay', en: 'Uruguay' },
    flagUrl: '/flags/uru.svg',
    groupId: 'group-h',
  },
  // Group I
  {
    fifaCode: 'FRA',
    name: { es: 'Francia', en: 'France' },
    flagUrl: '/flags/fra.svg',
    groupId: 'group-i',
  },
  {
    fifaCode: 'SEN',
    name: { es: 'Senegal', en: 'Senegal' },
    flagUrl: '/flags/sen.svg',
    groupId: 'group-i',
  },
  {
    fifaCode: 'IRQ',
    name: { es: 'Irak', en: 'Iraq' },
    flagUrl: '/flags/irq.svg',
    groupId: 'group-i',
  },
  {
    fifaCode: 'NOR',
    name: { es: 'Noruega', en: 'Norway' },
    flagUrl: '/flags/nor.svg',
    groupId: 'group-i',
  },
  // Group J
  {
    fifaCode: 'ARG',
    name: { es: 'Argentina', en: 'Argentina' },
    flagUrl: '/flags/arg.svg',
    groupId: 'group-j',
  },
  {
    fifaCode: 'ALG',
    name: { es: 'Argelia', en: 'Algeria' },
    flagUrl: '/flags/alg.svg',
    groupId: 'group-j',
  },
  {
    fifaCode: 'AUT',
    name: { es: 'Austria', en: 'Austria' },
    flagUrl: '/flags/aut.svg',
    groupId: 'group-j',
  },
  {
    fifaCode: 'JOR',
    name: { es: 'Jordania', en: 'Jordan' },
    flagUrl: '/flags/jor.svg',
    groupId: 'group-j',
  },
  // Group K
  {
    fifaCode: 'POR',
    name: { es: 'Portugal', en: 'Portugal' },
    flagUrl: '/flags/por.svg',
    groupId: 'group-k',
  },
  {
    fifaCode: 'COD',
    name: { es: 'RD Congo', en: 'DR Congo' },
    flagUrl: '/flags/cod.svg',
    groupId: 'group-k',
  },
  {
    fifaCode: 'UZB',
    name: { es: 'Uzbekistán', en: 'Uzbekistan' },
    flagUrl: '/flags/uzb.svg',
    groupId: 'group-k',
  },
  {
    fifaCode: 'COL',
    name: { es: 'Colombia', en: 'Colombia' },
    flagUrl: '/flags/col.svg',
    groupId: 'group-k',
  },
  // Group L
  {
    fifaCode: 'ENG',
    name: { es: 'Inglaterra', en: 'England' },
    flagUrl: '/flags/eng.svg',
    groupId: 'group-l',
  },
  {
    fifaCode: 'CRO',
    name: { es: 'Croacia', en: 'Croatia' },
    flagUrl: '/flags/cro.svg',
    groupId: 'group-l',
  },
  {
    fifaCode: 'GHA',
    name: { es: 'Ghana', en: 'Ghana' },
    flagUrl: '/flags/gha.svg',
    groupId: 'group-l',
  },
  {
    fifaCode: 'PAN',
    name: { es: 'Panamá', en: 'Panama' },
    flagUrl: '/flags/pan.svg',
    groupId: 'group-l',
  },
];

const groupMatches = [
  // Group A - Mexico City Stadium
  {
    slug: 'match-a1',
    groupId: 'group-a',
    homeTeamId: 'MEX',
    awayTeamId: 'RSA',
    date: '2026-06-11T21:00:00Z',
    stadium: 'mexico-city-stadium',
  },
  {
    slug: 'match-a2',
    groupId: 'group-a',
    homeTeamId: 'KOR',
    awayTeamId: 'CZE',
    date: '2026-06-12T18:00:00Z',
    stadium: 'mexico-city-stadium',
  },
  {
    slug: 'match-a3',
    groupId: 'group-a',
    homeTeamId: 'MEX',
    awayTeamId: 'KOR',
    date: '2026-06-17T21:00:00Z',
    stadium: 'mexico-city-stadium',
  },
  {
    slug: 'match-a4',
    groupId: 'group-a',
    homeTeamId: 'RSA',
    awayTeamId: 'CZE',
    date: '2026-06-18T18:00:00Z',
    stadium: 'mexico-city-stadium',
  },
  {
    slug: 'match-a5',
    groupId: 'group-a',
    homeTeamId: 'MEX',
    awayTeamId: 'CZE',
    date: '2026-06-23T21:00:00Z',
    stadium: 'mexico-city-stadium',
  },
  {
    slug: 'match-a6',
    groupId: 'group-a',
    homeTeamId: 'RSA',
    awayTeamId: 'KOR',
    date: '2026-06-23T21:00:00Z',
    stadium: 'mexico-city-stadium',
  },
  // Group B - BC Place Vancouver
  {
    slug: 'match-b1',
    groupId: 'group-b',
    homeTeamId: 'CAN',
    awayTeamId: 'BIH',
    date: '2026-06-12T21:00:00Z',
    stadium: 'bc-place-vancouver',
  },
  {
    slug: 'match-b2',
    groupId: 'group-b',
    homeTeamId: 'QAT',
    awayTeamId: 'SUI',
    date: '2026-06-13T18:00:00Z',
    stadium: 'bc-place-vancouver',
  },
  {
    slug: 'match-b3',
    groupId: 'group-b',
    homeTeamId: 'CAN',
    awayTeamId: 'QAT',
    date: '2026-06-18T21:00:00Z',
    stadium: 'bc-place-vancouver',
  },
  {
    slug: 'match-b4',
    groupId: 'group-b',
    homeTeamId: 'BIH',
    awayTeamId: 'SUI',
    date: '2026-06-19T18:00:00Z',
    stadium: 'bc-place-vancouver',
  },
  {
    slug: 'match-b5',
    groupId: 'group-b',
    homeTeamId: 'CAN',
    awayTeamId: 'SUI',
    date: '2026-06-23T21:00:00Z',
    stadium: 'bc-place-vancouver',
  },
  {
    slug: 'match-b6',
    groupId: 'group-b',
    homeTeamId: 'BIH',
    awayTeamId: 'QAT',
    date: '2026-06-23T21:00:00Z',
    stadium: 'bc-place-vancouver',
  },
  // Group C - SoFi Stadium
  {
    slug: 'match-c1',
    groupId: 'group-c',
    homeTeamId: 'BRA',
    awayTeamId: 'MAR',
    date: '2026-06-12T02:00:00Z',
    stadium: 'la-stadium',
  },
  {
    slug: 'match-c2',
    groupId: 'group-c',
    homeTeamId: 'HAI',
    awayTeamId: 'SCO',
    date: '2026-06-13T02:00:00Z',
    stadium: 'la-stadium',
  },
  {
    slug: 'match-c3',
    groupId: 'group-c',
    homeTeamId: 'BRA',
    awayTeamId: 'HAI',
    date: '2026-06-17T02:00:00Z',
    stadium: 'la-stadium',
  },
  {
    slug: 'match-c4',
    groupId: 'group-c',
    homeTeamId: 'MAR',
    awayTeamId: 'SCO',
    date: '2026-06-18T02:00:00Z',
    stadium: 'la-stadium',
  },
  {
    slug: 'match-c5',
    groupId: 'group-c',
    homeTeamId: 'BRA',
    awayTeamId: 'SCO',
    date: '2026-06-22T02:00:00Z',
    stadium: 'la-stadium',
  },
  {
    slug: 'match-c6',
    groupId: 'group-c',
    homeTeamId: 'MAR',
    awayTeamId: 'HAI',
    date: '2026-06-22T02:00:00Z',
    stadium: 'la-stadium',
  },
  // Group D - AT&T Stadium
  {
    slug: 'match-d1',
    groupId: 'group-d',
    homeTeamId: 'USA',
    awayTeamId: 'PAR',
    date: '2026-06-12T02:00:00Z',
    stadium: 'dallas-stadium',
  },
  {
    slug: 'match-d2',
    groupId: 'group-d',
    homeTeamId: 'AUS',
    awayTeamId: 'TUR',
    date: '2026-06-13T02:00:00Z',
    stadium: 'dallas-stadium',
  },
  {
    slug: 'match-d3',
    groupId: 'group-d',
    homeTeamId: 'USA',
    awayTeamId: 'AUS',
    date: '2026-06-17T02:00:00Z',
    stadium: 'dallas-stadium',
  },
  {
    slug: 'match-d4',
    groupId: 'group-d',
    homeTeamId: 'PAR',
    awayTeamId: 'TUR',
    date: '2026-06-18T02:00:00Z',
    stadium: 'dallas-stadium',
  },
  {
    slug: 'match-d5',
    groupId: 'group-d',
    homeTeamId: 'USA',
    awayTeamId: 'TUR',
    date: '2026-06-22T02:00:00Z',
    stadium: 'dallas-stadium',
  },
  {
    slug: 'match-d6',
    groupId: 'group-d',
    homeTeamId: 'PAR',
    awayTeamId: 'AUS',
    date: '2026-06-22T02:00:00Z',
    stadium: 'dallas-stadium',
  },
  // Group E - Mercedes-Benz Stadium
  {
    slug: 'match-e1',
    groupId: 'group-e',
    homeTeamId: 'GER',
    awayTeamId: 'CUW',
    date: '2026-06-13T21:00:00Z',
    stadium: 'atlanta-stadium',
  },
  {
    slug: 'match-e2',
    groupId: 'group-e',
    homeTeamId: 'CIV',
    awayTeamId: 'ECU',
    date: '2026-06-14T18:00:00Z',
    stadium: 'atlanta-stadium',
  },
  {
    slug: 'match-e3',
    groupId: 'group-e',
    homeTeamId: 'GER',
    awayTeamId: 'CIV',
    date: '2026-06-19T21:00:00Z',
    stadium: 'atlanta-stadium',
  },
  {
    slug: 'match-e4',
    groupId: 'group-e',
    homeTeamId: 'CUW',
    awayTeamId: 'ECU',
    date: '2026-06-20T18:00:00Z',
    stadium: 'atlanta-stadium',
  },
  {
    slug: 'match-e5',
    groupId: 'group-e',
    homeTeamId: 'GER',
    awayTeamId: 'ECU',
    date: '2026-06-24T21:00:00Z',
    stadium: 'atlanta-stadium',
  },
  {
    slug: 'match-e6',
    groupId: 'group-e',
    homeTeamId: 'CUW',
    awayTeamId: 'CIV',
    date: '2026-06-24T21:00:00Z',
    stadium: 'atlanta-stadium',
  },
  // Group F - Levi's Stadium
  {
    slug: 'match-f1',
    groupId: 'group-f',
    homeTeamId: 'NED',
    awayTeamId: 'JPN',
    date: '2026-06-13T02:00:00Z',
    stadium: 'sf-bay-area-stadium',
  },
  {
    slug: 'match-f2',
    groupId: 'group-f',
    homeTeamId: 'SWE',
    awayTeamId: 'TUN',
    date: '2026-06-14T02:00:00Z',
    stadium: 'sf-bay-area-stadium',
  },
  {
    slug: 'match-f3',
    groupId: 'group-f',
    homeTeamId: 'NED',
    awayTeamId: 'SWE',
    date: '2026-06-19T02:00:00Z',
    stadium: 'sf-bay-area-stadium',
  },
  {
    slug: 'match-f4',
    groupId: 'group-f',
    homeTeamId: 'JPN',
    awayTeamId: 'TUN',
    date: '2026-06-20T02:00:00Z',
    stadium: 'sf-bay-area-stadium',
  },
  {
    slug: 'match-f5',
    groupId: 'group-f',
    homeTeamId: 'NED',
    awayTeamId: 'TUN',
    date: '2026-06-24T02:00:00Z',
    stadium: 'sf-bay-area-stadium',
  },
  {
    slug: 'match-f6',
    groupId: 'group-f',
    homeTeamId: 'JPN',
    awayTeamId: 'SWE',
    date: '2026-06-24T02:00:00Z',
    stadium: 'sf-bay-area-stadium',
  },
  // Group G - Gillette Stadium
  {
    slug: 'match-g1',
    groupId: 'group-g',
    homeTeamId: 'BEL',
    awayTeamId: 'EGY',
    date: '2026-06-14T21:00:00Z',
    stadium: 'boston-stadium',
  },
  {
    slug: 'match-g2',
    groupId: 'group-g',
    homeTeamId: 'IRN',
    awayTeamId: 'NZL',
    date: '2026-06-15T18:00:00Z',
    stadium: 'boston-stadium',
  },
  {
    slug: 'match-g3',
    groupId: 'group-g',
    homeTeamId: 'BEL',
    awayTeamId: 'IRN',
    date: '2026-06-20T21:00:00Z',
    stadium: 'boston-stadium',
  },
  {
    slug: 'match-g4',
    groupId: 'group-g',
    homeTeamId: 'EGY',
    awayTeamId: 'NZL',
    date: '2026-06-21T18:00:00Z',
    stadium: 'boston-stadium',
  },
  {
    slug: 'match-g5',
    groupId: 'group-g',
    homeTeamId: 'BEL',
    awayTeamId: 'NZL',
    date: '2026-06-25T21:00:00Z',
    stadium: 'boston-stadium',
  },
  {
    slug: 'match-g6',
    groupId: 'group-g',
    homeTeamId: 'EGY',
    awayTeamId: 'IRN',
    date: '2026-06-25T21:00:00Z',
    stadium: 'boston-stadium',
  },
  // Group H - Estadio Akron
  {
    slug: 'match-h1',
    groupId: 'group-h',
    homeTeamId: 'ESP',
    awayTeamId: 'CPV',
    date: '2026-06-14T02:00:00Z',
    stadium: 'estadio-guadalajara',
  },
  {
    slug: 'match-h2',
    groupId: 'group-h',
    homeTeamId: 'KSA',
    awayTeamId: 'URU',
    date: '2026-06-15T02:00:00Z',
    stadium: 'estadio-guadalajara',
  },
  {
    slug: 'match-h3',
    groupId: 'group-h',
    homeTeamId: 'ESP',
    awayTeamId: 'KSA',
    date: '2026-06-20T02:00:00Z',
    stadium: 'estadio-guadalajara',
  },
  {
    slug: 'match-h4',
    groupId: 'group-h',
    homeTeamId: 'CPV',
    awayTeamId: 'URU',
    date: '2026-06-21T02:00:00Z',
    stadium: 'estadio-guadalajara',
  },
  {
    slug: 'match-h5',
    groupId: 'group-h',
    homeTeamId: 'ESP',
    awayTeamId: 'URU',
    date: '2026-06-25T02:00:00Z',
    stadium: 'estadio-guadalajara',
  },
  {
    slug: 'match-h6',
    groupId: 'group-h',
    homeTeamId: 'CPV',
    awayTeamId: 'KSA',
    date: '2026-06-25T02:00:00Z',
    stadium: 'estadio-guadalajara',
  },
  // Group I - MetLife Stadium
  {
    slug: 'match-i1',
    groupId: 'group-i',
    homeTeamId: 'FRA',
    awayTeamId: 'SEN',
    date: '2026-06-15T21:00:00Z',
    stadium: 'ny-nj-stadium',
  },
  {
    slug: 'match-i2',
    groupId: 'group-i',
    homeTeamId: 'IRQ',
    awayTeamId: 'NOR',
    date: '2026-06-16T18:00:00Z',
    stadium: 'ny-nj-stadium',
  },
  {
    slug: 'match-i3',
    groupId: 'group-i',
    homeTeamId: 'FRA',
    awayTeamId: 'IRQ',
    date: '2026-06-21T21:00:00Z',
    stadium: 'ny-nj-stadium',
  },
  {
    slug: 'match-i4',
    groupId: 'group-i',
    homeTeamId: 'SEN',
    awayTeamId: 'NOR',
    date: '2026-06-22T18:00:00Z',
    stadium: 'ny-nj-stadium',
  },
  {
    slug: 'match-i5',
    groupId: 'group-i',
    homeTeamId: 'FRA',
    awayTeamId: 'NOR',
    date: '2026-06-26T21:00:00Z',
    stadium: 'ny-nj-stadium',
  },
  {
    slug: 'match-i6',
    groupId: 'group-i',
    homeTeamId: 'SEN',
    awayTeamId: 'IRQ',
    date: '2026-06-26T21:00:00Z',
    stadium: 'ny-nj-stadium',
  },
  // Group J - Arrowhead Stadium
  {
    slug: 'match-j1',
    groupId: 'group-j',
    homeTeamId: 'ARG',
    awayTeamId: 'ALG',
    date: '2026-06-15T02:00:00Z',
    stadium: 'kansas-city-stadium',
  },
  {
    slug: 'match-j2',
    groupId: 'group-j',
    homeTeamId: 'AUT',
    awayTeamId: 'JOR',
    date: '2026-06-16T02:00:00Z',
    stadium: 'kansas-city-stadium',
  },
  {
    slug: 'match-j3',
    groupId: 'group-j',
    homeTeamId: 'ARG',
    awayTeamId: 'AUT',
    date: '2026-06-21T02:00:00Z',
    stadium: 'kansas-city-stadium',
  },
  {
    slug: 'match-j4',
    groupId: 'group-j',
    homeTeamId: 'ALG',
    awayTeamId: 'JOR',
    date: '2026-06-22T02:00:00Z',
    stadium: 'kansas-city-stadium',
  },
  {
    slug: 'match-j5',
    groupId: 'group-j',
    homeTeamId: 'ARG',
    awayTeamId: 'JOR',
    date: '2026-06-26T02:00:00Z',
    stadium: 'kansas-city-stadium',
  },
  {
    slug: 'match-j6',
    groupId: 'group-j',
    homeTeamId: 'ALG',
    awayTeamId: 'AUT',
    date: '2026-06-26T02:00:00Z',
    stadium: 'kansas-city-stadium',
  },
  // Group K - NRG Stadium
  {
    slug: 'match-k1',
    groupId: 'group-k',
    homeTeamId: 'POR',
    awayTeamId: 'COD',
    date: '2026-06-16T21:00:00Z',
    stadium: 'houston-stadium',
  },
  {
    slug: 'match-k2',
    groupId: 'group-k',
    homeTeamId: 'UZB',
    awayTeamId: 'COL',
    date: '2026-06-17T18:00:00Z',
    stadium: 'houston-stadium',
  },
  {
    slug: 'match-k3',
    groupId: 'group-k',
    homeTeamId: 'POR',
    awayTeamId: 'UZB',
    date: '2026-06-22T21:00:00Z',
    stadium: 'houston-stadium',
  },
  {
    slug: 'match-k4',
    groupId: 'group-k',
    homeTeamId: 'COD',
    awayTeamId: 'COL',
    date: '2026-06-23T18:00:00Z',
    stadium: 'houston-stadium',
  },
  {
    slug: 'match-k5',
    groupId: 'group-k',
    homeTeamId: 'POR',
    awayTeamId: 'COL',
    date: '2026-06-27T21:00:00Z',
    stadium: 'houston-stadium',
  },
  {
    slug: 'match-k6',
    groupId: 'group-k',
    homeTeamId: 'COD',
    awayTeamId: 'UZB',
    date: '2026-06-27T21:00:00Z',
    stadium: 'houston-stadium',
  },
  // Group L - Lincoln Financial Field
  {
    slug: 'match-l1',
    groupId: 'group-l',
    homeTeamId: 'ENG',
    awayTeamId: 'CRO',
    date: '2026-06-16T02:00:00Z',
    stadium: 'philadelphia-stadium',
  },
  {
    slug: 'match-l2',
    groupId: 'group-l',
    homeTeamId: 'GHA',
    awayTeamId: 'PAN',
    date: '2026-06-17T02:00:00Z',
    stadium: 'philadelphia-stadium',
  },
  {
    slug: 'match-l3',
    groupId: 'group-l',
    homeTeamId: 'ENG',
    awayTeamId: 'GHA',
    date: '2026-06-22T02:00:00Z',
    stadium: 'philadelphia-stadium',
  },
  {
    slug: 'match-l4',
    groupId: 'group-l',
    homeTeamId: 'CRO',
    awayTeamId: 'PAN',
    date: '2026-06-23T02:00:00Z',
    stadium: 'philadelphia-stadium',
  },
  {
    slug: 'match-l5',
    groupId: 'group-l',
    homeTeamId: 'ENG',
    awayTeamId: 'PAN',
    date: '2026-06-27T02:00:00Z',
    stadium: 'philadelphia-stadium',
  },
  {
    slug: 'match-l6',
    groupId: 'group-l',
    homeTeamId: 'CRO',
    awayTeamId: 'GHA',
    date: '2026-06-27T02:00:00Z',
    stadium: 'philadelphia-stadium',
  },
];

const knockoutMatches = [
  // Round of 32 - June 29-30, July 1-2 (official FIFA WC2026 bracket)
  {
    slug: 'r32-1',
    phase: 'round-of-32',
    homeTeamId: null,
    awayTeamId: null,
    date: '2026-06-29T18:00:00Z',
    stadium: 'dallas-stadium',
    tbd: true,
    tbdHome: '2A',
    tbdAway: '2B',
  },
  {
    slug: 'r32-2',
    phase: 'round-of-32',
    homeTeamId: null,
    awayTeamId: null,
    date: '2026-06-29T21:00:00Z',
    stadium: 'atlanta-stadium',
    tbd: true,
    tbdHome: '1E',
    tbdAway: '3A/B/C/D/F',
  },
  {
    slug: 'r32-3',
    phase: 'round-of-32',
    homeTeamId: null,
    awayTeamId: null,
    date: '2026-06-29T18:00:00Z',
    stadium: 'la-stadium',
    tbd: true,
    tbdHome: '1F',
    tbdAway: '2C',
  },
  {
    slug: 'r32-4',
    phase: 'round-of-32',
    homeTeamId: null,
    awayTeamId: null,
    date: '2026-06-29T21:00:00Z',
    stadium: 'sf-bay-area-stadium',
    tbd: true,
    tbdHome: '1C',
    tbdAway: '2F',
  },
  {
    slug: 'r32-5',
    phase: 'round-of-32',
    homeTeamId: null,
    awayTeamId: null,
    date: '2026-06-30T18:00:00Z',
    stadium: 'mexico-city-stadium',
    tbd: true,
    tbdHome: '1I',
    tbdAway: '3C/D/F/G/H',
  },
  {
    slug: 'r32-6',
    phase: 'round-of-32',
    homeTeamId: null,
    awayTeamId: null,
    date: '2026-06-30T21:00:00Z',
    stadium: 'bc-place-vancouver',
    tbd: true,
    tbdHome: '2E',
    tbdAway: '2I',
  },
  {
    slug: 'r32-7',
    phase: 'round-of-32',
    homeTeamId: null,
    awayTeamId: null,
    date: '2026-06-30T18:00:00Z',
    stadium: 'houston-stadium',
    tbd: true,
    tbdHome: '1A',
    tbdAway: '3C/E/F/H/I',
  },
  {
    slug: 'r32-8',
    phase: 'round-of-32',
    homeTeamId: null,
    awayTeamId: null,
    date: '2026-06-30T21:00:00Z',
    stadium: 'kansas-city-stadium',
    tbd: true,
    tbdHome: '1L',
    tbdAway: '3E/H/I/J/K',
  },
  {
    slug: 'r32-9',
    phase: 'round-of-32',
    homeTeamId: null,
    awayTeamId: null,
    date: '2026-07-01T18:00:00Z',
    stadium: 'ny-nj-stadium',
    tbd: true,
    tbdHome: '1D',
    tbdAway: '3B/E/F/I/J',
  },
  {
    slug: 'r32-10',
    phase: 'round-of-32',
    homeTeamId: null,
    awayTeamId: null,
    date: '2026-07-01T21:00:00Z',
    stadium: 'philadelphia-stadium',
    tbd: true,
    tbdHome: '1G',
    tbdAway: '3A/E/H/I/J',
  },
  {
    slug: 'r32-11',
    phase: 'round-of-32',
    homeTeamId: null,
    awayTeamId: null,
    date: '2026-07-01T18:00:00Z',
    stadium: 'boston-stadium',
    tbd: true,
    tbdHome: '2K',
    tbdAway: '2L',
  },
  {
    slug: 'r32-12',
    phase: 'round-of-32',
    homeTeamId: null,
    awayTeamId: null,
    date: '2026-07-01T21:00:00Z',
    stadium: 'miami-stadium',
    tbd: true,
    tbdHome: '1H',
    tbdAway: '2J',
  },
  {
    slug: 'r32-13',
    phase: 'round-of-32',
    homeTeamId: null,
    awayTeamId: null,
    date: '2026-07-02T18:00:00Z',
    stadium: 'toronto-stadium',
    tbd: true,
    tbdHome: '1B',
    tbdAway: '3E/F/G/I/J',
  },
  {
    slug: 'r32-14',
    phase: 'round-of-32',
    homeTeamId: null,
    awayTeamId: null,
    date: '2026-07-02T21:00:00Z',
    stadium: 'seattle-stadium',
    tbd: true,
    tbdHome: '1J',
    tbdAway: '2H',
  },
  {
    slug: 'r32-15',
    phase: 'round-of-32',
    homeTeamId: null,
    awayTeamId: null,
    date: '2026-07-02T18:00:00Z',
    stadium: 'estadio-monterrey',
    tbd: true,
    tbdHome: '1K',
    tbdAway: '3D/E/I/J/L',
  },
  {
    slug: 'r32-16',
    phase: 'round-of-32',
    homeTeamId: null,
    awayTeamId: null,
    date: '2026-07-02T21:00:00Z',
    stadium: 'estadio-guadalajara',
    tbd: true,
    tbdHome: '2D',
    tbdAway: '2G',
  },
  // Round of 16 - July 4-5 (official FIFA WC2026 bracket)
  {
    slug: 'r16-1',
    phase: 'round-of-16',
    homeTeamId: null,
    awayTeamId: null,
    date: '2026-07-04T18:00:00Z',
    stadium: 'dallas-stadium',
    tbd: true,
    tbdHome: 'W-R32-2',
    tbdAway: 'W-R32-5',
  },
  {
    slug: 'r16-2',
    phase: 'round-of-16',
    homeTeamId: null,
    awayTeamId: null,
    date: '2026-07-04T21:00:00Z',
    stadium: 'atlanta-stadium',
    tbd: true,
    tbdHome: 'W-R32-1',
    tbdAway: 'W-R32-3',
  },
  {
    slug: 'r16-3',
    phase: 'round-of-16',
    homeTeamId: null,
    awayTeamId: null,
    date: '2026-07-05T18:00:00Z',
    stadium: 'mexico-city-stadium',
    tbd: true,
    tbdHome: 'W-R32-4',
    tbdAway: 'W-R32-6',
  },
  {
    slug: 'r16-4',
    phase: 'round-of-16',
    homeTeamId: null,
    awayTeamId: null,
    date: '2026-07-05T21:00:00Z',
    stadium: 'houston-stadium',
    tbd: true,
    tbdHome: 'W-R32-7',
    tbdAway: 'W-R32-8',
  },
  {
    slug: 'r16-5',
    phase: 'round-of-16',
    homeTeamId: null,
    awayTeamId: null,
    date: '2026-07-04T18:00:00Z',
    stadium: 'ny-nj-stadium',
    tbd: true,
    tbdHome: 'W-R32-11',
    tbdAway: 'W-R32-12',
  },
  {
    slug: 'r16-6',
    phase: 'round-of-16',
    homeTeamId: null,
    awayTeamId: null,
    date: '2026-07-04T21:00:00Z',
    stadium: 'philadelphia-stadium',
    tbd: true,
    tbdHome: 'W-R32-9',
    tbdAway: 'W-R32-10',
  },
  {
    slug: 'r16-7',
    phase: 'round-of-16',
    homeTeamId: null,
    awayTeamId: null,
    date: '2026-07-05T18:00:00Z',
    stadium: 'toronto-stadium',
    tbd: true,
    tbdHome: 'W-R32-14',
    tbdAway: 'W-R32-16',
  },
  {
    slug: 'r16-8',
    phase: 'round-of-16',
    homeTeamId: null,
    awayTeamId: null,
    date: '2026-07-05T21:00:00Z',
    stadium: 'la-stadium',
    tbd: true,
    tbdHome: 'W-R32-13',
    tbdAway: 'W-R32-15',
  },
  // Quarterfinals - July 9-10 (official FIFA WC2026 bracket)
  {
    slug: 'qf-1',
    phase: 'quarterfinals',
    homeTeamId: null,
    awayTeamId: null,
    date: '2026-07-09T18:00:00Z',
    stadium: 'dallas-stadium',
    tbd: true,
    tbdHome: 'W-R16-1',
    tbdAway: 'W-R16-2',
  },
  {
    slug: 'qf-2',
    phase: 'quarterfinals',
    homeTeamId: null,
    awayTeamId: null,
    date: '2026-07-09T21:00:00Z',
    stadium: 'miami-stadium',
    tbd: true,
    tbdHome: 'W-R16-5',
    tbdAway: 'W-R16-6',
  },
  {
    slug: 'qf-3',
    phase: 'quarterfinals',
    homeTeamId: null,
    awayTeamId: null,
    date: '2026-07-10T18:00:00Z',
    stadium: 'ny-nj-stadium',
    tbd: true,
    tbdHome: 'W-R16-3',
    tbdAway: 'W-R16-4',
  },
  {
    slug: 'qf-4',
    phase: 'quarterfinals',
    homeTeamId: null,
    awayTeamId: null,
    date: '2026-07-10T21:00:00Z',
    stadium: 'la-stadium',
    tbd: true,
    tbdHome: 'W-R16-7',
    tbdAway: 'W-R16-8',
  },
  // Semifinals - July 13-14 (official FIFA WC2026 bracket)
  {
    slug: 'sf-1',
    phase: 'semifinals',
    homeTeamId: null,
    awayTeamId: null,
    date: '2026-07-13T21:00:00Z',
    stadium: 'dallas-stadium',
    tbd: true,
    tbdHome: 'W-QF-1',
    tbdAway: 'W-QF-2',
  },
  {
    slug: 'sf-2',
    phase: 'semifinals',
    homeTeamId: null,
    awayTeamId: null,
    date: '2026-07-14T21:00:00Z',
    stadium: 'atlanta-stadium',
    tbd: true,
    tbdHome: 'W-QF-3',
    tbdAway: 'W-QF-4',
  },
  // Third Place - July 18
  {
    slug: 'third-place',
    phase: 'third-place',
    homeTeamId: null,
    awayTeamId: null,
    date: '2026-07-18T21:00:00Z',
    stadium: 'la-stadium',
    tbd: true,
    tbdHome: 'L-SF-1',
    tbdAway: 'L-SF-2',
  },
  // Final - July 19
  {
    slug: 'final',
    phase: 'final',
    homeTeamId: null,
    awayTeamId: null,
    date: '2026-07-19T21:00:00Z',
    stadium: 'ny-nj-stadium',
    tbd: true,
    tbdHome: 'W-SF-1',
    tbdAway: 'W-SF-2',
  },
];

function deadline(dateStr: string): string {
  const d = new Date(dateStr);
  d.setMinutes(d.getMinutes() - 10);
  return d.toISOString();
}

async function dropTournament(): Promise<void> {
  const tournamentRef = db.collection('tournaments').doc(TOURNAMENT_ID);
  const subcollectionIds = [
    'groups',
    'teams',
    'matches',
    'group_standings',
    'group_bets',
    'knockout_bets',
    'bets',
    'predictions',
    'rankings',
  ];
  for (const subId of subcollectionIds) {
    const snap = await tournamentRef.collection(subId).get();
    for (const d of snap.docs) await d.ref.delete();
    if (snap.size > 0) console.log(`  · dropped ${snap.size} docs in ${subId}`);
  }
  await tournamentRef.delete();
  console.log('🗑️  Dropped existing tournament\n');
}

async function seedTournament() {
  console.log('🌱 Seeding FIFA World Cup 2026...\n');

  const force = process.argv.includes('--force');
  const tournamentRef = db.collection('tournaments').doc(TOURNAMENT_ID);
  const existing = await tournamentRef.get();
  if (existing.exists) {
    if (!force) {
      console.log('⏭️  Tournament already exists. Skipping.\n');
      return;
    }
    console.log('⚠️  --force: dropping existing tournament...');
    await dropTournament();
  }

  // 1. Create tournament
  const now = admin.firestore.Timestamp.now();
  await tournamentRef.set({
    slug: TOURNAMENT_ID,
    name: 'FIFA World Cup 2026',
    startDate: admin.firestore.Timestamp.fromDate(new Date('2026-06-11T00:00:00Z')),
    endDate: admin.firestore.Timestamp.fromDate(new Date('2026-07-19T23:59:59Z')),
    status: 'draft',
    phases: [
      { name: 'group', order: 1 },
      { name: 'round-of-32', order: 2 },
      { name: 'round-of-16', order: 3 },
      { name: 'quarterfinals', order: 4 },
      { name: 'semifinals', order: 5 },
      { name: 'third-place', order: 6 },
      { name: 'final', order: 7 },
    ],
    createdAt: now,
    updatedAt: now,
  });
  console.log('✅ Tournament created: world-cup-2026');

  // 2. Create groups
  for (const group of groups) {
    await db
      .collection('tournaments')
      .doc(TOURNAMENT_ID)
      .collection('groups')
      .doc(group.slug)
      .set({
        slug: group.slug,
        name: group.name,
        order: group.order,
        teamCount: 4,
        createdAt: admin.firestore.Timestamp.now(),
      });
  }
  console.log(`✅ ${groups.length} groups created`);

  // 3. Create teams
  for (const team of teams) {
    await db
      .collection('tournaments')
      .doc(TOURNAMENT_ID)
      .collection('teams')
      .doc(team.fifaCode)
      .set({
        fifaCode: team.fifaCode,
        name: team.name,
        flagUrl: team.flagUrl,
        groupId: team.groupId,
        createdAt: admin.firestore.Timestamp.now(),
      });
  }
  console.log(`✅ ${teams.length} teams created`);

  // 4. Create group matches
  for (const m of groupMatches) {
    const stadium = stadiums[m.stadium];
    await db
      .collection('tournaments')
      .doc(TOURNAMENT_ID)
      .collection('matches')
      .doc(m.slug)
      .set({
        slug: m.slug,
        phase: 'group',
        groupId: m.groupId,
        homeTeamId: m.homeTeamId,
        awayTeamId: m.awayTeamId,
        date: admin.firestore.Timestamp.fromDate(new Date(m.date)),
        stadium: stadium.name,
        result: { home: null, away: null },
        status: 'scheduled',
        predictionDeadline: admin.firestore.Timestamp.fromDate(new Date(deadline(m.date))),
        createdAt: admin.firestore.Timestamp.now(),
      });
  }
  console.log(`✅ ${groupMatches.length} group matches created`);

  // 5. Create knockout matches
  for (const m of knockoutMatches) {
    const stadium = stadiums[m.stadium];
    await db
      .collection('tournaments')
      .doc(TOURNAMENT_ID)
      .collection('matches')
      .doc(m.slug)
      .set({
        slug: m.slug,
        phase: m.phase,
        groupId: null,
        homeTeamId: null,
        awayTeamId: null,
        date: admin.firestore.Timestamp.fromDate(new Date(m.date)),
        stadium: stadium.name,
        result: { home: null, away: null },
        status: 'scheduled',
        predictionDeadline: admin.firestore.Timestamp.fromDate(new Date(deadline(m.date))),
        tbd: true,
        tbdHome: m.tbdHome,
        tbdAway: m.tbdAway,
        createdAt: admin.firestore.Timestamp.now(),
      });
  }
  console.log(`✅ ${knockoutMatches.length} knockout matches created`);

  console.log(
    `\n🎉 Seed complete! Total: ${1 + groups.length + teams.length + groupMatches.length + knockoutMatches.length} documents`,
  );
}

seedTournament().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
