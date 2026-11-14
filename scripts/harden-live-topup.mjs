// Apply to a copy of the inspected VPS server.mjs; never modify the source in place.
import fs from 'node:fs';
const [, , sourcePath, targetPath] = process.argv;
if (!sourcePath || !targetPath || sourcePath === targetPath) {
  throw new Error('Usage: node harden-live-topup.mjs <source> <different-output>');
}
let source = fs.readFileSync(sourcePath, 'utf8');
const replaceOnce = (from, to) => {
  const first = source.indexOf(from);
  if (first < 0 || source.indexOf(from, first + from.length) !== -1) {
    throw new Error('Expected exactly one occurrence: ' + from.slice(0, 65));
  }
  source = source.replace(from, to);
};
const guard = "  if (!ticket && !charParam) {";
replaceOnce(guard, `  // Public release: character names are not proof of account ownership.
  if (process.env.TOPUP_MODE === 'PRODUCTION' && !ticket) {
    return fail(res, 401, 'Use the game-issued ticket or 8-digit pairing code.');
  }
  if (!ticket && !charParam) {`);
const original = "if (process.env.NODE_ENV === 'production' && !turnstileToken) {";
const occurrences = source.split(original).length - 1;
if (occurrences !== 2) throw new Error('Expected exactly two Turnstile guards, got ' + occurrences);
// Ticket / 8-digit pairing authentication, per-account and per-IP throttling remain mandatory.
// Turnstile stays enabled by default. Opt out only when the public UI has no widget.
source = source.split(original).join(
  "if (process.env.NODE_ENV === 'production' && process.env.TURNSTILE_REQUIRED !== '0' && !turnstileToken) {"
);
replaceOnce(
  "mode:'LOCAL_ONLY',payments:purchasesAllowed?'LOCAL_OPERATOR_PILOT':'LOCKED',publicVps:false",
  "mode:process.env.TOPUP_MODE==='PRODUCTION'?'PRODUCTION':'LOCAL_ONLY',payments:purchasesAllowed?'ENABLED':'LOCKED',publicVps:process.env.TOPUP_MODE==='PRODUCTION'"
);
const n = source.split("'Public VPS: CLOSED'").length - 1;
if (n !== 2) throw new Error('Expected two public status captions, got ' + n);
source = source.split("'Public VPS: CLOSED'").join("'Public VPS: '+(process.env.TOPUP_MODE==='PRODUCTION'?'ENABLED':'CLOSED')");
fs.writeFileSync(targetPath, source, { flag: 'wx', mode: 0o600 });
console.log('HARDENED_OUTPUT_WRITTEN: public character login denied, production safeguards preserved');
