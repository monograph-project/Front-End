import { useState } from "react";
import IC from "../components/IC";
import Icon from "../components/Icon";
import { useTheme } from "../context/themContext";

export default function AppHeader() {
  const { toggleTheme, theme } = useTheme();
  const [language, setLanguage] = useState("en");

  const languages = [
    { code: "en", label: "English" },
    { code: "es", label: "Español" },
    { code: "fr", label: "Français" },
    { code: "de", label: "Deutsch" },
  ];

  const toggleLanguage = () => {
    const currentIndex = languages.findIndex((l) => l.code === language);
    const nextIndex = (currentIndex + 1) % languages.length;
    setLanguage(languages[nextIndex].code);
  };

  return (
    <header className=" bg-bg-shell dark:bg-dark-shell dark:border-dark-default  border-b  h-14  border-default flex items-center  gap-3 shrink-0 px-5">
      <div className=" flex items-center gap-2 flex-1">
        <Icon
          d={IC.dashboard}
          className={
            " dark:stroke-dark-primary text-primary size-4 stroke-[1.5]"
          }
        />
        <span className=" text-sm font-normal text-primary dark:text-dark-primary">
          Dashboard
        </span>
      </div>
      {/* Search */}
      <div className=" relative ">
        <input
          placeholder=" Search AI Mode"
          className=" px-3 py-1.5  h-full text-muted dark:text-dark-muted text-xs rounded-lg  outline-none  w-50 placeholder:pl-1 pl-6  bg-input dark:bg-dark-input border border-default dark:border-dark-default "
        />
        <span className="absolute left-1 top-2/10  ">
          <Icon
            d={IC.search}
            className={
              "size[13px] stroke-muted dark:stroke-dark-muted stroke-2"
            }
          />
        </span>
      </div>
      {/* Actions */}
      <div className=" flex items-center gap-1.5">
        <button
          className="px-2 py-1.5 bg-bg-input flex rounded-lg cursor-pointer text-secondary dark:text-dark-secondary  dark:bg-dark-input border border-default dark:border-dark-default"
          onClick={() => toggleTheme()}
        >
          <Icon
            d={theme === "light" ? IC.moon : IC.sun}
            className={" size-3.75 stroke-[1.5]"}
          />
        </button>
        <button className=" relative px-2 py-1.5 rounded-lg flex  cursor-pointer text-secondary dark:text-dark-secondary bg-input dark:bg-dark-input border border-default dark:border-dark-default">
          <Icon d={IC.bell} className={" size-3.75 stroke-[1.5]"} />
        </button>
        <button className=" px-2 py-1.5 relative rounded-lg flex  cursor-pointer text-secondary dark:text-dark-secondary bg-input dark:bg-dark-input border border-default dark:border-dark-default">
          <Icon d={IC.mail} className={" size-3.75 stroke-[1.5]"} />
          <div className=" absolute top-1 border-[1.5px] border-card dark:border-card right-1 w-2 h-2 rounded-full bg-error dark:bg-error-dark" />
        </button>
        <div className="relative">
          <button
            className=" px-2 py-1.5 relative rounded-lg flex  cursor-pointer text-secondary dark:text-dark-secondary bg-input dark:bg-dark-input border border-default dark:border-dark-default"
            onClick={toggleLanguage}
          >
            <Icon d={IC.globe} className={" size-3.75 stroke-[1.5]"} />
          </button>
        </div>
      </div>
    </header>
  );
}
