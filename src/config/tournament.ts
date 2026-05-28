const raw = import.meta.env.PUBLIC_TOURNAMENT_ID;

if (!raw) {
  throw new Error(
    'PUBLIC_TOURNAMENT_ID is not set. Add it to your .env file or set it as a build-time env var.',
  );
}

export const TOURNAMENT_ID: string = raw;
