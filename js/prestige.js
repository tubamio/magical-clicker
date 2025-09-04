export function prestigeGain(power){
  if (power < 1e6) return 0;
  return Math.floor(Math.sqrt(power / 1e6));
}
