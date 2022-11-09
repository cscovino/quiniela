import i18next from '@/configs/i18n';
import { LOCALES } from '@/helpers/locales';

i18next.addResources(LOCALES.ES, 'PLAYOFFS', {
  TITLE: 'Eliminatoria Directa',
  SUBTITLE: 'Haga click para seleccionar el equipo ganador',
  NEXT: 'Siguiente',
  MATCH: 'Partido',
  BRONZE: 'TERCER PUESTO',
  MODAL_SUCCESS_TITLE: 'Recibimos tus resultados exitosamente',
  MODAL_SUCCESS_TEXT: '¡Gracias por participar, te deseamos mucha suerte!.',
  MODAL_SUCCESS_SUBTEXT:
    'Cuando comience el torneo podrás visitar esta página para ver la tabla con los resultados.',
  MODAL_SUCCESS_BUTTON: 'OK',
  MODAL_TITLE: 'Ingresa tu nombre para guardar tus resultados.',
  MODAL_SCORER: 'Goleador del torneo:',
  MODAL_PARTICIPANT: 'Participante:',
  MODAL_SUBTITLE: 'Cuadro Final:',
  MODAL_SENT: 'Enviar',
});
