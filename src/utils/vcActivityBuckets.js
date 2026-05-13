/** @param {unknown} v */
function tsFromEvent(v) {
  if (v == null || typeof v !== "object") return 0;
  const raw =
    v.timestamp ??
    v.time ??
    v.createdAt ??
    v.created_at ??
    v.date ??
    "";
  if (typeof raw === "number") return raw;
  const d = new Date(raw);
  const t = d.getTime();
  return Number.isNaN(t) ? 0 : t;
}

/** @param {unknown} v */
function repoFromEvent(v) {
  if (v == null || typeof v !== "object") return "";
  const r = v.repo ?? v.repository ?? v.repositoryName ?? v.repository_name;
  if (typeof r === "string") return r.trim();
  if (r && typeof r === "object") {
    const full = r.full_name ?? r.fullName;
    if (typeof full === "string" && full.trim()) return full.trim();
    const o = r.owner ?? {};
    const owner =
      (typeof o === "string" ? o : o?.login ?? o?.username ?? "") || "";
    const name = r.name ?? "";
    if (owner && name) return `${owner}/${String(name).trim()}`;
  }
  const owner =
    v.ownerUsername ??
    v.owner_username ??
    v.repoOwnerUsername ??
    v.repo_owner_username ??
    v.repoOwner ??
    v.owner ??
    "";
  const name = v.repoName ?? v.repo_name ?? v.repositoryName ?? "";
  if (
    typeof owner === "string" &&
    typeof name === "string" &&
    owner.trim() &&
    name.trim()
  ) {
    return `${owner.trim()}/${name.trim()}`;
  }
  return "";
}

/**
 * Best-effort VC activity rows → GitHub-style buckets.
 * Backend event shapes vary; we lean on `type`/`action` when present, else keyword match.
 *
 * @param {unknown[]} events
 * @returns {{
 *   pushes: Array<{ id: string; repo: string; label: string; at: number }>,
 *   pulls: Array<{ id: string; repo: string; label: string; at: number }>,
 *   merges: Array<{ id: string; repo: string; label: string; at: number }>,
 *   other: Array<{ id: string; repo: string; label: string; at: number }>,
 * }}
 */
export function bucketVcActivityEvents(events) {
  /** @type {typeof out.pushes} */
  const pushes = [];
  /** @type {typeof out.pulls} */
  const pulls = [];
  /** @type {typeof out.merges} */
  const merges = [];
  /** @type {typeof out.other} */
  const other = [];

  if (!Array.isArray(events)) {
    return { pushes, pulls, merges, other };
  }

  let i = 0;
  for (const ev of events) {
    if (ev == null || typeof ev !== "object") continue;
    const repo = repoFromEvent(ev);
    const at = tsFromEvent(ev);
    const typeRaw = String(
      ev.type ?? ev.kind ?? ev.eventType ?? ev.action ?? ev.verb ?? "",
    ).toLowerCase();
    const actionRaw = String(
      ev.action ?? ev.status ?? ev.state ?? ev.verb ?? "",
    ).toLowerCase();
    const branch = String(ev.branch ?? ev.ref ?? ev.branchName ?? "").toLowerCase();
    const title = String(
      ev.title ?? ev.message ?? ev.summary ?? ev.description ?? "",
    );
    const hay = `${typeRaw} ${actionRaw} ${branch} ${title} ${JSON.stringify(ev)}`.toLowerCase();

    const label =
      title.trim() ||
      (repo ? repo : String(ev.id ?? `event-${i}`)) ||
      String(ev.id ?? `event-${i}`);

    const id = String(
      [ev.id, ev.uuid, `${repo}-${at}-${i}`].find(
        (v) => v != null && String(v).trim() !== "",
      ) ?? `row-${i}`,
    );
    i += 1;

    const row = { id, repo, label, at };

    const isMerge =
      typeRaw.includes("merge") ||
      actionRaw.includes("merge") ||
      hay.includes(" merged ") ||
      hay.includes("merge pull") ||
      hay.includes("pr merged");
    const isPull =
      typeRaw.includes("pull") ||
      hay.includes("pull request") ||
      hay.includes("/pulls/") ||
      hay.includes("opened pr") ||
      hay.includes("opened pull");
    const isPush =
      typeRaw.includes("push") ||
      typeRaw.includes("commit") ||
      hay.includes(" pushed ") ||
      hay.includes("commits to");

    if (isMerge) merges.push(row);
    else if (isPull) pulls.push(row);
    else if (isPush) pushes.push(row);
    else if (repo || title.trim())
      pushes.push(row);
    else other.push(row);
  }

  const sortByAt = (a, b) => (b.at || 0) - (a.at || 0);
  pushes.sort(sortByAt);
  pulls.sort(sortByAt);
  merges.sort(sortByAt);
  other.sort(sortByAt);

  return { pushes, pulls, merges, other };
}
