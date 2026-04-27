import { useMemo, useState } from "react";
import { Plus, Shield, UsersRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import Field from "../Field";
import SearchableSelect from "../SearchableSelect";
import Select from "../Select";
import SettingsSectionCard from "./SettingsSectionCard";

const departmentOptions = [
  { value: "computer-science", label: "Computer Science" },
  { value: "medicine", label: "Medicine" },
  { value: "economics", label: "Economics" },
  { value: "engineering", label: "Engineering" },
  { value: "education", label: "Education" },
];

const initialRoles = [
  {
    id: 1,
    title: "System administrator",
    department: "computer-science",
    usersCount: 4,
    level: "Full access",
    description:
      "Full control over settings, integrations, users and audit history.",
  },
  {
    id: 2,
    title: "Faculty dean",
    department: "medicine",
    usersCount: 6,
    level: "Approver",
    description:
      "Approves schedules, reviews staffing and publishes faculty-level decisions.",
  },
  {
    id: 3,
    title: "Registrar office",
    department: "education",
    usersCount: 9,
    level: "Records",
    description:
      "Owns academic records, enrollment periods and official result publishing.",
  },
  {
    id: 4,
    title: "Lecturer",
    department: "engineering",
    usersCount: 84,
    level: "Academic",
    description:
      "Manages attendance, coursework, exams and classroom communication.",
  },
];

const permissionOptions = [
  { value: "manage-users", label: "Manage users" },
  { value: "edit-grades", label: "Edit grades" },
  { value: "publish-results", label: "Publish results" },
  { value: "manage-courses", label: "Manage courses" },
  { value: "approve-finance", label: "Approve finance" },
  { value: "view-audit", label: "View audit logs" },
];

export default function RoleSettingsTab() {
  const { t } = useTranslation();
  const [defaultRole, setDefaultRole] = useState("lecturer");
  const [selectedDepartment, setSelectedDepartment] = useState(
    "computer-science",
  );
  const [roles, setRoles] = useState(initialRoles);
  const [draftRole, setDraftRole] = useState({
    title: "",
    description: "",
    department: "computer-science",
    level: "Academic",
    permissions: ["manage-courses"],
  });

  const roleSummary = useMemo(() => {
    const totalUsers = roles.reduce((sum, role) => sum + role.usersCount, 0);

    return {
      totalRoles: roles.length,
      totalUsers,
      largestRole:
        roles.slice().sort((a, b) => b.usersCount - a.usersCount)[0]?.title ??
        "None",
    };
  }, [roles]);

  const handleCreateRole = () => {
    if (!draftRole.title.trim()) return;

    setRoles((current) => [
      {
        id: Date.now(),
        title: draftRole.title.trim(),
        description: draftRole.description.trim() || "No description added yet.",
        department: draftRole.department,
        usersCount: 0,
        level: draftRole.level,
        permissions: draftRole.permissions,
      },
      ...current,
    ]);

    setDraftRole({
      title: "",
      description: "",
      department: selectedDepartment,
      level: "Academic",
      permissions: ["manage-courses"],
    });
  };

  const handleIncreaseUsers = (id) => {
    setRoles((current) =>
      current.map((role) =>
        role.id === id ? { ...role, usersCount: role.usersCount + 1 } : role,
      ),
    );
  };

  const filteredRoles = roles.filter(
    (role) =>
      !selectedDepartment || role.department === selectedDepartment,
  );

  return (
    <div className="space-y-6">
      <SettingsSectionCard
        icon={UsersRound}
        title={t("settings.roles.title")}
        description={t("settings.roles.description")}
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-md border border-default bg-shell p-4 dark:border-dark-default dark:bg-dark-shell">
            <p className="text-sm font-medium text-secondary dark:text-dark-secondary">
              {t("settings.roles.summary.existingRoles")}
            </p>
            <p className="mt-2 text-3xl font-bold text-primary dark:text-dark-primary">
              {roleSummary.totalRoles}
            </p>
          </div>
          <div className="rounded-md border border-default bg-shell p-4 dark:border-dark-default dark:bg-dark-shell">
            <p className="text-sm font-medium text-secondary dark:text-dark-secondary">
              {t("settings.roles.summary.usersAssigned")}
            </p>
            <p className="mt-2 text-3xl font-bold text-primary dark:text-dark-primary">
              {roleSummary.totalUsers}
            </p>
          </div>
          <div className="rounded-md border border-default bg-shell p-4 dark:border-dark-default dark:bg-dark-shell">
            <p className="text-sm font-medium text-secondary dark:text-dark-secondary">
              {t("settings.roles.summary.defaultInviteRole")}
            </p>
            <p className="mt-2 text-lg font-bold text-primary dark:text-dark-primary">
              {t(`settings.shared.roles.${defaultRole}`)}
            </p>
          </div>
          <div className="rounded-md border border-default bg-shell p-4 dark:border-dark-default dark:bg-dark-shell">
            <p className="text-sm font-medium text-secondary dark:text-dark-secondary">
              {t("settings.roles.summary.largestRole")}
            </p>
            <p className="mt-2 text-lg font-bold text-primary dark:text-dark-primary">
              {roleSummary.largestRole}
            </p>
          </div>
        </div>
      </SettingsSectionCard>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_1.45fr]">
        <SettingsSectionCard
          icon={Shield}
          title={t("settings.roles.create.title")}
          description={t("settings.roles.create.description")}
          action={
            <button
              type="button"
              onClick={handleCreateRole}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white dark:bg-dark-primary dark:text-dark-shell"
            >
              <Plus className="h-4 w-4" />
              {t("settings.roles.create.action")}
            </button>
          }
        >
          <div className="grid gap-4 md:grid-cols-2">
            <Field
              register={{}}
              label={t("settings.roles.fields.roleName")}
              placeholder={t("settings.roles.placeholders.roleName")}
              value={draftRole.title}
              onChange={(e) =>
                setDraftRole((current) => ({
                  ...current,
                  title: e.target.value,
                }))
              }
            />
            <div>
              <span className="mb-2 block text-[11px] font-semibold text-primary dark:text-dark-primary">
                {t("settings.roles.fields.accessLevel")}
              </span>
              <Select
                value={draftRole.level}
                onChange={(value) =>
                  setDraftRole((current) => ({
                    ...current,
                    level: value,
                  }))
                }
                options={[
                  { value: "Full access", label: t("settings.roles.levels.fullAccess") },
                  { value: "Approver", label: t("settings.roles.levels.approver") },
                  { value: "Academic", label: t("settings.roles.levels.academic") },
                  { value: "Records", label: t("settings.roles.levels.records") },
                ]}
              />
            </div>
            <div className="md:col-span-2">
              <Field
                register={{}}
                label={t("settings.roles.fields.description")}
                placeholder={t("settings.roles.placeholders.description")}
                value={draftRole.description}
                onChange={(e) =>
                  setDraftRole((current) => ({
                    ...current,
                    description: e.target.value,
                  }))
                }
              />
            </div>
            <div>
              <span className="mb-2 block text-[11px] font-semibold text-primary dark:text-dark-primary">
                {t("settings.roles.fields.department")}
              </span>
              <SearchableSelect
                options={departmentOptions.map((item) => ({
                  ...item,
                  label: t(`settings.shared.departments.${item.value}`),
                }))}
                value={draftRole.department}
                onChange={(value) =>
                  setDraftRole((current) => ({
                    ...current,
                    department: value,
                  }))
                }
                placeholder={t("settings.roles.placeholders.findDepartment")}
                searchPlaceholder={t("settings.roles.placeholders.searchDepartments")}
              />
            </div>
            <div>
              <span className="mb-2 block text-[11px] font-semibold text-primary dark:text-dark-primary">
                {t("settings.roles.fields.defaultPermissions")}
              </span>
              <SearchableSelect
                multiple
                options={permissionOptions.map((item) => ({
                  ...item,
                  label: t(`settings.shared.permissions.${item.value}`),
                }))}
                value={draftRole.permissions}
                onChange={(value) =>
                  setDraftRole((current) => ({
                    ...current,
                    permissions: value,
                  }))
                }
                placeholder={t("settings.roles.placeholders.selectPermissions")}
                searchPlaceholder={t("settings.roles.placeholders.searchPermissions")}
              />
            </div>
          </div>
        </SettingsSectionCard>

        <SettingsSectionCard
          icon={UsersRound}
          title={t("settings.roles.existing.title")}
          description={t("settings.roles.existing.description")}
        >
          <div className="mb-4 grid gap-4 md:grid-cols-2">
            <div>
              <span className="mb-2 block text-[11px] font-semibold text-primary dark:text-dark-primary">
                {t("settings.roles.fields.defaultInviteRole")}
              </span>
              <Select
                value={defaultRole}
                onChange={setDefaultRole}
                placeholder={t("settings.roles.placeholders.chooseRole")}
                options={[
                  { value: "student", label: t("settings.shared.roles.student") },
                  { value: "lecturer", label: t("settings.shared.roles.lecturer") },
                  { value: "registrar", label: t("settings.shared.roles.registrar") },
                  { value: "dean", label: t("settings.shared.roles.dean") },
                ]}
              />
            </div>
            <div>
              <span className="mb-2 block text-[11px] font-semibold text-primary dark:text-dark-primary">
                {t("settings.roles.fields.filterByDepartment")}
              </span>
              <SearchableSelect
                options={departmentOptions.map((item) => ({
                  ...item,
                  label: t(`settings.shared.departments.${item.value}`),
                }))}
                value={selectedDepartment}
                onChange={setSelectedDepartment}
                placeholder={t("settings.roles.placeholders.findDepartment")}
                searchPlaceholder={t("settings.roles.placeholders.searchDepartments")}
              />
            </div>
          </div>

          <div className="space-y-3">
            {filteredRoles.map((role) => (
              <div
                key={role.id}
                className="rounded-md border border-default bg-shell p-4 dark:border-dark-default dark:bg-dark-shell"
              >
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm font-semibold text-primary dark:text-dark-primary">
                        {role.title}
                      </h3>
                      <span className="rounded-md bg-card px-2.5 py-1 text-xs font-medium text-secondary dark:bg-dark-card dark:text-dark-secondary">
                        {t(
                          `settings.roles.levels.${role.level
                            .replaceAll(" ", "")
                            .replace(/^./, (char) => char.toLowerCase())}`,
                          role.level,
                        )}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-secondary dark:text-dark-secondary">
                      {role.description}
                    </p>
                    <p className="mt-2 text-xs font-medium uppercase tracking-[0.2em] text-muted dark:text-dark-muted">
                      {t("settings.roles.existing.appliedUsers", {
                        count: role.usersCount,
                      })}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleIncreaseUsers(role.id)}
                    className="inline-flex items-center justify-center rounded-md border border-default bg-card px-3 py-2 text-sm font-medium text-primary hover:bg-card-2 dark:border-dark-default dark:bg-dark-card dark:text-dark-primary dark:hover:bg-dark-card-2"
                  >
                    {t("settings.roles.existing.addAssignedUser")}
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
