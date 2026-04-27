import { useMemo, useState } from "react";
import { KeyRound, Plus, ShieldCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import Field from "../Field";
import SearchableSelect from "../SearchableSelect";
import Select from "../Select";
import SettingsSectionCard from "./SettingsSectionCard";

const moduleOptions = [
  {
    label: "Academic",
    options: [
      {
        value: "courses",
        label: "Course setup",
        description: "Sections and credits",
      },
      {
        value: "grading",
        label: "Grading",
        description: "Assessments and results",
      },
      {
        value: "attendance",
        label: "Attendance",
        description: "Daily and period attendance",
      },
    ],
  },
  {
    label: "Operations",
    options: [
      {
        value: "finance",
        label: "Finance",
        description: "Invoices and approvals",
      },
      { value: "library", label: "Library", description: "Loans and fines" },
      {
        value: "transport",
        label: "Transport",
        description: "Routes and assignments",
      },
    ],
  },
];

const initialPermissionRows = [
  {
    id: 1,
    title: "Student records",
    module: "courses",
    scope: "Registrar office",
    level: "Restricted",
    assignedRoles: 2,
  },
  {
    id: 2,
    title: "Grade publishing",
    module: "grading",
    scope: "Dean + registrar",
    level: "Approval required",
    assignedRoles: 2,
  },
  {
    id: 3,
    title: "Attendance editing",
    module: "attendance",
    scope: "Lecturer",
    level: "Limited window",
    assignedRoles: 1,
  },
  {
    id: 4,
    title: "Finance approvals",
    module: "finance",
    scope: "Finance office",
    level: "Restricted",
    assignedRoles: 1,
  },
];

export default function PermissionSettingsTab() {
  const { t } = useTranslation();
  const [template, setTemplate] = useState("faculty-strict");
  const [moduleFilter, setModuleFilter] = useState("courses");
  const [permissions, setPermissions] = useState(initialPermissionRows);
  const [draftPermission, setDraftPermission] = useState({
    title: "",
    module: "courses",
    scope: "Registrar office",
    level: "Restricted",
  });

  const permissionSummary = useMemo(
    () => ({
      totalPermissions: permissions.length,
      approvalRules: permissions.filter(
        (item) => item.level === "Approval required",
      ).length,
      restrictedRules: permissions.filter((item) => item.level === "Restricted")
        .length,
    }),
    [permissions],
  );

  const handleCreatePermission = () => {
    if (!draftPermission.title.trim()) return;

    setPermissions((current) => [
      {
        id: Date.now(),
        title: draftPermission.title.trim(),
        module: draftPermission.module,
        scope: draftPermission.scope,
        level: draftPermission.level,
        assignedRoles: 0,
      },
      ...current,
    ]);

    setDraftPermission({
      title: "",
      module: moduleFilter || "courses",
      scope: "Registrar office",
      level: "Restricted",
    });
  };

  const handleAssignRole = (id) => {
    setPermissions((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, assignedRoles: item.assignedRoles + 1 }
          : item,
      ),
    );
  };

  const filteredPermissions = permissions.filter(
    (item) => !moduleFilter || item.module === moduleFilter,
  );

  return (
    <div className="space-y-6">
      <SettingsSectionCard
        icon={KeyRound}
        title={t("settings.permissions.title")}
        description={t("settings.permissions.description")}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-md border border-default bg-shell p-4 dark:border-dark-default dark:bg-dark-shell">
            <p className="text-sm font-medium text-secondary dark:text-dark-secondary">
              {t("settings.permissions.summary.totalPermissions")}
            </p>
            <p className="mt-2 text-3xl font-bold text-primary dark:text-dark-primary">
              {permissionSummary.totalPermissions}
            </p>
          </div>
          <div className="rounded-md border border-default bg-shell p-4 dark:border-dark-default dark:bg-dark-shell">
            <p className="text-sm font-medium text-secondary dark:text-dark-secondary">
              {t("settings.permissions.summary.restrictedRules")}
            </p>
            <p className="mt-2 text-3xl font-bold text-primary dark:text-dark-primary">
              {permissionSummary.restrictedRules}
            </p>
          </div>
          <div className="rounded-md border border-default bg-shell p-4 dark:border-dark-default dark:bg-dark-shell">
            <p className="text-sm font-medium text-secondary dark:text-dark-secondary">
              {t("settings.permissions.summary.approvalRules")}
            </p>
            <p className="mt-2 text-3xl font-bold text-primary dark:text-dark-primary">
              {permissionSummary.approvalRules}
            </p>
          </div>
          <div className="rounded-md border border-default bg-shell p-4 dark:border-dark-default dark:bg-dark-shell">
            <p className="text-sm font-medium text-secondary dark:text-dark-secondary">
              {t("settings.permissions.summary.activeTemplate")}
            </p>
            <p className="mt-2 text-lg font-bold text-primary dark:text-dark-primary">
              {t(
                `settings.permissions.templates.${
                  template === "faculty-strict"
                    ? "facultyStrict"
                    : template === "balanced"
                      ? "balanced"
                      : "openAdmin"
                }`,
              )}
            </p>
          </div>
        </div>
      </SettingsSectionCard>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_1.45fr]">
        <SettingsSectionCard
          icon={KeyRound}
          title={t("settings.permissions.create.title")}
          description={t("settings.permissions.create.description")}
          action={
            <button
              type="button"
              onClick={handleCreatePermission}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white dark:bg-dark-primary dark:text-dark-shell"
            >
              <Plus className="h-4 w-4" />
              {t("settings.permissions.create.action")}
            </button>
          }
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              register={{}}
              label={t("settings.permissions.fields.permissionName")}
              placeholder={t("settings.permissions.placeholders.permissionName")}
              value={draftPermission.title}
              onChange={(e) =>
                setDraftPermission((current) => ({
                  ...current,
                  title: e.target.value,
                }))
              }
            />
            <div>
              <span className="mb-2 block text-[11px] font-semibold text-primary dark:text-dark-primary">
                {t("settings.permissions.fields.accessLevel")}
              </span>
              <Select
                value={draftPermission.level}
                onChange={(value) =>
                  setDraftPermission((current) => ({
                    ...current,
                    level: value,
                  }))
                }
                options={[
                  { value: "Restricted", label: t("settings.permissions.levels.restricted") },
                  {
                    value: "Approval required",
                    label: t("settings.permissions.levels.approvalRequired"),
                  },
                  { value: "Limited window", label: t("settings.permissions.levels.limitedWindow") },
                  { value: "Standard", label: t("settings.permissions.levels.standard") },
                ]}
              />
            </div>
            <div>
              <span className="mb-2 block text-[11px] font-semibold text-primary dark:text-dark-primary">
                {t("settings.permissions.fields.module")}
              </span>
              <SearchableSelect
                options={moduleOptions.map((group) => ({
                  ...group,
                  label: t(`settings.shared.modules.groups.${group.label.toLowerCase()}`),
                  options: group.options.map((opt) => ({
                    ...opt,
                    label: t(`settings.shared.modules.items.${opt.value}.label`),
                    description: t(
                      `settings.shared.modules.items.${opt.value}.description`,
                    ),
                  })),
                }))}
                value={draftPermission.module}
                onChange={(value) =>
                  setDraftPermission((current) => ({
                    ...current,
                    module: value,
                  }))
                }
                placeholder={t("settings.permissions.placeholders.findModule")}
                searchPlaceholder={t("settings.permissions.placeholders.searchModules")}
              />
            </div>
            <Field
              register={{}}
              label={t("settings.permissions.fields.allowedGroup")}
              placeholder={t("settings.permissions.placeholders.allowedGroup")}
              value={draftPermission.scope}
              onChange={(e) =>
                setDraftPermission((current) => ({
                  ...current,
                  scope: e.target.value,
                }))
              }
            />
          </div>
        </SettingsSectionCard>

        <SettingsSectionCard
          icon={ShieldCheck}
          title={t("settings.permissions.existing.title")}
          description={t("settings.permissions.existing.description")}
        >
          <div className="mb-4 grid gap-4 md:grid-cols-2">
            <div>
              <span className="mb-2 block text-[11px] font-semibold text-primary dark:text-dark-primary">
                {t("settings.permissions.fields.permissionTemplate")}
              </span>
              <Select
                value={template}
                onChange={setTemplate}
                placeholder={t("settings.permissions.placeholders.selectTemplate")}
                options={[
                  { value: "faculty-strict", label: t("settings.permissions.templates.facultyStrict") },
                  { value: "balanced", label: t("settings.permissions.templates.balanced") },
                  { value: "open-admin", label: t("settings.permissions.templates.openAdmin") },
                ]}
              />
            </div>
            <div>
              <span className="mb-2 block text-[11px] font-semibold text-primary dark:text-dark-primary">
                {t("settings.permissions.fields.filterModule")}
              </span>
              <SearchableSelect
                options={moduleOptions.map((group) => ({
                  ...group,
                  label: t(`settings.shared.modules.groups.${group.label.toLowerCase()}`),
                  options: group.options.map((opt) => ({
                    ...opt,
                    label: t(`settings.shared.modules.items.${opt.value}.label`),
                    description: t(
                      `settings.shared.modules.items.${opt.value}.description`,
                    ),
                  })),
                }))}
                value={moduleFilter}
                onChange={setModuleFilter}
                placeholder={t("settings.permissions.placeholders.findModule")}
                searchPlaceholder={t("settings.permissions.placeholders.searchModules")}
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredPermissions.map((item) => (
              <div
                key={item.id}
                className="rounded-md border border-default bg-shell p-4 dark:border-dark-default dark:bg-dark-shell"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-primary dark:text-dark-primary">
                        {item.title}
                      </p>
                      <span className="rounded-md bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-inset ring-amber-200 dark:bg-amber-500/15 dark:text-amber-200 dark:ring-amber-400/20">
                        {t(
                          `settings.permissions.levels.${
                            item.level === "Approval required"
                              ? "approvalRequired"
                              : item.level === "Limited window"
                                ? "limitedWindow"
                                : item.level === "Standard"
                                  ? "standard"
                                  : "restricted"
                          }`,
                        )}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-secondary dark:text-dark-secondary">
                      {t("settings.permissions.existing.allowedGroup", {
                        group: item.scope,
                      })}
                    </p>
                    <p className="mt-2 text-xs font-medium uppercase tracking-[0.2em] text-muted dark:text-dark-muted">
                      {t("settings.permissions.existing.appliedRoles", {
                        count: item.assignedRoles,
                      })}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAssignRole(item.id)}
                    className="inline-flex items-center justify-center rounded-md border border-default bg-card px-3 py-2 text-sm font-medium text-primary hover:bg-card-2 dark:border-dark-default dark:bg-dark-card dark:text-dark-primary dark:hover:bg-dark-card-2"
                  >
                    {t("settings.permissions.existing.assignRole")}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </SettingsSectionCard>
      </div>
    </div>
  );
}
