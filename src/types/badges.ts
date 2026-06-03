import type { IconName } from '@atoms/Icon';

export interface BadgeDefinition {
  id: string;
  name: { en: string; es: string };
  description: { en: string; es: string };
  icon: IconName;
  condition: { en: string; es: string };
}

export const BADGE_DEFINITIONS: BadgeDefinition[] = [
  {
    id: 'first-blood',
    name: { en: 'First Blood', es: 'Primera Sangre' },
    description: { en: 'Made your first prediction', es: 'Hiciste tu primera predicción exacta' },
    icon: 'sword',
    condition: { en: 'Make 1 exact prediction', es: 'Haz 1 predicción exacta' },
  },
  {
    id: 'on-fire',
    name: { en: 'On Fire', es: 'En Llamas' },
    description: { en: '3 exact predictions in a row', es: '3 predicciones exactas seguidas' },
    icon: 'fire',
    condition: {
      en: 'Get 3 exact predictions in a row',
      es: 'Acierta 3 predicciones exactas seguidas',
    },
  },
  {
    id: 'consistent',
    name: { en: 'Consistent', es: 'Consistente' },
    description: { en: '20+ correct predictions total', es: '20+ predicciones correctas en total' },
    icon: 'target',
    condition: { en: 'Get 20 correct predictions', es: 'Acierta 20 predicciones' },
  },
  {
    id: 'top-10',
    name: { en: 'Top 10', es: 'Top 10' },
    description: { en: 'Reached top 10% of the ranking', es: 'Llegaste al top 10% del ranking' },
    icon: 'award',
    condition: { en: 'Be in the top 10% of the ranking', es: 'Estar en el top 10% del ranking' },
  },
  {
    id: 'perfect-group',
    name: { en: 'Perfect Group', es: 'Grupo Perfecto' },
    description: {
      en: '16 group standings predicted correctly',
      es: '16 clasificaciones de grupos acertadas',
    },
    icon: 'trophy',
    condition: {
      en: 'Predict 16 group standings correctly',
      es: 'Acerta 16 clasificaciones de grupos',
    },
  },
  {
    id: 'clairvoyant',
    name: { en: 'Clairvoyant', es: 'Clarividente' },
    description: {
      en: 'Predicted the tournament winner early',
      es: 'Predijiste el ganador del torneo temprano',
    },
    icon: 'eye',
    condition: {
      en: 'Predict the tournament winner from group stage',
      es: 'Predice al ganador del torneo desde la fase de grupos',
    },
  },
];

export const getBadgeDefinition = (badgeId: string): BadgeDefinition | undefined => {
  return BADGE_DEFINITIONS.find((b) => b.id === badgeId);
};

export const getBadgeName = (badgeId: string, locale: 'en' | 'es'): string => {
  const def = getBadgeDefinition(badgeId);
  return def ? def.name[locale] : badgeId;
};

export const getBadgeDescription = (badgeId: string, locale: 'en' | 'es'): string => {
  const def = getBadgeDefinition(badgeId);
  return def ? def.description[locale] : '';
};
