// /src/format.ts
import { D } from "/src/math/dec.ts";

/** ENG: 1.01 / 10.1 / 100 / 1.02e5（指数あり） */
function formatEng(x: any): string {
  const v = D(x);
  const n = v.toNumber();
  if (!Number.isFinite(n) || n === 0) return "0.000";
  const exp = Math.floor(v.log10());
  const m = v.div(D(10).pow(exp)).toNumber();
  const digs = m >= 100 ? 0 : m >= 10 ? 1 : 2;
  if (exp === 0) return m.toFixed(3); // 1.000..9.999
  return `${m.toFixed(digs)}e${exp}`;
}

/** 1万未満: 小数で“有効3桁”（指数なし） */
function sig3NoExpUnder1e4(x: any): string {
  const n = D(x).toNumber();
  if (!Number.isFinite(n)) return String(n);
  const a = Math.abs(n);
  const digs = a >= 100 ? 0 : a >= 10 ? 1 : 2;
  return n.toFixed(digs);
}

/** 日本式: 二段合成（…億…万）まで。整数のみ（例: 5億1000万, 12兆3億） */
function jpTwoTierInt(x: any): string {
  const v = Math.floor(D(x).toNumber());
  if (!Number.isFinite(v)) return String(v);
  if (v < 10000) return String(v);

  const UNITS = ["","万","億","兆","京","垓","𥝱","穣","溝","澗","正","載","極","恒河沙","阿僧祇","那由他","不可思議","無量大数"];
  const pow4 = (k: number) => Math.pow(10, k * 4);

  let g = Math.floor(Math.log10(v) / 4);
  g = Math.min(UNITS.length - 1, Math.max(1, g));
  const top = Math.floor(v / pow4(g));
  const rem = v - top * pow4(g);

  let out = `${top}${UNITS[g]}`;
  if (g > 0) {
    const next = g - 1;
    const lo = Math.floor(rem / pow4(next));
    if (lo > 0) out += `${lo}${UNITS[next]}`;
  }
  return out;
}

/** 日本式スマート:
 *  - 閾値: 1000 無量大数 以上は e表記（ENG）に切替
 *  - 1万未満: 小数Sig3（指数なし）
 *  - 1万以上: 二段合成（整数のみ）
 */
function formatJP(x: any): string {
  const n = D(x).toNumber();
  if (!Number.isFinite(n)) return String(n);
  const abs = Math.abs(n);
  // 無量大数 = 10^(4*16)  → 1000 無量大数 = 1000 * 10^(64)
  const THRESH = 1000 * Math.pow(10, 64);
  if (abs >= THRESH) return formatEng(x);

  if (abs < 10000) return sig3NoExpUnder1e4(x);
  return jpTwoTierInt(x);
}

/** 外部向けAPI: mode="eng"|"jp" */
export function format(x: any, mode: "eng" | "jp" = "eng"): string {
  return mode === "jp" ? formatJP(x) : formatEng(x);
}
