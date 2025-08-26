// Ver.0.1.1.8 format.js (clean rewrite)
// Formatting utilities for JP (万・億…) and ENG (engineering e±3n)

let __mode = 'jp';
export function setFormatMode(m){ __mode = (m === 'eng') ? 'eng' : 'jp'; }
export function getFormatMode(){ return __mode; }

function sign(n){ return n < 0 ? '-' : ''; }
function abs(n){ return n < 0 ? -n : n; }
function digitsInt(a){ return a >= 1 ? Math.floor(Math.log10(a)) + 1 : 0; }
function pow10(e){ return 10 ** e; }
function strRound(val, dec){ return (Math.round(val * pow10(dec)) / pow10(dec)).toFixed(dec); }

// ===== JP formatting =====
// < 1万: 有効3桁の通常表記
// >= 1万: 上位/下位2段（例: 1億2345万）。下位0なら省略
// 1000 無量大数 以上は ENG にフォールバック
const UNITS = ['', '万', '億', '兆', '京', '垓', '𥝱', '穣', '溝', '澗', '正', '載', '極', '恒河沙', '阿僧祇', '那由他', '不可思議', '無量大数'];
const UNIT_BASES = UNITS.map((_, k) => pow10(k * 4));

function sig3Plain(n){
  if (!Number.isFinite(n)) return String(n);
  if (n === 0) return '0';
  const s = sign(n);
  const a = abs(n);
  // 有効3桁
  const exp = Math.floor(Math.log10(a));
  if (a >= 1){
    const d = exp + 1;
    const dec = Math.max(0, 3 - d);
    return s + strRound(a, dec);
  } else {
    const dec = Math.max(0, 3 - 1 - exp); // 0.xxx で3桁
    return s + strRound(a, dec);
  }
}

function formatJP(x){
  const n = Number(x);
  if (!Number.isFinite(n)) return String(n);
  if (n === 0) return '0';
  const s = sign(n);
  const a = abs(n);

  if (a < 1e4) return sig3Plain(n); // 符号付きで返している

  // 上限チェック（1000 無量大数 以上）
  const maxIdx = UNITS.length - 1;
  const maxBase = UNIT_BASES[maxIdx]; // 10^(4*maxIdx)
  if (a >= 1000 * maxBase){
    return formatENG(n); // フォールバック
  }

  // どの桁の単位か
  let k = Math.min(maxIdx, Math.floor(Math.log10(a) / 4));
  // 安全に上げ下げ（浮動誤差対策）
  while (k < maxIdx && a >= pow10((k+1) * 4)) k++;
  while (k > 0 && a < pow10(k * 4)) k--;

  const upper = Math.floor(a / pow10(k * 4));
  const rem = a - upper * pow10(k * 4);
  const lower = (k > 0) ? Math.floor(rem / pow10((k - 1) * 4)) : 0;

  let out = s + String(upper) + UNITS[k];
  if (k > 0 && lower > 0) out += String(lower) + UNITS[k - 1];
  return out;
}

// ===== ENG formatting =====
// 有効3桁。|exp| < 3 は指数なし、|exp| >= 3 で工学式（e±3n）
function formatENG(x){
  const n = Number(x);
  if (!Number.isFinite(n)) return String(n);
  if (n === 0) return "0.00";
  const s = sign(n);
  const a = abs(n);
  const rawExp = a > 0 ? Math.floor(Math.log10(a)) : 0;

  // 指数なし（有効3桁）
  if (Math.abs(rawExp) < 3){
    if (a >= 1){
      const d = digitsInt(a);
      const dec = Math.max(0, 3 - d);
      return s + strRound(a, dec);
    } else {
      const dec = Math.max(0, 3 - 1 - Math.floor(Math.log10(a)));
      return s + strRound(a, dec);
    }
  }

  // 工学式 e(±3n)
  const e3 = Math.floor(rawExp / 3) * 3;
  const mant = a / pow10(e3);
  const dMant = mant >= 100 ? 3 : (mant >= 10 ? 2 : 1);
  const dec = Math.max(0, 3 - dMant);
  const rounded = Math.round(mant * pow10(dec)) / pow10(dec);
  return s + rounded.toFixed(dec) + "e" + e3;
}

export function fmt(x){ return __mode === 'eng' ? formatENG(x) : formatJP(x); }
export { formatJP, formatENG };
