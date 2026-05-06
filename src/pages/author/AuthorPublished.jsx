import { useTranslation } from "react-i18next";

export default function AuthorPublished() {
  const { t } = useTranslation();
  return (
    <div className="p-4 md:p-5">
      <div className="mx-auto max-w-6xl rounded-md border border-(--color-light-card-border) bg-(--color-light-card-bg) p-6  dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)">
        <h1 className="text-lg font-semibold text-primary dark:text-dark-primary">
          {t("authorPublished.title")}
        </h1>
        <p className="mt-2 text-sm text-secondary dark:text-dark-secondary">
          {t("authorPublished.body")}
        </p>
      </div>
    </div>
  );
}
