import type * as functions from 'firebase-functions/v1';
import { verifyAppCheckToken } from './appCheckMiddleware';

type Handler = (
  req: functions.https.Request,
  res: functions.Response,
) => Promise<void> | void;

export function withAppCheck(handler: Handler, cacheControl: string): Handler {
  return async (req, res) => {
    res.set('Cache-Control', cacheControl);
    res.set('Access-Control-Allow-Origin', '*');
    const ok = await verifyAppCheckToken(req, res);
    if (!ok) return; // middleware already wrote 401 with { error: "..." }
    await handler(req, res);
  };
}