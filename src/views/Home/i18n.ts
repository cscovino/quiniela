import i18next from '@/configs/i18n';
import { LOCALES } from '@/helpers/locales';

i18next.addResources(LOCALES.ES, 'HOME', {
  TITLE: '¡Bienvenido a la quiniela del mundial!',
  SUBTITLE: 'Te recordamos las reglas:',
  LINK: 'Acá',
  HELP: ' puedes descargar un excel si lo necesitas para tener de guía.',
  RULES: [
    'El ganador de la quiniela será el que acumule la mayor cantidad de puntos. Se obtienen puntos con los marcadores de los de los juegos de la primera ronda, con el cuadro de los cuatro finalistas  y con el nombre del goleador del mundial.',
    'Si aciertas el marcador final del partido ganas 5 puntos.',
    'Si aciertas el ganador o el empate pero no el marcador exacto ganas 3 puntos.',
    'Si aciertas los equipos que pasan la zona de grupos en la posición exacta ganas 10 puntos por cada uno.',
    'Si aciertas los equipos que pasan la zona de grupos pero no en la posición exacta ganas 5 puntos por cada uno.',
    'En el cuadro final por cada equipo que aciertes en la posición correcta ganas 20 puntos.',
    'En el cuadro final por cada equpo que aciertes pero no en la posición exacta ganas 10 puntos.',
    'Si aciertas al goleador del campeonato ganas 20 puntos. Si hay empate igual se ganan todos los puntos.',
    'Cuando comience el torneo podrás ver la tabla de participantes en esta misma página.',
    'El costo para participar es de 2 USD. Del total recaudado la premiación es la siguiente 70% primero, 15% segundo, 10% tercero y 5% premio sorpresa.',
    'Para pagos en USD a través de zelle: carsco13@gmail.com. Para pagos en Bs (al cambio paralelo) a través de pago móvil: 04166460249, CI 9234795. Importante notificar el pago enviando un comprobante al correo carsco13@gmail.com indicando los participantes que están pagando.',
  ],
  BYE: '¡Te deseamos mucha suerte!',
  NEXT: 'Empezar',
  PARTICIPANTS: 'Participantes',
});
