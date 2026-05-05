import { useState } from "react";
import {
  Bell,
  Building2,
  Globe2,
  KeyRound,
  Lock,
  Palette,
  ShieldCheck,
  SlidersHorizontal,
  UsersRound,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import AcademicRegistrySettingsTab from "../../components/AcademicRegistrySettingsTab";
import SettingsTabs from "../../components/SettingsTabs";
import SystemSettingsTab from "../../components/SystemSettingsTab";
import PermissionSettingsTab from "../../components/PermissionSettingsTab";
import RoleSettingsTab from "../../components/RoleSettingsTab";
import NotificationSettingsTab from "../../components/NotificationSettingsTab";
import LanguageSettingsTab from "../../components/LanguageSettingsTab";
import ThemeSettingsTab from "../../components/ThemeSettingsTab";
import SecuritySettingsTab from "../../components/SecuritySettingsTab";

const SURFACE_CARD =
  "rounded-xl border border-(--color-light-card-border) bg-(--color-light-card-bg) shadow-sm dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)";

function Setting() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("system");
  const tabs = [
    { id: "system", label: t("settings.tabs.system"), icon: SlidersHorizontal },
    {
      id: "permissions",
      label: t("settings.tabs.permissions"),
      icon: KeyRound,
    },
    { id: "roles", label: t("settings.tabs.roles"), icon: UsersRound },
    {
      id: "academic",
      label: t("settings.tabs.academic"),
      icon: Building2,
    },
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
    <div className="min-h-screen flex-1 bg-light-app-bg p-4 md:p-5 dark:bg-dark-card-bg">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <section className={`${SURFACE_CARD} overflow-hidden`}>
          <div className="border-b border-light-divider px-4 py-5 dark:border-dark-divider md:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-(--color-light-card-border) bg-light-app-tertiary px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary dark:text-dark-muted">
                  <ShieldCheck className="h-4 w-4 shrink-0" strokeWidth={2} />
                  {t("settings.header.eyebrow")}
                </div>
                <h1 className="mt-3 text-3xl font-bold tracking-tight text-primary dark:text-dark-primary md:text-4xl">
                  {t("settings.header.title")}
                </h1>
                <p className="mt-3 text-sm leading-7 text-secondary dark:text-dark-secondary">
                  {t("settings.header.description")}
                </p>
              </div>
            </div>
          </div>

          <div className="px-4 py-4 md:px-6">
            <SettingsTabs
              tabs={tabs}
              activeTab={activeTab}
              onChange={setActiveTab}
            />
          </div>
        </section>

        <div>
          {activeTab === "system" && <SystemSettingsTab />}
          {activeTab === "permissions" && <PermissionSettingsTab />}
          {activeTab === "roles" && <RoleSettingsTab />}
          {activeTab === "academic" && <AcademicRegistrySettingsTab />}
          {activeTab === "notifications" && <NotificationSettingsTab />}
          {activeTab === "language" && <LanguageSettingsTab />}
          {activeTab === "theme" && <ThemeSettingsTab />}
          {activeTab === "security" && <SecuritySettingsTab />}
        </div>
      </div>
    </div>
  );
}

export default Setting;
