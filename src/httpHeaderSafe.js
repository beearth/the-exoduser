export function toSafeHeaderValue(value) {
  const str = String(value ?? '');
  // Node HTTP headers accept ASCII visible chars only.
  if (/^[\t\x20-\x7E]*$/.test(str)) return str;
  return encodeURIComponent(str);
}
