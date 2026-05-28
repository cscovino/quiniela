import * as admin from 'firebase-admin';

const appCheck = admin.appCheck();

export async function verifyAppCheckToken(
  req: { header: (name: string) => string | undefined },
  res: { set: (key: string, value: string) => void; status: (code: number) => { json: (body: unknown) => void } },
): Promise<boolean> {
  const appCheckToken = req.header('X-Firebase-AppCheck');
  if (!appCheckToken) {
    res.status(401).json({ error: 'Unauthorized: App Check token missing' });
    return false;
  }

  try {
    await appCheck.verifyToken(appCheckToken);
    return true;
  } catch {
    res.status(401).json({ error: 'Unauthorized: App Check token invalid' });
    return false;
  }
}