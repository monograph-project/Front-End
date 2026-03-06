import { useTranslation } from "react-i18next";
import Dropdown from "./Dropdown";
import IC from "./IC";
import Icon from "./Icon";
import { setDocumentDirection } from "../i18n";
import { useClickOutSide } from "../hooks/useClickOutside";

export default function LanguageDropdown({ current, onChange, onClose }) {
  const { t } = useTranslation();
  const ref = useClickOutSide(onClose);

  const LANGUAGES = [
    { code: "en", label: "English", flag: "🇬🇧", native: "English" },
    { code: "ps", label: "Pashto", flag: "🇦🇫", native: "پښتو" },
    { code: "prs", label: "Dari", flag: "🇦🇫", native: "دری" },
  ];

  const handleLanguageChange = (langCode) => {
    setDocumentDirection(langCode);
    onChange(langCode);
  };

  return (
    <Dropdown className="w-55 overflow-hidden" ref={ref}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2.5 border-b border-default dark:border-dark-default">
        <span className="text-sm font-semibold text-primary dark:text-dark-primary">
          {t("common.language") || "Language"}
        </span>
        <button
          onClick={onClose}
          className="w-6 h-6 cursor-pointer flex items-center justify-center rounded-lg hover:bg-hover dark:hover:bg-dark-hover text-muted dark:text-dark-muted"
        >
          <Icon
            d={IC.close ?? "M18 6L6 18M6 6l12 12"}
            className="size-3.5 stroke-2 hover:text-accent dark:hover:text-accent-dark"
          />
        </button>
      </div>

      {/* List */}
      <ul className="py-1.5">
        {LANGUAGES.map((lang) => {
          const isActive = current === lang.code;
          return (
            <li key={lang.code}>
              <button
                onClick={() => {
                  handleLanguageChange(lang.code);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-accent/90 dark:hover:bg-accent-dark cursor-pointer group ${
                  isActive ? "bg-nav-active dark:bg-dark-nav-active" : ""
                }`}
              >
                <span className="text-lg leading-none group-hover:text-white ">
                  {lang.flag}
                </span>
                <div className="flex-1 min-w-0 ">
                  <p
                    className={`text-xs font-medium ${isActive ? "text-accent dark:text-dark-accent" : "text-primary dark:text-dark-primary"}`}
                  >
                    {lang.label}
                  </p>
                  <p className="text-[10px] group-hover:text-white   text-muted dark:text-dark-muted">
                    {lang.native}
                  </p>
                </div>
                {isActive && (
                  <Icon
                    d={IC.check ?? "M20 6L9 17l-5-5"}
                    className="size-3.5 stroke-accent dark:stroke-dark-accent stroke-[2.5]"
                  />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </Dropdown>
  );
}
