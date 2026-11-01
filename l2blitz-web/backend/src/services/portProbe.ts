import { connect } from 'node:net';

type Status = 'online' | 'offline' | 'unknown';

// Optional TCP reachability checks configured by an administrator only.
// An open port proves reachability, not that gameplay is fully functional.
export async function probeConfiguredPort(envKey: string): Promise<Status> {
  if (process.env.STATUS_CHECK_ENABLE !== 'true') return 'unknown';
  const port = Number(process.env[envKey]);
  if (!Number.isInteger(port) || port < 1 || port > 65535) return 'unknown';
  const host = process.env.STATUS_CHECK_HOST || '127.0.0.1';
  return await new Promise<Status>((resolve) => {
    const socket = connect({ host, port });
    let settled = false;
    const finish = (status: Status) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      resolve(status);
    };
    socket.setTimeout(1500);
    socket.once('connect', () => finish('online'));
    socket.once('error', () => finish('offline'));
    socket.once('timeout', () => finish('offline'));
  });
}