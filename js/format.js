/* format.js — cleaned & unified (JP/ENG) formatter
 * Exports:
 *   - setFormatMode('jp' | 'eng')
 *   - fmt(number): string
 * Rules:
 *   JP:
 *     - < 1万: 有効3桁
 *     - ≥ 1万: 上位/下位2段 (例: 1億2345万) ※下位0は省略
 *     - 超巨大は ENG にフォールバック
 *   ENG:
 *     - 有効3桁
 *     - |exp| >= 3 は工学式 (e±3n)
 */
let _mode = 'jp';

export function setFormatMode(mode) {
  if (mode === 'jp' || mode === 'eng') _mode = mode;
}

export function fmt(x) {
  if (Number.isNaN(x)) return 'NaN';
  if (!Number.isFinite(x)) return String(x);
  // Normalize -0 to 0
  if (Object.is(x, -0)) x = 0;

  return _mode === 'jp' ? fmtJP(x) : fmtENG(x);
}

/* ---------- Helpers ---------- */

function absExp10(a){
  // floor(log10(|a|)) with safe handling
  return Math.floor(Math.log10(Math.abs(a)));
}

function sigToFixed(a, sig=3){
  // Represent |a| with 'sig' significant digits in non-exponential fixed form
  if (a === 0) return '0';
  const exp = absExp10(a);
  const dec = Math.max(0, sig - 1 - exp);
  return (a).toFixed(dec);
}

/* ---------- ENG formatter ---------- */
function fmtENG(n){
  const s = n < 0 ? '-' : '';
  const a = Math.abs(n);
  if (a === 0) return '0';

  const rawExp = absExp10(a);
  if (Math.abs(rawExp) >= 3){
    // engineering notation: exponent multiple of 3
    const e3 = Math.floor(rawExp / 3) * 3;
    const mant = a / (10 ** e3);
    // 3 significant digits: determine decimals by integer width of mant (1..3)
    const di = mant >= 100 ? 3 : (mant >= 10 ? 2 : 1);
    const dec = Math.max(0, 3 - di);
    const rounded = Math.round(mant * 10 ** dec) / 10 ** dec;
    return s + rounded.toFixed(dec) + "e" + e3;
  } else {
    return s + sigToFixed(a, 3);
  }
}

/* ---------- JP formatter ---------- */
const JP_UNITS = [
  '', '万', '億', '兆', '京', '垓', '秭', '穣', '溝', '澗',
  '正', '載', '極', '恒河沙', '阿僧祇', '那由他', '不可思議', '無量大数'
];

function fmtJP(n){
  const s = n < 0 ? '-' : '';
  const a = Math.abs(n);

  if (a === 0) return '0';

  // < 1万 → 有効3桁（固定小数）
  if (a < 1e4){
    return s + sigToFixed(a, 3);
  }

  // Group by 10^4 with unit names
  const exp10 = absExp10(a);
  const group = Math.floor(exp10 / 4); // 10^4 per step
  if (group >= JP_UNITS.length){
    // 超巨大 → ENG へフォールバック
    return s + fmtENG(a);
  }

  const powTop = 10 ** (group * 4);
  const top = Math.floor(a / powTop); // 上位
  const rem = a - top * powTop;

  let out = s + String(top) + JP_UNITS[group];

  if (group >= 1){
    const powLow = 10 ** ((group - 1) * 4);
    const low = Math.floor(rem / powLow);
    if (low > 0){
      out += String(low) + JP_UNITS[group - 1];
    }
  }

  return out;
}
