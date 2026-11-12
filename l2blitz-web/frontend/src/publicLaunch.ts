/** Fail closed during Close Beta. Opt in only for the official public launch. */
export const PUBLIC_CHARACTER_DATA_ENABLED = import.meta.env.VITE_PUBLIC_CHARACTER_DATA_ENABLED === 'true';

/**
 * Separate go-live approval from TCP reachability and the scheduled countdown.
 * Both switches default to OFF; publishing the web site never opens game access.
 */
export const PUBLIC_LAUNCH_CONFIRMED = import.meta.env.VITE_PUBLIC_LAUNCH_CONFIRMED === 'true';
export const PUBLIC_TOPUP_ENABLED =
  PUBLIC_LAUNCH_CONFIRMED && import.meta.env.VITE_PUBLIC_TOPUP_ENABLED === 'true';

