import apiClient from "../api/client";
import { VC } from "./RouteConfig";
import { extractApiError } from "./apiRoute";

/**
 * @param {Uint8Array | ArrayBuffer} buf
 * @returns {Uint8Array}
 */
function toUint8(buf) {
  if (buf instanceof Uint8Array) return buf;
  return new Uint8Array(buf);
}

/**
 * Raw file bytes from the gateway (Git tree / blob endpoint).
 * @param {string} owner
 * @param {string} repo
 * @param {string} filePath
 * @param {string} [branch]
 */
export async function fetchFileContent(owner, repo, filePath, branch = "main") {
  const url = VC.REPO_FILE_AT_REF(owner, repo, branch, filePath);
  try {
    const { data } = await apiClient.get(url, {
      responseType: "arraybuffer",
    });
    return toUint8(data);
  } catch (err) {
    throw new Error(extractApiError(err, "Failed to load file."));
  }
}

/**
 * Normalize blame payload to a flat array:
 * `{ lineNumber, author, authorId, commit, commitMessage, timestamp, content }`
 * @param {*} raw
 * @returns {Array<Record<string, unknown>>}
 */
export function normalizeBlameLines(raw) {
  if (Array.isArray(raw)) return raw;
  if (raw?.lines && Array.isArray(raw.lines)) return raw.lines;
  if (raw?.blame && Array.isArray(raw.blame)) return raw.blame;
  if (raw?.data && Array.isArray(raw.data)) return raw.data;
  return [];
}

/**
 * @param {string} owner
 * @param {string} repo
 * @param {string} filePath
 * @param {string} [branch]
 */
export async function fetchFileBlame(owner, repo, filePath, branch = "main") {
  const url = VC.BLAME_FILE(owner, repo, filePath, { branch });
  try {
    const { data } = await apiClient.get(url);
    return normalizeBlameLines(data);
  } catch (err) {
    throw new Error(extractApiError(err, "Failed to load blame data."));
  }
}

export async function fetchPullRequestFiles(owner, repo, prNumber) {
  try {
    const { data } = await apiClient.get(VC.PULL_REQUEST_FILES(owner, repo, prNumber));
    if (Array.isArray(data)) return data;
    if (data?.files && Array.isArray(data.files)) return data.files;
    return [];
  } catch (err) {
    throw new Error(extractApiError(err, "Failed to load pull request files."));
  }
}

export async function fetchPullRequestFileDiff(owner, repo, prNumber, fileIndex) {
  try {
    const { data } = await apiClient.get(
      VC.PULL_REQUEST_FILE_DIFF(owner, repo, prNumber, fileIndex),
    );
    return data ?? {};
  } catch (err) {
    throw new Error(extractApiError(err, "Failed to load file diff."));
  }
}

export async function fetchMergeConflicts(owner, repo, prNumber) {
  try {
    const { data } = await apiClient.get(VC.MERGE_CONFLICTS(owner, repo, prNumber));
    return Array.isArray(data) ? data : data?.conflicts ?? [];
  } catch (err) {
    throw new Error(extractApiError(err, "Failed to load merge conflicts."));
  }
}

/**
 * @param {string} owner
 * @param {string} repo
 * @param {string|number} prNumber
 * @param {{
 *   filePath: string,
 *   resolution: "SOURCE"|"TARGET"|"CUSTOM"|"SKIP"|string,
 *   customContent?: string
 * }} body
 */
export async function resolveMergeConflict(owner, repo, prNumber, body) {
  try {
    const { data } = await apiClient.post(
      VC.MERGE_RESOLVE(owner, repo, prNumber),
      body,
    );
    return data;
  } catch (err) {
    throw new Error(extractApiError(err, "Failed to resolve conflict."));
  }
}

export async function fetchCommitDetails(owner, repo, commitSha) {
  try {
    const { data } = await apiClient.get(VC.COMMIT_DETAIL(owner, repo, commitSha));
    return data ?? {};
  } catch (err) {
    throw new Error(extractApiError(err, "Failed to load commit."));
  }
}

export async function fetchCommitHistory(owner, repo, branch = "main", params = {}) {
  try {
    const { data } = await apiClient.get(
      VC.COMMITS_ON_BRANCH(owner, repo, branch, params),
    );
    if (Array.isArray(data)) return data;
    return data?.commits ?? data?.content ?? [];
  } catch (err) {
    throw new Error(extractApiError(err, "Failed to load commits."));
  }
}
