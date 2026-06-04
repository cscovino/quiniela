import fs from 'fs';
import path from 'path';

const teams = [
  // Group A
  { fifaCode: 'MEX', name: { es: 'México', en: 'Mexico' }, groupId: 'A' },
  { fifaCode: 'RSA', name: { es: 'Sudáfrica', en: 'South Africa' }, groupId: 'A' },
  { fifaCode: 'KOR', name: { es: 'Corea del Sur', en: 'South Korea' }, groupId: 'A' },
  { fifaCode: 'CZE', name: { es: 'Chequia', en: 'Czechia' }, groupId: 'A' },
  // Group B
  { fifaCode: 'CAN', name: { es: 'Canadá', en: 'Canada' }, groupId: 'B' },
  { fifaCode: 'BIH', name: { es: 'Bosnia y Herzegovina', en: 'Bosnia and Herzegovina' }, groupId: 'B' },
  { fifaCode: 'QAT', name: { es: 'Catar', en: 'Qatar' }, groupId: 'B' },
  { fifaCode: 'SUI', name: { es: 'Suiza', en: 'Switzerland' }, groupId: 'B' },
  // Group C
  { fifaCode: 'BRA', name: { es: 'Brasil', en: 'Brazil' }, groupId: 'C' },
  { fifaCode: 'MAR', name: { es: 'Marruecos', en: 'Morocco' }, groupId: 'C' },
  { fifaCode: 'HAI', name: { es: 'Haití', en: 'Haiti' }, groupId: 'C' },
  { fifaCode: 'SCO', name: { es: 'Escocia', en: 'Scotland' }, groupId: 'C' },
  // Group D
  { fifaCode: 'USA', name: { es: 'Estados Unidos', en: 'United States' }, groupId: 'D' },
  { fifaCode: 'PAR', name: { es: 'Paraguay', en: 'Paraguay' }, groupId: 'D' },
  { fifaCode: 'AUS', name: { es: 'Australia', en: 'Australia' }, groupId: 'D' },
  { fifaCode: 'TUR', name: { es: 'Turquía', en: 'Turkey' }, groupId: 'D' },
  // Group E
  { fifaCode: 'GER', name: { es: 'Alemania', en: 'Germany' }, groupId: 'E' },
  { fifaCode: 'CUW', name: { es: 'Curazao', en: 'Curaçao' }, groupId: 'E' },
  { fifaCode: 'CIV', name: { es: 'Costa de Marfil', en: 'Ivory Coast' }, groupId: 'E' },
  { fifaCode: 'ECU', name: { es: 'Ecuador', en: 'Ecuador' }, groupId: 'E' },
  // Group F
  { fifaCode: 'NED', name: { es: 'Países Bajos', en: 'Netherlands' }, groupId: 'F' },
  { fifaCode: 'JPN', name: { es: 'Japón', en: 'Japan' }, groupId: 'F' },
  { fifaCode: 'SWE', name: { es: 'Suecia', en: 'Sweden' }, groupId: 'F' },
  { fifaCode: 'TUN', name: { es: 'Túnez', en: 'Tunisia' }, groupId: 'F' },
  // Group G
  { fifaCode: 'BEL', name: { es: 'Bélgica', en: 'Belgium' }, groupId: 'G' },
  { fifaCode: 'EGY', name: { es: 'Egipto', en: 'Egypt' }, groupId: 'G' },
  { fifaCode: 'IRN', name: { es: 'Irán', en: 'Iran' }, groupId: 'G' },
  { fifaCode: 'NZL', name: { es: 'Nueva Zelanda', en: 'New Zealand' }, groupId: 'G' },
  // Group H
  { fifaCode: 'ESP', name: { es: 'España', en: 'Spain' }, groupId: 'H' },
  { fifaCode: 'CPV', name: { es: 'Cabo Verde', en: 'Cape Verde' }, groupId: 'H' },
  { fifaCode: 'KSA', name: { es: 'Arabia Saudita', en: 'Saudi Arabia' }, groupId: 'H' },
  { fifaCode: 'URU', name: { es: 'Uruguay', en: 'Uruguay' }, groupId: 'H' },
  // Group I
  { fifaCode: 'FRA', name: { es: 'Francia', en: 'France' }, groupId: 'I' },
  { fifaCode: 'SEN', name: { es: 'Senegal', en: 'Senegal' }, groupId: 'I' },
  { fifaCode: 'IRQ', name: { es: 'Irak', en: 'Iraq' }, groupId: 'I' },
  { fifaCode: 'NOR', name: { es: 'Noruega', en: 'Norway' }, groupId: 'I' },
  // Group J
  { fifaCode: 'ARG', name: { es: 'Argentina', en: 'Argentina' }, groupId: 'J' },
  { fifaCode: 'ALG', name: { es: 'Argelia', en: 'Algeria' }, groupId: 'J' },
  { fifaCode: 'AUT', name: { es: 'Austria', en: 'Austria' }, groupId: 'J' },
  { fifaCode: 'JOR', name: { es: 'Jordania', en: 'Jordan' }, groupId: 'J' },
  // Group K
  { fifaCode: 'POR', name: { es: 'Portugal', en: 'Portugal' }, groupId: 'K' },
  { fifaCode: 'COD', name: { es: 'RD Congo', en: 'DR Congo' }, groupId: 'K' },
  { fifaCode: 'UZB', name: { es: 'Uzbekistán', en: 'Uzbekistan' }, groupId: 'K' },
  { fifaCode: 'COL', name: { es: 'Colombia', en: 'Colombia' }, groupId: 'K' },
  // Group L
  { fifaCode: 'ENG', name: { es: 'Inglaterra', en: 'England' }, groupId: 'L' },
  { fifaCode: 'CRO', name: { es: 'Croacia', en: 'Croatia' }, groupId: 'L' },
  { fifaCode: 'GHA', name: { es: 'Ghana', en: 'Ghana' }, groupId: 'L' },
  { fifaCode: 'PAN', name: { es: 'Panamá', en: 'Panama' }, groupId: 'L' },
];

const groups = [
  { name: 'Group A', order: 1 },
  { name: 'Group B', order: 2 },
  { name: 'Group C', order: 3 },
  { name: 'Group D', order: 4 },
  { name: 'Group E', order: 5 },
  { name: 'Group F', order: 6 },
  { name: 'Group G', order: 7 },
  { name: 'Group H', order: 8 },
  { name: 'Group I', order: 9 },
  { name: 'Group J', order: 10 },
  { name: 'Group K', order: 11 },
  { name: 'Group L', order: 12 },
];

const teamsDir = path.resolve('src/content/teams');
const groupsDir = path.resolve('src/content/groups');

fs.mkdirSync(teamsDir, { recursive: true });
fs.mkdirSync(groupsDir, { recursive: true });

for (const team of teams) {
  const slug = team.fifaCode.toLowerCase();
  const filePath = path.join(teamsDir, `${slug}.json`);
  fs.writeFileSync(filePath, JSON.stringify(team, null, 2) + '\n');
  console.log(`✓ Created ${filePath}`);
}

for (const group of groups) {
  const slug = group.name.toLowerCase().replace(' ', '-');
  const filePath = path.join(groupsDir, `${slug}.json`);
  fs.writeFileSync(filePath, JSON.stringify(group, null, 2) + '\n');
  console.log(`✓ Created ${filePath}`);
}

console.log(`\n✓ Generated ${teams.length} teams and ${groups.length} groups`);
