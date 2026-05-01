import { normalizeFacetKey } from "./roleModel";

/**
 * Check if a facet list from the session satisfies a logical role gate
 * (handles `student` vs `user`, `employee` vs `staff`, casing).
 */
export function userHasNormalizedRole(normalizedRoles, roleInput) {
  if (!normalizedRoles?.length) return false;
  const canon = normalizedRoles.map((x) => String(x).toLowerCase());
  const k = normalizeFacetKey(roleInput.trim());
  const rawLow = roleInput.trim().toLowerCase();

  if (k === "student" || rawLow === "student") {
    return canon.some((x) => x === "student" || x === "user");
  }

  const targets = new Set();
  if (k) targets.add(String(k).toLowerCase());
  if (rawLow) targets.add(rawLow);
  if (rawLow === "employee" || rawLow === "staff") {
    targets.add("staff");
    targets.add("employee");
  }

  return [...targets].some((t) => canon.includes(t));
}

/** Match route `allowedRoles` lists — `student` gates also allow reader `user`. */
export function normalizedUserMatchesRoutes(
  normalizedRoles,
  allowed,
  mode = "any",
) {
  if (!allowed.length) return true;
  const test = (r) => userHasNormalizedRole(normalizedRoles, r);
  return mode === "all" ? allowed.every(test) : allowed.some(test);
}
