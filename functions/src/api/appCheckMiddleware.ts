import * as admin from 'firebase-admin';

const appCheck = admin.appCheck();

export async function verifyAppCheckToken(
  req: { header: (name: string) => string | undefined },
  res: { set: (key: string, value: string) => void; status: (code: number) => { json: (body: unknown) => void } },
  next: () => void
): Promise<void> {
  const appCheckToken = req.header('X-Firebase-AppCheck');
  if (!appCheckToken) {
    res.status(401).json({ error: 'Unauthorized: App Check token missing' });
    return;
  }

  try {
    await appCheck.verifyToken(appCheckToken);
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized: App Check token invalid' });
  }
}
