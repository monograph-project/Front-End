import { useState } from "react";
import {
  Bell,
  Globe2,
  KeyRound,
  Lock,
  Palette,
  ShieldCheck,
  SlidersHorizontal,
  UsersRound,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import SettingsTabs from "../../components/SettingsTabs";
import SystemSettingsTab from "../../components/SystemSettingsTab";
import PermissionSettingsTab from "../../components/PermissionSettingsTab";
import RoleSettingsTab from "../../components/RoleSettingsTab";
import NotificationSettingsTab from "../../components/NotificationSettingsTab";
import LanguageSettingsTab from "../../components/LanguageSettingsTab";
import ThemeSettingsTab from "../../components/ThemeSettingsTab";
import SecuritySettingsTab from "../../components/SecuritySettingsTab";

function Setting() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("system");
  const [appearance, setAppearance] = useState("system");
  const tabs = [
    { id: "system", label: t("settings.tabs.system"), icon: SlidersHorizontal },
    {
      id: "permissions",
      label: t("settings.tabs.permissions"),
      icon: KeyRound,
    },
    { id: "roles", label: t("settings.tabs.roles"), icon: UsersRound },
    {
      id: "notifications",
      label: t("settings.tabs.notifications"),
      icon: Bell,
    },
    { id: "language", label: t("settings.tabs.language"), icon: Globe2 },
    { id: "theme", label: t("settings.tabs.theme"), icon: Palette },
    { id: "security", label: t("settings.tabs.security"), icon: Lock },
  ];

  return (
    <div className="min-h-screen flex-1 rounded-md border border-default bg-shell m-2 dark:border-dark-default dark:bg-dark-shell">
      <div className="mx-auto bg-shell dark:bg-dark-shell w-full max-w-7xl px-2 py-3 md:px-3">
        <section className="overflow-hidden rounded-md border border-default  dark:border-dark-default ">
          <div className="border-b border-default px-5 py-5 dark:border-dark-default">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary dark:text-dark-primary">
                  <ShieldCheck className="h-4 w-4" />
                  {t("settings.header.eyebrow")}
                </div>
                <h1 className="mt-3 text-3xl font-bold tracking-tight text-primary dark:text-dark-primary md:text-4xl">
                  {t("settings.header.title")}
                </h1>
                <p className="mt-3 text-sm leading-7 text-secondary dark:text-dark-secondary">
                  {t("settings.header.description")}
                </p>
              </div>

              <button
                type="button"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 dark:bg-dark-primary dark:text-dark-shell"
              >
                {t("settings.actions.saveAll")}
              </button>
            </div>
          </div>

          <div className="px-5 py-5">
            <SettingsTabs
              tabs={tabs}
              activeTab={activeTab}
              onChange={setActiveTab}
            />
          </div>
        </section>

        <div className="mt-6">
          {activeTab === "system" && <SystemSettingsTab />}
          {activeTab === "permissions" && <PermissionSettingsTab />}
          {activeTab === "roles" && <RoleSettingsTab />}
          {activeTab === "notifications" && <NotificationSettingsTab />}
          {activeTab === "language" && <LanguageSettingsTab />}
          {activeTab === "theme" && (
            <ThemeSettingsTab
              appearance={appearance}
              setAppearance={setAppearance}
            />
          )}
          {activeTab === "security" && <SecuritySettingsTab />}
        </div>
      </div>
    </div>
  );
}

export default Setting;
