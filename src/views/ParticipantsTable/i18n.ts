import i18next from '@/configs/i18n';
import { LOCALES } from '@/helpers/locales';

i18next.addResources(LOCALES.ES, 'TABLE', {
  TITLE: 'Tabla de posiciones',
  SEARCH: 'Buscar',
  HOME: 'Inicio',
  PARTICIPANT: 'Participante',
  POINTS: 'Puntos',
  SCORER: 'Goleador',
  GROUP: 'Grupo',
  GROUP_FIRST: '1°',
  GROUP_SECOND: '2°',
  FINAL_POSITION: 'Final',
  FINAL_FIRST: '1°',
  FINAL_SECOND: '2°',
  FINAL_THIRD: '3°',
  FINAL_FOURTH: '4°',
});
