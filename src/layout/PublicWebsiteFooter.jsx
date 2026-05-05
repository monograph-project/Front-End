import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function PublicWebsiteFooter() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  const linkCls =
    "text-sm font-medium text-(--color-light-text-secondary) transition-colors hover:text-(--color-light-text-primary) dark:text-dark-text-secondary dark:hover:text-(--color-dark-text-primary)";

  return (
    <footer className="border-t border-light-divider bg-(--color-light-card-bg) dark:border-dark-divider dark:bg-(--color-dark-card-bg)">
      <div className="mx-auto grid max-w-[1320px] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="space-y-3">
          <p className="font-blog-display text-lg font-bold text-primary dark:text-dark-primary">
            Campus
          </p>
          <p className="max-w-xs text-sm leading-6 text-secondary dark:text-dark-secondary">
            {t("publicFooter.note")}
          </p>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted dark:text-dark-muted">
            {t("publicFooter.column.explore")}
          </p>
          <ul className="mt-4 space-y-2">
            <li>
              <Link to="/" className={linkCls}>
                {t("publicFooter.links.stories")}
              </Link>
            </li>
            <li>
              <Link to="/write" className={linkCls}>
                {t("publicFooter.links.write")}
              </Link>
            </li>
            <li>
              <Link to="/documentation" className={linkCls}>
                {t("publicFooter.links.documentation")}
              </Link>
            </li>
            <li>
              <Link to="/download" className={linkCls}>
                {t("publicFooter.links.download")}
              </Link>
            </li>
            <li>
              <Link to="/about" className={linkCls}>
                {t("publicFooter.links.about")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted dark:text-dark-muted">
            {t("publicFooter.column.read")}
          </p>
          <p className="mt-4 text-sm leading-6 text-secondary dark:text-dark-secondary">
            {t("publicFooter.readBody")}
          </p>
        </div>
      </div>

      <div className="border-t border-light-divider py-6 text-center dark:border-dark-divider">
        <p className="text-xs text-muted dark:text-dark-muted">
          {t("publicFooter.bottom", { year })}
        </p>
      </div>
    </footer>
  );
}
