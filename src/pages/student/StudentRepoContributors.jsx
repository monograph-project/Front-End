import { useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import SettingsSectionCard from "../../components/SettingsSectionCard";
import { useVcRepository } from "../../services/useApi";

export default function StudentRepoContributors() {
  const { t } = useTranslation();
  const { owner, repo, repositoryMeta } = useOutletContext() ?? {};

  const { data: fresh } = useVcRepository(owner, repo, {
    notifyOnError: false,
    enabled: !(repositoryMeta?.collaborators ?? []).length && Boolean(owner && repo),
  });

  const list = useMemo(() => {
    const collab =
      (repositoryMeta?.collaborators ??
        repositoryMeta?.collaborator ??
        fresh?.collaborators ??
        fresh?.Collaborators ??
        []) || [];
    if (Array.isArray(collab)) return collab;
    if (collab && typeof collab === "object") return Object.values(collab);
    return [];
  }, [repositoryMeta, fresh]);

  function displayName(entry) {
    if (!entry) return "—";
    if (typeof entry === "string") return entry;
    const full =
      [entry.first_name, entry.last_name].filter(Boolean).join(" ") || "";
    return (
      full ||
      entry.displayName ||
      entry.username ||
      entry.userName ||
      String(entry.id ?? "")
    );
  }

  return (
    <SettingsSectionCard
      title={t("studentRepo.contributors.title")}
      description={t("studentRepo.contributors.subtitle")}
      icon={Users}
    >
      {!list.length ? (
        <p className="text-sm text-muted dark:text-dark-muted">{t("studentRepo.contributors.empty")}</p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2">
          {list.map((c, idx) => (
            <li
              key={String(idx)}
              className="rounded-xl border border-(--color-light-card-border) bg-light-app-tertiary px-4 py-3 dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary"
            >
              <p className="text-sm font-semibold text-primary dark:text-dark-primary">
                {displayName(c)}
              </p>
              {typeof c === "object" && c.username != null ? (
                <p className="font-mono text-[11px] text-muted dark:text-dark-muted">
                  @{c.username}
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </SettingsSectionCard>
  );
}
