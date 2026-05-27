import type { FC } from 'react';
import { useEffect, useState } from 'react';

import { Icon } from '@atoms/Icon';
import { Typography } from '@atoms/Typography';

import './CountdownTimer.css';

export interface CountdownTimerProps {
  targetDate: Date;
  label?: string;
  expiredText?: string;
  className?: string;
}

interface TimeParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeRemaining(targetDate: Date): TimeParts {
  const total = targetDate.getTime() - Date.now();
  if (total <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

  return {
    days: Math.floor(total / (1000 * 60 * 60 * 24)),
    hours: Math.floor((total / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((total / (1000 * 60)) % 60),
    seconds: Math.floor((total / 1000) % 60),
  };
}

function padZero(num: number): string {
  return num.toString().padStart(2, '0');
}

export const CountdownTimer: FC<CountdownTimerProps> = ({
  targetDate,
  label,
  expiredText = 'Expired',
  className = '',
}) => {
  const initialTime = getTimeRemaining(targetDate);
  const [time, setTime] = useState<TimeParts>(initialTime);
  const [isExpired, setIsExpired] = useState(
    initialTime.days === 0 &&
      initialTime.hours === 0 &&
      initialTime.minutes === 0 &&
      initialTime.seconds === 0,
  );

  useEffect(() => {
    if (isExpired) return;

    const timer = setInterval(() => {
      const remaining = getTimeRemaining(targetDate);
      setTime(remaining);

      if (
        remaining.days === 0 &&
        remaining.hours === 0 &&
        remaining.minutes === 0 &&
        remaining.seconds === 0
      ) {
        setIsExpired(true);
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate, isExpired]);

  if (isExpired) {
    return (
      <div className={`countdown-timer countdown-timer--expired ${className}`}>
        {label && (
          <Typography variant="small" className="countdown-timer__label">
            {label}
          </Typography>
        )}
        <Typography variant="caption" className="countdown-timer__expired">
          {expiredText}
        </Typography>
      </div>
    );
  }

  return (
    <div className={`countdown-timer ${className}`}>
      {label && (
        <Typography variant="small" className="countdown-timer__label">
          {label}
        </Typography>
      )}
      <div className="countdown-timer__time">
        <Icon name="clock" size={16} />
        <div className="countdown-timer__segments">
          {time.days > 0 && (
            <div className="countdown-timer__segment">
              <Typography variant="h3">{padZero(time.days)}</Typography>
              <Typography variant="caption">d</Typography>
            </div>
          )}
          <div className="countdown-timer__segment">
            <Typography variant="h3">{padZero(time.hours)}</Typography>
            <Typography variant="caption">h</Typography>
          </div>
          <div className="countdown-timer__segment">
            <Typography variant="h3">{padZero(time.minutes)}</Typography>
            <Typography variant="caption">m</Typography>
          </div>
          <div className="countdown-timer__segment">
            <Typography variant="h3">{padZero(time.seconds)}</Typography>
            <Typography variant="caption">s</Typography>
          </div>
        </div>
      </div>
    </div>
  );
};
