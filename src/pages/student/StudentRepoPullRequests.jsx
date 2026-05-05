import { useOutletContext } from "react-router-dom";
import { GitPullRequest } from "lucide-react";
import { useTranslation } from "react-i18next";
import SettingsSectionCard from "../../components/SettingsSectionCard";
import { useVcRepoPullRequests } from "../../services/useApi";

function prTitle(pr) {
  return pr.title ?? pr.name ?? pr.subject ?? `#${pr.id ?? pr.number ?? ""}`;
}

export default function StudentRepoPullRequests() {
  const { t } = useTranslation();
  const { owner, repo } = useOutletContext() ?? {};
  const { data = [], isLoading } = useVcRepoPullRequests(owner, repo, {
    notifyOnError: false,
  });

  return (
    <SettingsSectionCard
      title={t("studentRepo.pulls.title")}
      description={t("studentRepo.pulls.subtitle")}
      icon={GitPullRequest}
    >
      {isLoading && (
        <p className="text-sm text-muted dark:text-dark-muted">{t("studentRepo.pulls.loading")}</p>
      )}
      {!isLoading && !data.length ? (
        <p className="text-sm text-muted dark:text-dark-muted">{t("studentRepo.pulls.empty")}</p>
      ) : null}
      {!isLoading && data.length ? (
        <div className="space-y-2">
          {(data ?? []).map((pr, idx) => (
            <article
              key={String(pr.id ?? pr.uuid ?? idx)}
              className="rounded-xl border border-(--color-light-card-border) bg-light-app-tertiary px-4 py-3 dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-sm font-semibold text-primary dark:text-dark-primary">
                  {prTitle(pr)}
                </p>
                <span className="rounded-full border border-(--color-light-card-border) px-2 py-0.5 text-[10px] font-semibold uppercase text-secondary dark:border-(--color-dark-card-border) dark:text-dark-secondary">
                  {(pr.status ?? pr.state ?? "OPEN").toString()}
                </span>
              </div>
              {(pr.summary ?? pr.body)?.length ? (
                <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-secondary dark:text-dark-secondary">
                  {pr.summary ?? pr.body}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}
    </SettingsSectionCard>
  );
}
