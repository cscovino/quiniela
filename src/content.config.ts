import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const teamsCollection = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/teams' }),
  schema: z.object({
    fifaCode: z.string().length(3),
    name: z.string(),
    groupId: z.string(),
  }),
});

const groupsCollection = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/groups' }),
  schema: z.object({
    name: z.string(),
    order: z.number().int().positive(),
    teamCount: z.number().int().positive().default(4),
  }),
});

export const collections = {
  teams: teamsCollection,
  groups: groupsCollection,
};
