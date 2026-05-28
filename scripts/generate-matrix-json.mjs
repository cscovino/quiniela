import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve } from 'path';

const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

function generateCombinations(arr, size) {
  const result = [];
  function backtrack(start, current) {
    if (current.length === size) {
      result.push([...current]);
      return;
    }
    for (let i = start; i < arr.length; i++) {
      current.push(arr[i]);
      backtrack(i + 1, current);
      current.pop();
    }
  }
  backtrack(0, []);
  return result;
}

const SLOT_PRIORITIES = [
  { slot: 'M74', groups: ['A', 'B', 'C', 'D', 'F'] },
  { slot: 'M77', groups: ['C', 'D', 'F', 'G', 'H'] },
  { slot: 'M79', groups: ['C', 'E', 'F', 'H', 'I'] },
  { slot: 'M80', groups: ['E', 'H', 'I', 'J', 'K'] },
  { slot: 'M81', groups: ['B', 'E', 'F', 'I', 'J'] },
  { slot: 'M82', groups: ['A', 'E', 'H', 'I', 'J'] },
  { slot: 'M85', groups: ['E', 'F', 'G', 'I', 'J'] },
  { slot: 'M87', groups: ['D', 'E', 'I', 'J', 'L'] },
];

function kuhnMatch(groups, slotGroups, slots) {
  const adj = {};
  for (const g of groups) {
    adj[g] = slots.filter(s => slotGroups[s].includes(g));
  }

  const matchSlotToGroup = {};

  function tryKuhn(g, visited) {
    for (const s of adj[g]) {
      if (visited.has(s)) continue;
      visited.add(s);
      if (matchSlotToGroup[s] === undefined || tryKuhn(matchSlotToGroup[s], visited)) {
        matchSlotToGroup[s] = g;
        return true;
      }
    }
    return false;
  }

  for (const g of groups) {
    const visited = new Set();
    if (!tryKuhn(g, visited)) return null;
  }

  return matchSlotToGroup;
}

function assignThirdPlaceTeams(advancingGroups) {
  const sorted = [...advancingGroups].sort();
  const slotGroups = {};
  for (const { slot, groups } of SLOT_PRIORITIES) {
    slotGroups[slot] = groups;
  }
  const slots = SLOT_PRIORITIES.map(p => p.slot);

  const matching = kuhnMatch(sorted, slotGroups, slots);
  return matching || {};
}

const combinations = generateCombinations(GROUPS, 8);
const matrix = {};

for (const combo of combinations) {
  const key = combo.sort().join('');
  const assignments = assignThirdPlaceTeams(combo);

  const mapping = {};
  for (const [slot, group] of Object.entries(assignments)) {
    mapping[slot] = group;
  }

  matrix[key] = mapping;
}

console.log(`Generated ${Object.keys(matrix).length} combinations`);
console.log('Sample entries:');
const sampleKeys = Object.keys(matrix).slice(0, 3);
for (const k of sampleKeys) {
  console.log(`  ${k}:`, JSON.stringify(matrix[k]));
}

if (Object.keys(matrix).length !== 495) {
  console.error(`ERROR: Expected 495 combinations, got ${Object.keys(matrix).length}`);
  process.exit(1);
}

for (const [key, mapping] of Object.entries(matrix)) {
  if (Object.keys(mapping).length !== 8) {
    console.error(`ERROR: ${key} has ${Object.keys(mapping).length} slots, expected 8`);
    process.exit(1);
  }
}

console.log('All validations passed');

const jsonOutput = JSON.stringify(matrix);
const outDir = resolve('public/data');
if (!existsSync(outDir)) {
  mkdirSync(outDir, { recursive: true });
}

writeFileSync(`${outDir}/third-place-matrix.json`, jsonOutput);
console.log(`Written to public/data/third-place-matrix.json (${jsonOutput.length} bytes)`);
