const IMAGE_EXT = new Set(["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp"]);

/**
 * @param {string} filePath
 * @returns {string}
 */
export function getFileExtension(filePath = "") {
  const base = String(filePath).split("/").pop() || "";
  const i = base.lastIndexOf(".");
  if (i <= 0) return "";
  return base.slice(i + 1).toLowerCase();
}

export function isImageExtension(ext) {
  return IMAGE_EXT.has(String(ext).toLowerCase());
}

export function isLikelyTextExtension(ext) {
  const e = String(ext).toLowerCase();
  return (
    !e ||
    [
      "txt",
      "md",
      "json",
      "xml",
      "html",
      "htm",
      "css",
      "js",
      "jsx",
      "ts",
      "tsx",
      "java",
      "py",
      "yml",
      "yaml",
      "env",
      "gitignore",
      "properties",
    ].includes(e)
  );
}

/**
 * @param {Uint8Array} bytes
 */
export function tryDecodeUtf8(bytes) {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return null;
  }
}
