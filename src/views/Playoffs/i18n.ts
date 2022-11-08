import i18next from '@/configs/i18n';
import { LOCALES } from '@/helpers/locales';

i18next.addResources(LOCALES.ES, 'PLAYOFFS', {
  TITLE: 'Eliminatoria Directa',
  SUBTITLE: 'Haga click para seleccionar el equipo ganador',
  NEXT: 'Siguiente',
  MATCH: 'Partido',
  BRONZE: 'TERCER PUESTO',
  MODAL_TITLE: 'Ingresa tu nombre para guardar tus resultados.',
  MODAL_SUBTITLE: 'Cuadro Final:',
  MODAL_SENT: 'Enviar',
});
