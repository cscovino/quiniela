import i18next from '@/configs/i18n';
import { LOCALES } from '@/helpers/locales';

i18next.addResources(LOCALES.ES, 'HOME', {
  TITLE: '¡Bienvenido a la quiniela del mundial!',
  SUBTITLE: 'Te recordamos las reglas:',
  RULES: [
    'Si aciertas el marcador tal como queda ganas 5 puntos.',
    'Si aciertas el ganador o el empate pero no con los goles exactos ganas 2 puntos.',
    'Si aciertas los equipos que pasan la fase de grupos ganas 10 puntos si es en la posición correcta y 5 puntos si no es en la posición correcta.',
    'Si aciertas el campeón ganas 30 puntos y si aciertas el subcampeón 15 puntos',
  ],
  BYE: '¡Te deseamos mucha suerte!',
  NEXT: 'Empezar',
});
