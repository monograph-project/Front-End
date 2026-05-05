import JSZip from "jszip";

/**
 * Rough plain-text preview for `.docx` when no Word processor service is configured.
 */
export async function extractDocxPlainText(input) {
  const slice =
    input instanceof ArrayBuffer ?
      new Uint8Array(input)
    : input instanceof Uint8Array ?
      input
    : new Uint8Array(input);

  const zip = await JSZip.loadAsync(slice);
  const file = zip.file("word/document.xml");
  if (!file) return "";
  const xml = await file.async("string");
  const doc = new DOMParser().parseFromString(xml, "application/xml");
  const texts = doc.getElementsByTagName("w:t");
  const parts = [];
  for (let i = 0; i < texts.length; i++) {
    const t = texts[i].textContent;
    if (t) parts.push(t);
  }
  return parts.join(" ");
}
