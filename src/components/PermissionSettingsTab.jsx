import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { KeyRound, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import Button from "./Button";
import Field from "./Field";
import GlobalModal from "./GlobalModal";
import Select from "./Select";
import SettingsSectionCard from "./SettingsSectionCard";
import {
  useCreatePermission,
  usePermissionsByClient,
} from "../services/useApi";

const PERMISSIONS_CLIENT_ID =
  import.meta.env.VITE_PERMISSIONS_CLIENT_ID ?? "file-service";

export default function PermissionSettingsTab() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const { data, isLoading } = usePermissionsByClient(PERMISSIONS_CLIENT_ID);

  const permissions = useMemo(() => {
    const list = data?.permissions ?? [];
    const q = filter.trim().toLowerCase();
    if (!q) return list;
    return list.filter(
      (p) =>
        (p.name || "").toLowerCase().includes(q) ||
        (p.description || "").toLowerCase().includes(q),
    );
  }, [data, filter]);

  const total = data?.total ?? permissions.length;

  const createMutation = useCreatePermission({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["permissions", "client", PERMISSIONS_CLIENT_ID],
      });
      setCreateOpen(false);
    },
  });

  const [draft, setDraft] = useState({
    name: "",
    description: "",
    resource: "",
    action: "",
    is_system_permission: "false",
  });

  const resetDraft = () => {
    setDraft({
      name: "",
      description: "",
      resource: "",
      action: "",
      is_system_permission: "false",
    });
  };

  const handleCreate = () => {
    if (!draft.name.trim() || !draft.resource.trim() || !draft.action.trim()) {
      return;
    }
    createMutation.mutate({
      name: draft.name.trim(),
      description: draft.description.trim() || undefined,
      client_id: PERMISSIONS_CLIENT_ID,
      resource: draft.resource.trim().toUpperCase(),
      action: draft.action.trim().toUpperCase(),
      is_system_permission: draft.is_system_permission === "true",
    });
    resetDraft();
  };

  const closeModal = (openFlag) => {
    if (!openFlag) {
      setCreateOpen(false);
      resetDraft();
    }
  };

  return (
    <div className="space-y-6">
      <SettingsSectionCard
        icon={KeyRound}
        title={t("settings.permissions.title")}
        description={t("settings.permissions.apiDescription")}
        action={
          <Button
            type="button"
            variant="primary"
            className="gap-2"
            icon={<Plus className="h-4 w-4" strokeWidth={2} aria-hidden />}
            onClick={() => setCreateOpen(true)}
          >
            {t("settings.permissions.actions.openCreateModal")}
          </Button>
        }
      >
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-xl border border-(--color-light-card-border) bg-light-app-tertiary p-4 dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary">
            <p className="text-sm font-medium text-secondary dark:text-dark-secondary">
              {t("settings.permissions.summary.totalPermissions")}
            </p>
            <p className="mt-2 text-3xl font-bold text-primary dark:text-dark-primary">
              {isLoading ? "—" : total}
            </p>
          </div>
          <div className="rounded-xl border border-(--color-light-card-border) bg-light-app-tertiary p-4 dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary md:col-span-2">
            <p className="text-sm font-medium text-secondary dark:text-dark-secondary">
              {t("settings.permissions.clientIdLabel")}
            </p>
            <p className="mt-2 font-mono text-sm text-primary dark:text-dark-primary">
              {PERMISSIONS_CLIENT_ID}
            </p>
          </div>
        </div>
      </SettingsSectionCard>

      <SettingsSectionCard
        icon={KeyRound}
        title={t("settings.permissions.existing.title")}
        description={t("settings.permissions.apiListHint")}
      >
        <div className="mb-4">
          <Field
            register={{}}
            label={t("settings.permissions.filterLabel")}
            placeholder={t("settings.permissions.filterPlaceholder")}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          />
        </div>

        <div className="max-h-[520px] space-y-3 overflow-y-auto pr-1">
          {isLoading && (
            <p className="text-sm text-muted dark:text-dark-muted">
              {t("settings.permissions.loading")}
            </p>
          )}
          {!isLoading &&
            permissions.map((item) => (
              <div
                key={item.id ?? item.name}
                className="rounded-xl border border-(--color-light-card-border) bg-light-app-tertiary p-4 dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary"
              >
                <p className="text-sm font-semibold text-primary dark:text-dark-primary">
                  {item.name}
                </p>
                {item.description ? (
                  <p className="mt-2 text-sm leading-6 text-secondary dark:text-dark-secondary">
                    {item.description}
                  </p>
                ) : null}
              </div>
            ))}
          {!isLoading && !permissions.length && (
            <p className="text-sm text-muted dark:text-dark-muted">
              {t("settings.permissions.empty")}
            </p>
          )}
        </div>
      </SettingsSectionCard>

      <GlobalModal
        variant="sheet"
        open={createOpen}
        setOpen={closeModal}
        isClose
        title={t("settings.permissions.modal.title")}
        subtitle={t("settings.permissions.apiCreateHint")}
        footer={
          <>
            <Button
              type="button"
              variant="tertiary"
              onClick={() => closeModal(false)}
            >
              {t("settings.academic.cancel")}
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={createMutation.isPending}
              onClick={handleCreate}
            >
              {t("settings.permissions.create.action")}
            </Button>
          </>
        }
        sheetClassName="sm:max-w-[min(36rem,92vw)]"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            register={{}}
            label={t("settings.permissions.fields.permissionName")}
            placeholder={t("settings.permissions.placeholders.permissionName")}
            value={draft.name}
            onChange={(e) => setDraft((c) => ({ ...c, name: e.target.value }))}
          />
          <Field
            register={{}}
            label={t("settings.permissions.fields.resource")}
            placeholder={t("settings.permissions.placeholders.resource")}
            value={draft.resource}
            onChange={(e) =>
              setDraft((c) => ({ ...c, resource: e.target.value }))
            }
          />
          <Field
            register={{}}
            label={t("settings.permissions.fields.action")}
            placeholder={t("settings.permissions.placeholders.action")}
            value={draft.action}
            onChange={(e) =>
              setDraft((c) => ({ ...c, action: e.target.value }))
            }
          />
          <div>
            <span className="mb-2 block text-[11px] font-semibold text-primary dark:text-dark-primary">
              {t("settings.permissions.fields.systemPermission")}
            </span>
            <Select
              value={draft.is_system_permission}
              onChange={(v) =>
                setDraft((c) => ({ ...c, is_system_permission: v }))
              }
              options={[
                { value: "false", label: t("settings.permissions.systemNo") },
                { value: "true", label: t("settings.permissions.systemYes") },
              ]}
            />
          </div>
          <div className="md:col-span-2">
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
        </div>
      </GlobalModal>
    </div>
  );
}
