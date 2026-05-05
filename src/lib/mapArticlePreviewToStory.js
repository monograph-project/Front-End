/**
 * Adapt `ArticlePreviewResponse` / list items for `StoryCard` + Home filters.
 */
export function mapArticlePreviewToStory(article, { collectionLabel = "" } = {}) {
  const a = article ?? {};
  const author = typeof a.author === "object" && a.author !== null ? a.author : {};
  const stats = typeof a.stats === "object" && a.stats !== null ? a.stats : {};
  const ct = String(a.contentType ?? "").toUpperCase();

  const publish_type =
    ct === "MONOGRAPH" ? "monograph" : "weblog";

  return {
    id: a.id,
    slug: a.slug,
    publish_type,
    title: a.title ?? "—",
    subtitle: a.subtitle ?? a.description ?? "",
    description: a.description ?? a.subtitle ?? "",
    author_name:
      author.displayName ??
      author.userName ??
      author.name ??
      "—",
    created_date:
      a.publishedAt ??
      a.createdAt ??
      a.updatedAt ??
      new Date().toISOString(),
    reading_time:
      typeof a.estimatedReadTime === "number"
        ? a.estimatedReadTime
        : Number(a.estimatedReadTimeMinutes) || 1,
    claps_count: stats.likes ?? stats.totalLikes ?? stats.claps ?? 0,
    cover_image: a.coverImageUrl ?? "",
    tags: Array.isArray(a.tags) ? a.tags : [],
    collection: collectionLabel || "Stories",
    _raw: a,
  };
}
