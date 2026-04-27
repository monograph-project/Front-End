import { useMemo, useState } from "react";
import {
  Building2,
  CalendarRange,
  Check,
  Globe2,
  Save,
  SlidersHorizontal,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import Field from "../Field";
import Select from "../Select";
import SearchableSelect from "../SearchableSelect";
import SettingsSectionCard from "./SettingsSectionCard";

const campusOptions = [
  {
    value: "main-campus",
    label: "Main Campus",
    description: "Central administration and registrar office",
  },
  {
    value: "medical-campus",
    label: "Medical Campus",
    description: "Health sciences and clinical departments",
  },
  {
    value: "engineering-campus",
    label: "Engineering Campus",
    description: "Applied sciences and laboratories",
  },
];

export default function SystemSettingsTab() {
  const { t } = useTranslation();
  const [systemProfile, setSystemProfile] = useState({
    institutionName: "Faculty Management System",
    portalTitle: "University Faculty Portal",
    supportEmail: "support@faculty.edu",
    helpDeskPhone: "+93 70 000 0000",
    academicYear: "2026 - 2027",
    activeSemester: "fall-2026",
    timezone: "asia-kabul",
    campus: "main-campus",
  });
  const [publicVisibility, setPublicVisibility] = useState([
    "Show admission announcement banner",
    "Display active semester on homepage",
    "Publish maintenance notices in portal header",
  ]);

  const summaryItems = useMemo(
    () => [
      { label: t("settings.system.summary.status"), value: t("settings.system.values.operational") },
      { label: t("settings.system.summary.academicYear"), value: systemProfile.academicYear },
      {
        label: t("settings.system.summary.activeTerm"),
        value:
          {
            "spring-2026": t("settings.system.semesters.spring2026"),
            "summer-2026": t("settings.system.semesters.summer2026"),
            "fall-2026": t("settings.system.semesters.fall2026"),
            "winter-2026": t("settings.system.semesters.winter2026"),
          }[systemProfile.activeSemester] || t("settings.system.values.unknown"),
      },
      {
        label: t("settings.system.summary.publicProperties"),
        value: t("settings.system.summary.activeCount", {
          count: publicVisibility.length,
        }),
      },
    ],
    [publicVisibility.length, systemProfile.academicYear, systemProfile.activeSemester, t],
  );

  const handleProfileChange = (key, value) => {
    setSystemProfile((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const handleRemoveVisibility = (item) => {
    setPublicVisibility((current) => current.filter((entry) => entry !== item));
  };

  return (
    <div className="space-y-6">
      <SettingsSectionCard
        icon={SlidersHorizontal}
        title={t("settings.system.title")}
        description={t("settings.system.description")}
        action={
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white dark:bg-dark-primary dark:text-dark-shell"
          >
            <Save className="h-4 w-4" />
            {t("settings.system.actions.save")}
          </button>
        }
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {summaryItems.map((item) => (
            <div
              key={item.label}
              className="rounded-md border border-default bg-shell p-4 dark:border-dark-default dark:bg-dark-shell"
            >
              <p className="text-sm font-medium text-secondary dark:text-dark-secondary">
                {item.label}
              </p>
              <p className="mt-2 text-2xl font-bold tracking-tight text-primary dark:text-dark-primary">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </SettingsSectionCard>

      <div className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
        <SettingsSectionCard
          icon={Building2}
          title={t("settings.system.identity.title")}
          description={t("settings.system.identity.description")}
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              register={{}}
              label={t("settings.system.fields.institutionName")}
              placeholder={t("settings.system.placeholders.institutionName")}
              value={systemProfile.institutionName}
              onChange={(e) =>
                handleProfileChange("institutionName", e.target.value)
              }
            />
            <Field
              register={{}}
              label={t("settings.system.fields.portalTitle")}
              placeholder={t("settings.system.placeholders.portalTitle")}
              value={systemProfile.portalTitle}
              onChange={(e) => handleProfileChange("portalTitle", e.target.value)}
            />
            <Field
              register={{}}
              label={t("settings.system.fields.supportEmail")}
              type="email"
              placeholder={t("settings.system.placeholders.supportEmail")}
              value={systemProfile.supportEmail}
              onChange={(e) => handleProfileChange("supportEmail", e.target.value)}
            />
            <Field
              register={{}}
              label={t("settings.system.fields.helpDeskPhone")}
              placeholder={t("settings.system.placeholders.helpDeskPhone")}
              value={systemProfile.helpDeskPhone}
              onChange={(e) => handleProfileChange("helpDeskPhone", e.target.value)}
            />
            <div className="md:col-span-2">
              <span className="mb-2 block text-[11px] font-semibold text-primary dark:text-dark-primary">
                {t("settings.system.fields.defaultCampus")}
              </span>
              <SearchableSelect
                options={campusOptions.map((item) => ({
                  ...item,
                  label: t(`settings.system.campuses.${item.value}.label`),
                  description: t(
                    `settings.system.campuses.${item.value}.description`,
                  ),
                }))}
                value={systemProfile.campus}
                onChange={(value) => handleProfileChange("campus", value)}
                placeholder={t("settings.system.placeholders.chooseCampus")}
                searchPlaceholder={t("settings.system.placeholders.searchCampus")}
              />
            </div>
          </div>
        </SettingsSectionCard>

        <SettingsSectionCard
          icon={CalendarRange}
          title={t("settings.system.academic.title")}
          description={t("settings.system.academic.description")}
        >
          <div className="space-y-4">
            <Field
              register={{}}
              label={t("settings.system.fields.academicYear")}
              placeholder={t("settings.system.placeholders.academicYear")}
              value={systemProfile.academicYear}
              onChange={(e) => handleProfileChange("academicYear", e.target.value)}
            />
            <div>
              <span className="mb-2 block text-[11px] font-semibold text-primary dark:text-dark-primary">
                {t("settings.system.fields.activeSemester")}
              </span>
              <Select
                value={systemProfile.activeSemester}
                onChange={(value) => handleProfileChange("activeSemester", value)}
                placeholder={t("settings.system.placeholders.selectSemester")}
                options={[
                  {
                    value: "spring-2026",
                    label: t("settings.system.semesters.spring2026"),
                  },
                  {
                    value: "summer-2026",
                    label: t("settings.system.semesters.summer2026"),
                  },
                  {
                    value: "fall-2026",
                    label: t("settings.system.semesters.fall2026"),
                  },
                  {
                    value: "winter-2026",
                    label: t("settings.system.semesters.winter2026"),
                  },
                ]}
              />
            </div>
            <div>
              <span className="mb-2 block text-[11px] font-semibold text-primary dark:text-dark-primary">
                {t("settings.system.fields.defaultTimezone")}
              </span>
              <Select
                value={systemProfile.timezone}
                onChange={(value) => handleProfileChange("timezone", value)}
                placeholder={t("settings.system.placeholders.chooseTimezone")}
                options={[
                  {
                    value: "asia-kabul",
                    label: t("settings.system.timezones.kabul"),
                  },
                  {
                    value: "asia-dubai",
                    label: t("settings.system.timezones.dubai"),
                  },
                  {
                    value: "asia-tehran",
                    label: t("settings.system.timezones.tehran"),
                  },
                ]}
              />
            </div>
          </div>
        </SettingsSectionCard>
      </div>

      <SettingsSectionCard
        icon={Globe2}
        title={t("settings.system.visibility.title")}
        description={t("settings.system.visibility.description")}
      >
        <div className="grid gap-3 md:grid-cols-3">
          {publicVisibility.map((item) => (
            <div
              key={item}
              className="flex items-center justify-between gap-3 rounded-md border border-default bg-shell px-4 py-3 dark:border-dark-default dark:bg-dark-shell"
            >
              <div className="flex items-center gap-3">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                  <Check className="h-4 w-4" />
                </span>
                <p className="text-sm font-medium text-primary dark:text-dark-primary">
                  {t(
                    `settings.system.visibility.items.${item
                      .toLowerCase()
                      .replaceAll(" ", "")
                      .replaceAll("-", "")}`,
                    { defaultValue: item },
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleRemoveVisibility(item)}
                className="text-xs font-semibold text-secondary hover:text-primary dark:text-dark-secondary dark:hover:text-dark-primary"
              >
                {t("settings.actions.remove")}
              </button>
            </div>
          ))}
        </div>
      </SettingsSectionCard>
    </div>
  );
}
