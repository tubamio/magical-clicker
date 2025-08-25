// format.js — Ver.0.1.0.1
// 表記モード: 'jp' 日本式 / 'eng' 工学式（エンジニアリング）
let __mode = 'jp';
export function setFormatMode(m){ __mode = (m==='eng' ? 'eng' : 'jp'); }
export function getFormatMode(){ return __mode; }

// ===== 共通ユーティリティ =====
function signStr(n){ return n < 0 ? '-' : ''; }
function abs(n){ return Math.abs(n); }
function intDigits(a){ return a >= 1 ? Math.floor(Math.log10(a)) + 1 : 0; }

// ===== 1) 日本式 =====
// 1万未満は「指数なし・有効3桁」。例: 1.01, 10.1, 100, 1000
function sig3Plain(n){
  if (!Number.isFinite(n)) return String(n);
  if (n === 0) return '0'; // 0は0表記
  const s = signStr(n);
  const a = abs(n);
  const d = intDigits(a);
  if (d >= 3) return s + Math.round(a).toString();        // 100〜 は整数（有効3桁）
  if (d === 2) return s + (Math.round(a*10)/10).toFixed(1); // 10〜99.9 → 10.1 形式
  if (d === 1) return s + (Math.round(a*100)/100).toFixed(2); // 1〜9.99 → 1.01 形式
  // 1未満：有効3桁になるだけ小数点以下を伸ばす（指数は使わない）
  const exp = Math.floor(Math.log10(a)); // 負の数（-1,-2,...）
  const scale = 3 - 1 - exp; // 小数点以下の桁数
  const val = (Math.round(a * 10**scale) / 10**scale);
  // 小数末尾の0は不要なので削る
  let out = val.toFixed(max(0, scale));
  out = out.replace(/\.0+$/,'');
  return s + out;
}
function max(a,b){ return a>b?a:b; }

const UNITS=['','万','億','兆','京','垓','𥝱','穣','溝','澗','正','載','極','恒河沙','阿僧祇','那由他','不可思議','無量大数'];
const POW4 = (k)=> 10 ** (k*4);

function jpTwoTier(n){
  const s = signStr(n); const a = abs(n);
  const exp = Math.floor(Math.log10(a));
  const g = Math.min(UNITS.length-1, Math.floor(exp/4));
  const top = Math.floor(a / POW4(g));
  const rem = Math.floor(a - top * POW4(g));
  let out = s + top + UNITS[g];
  if (g > 0) {
    const next = g - 1;
    const lo = Math.floor(rem / POW4(next));
    if (lo > 0) out += String(lo) + UNITS[next];
  }
  return out;
}

function formatJP(x){
  const n = Number(x); const a = abs(n);
  if (!Number.isFinite(a)) return String(n);
  const THRESH = 1000 * (10 ** 64); // 1000 無量大数以上はENG
  if (a >= THRESH) return formatENG(x);
  if (a < 1e4) return sig3Plain(n);
  return jpTwoTier(n);
}

// ===== 2) 工学式（エンジニアリング） =====
// ルール:
// - 有効3桁（小数も合わせて3桁）
// - 指数は 3 の倍数のみ使用（e±3, e±6, ...）
// - e表記は最低でも |exp|>=3 から。つまり 1〜999 は指数を使わず 1.01, 10.1, 100 で出す
function formatENG(x){
  const n = Number(x);
  if (!Number.isFinite(n)) return String(n);
  if (n === 0) return '0.00'; // 0は任意だが2桁小数で固定

  const s = signStr(n);
  const a = abs(n);
  if (a < 1000 && a >= 1) {
    // 1〜999 は指数を使わず有効3桁
    const d = intDigits(a);
    if (d >= 3) return s + Math.round(a).toString();
    if (d === 2) return s + (Math.round(a*10)/10).toFixed(1);
    return s + (Math.round(a*100)/100).toFixed(2);
  }
  // 1未満や1000以上は engineering exponent（3の倍数）を使う
  const rawExp = Math.floor(Math.log10(a));
  const e3 = Math.floor(rawExp/3)*3;
  if (e3 === 0) {
    // 0 には来ないはずだが保険：指数0は使わず有効3桁
    const d = intDigits(a);
    if (d >= 3) return s + Math.round(a).toString();
    if (d === 2) return s + (Math.round(a*10)/10).toFixed(1);
    return s + (Math.round(a*100)/100).toFixed(2);
  }
  const mant = a / (10 ** e3); // [1,1000)
  const di = intDigits(mant); // 1,2,3
  const dec = Math.max(0, 3 - di);
  const rounded = Math.round(mant * 10**dec) / 10**dec;
  return s + rounded.toFixed(dec) + 'e' + e3;
}

export function fmt(x){
  return __mode === 'eng' ? formatENG(x) : formatJP(x);
}
