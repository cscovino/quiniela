import fs from 'fs';
import path from 'path';

const teams = [
  { fifaCode: 'MEX', name: 'Mexico', groupId: 'A' },
  { fifaCode: 'RSA', name: 'South Africa', groupId: 'A' },
  { fifaCode: 'KOR', name: 'South Korea', groupId: 'A' },
  { fifaCode: 'CZE', name: 'Czech Republic', groupId: 'A' },
  { fifaCode: 'CAN', name: 'Canada', groupId: 'B' },
  { fifaCode: 'BIH', name: 'Bosnia and Herzegovina', groupId: 'B' },
  { fifaCode: 'QAT', name: 'Qatar', groupId: 'B' },
  { fifaCode: 'SUI', name: 'Switzerland', groupId: 'B' },
  { fifaCode: 'BRA', name: 'Brazil', groupId: 'C' },
  { fifaCode: 'MAR', name: 'Morocco', groupId: 'C' },
  { fifaCode: 'HAI', name: 'Haiti', groupId: 'C' },
  { fifaCode: 'SCO', name: 'Scotland', groupId: 'C' },
  { fifaCode: 'USA', name: 'United States', groupId: 'D' },
  { fifaCode: 'PAR', name: 'Paraguay', groupId: 'D' },
  { fifaCode: 'AUS', name: 'Australia', groupId: 'D' },
  { fifaCode: 'TUR', name: 'Turkey', groupId: 'D' },
  { fifaCode: 'GER', name: 'Germany', groupId: 'E' },
  { fifaCode: 'CUW', name: 'Curaçao', groupId: 'E' },
  { fifaCode: 'CIV', name: 'Ivory Coast', groupId: 'E' },
  { fifaCode: 'ECU', name: 'Ecuador', groupId: 'E' },
  { fifaCode: 'NED', name: 'Netherlands', groupId: 'F' },
  { fifaCode: 'JPN', name: 'Japan', groupId: 'F' },
  { fifaCode: 'SWE', name: 'Sweden', groupId: 'F' },
  { fifaCode: 'TUN', name: 'Tunisia', groupId: 'F' },
  { fifaCode: 'BEL', name: 'Belgium', groupId: 'G' },
  { fifaCode: 'EGY', name: 'Egypt', groupId: 'G' },
  { fifaCode: 'IRN', name: 'Iran', groupId: 'G' },
  { fifaCode: 'NZL', name: 'New Zealand', groupId: 'G' },
  { fifaCode: 'ESP', name: 'Spain', groupId: 'H' },
  { fifaCode: 'CPV', name: 'Cape Verde', groupId: 'H' },
  { fifaCode: 'KSA', name: 'Saudi Arabia', groupId: 'H' },
  { fifaCode: 'URU', name: 'Uruguay', groupId: 'H' },
  { fifaCode: 'FRA', name: 'France', groupId: 'I' },
  { fifaCode: 'GHA', name: 'Ghana', groupId: 'I' },
  { fifaCode: 'NCL', name: 'New Caledonia', groupId: 'I' },
  { fifaCode: 'ARG', name: 'Argentina', groupId: 'I' },
  { fifaCode: 'ITA', name: 'Italy', groupId: 'J' },
  { fifaCode: 'COD', name: 'DR Congo', groupId: 'J' },
  { fifaCode: 'PAN', name: 'Panama', groupId: 'J' },
  { fifaCode: 'COL', name: 'Colombia', groupId: 'J' },
  { fifaCode: 'ENG', name: 'England', groupId: 'K' },
  { fifaCode: 'UZB', name: 'Uzbekistan', groupId: 'K' },
  { fifaCode: 'CUB', name: 'Cuba', groupId: 'K' },
  { fifaCode: 'POR', name: 'Portugal', groupId: 'K' },
  { fifaCode: 'JAM', name: 'Jamaica', groupId: 'L' },
  { fifaCode: 'NGA', name: 'Nigeria', groupId: 'L' },
  { fifaCode: 'CRC', name: 'Costa Rica', groupId: 'L' },
  { fifaCode: 'DEN', name: 'Denmark', groupId: 'L' },
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
