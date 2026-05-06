import pako from "pako";

/**
 * Inflates zlib-wrapped Vic storage (`InflaterInputStream` on the Java side).
 * Then parses `{type} {payloadSize}\u0000<payload>` (see `VicObjectFormat.java`).
 *
 * @param {ArrayBuffer | Uint8Array} compressedBytes
 * @returns {{ type: string, content: Uint8Array }}
 */
export function parseVicCompressedObject(compressedBytes) {
  const u8 =
    compressedBytes instanceof Uint8Array
      ? compressedBytes
      : new Uint8Array(compressedBytes ?? []);
  const inflated = pako.inflate(u8);
  return parseVicInflatedObject(inflated);
}

/** @returns {{ type: string, content: Uint8Array }} */
function parseVicInflatedObject(raw) {
  let z = -1;
  for (let i = 0; i < raw.length; i++) {
    if (raw[i] === 0) {
      z = i;
      break;
    }
  }
  if (z < 0) {
    throw new Error("Invalid Vic object (missing header separator).");
  }
  const headerStr = new TextDecoder("utf-8", { fatal: false }).decode(
    raw.subarray(0, z),
  );
  const sp = headerStr.indexOf(" ");
  if (sp < 0) {
    throw new Error("Invalid Vic object header.");
  }
  const type = headerStr.slice(0, sp);
  const content = raw.subarray(z + 1);
  return { type, content };
}
