import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, UsersRound } from "lucide-react";
import { useTranslation } from "react-i18next";
import Button from "./Button";
import Field from "./Field";
import GlobalModal from "./GlobalModal";
import SettingsSectionCard from "./SettingsSectionCard";
import { useCreateRole, useDeleteRole, useRoles } from "../services/useApi";

export default function RoleSettingsTab() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { data, isLoading } = useRoles();

  const roles = useMemo(() => data?.roles ?? [], [data]);
  const total = data?.total ?? roles.length;

  const createMutation = useCreateRole({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
      setCreateOpen(false);
    },
  });
  const deleteMutation = useDeleteRole({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["roles"] });
    },
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [draft, setDraft] = useState({ name: "", description: "" });
  const [deleteTarget, setDeleteTarget] = useState(null);

  const resetDraft = () => setDraft({ name: "", description: "" });

  const handleCreate = () => {
    if (!draft.name.trim()) return;
    createMutation.mutate({
      name: draft.name.trim().toUpperCase().replace(/\s+/g, "_"),
      description: draft.description.trim() || undefined,
    });
    resetDraft();
  };

  const closeCreateModal = (openFlag) => {
    if (!openFlag) {
      setCreateOpen(false);
      resetDraft();
    }
  };

  return (
    <div className="space-y-6">
      <SettingsSectionCard
        icon={UsersRound}
        title={t("settings.roles.title")}
        description={t("settings.roles.apiDescription")}
        action={
          <Button
            type="button"
            variant="primary"
            className="gap-2"
            icon={<Plus className="h-4 w-4" strokeWidth={2} aria-hidden />}
            onClick={() => setCreateOpen(true)}
          >
            {t("settings.roles.actions.openCreateModal")}
          </Button>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-(--color-light-card-border) bg-light-app-tertiary p-4 dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary">
            <p className="text-sm font-medium text-secondary dark:text-dark-secondary">
              {t("settings.roles.summary.existingRoles")}
            </p>
            <p className="mt-2 text-3xl font-bold text-primary dark:text-dark-primary">
              {isLoading ? "—" : total}
            </p>
          </div>
          <div className="rounded-xl border border-(--color-light-card-border) bg-light-app-tertiary p-4 dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary">
            <p className="text-sm text-secondary dark:text-dark-secondary">
              {t("settings.roles.assignHint")}
            </p>
          </div>
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        icon={UsersRound}
        title={t("settings.roles.existing.title")}
        description={t("settings.roles.apiListHint")}
      >
        <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
          {isLoading && (
            <p className="text-sm text-muted dark:text-dark-muted">
              {t("settings.roles.loading")}
            </p>
          )}
          {!isLoading &&
            roles.map((role) => {
              const roleName = role.name ?? role.roleKey ?? role.id;
              return (
                <div
                  key={roleName}
                  className="flex flex-col gap-3 rounded-xl border border-(--color-light-card-border) bg-light-app-tertiary p-4 sm:flex-row sm:items-start sm:justify-between dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-primary dark:text-dark-primary">
                      {roleName}
                    </p>
                    {role.description ? (
                      <p className="mt-2 text-sm leading-6 text-secondary dark:text-dark-secondary">
                        {role.description}
                      </p>
                    ) : null}
                  </div>
                  <Button
                    type="button"
                    variant="tertiary"
                    className="shrink-0 gap-2 text-(--color-light-error-text) dark:text-(--color-dark-error-text)"
                    onClick={() => setDeleteTarget(roleName)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" strokeWidth={2} aria-hidden />
                    {t("settings.roles.delete")}
                  </Button>
                </div>
              );
            })}
          {!isLoading && !roles.length && (
            <p className="text-sm text-muted dark:text-dark-muted">
              {t("settings.roles.empty")}
            </p>
          )}
        </div>
      </SettingsSectionCard>

      <GlobalModal
        variant="sheet"
        open={createOpen}
        setOpen={closeCreateModal}
        isClose
        title={t("settings.roles.modal.title")}
        subtitle={t("settings.roles.apiCreateHint")}
        footer={
          <>
            <Button
              type="button"
              variant="tertiary"
              onClick={() => closeCreateModal(false)}
            >
              {t("settings.roles.cancel")}
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={createMutation.isPending}
              onClick={handleCreate}
            >
              {t("settings.roles.create.action")}
            </Button>
          </>
        }
        sheetClassName="sm:max-w-[min(28rem,92vw)]"
      >
        <div className="grid gap-4">
          <Field
            register={{}}
            label={t("settings.roles.fields.apiRoleName")}
            placeholder={t("settings.roles.placeholders.apiRoleName")}
            value={draft.name}
            onChange={(e) => setDraft((c) => ({ ...c, name: e.target.value }))}
          />
          <Field
            register={{}}
            label={t("settings.roles.fields.description")}
            placeholder={t("settings.roles.placeholders.description")}
            value={draft.description}
            onChange={(e) =>
              setDraft((c) => ({ ...c, description: e.target.value }))
            }
          />
        </div>
      </GlobalModal>

      <GlobalModal
        variant="center"
        open={Boolean(deleteTarget)}
        setOpen={(o) => {
          if (!o) setDeleteTarget(null);
        }}
        isClose
        title={t("settings.roles.deleteConfirmTitle")}
        subtitle={t("settings.roles.deleteConfirmMessage", {
          name: deleteTarget ?? "",
        })}
        className="max-w-md"
        footer={
          <>
            <Button
              type="button"
              variant="tertiary"
              onClick={() => setDeleteTarget(null)}
            >
              {t("settings.roles.cancel")}
            </Button>
            <Button
              type="button"
              variant="danger"
              disabled={deleteMutation.isPending}
              onClick={() => {
                if (deleteTarget) deleteMutation.mutate(deleteTarget);
                setDeleteTarget(null);
              }}
            >
              {t("settings.roles.delete")}
            </Button>
          </>
        }
      >
        <span className="sr-only">role delete</span>
      </GlobalModal>
    </div>
  );
}
