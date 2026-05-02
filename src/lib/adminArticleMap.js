/** Shared mappings for admin blog list + detail (`/api/v1/articles`). */

/**
 * Normalize `ContentBlockResponse` from blog-service (type + JsonNode data).
 * Accepts enum-as-string in any case and legacy `article.blocks` layouts.
 */
export function normalizeArticleBlock(block) {
  if (!block || typeof block !== "object") return null;
  const rawType = block.type ?? block.blockType;
  const typeStr =
    typeof rawType === "string"
      ? rawType.toUpperCase().trim()
      : String(rawType?.name ?? "").toUpperCase().trim();
  let data = block.data;
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      data = {};
    }
  }
  if (!data || typeof data !== "object") data = {};
  return {
    ...block,
    type: typeStr,
    data,
    order: Number.isFinite(Number(block.order))
      ? Number(block.order)
      : Number.isFinite(Number(block.position))
        ? Number(block.position)
        : 0,
  };
}

function extractBlocksFromArticle(article) {
  const raw =
    article?.content?.blocks ??
    article?.content?.Blocks ??
    article?.blocks ??
    [];
  if (!Array.isArray(raw)) return [];
  return raw.map(normalizeArticleBlock).filter(Boolean);
}

export function mapApiStatusToUi(status) {
  const s = (status || "").toUpperCase();
  if (s === "PUBLISHED") return "published";
  if (s === "ARCHIVED") return "rejected";
  if (s === "DRAFT") return "pending";
  return "draft";
}

export function normalizeReadMinutes(article) {
  const readMin =
    article.estimatedReadTimeMinutes ??
    article.estimatedReadTime ??
    article?.content?.estimatedReadTime ??
    article?.metadata?.readingTimeMinutes ??
    article?.readingTimeMinutes;
  if (typeof readMin === "number" && Number.isFinite(readMin)) return readMin;
  if (readMin != null && readMin !== "") return Number(readMin) || undefined;
  return undefined;
}

export function mapArticleToAdminBlog(article) {
  const author = article.author || {};
  const authorId = author.id ?? article.authorId ?? author.userId;
  const readMin = normalizeReadMinutes(article);
  const stats = article.stats || {};
  const meta = article.metadata || {};
  const blocks = extractBlocksFromArticle(article);
  const tags = Array.isArray(article.tags)
    ? article.tags
    : Array.isArray(meta.tags)
      ? meta.tags
      : Array.isArray(meta.keywords)
        ? meta.keywords
        : [];

  return {
    id: article.id,
    title: article.title || "—",
    excerpt:
      meta.description ||
      meta.summary ||
      article.description ||
      article.subtitle ||
      article.teaser ||
      "",
    author:
      author.displayName || author.userName || author.name || "—",
    authorId,
    authorRole: author.userType || article.authorRole || "—",
    date: article.updatedAt || article.createdAt || article.publishedAt,
    category:
      meta.category ??
      meta.primaryCategory ??
      (tags.length ? tags[0] : null) ??
      article.contentType ??
      "Blog",
    readTime: readMin == null ? "—" : readMin,
    status: mapApiStatusToUi(article.status),
    tags,
    featured: Boolean(
      article.featured ?? article.highlighted ?? meta.featured,
    ),
    visibility: article.visibility,
    slug: article.slug,
    blocks,
    coverImageUrl:
      article.coverImageUrl ?? meta.coverImageUrl ?? meta.thumbnailUrl,
    stats,
    _rawStatus: (article.status || "").toUpperCase(),
    raw: article,
    claps: stats.likes ?? stats.totalLikes ?? stats.claps ?? 0,
    comments: stats.comments ?? stats.totalComments ?? 0,
  };
}

export function derivePlainTextPreview(blocks) {
  if (!Array.isArray(blocks) || !blocks.length) return "";
  const parts = [];
  const ordered = [...blocks]
    .map((b) => normalizeArticleBlock(b))
    .filter(Boolean)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  for (const block of ordered) {
    const d = block?.data ?? {};
    const t = String(block?.type ?? "").toUpperCase();
    if (t === "TEXT" && d.text) parts.push(String(d.text));
    if (t === "QUOTE" && d.text) parts.push(String(d.text));
    if (t === "HEADING" && d.text) parts.push(String(d.text));
    if (t === "CODE" && d.code)
      parts.push(String(d.code).slice(0, 400));
  }
  return parts.join("\n\n").trim();
}
