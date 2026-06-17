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
    description: { en: 'Made your first prediction', es: 'Hiciste tu primera predicción' },
    icon: 'sword',
    condition: { en: 'Make 1 exact prediction', es: 'Haz 1 predicción exacta' },
  },
  {
    id: 'back-to-back',
    name: { en: 'Back to Back', es: 'Dos de Seguido' },
    description: { en: '2 exact predictions in a row', es: '2 predicciones exactas seguidas' },
    icon: 'zap',
    condition: {
      en: 'Get 2 exact predictions in a row',
      es: 'Acierta 2 predicciones exactas seguidas',
    },
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
    id: 'perfectionist',
    name: { en: 'Perfectionist', es: 'Perfeccionista' },
    description: { en: '5 exact predictions total', es: '5 predicciones exactas en total' },
    icon: 'star',
    condition: { en: 'Get 5 exact predictions', es: 'Acierta 5 predicciones exactas' },
  },
  {
    id: 'consistent',
    name: { en: 'Consistent', es: 'Consistente' },
    description: { en: '20 correct predictions total', es: '20 predicciones correctas en total' },
    icon: 'target',
    condition: { en: 'Get 20 correct predictions', es: 'Acierta 20 predicciones' },
  },
  {
    id: 'almost-perfect',
    name: { en: 'Almost Perfect', es: 'Casi Perfecto' },
    description: { en: '12 correct predictions total', es: '12 predicciones correctas en total' },
    icon: 'target',
    condition: { en: 'Get 12 correct predictions', es: 'Acierta 12 predicciones' },
  },
  {
    id: 'top-10',
    name: { en: 'Top 5', es: 'Top 5' },
    description: { en: 'Reached top 5% of the ranking', es: 'Llegaste al top 5% del ranking' },
    icon: 'award',
    condition: { en: 'Be in the top 5% of the ranking', es: 'Estar en el top 5% del ranking' },
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
