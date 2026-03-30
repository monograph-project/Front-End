import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { setDocumentDirection } from "../i18n";

export default function LanguageMenu({ current, onChange, onClose }) {
  const { t } = useTranslation();
  const ref = useRef(null);

  const LANGUAGES = [
    { code: "en", label: "English", native: "English", flag: "🇬🇧" },
    { code: "ps", label: "Pashto", native: "پښتو", flag: "🇦🇫" },
    { code: "prs", label: "Dari", native: "دری", flag: "🇦🇫" },
  ];

  const [direction, setDirection] = useState(
    () => document.documentElement.dir || "ltr",
  );

  const activeIndex = LANGUAGES.findIndex((l) => l.code === current);

  // watch direction changes
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setDirection(document.documentElement.dir || "ltr");
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  // click outside
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onClose?.();
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [onClose]);

  const changeLanguage = (lang) => {
    setDocumentDirection(lang.code);
    onChange(lang.code);
    onClose?.();
  };

  return (
    <div
      ref={ref}
      className={`absolute ${
        direction === "rtl" ? "left-0" : "right-0"
      } top-full mt-2 z-50`}
    >
      <div
        className="flex flex-col w-[200px] rounded-md overflow-hidden shadow-lg"
        style={{ backgroundColor: "#0D1117" }}
      >
        {/* Header */}
        <div className="px-3 py-2 text-xs text-gray-400 border-b border-[#21262C]">
          {t("common.language") || "Language"}
        </div>

        {LANGUAGES.map((lang, index) => (
          <button
            key={lang.code}
            onClick={() => changeLanguage(lang)}
            className={`
              relative flex items-center gap-2 px-3 py-[10px]
              text-sm text-white cursor-pointer rounded-[4px]
              transition-colors duration-150
              ${activeIndex === index ? "bg-[#1A1F24]" : "hover:bg-[#21262C]"}
            `}
          >
            {/* Accent bar */}
            <span
              className={`absolute ${
                direction === "rtl" ? "right-[-10px]" : "left-[-10px]"
              } top-[10%] w-[5px] rounded-md bg-[#2F81F7] transition-opacity duration-150`}
              style={{
                height: "80%",
                opacity: activeIndex === index ? 1 : 0,
              }}
            />

            <span className="text-base">{lang.flag}</span>

            <div className="flex flex-col items-start">
              <span className="text-sm">{lang.label}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
