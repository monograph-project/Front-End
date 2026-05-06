# Plan — GitHub‑like Repository UI (Frontend)

This file tracks the work required to simulate GitHub’s repository UI while leveraging VIC’s backend + CLI (binary-aware).

## In progress

- **Design alignment**: map `cli-application.md` + `version-control.md` capabilities to UI views (refs, tree, contents, blame, commits, compare, PRs, tasks, contributors).

## Completed

- **Route consistency**: tree + browse routes target `/api/v1/repos/...` with **404 fallback** to legacy `/repos/.../tree` in `vcGetRepositoryTree`.
- **`/info/refs`**: `vcGetRepositoryRefs` + `useVcRepositoryRefs` (404-safe empty payload).
- **Binary-safe blobs**: `fetchRepositoryBlobPayload` via `VC.REPO_OBJECT` + client inflate (`vicObjectFormat` / `pako`); `fetchFileContent(..., blobSha)` prefers blob when provided.
- **Document viewer**: `DocumentViewerContainer` / `useDocumentLoader` accept optional **`blobSha`** for overview + blame byte loading.
- **Admin repository documents workspace** (`ProjectWorkspace` → Documents):
  - Tree browsing, file preview, blame, commit list, compare/diff, Syncfusion reader mode.
- **Student repository Code tab**:
  - Rebuilt around `GithubRepoCodeBrowser`: branch selector (refs-backed), breadcrumbs, Raw / History / Download, previews via blob SHA when present. `StudentRepoCode.jsx` delegates to this component.

## Pending (next tasks)

- **GitHub-like shell**:
  - Top nav bar (GitHub-like), repo breadcrumbs, tab row styling (Code / Pull requests / Tasks / Contributors + future tabs).
  - URL updates on tab switching (already routed; align visuals).
- **Backend parity**: `/contents/**` + `/blame/**` URI prefix handling on server (blame still calls existing `fetchFileBlame`; may 404 until gateway matches).
- **File header actions**:
  - Raw / Blame / History / Download (and Edit if permitted) with GitHub-like layout.
- **History view (file-scoped)**:
  - Commit list touching file with optional search/filter.
- **Diff/compare view polish**:
  - Rich “compare” UX: base/head selectors + changed files list + per-file diff.
- **Binary-first UX**:
  - Explicit “Rendered / Source / Download” controls for `.docx`, `.pdf`, images, etc.
  - Ensure “GitHub doesn’t render binary” is addressed via Syncfusion / fallbacks everywhere.
- **Consistency + i18n**:
  - All new strings in `en` / `prs` / `ps`.
  - Replace remaining hard-coded labels where these views are touched.

