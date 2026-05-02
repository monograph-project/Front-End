import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowUpDown,
  BadgeCheck,
  Building2,
  CalendarDays,
  Columns3,
  EyeOff,
  Filter,
  Hash,
  LayoutGrid,
  LayoutList,
  Mail,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import Checkbox from "../../components/Checkbox";
import {
  DropdownContent,
  DropdownItem,
  DropdownMenuRoot,
  DropdownSeparator,
  DropdownTrigger,
} from "../../components/DropdownMenu";
import Field from "../../components/Field";
import GlobalModal from "../../components/GlobalModal";
import IC from "../../components/IC";
import Icon from "../../components/Icon";
import Pagination from "../../components/Pagination";
import Select from "../../components/Select";
import StatusPill, { statusToPillVariant } from "../../components/StatusPill";
import Table from "../../components/Table";
import TableBody from "../../components/TableBody";
import TableColumn from "../../components/TableColumn";
import TableHeader from "../../components/TableHeader";
import TableRow from "../../components/TableRow";
import TableToolbar from "../../components/TableToolbar";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useDeleteDepartment, useDepartments } from "../../services/useApi";
import AddDepartmentForm from "./AddDepartmentForm";
import EditDepartmentForm from "./EditDepartmentForm";

const EMPTY = [];

function formatDepartmentDate(value, locale, fallback) {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function departmentKey(row) {
  const raw = row?.id ?? row?.code ?? row?.name;
  return raw == null || raw === "" ? "-" : String(raw);
}

export default function Departments() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 400);
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewTab, setViewTab] = useState("list");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [deleteDepartmentId, setDeleteDepartmentId] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const {
    data: departmentsData = EMPTY,
    isLoading,
    isError,
    error,
  } = useDepartments({ notifyOnError: true });

  const deleteDepartmentMutation = useDeleteDepartment({
    showSuccessToast: false,
    showErrorToast: false,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        predicate: (q) =>
          Array.isArray(q.queryKey) && q.queryKey[0] === "departments",
      });
    },
  });

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, pageSize]);

  const filteredDepartments = useMemo(() => {
    const search = debouncedSearch.trim().toLowerCase();

    return departmentsData.filter((department) => {
      const name = String(department.name ?? "").toLowerCase();
      const head = String(department.head ?? "").toLowerCase();
      const faculty = String(department.facultyName ?? "").toLowerCase();
      const id = String(department.id ?? "").toLowerCase();
      const status = String(department.status ?? "").toLowerCase();

      const matchesSearch =
        search === "" ||
        name.includes(search) ||
        head.includes(search) ||
        faculty.includes(search) ||
        id.includes(search);
      const matchesStatus =
        statusFilter === "all" || status === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [departmentsData, debouncedSearch, statusFilter]);

  const totalElements = filteredDepartments.length;
  const totalPages =
    totalElements > 0 ? Math.ceil(totalElements / pageSize) : 0;

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageDepartments = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredDepartments.slice(start, start + pageSize);
  }, [filteredDepartments, page, pageSize]);

  const summary = useMemo(() => {
    const active = departmentsData.filter(
      (department) => String(department.status).toLowerCase() === "active",
    ).length;
    const pending = departmentsData.filter(
      (department) => String(department.status).toLowerCase() === "pending",
    ).length;
    const inactive = departmentsData.length - active;

    return { active, pending, inactive };
  }, [departmentsData]);

  const deletingDepartment = departmentsData.find(
    (department) => String(department.id) === String(deleteDepartmentId),
  );

  const locale =
    i18n.language === "ps"
      ? "ps-AF"
      : i18n.language === "prs"
        ? "fa-AF"
        : "en-US";

  const headerData = useMemo(
    () => [
      { title: "" },
      {
        title: t("adminDepartments.table.id"),
        icon: (
          <Hash className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
        ),
      },
      {
        title: t("adminDepartments.table.department"),
        icon: (
          <Building2
            className="size-3.5 shrink-0"
            strokeWidth={2}
            aria-hidden
          />
        ),
      },
      {
        title: t("adminDepartments.table.head"),
        icon: (
          <Mail className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
        ),
      },
      {
        title: t("adminDepartments.table.status"),
        hint: true,
        icon: (
          <BadgeCheck
            className="size-3.5 shrink-0"
            strokeWidth={2}
            aria-hidden
          />
        ),
      },
      {
        title: t("adminDepartments.table.created"),
        hint: true,
        icon: (
          <CalendarDays
            className="size-3.5 shrink-0"
            strokeWidth={2}
            aria-hidden
          />
        ),
      },
      {
        title: t("adminDepartments.table.actions"),
        align: "center",
      },
    ],
    [t],
  );

  const statusOptions = [
    { value: "all", label: t("adminShared.filters.allStatus") },
    { value: "active", label: t("adminShared.status.active") },
    { value: "pending", label: t("adminShared.status.pending") },
    { value: "suspended", label: t("adminShared.status.suspended") },
    { value: "inactive", label: t("adminDepartments.status.inactive") },
  ];

  const exportToCSV = () => {
    const headers = [
      t("adminDepartments.table.id"),
      t("adminDepartments.table.department"),
      t("adminDepartments.table.head"),
      t("adminDepartments.table.faculty"),
      t("adminDepartments.table.status"),
      t("adminDepartments.table.created"),
    ];
    const csvContent = [
      headers.join(","),
      ...filteredDepartments.map((department) =>
        [
          department.id ?? "",
          department.name ?? "",
          department.head ?? "",
          department.facultyName ?? "",
          department.status ?? "",
          department.created ?? "",
        ]
          .map((field) => `"${String(field).replaceAll('"', '""')}"`)
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "departments.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const confirmDeleteDepartment = async () => {
    if (deleteDepartmentId == null || deleteSubmitting) return;
    setDeleteSubmitting(true);
    try {
      await deleteDepartmentMutation.mutateAsync(deleteDepartmentId);
      window.GooeyToaster?.success?.(t("adminDepartments.delete.success"));
      setDeleteDepartmentId(null);
    } catch (e) {
      window.GooeyToaster?.error?.(
        e?.message || t("adminDepartments.delete.error"),
      );
    } finally {
      setDeleteSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-[14px] overflow-y-auto bg-light-app-bg p-4 md:p-5 dark:bg-dark-shell">
        <div className="flex h-64 items-center justify-center text-primary dark:text-dark-primary">
          {t("adminDepartments.loading")}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-1 flex-col gap-[14px] overflow-y-auto bg-light-app-bg p-4 md:p-5 dark:bg-dark-shell">
        <div className="flex h-64 flex-col items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-light-error-bg dark:bg-dark-error-bg">
            <Icon
              d={IC.x}
              className="h-5 w-5 text-light-error-text dark:text-dark-error-text"
            />
          </div>
          <div className="text-center">
            <p className="font-medium text-primary dark:text-dark-primary">
              {t("apiErrors.failed_to_load_departments")}
            </p>
            <p className="mt-1 max-w-md text-sm text-muted dark:text-dark-muted">
              {error?.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto bg-light-app-bg p-4 md:p-5 dark:bg-dark-shell">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-primary dark:text-dark-primary">
            {t("adminDepartments.header.title")}
          </h1>
          <p className="text-muted dark:text-dark-muted">
            {t("adminDepartments.header.description", {
              count: departmentsData.length,
            })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-none">
            <DropdownMenuRoot>
              <DropdownTrigger>{t("adminShared.labels.actions")}</DropdownTrigger>
              <DropdownContent align="end">
                <DropdownItem
                  icon={<Icon d={IC.download} className="size-4" />}
                  onClick={exportToCSV}
                >
                  {t("adminShared.actions.download")}
                </DropdownItem>
                <DropdownItem
                  icon={<Icon d={IC.upload} className="size-4" />}
                  onClick={() =>
                    window.GooeyToaster?.info?.(
                      t("adminDepartments.toolbar.importPending"),
                    )
                  }
                >
                  {t("adminDepartments.toolbar.import")}
                </DropdownItem>
              </DropdownContent>
            </DropdownMenuRoot>
          </div>

          <div className="flex-none">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-default bg-light-btn-primary-bg px-3 py-2 text-xs font-semibold text-secondary transition-colors hover:bg-light-btn-primary-hover dark:border-dark-default dark:text-dark-secondary dark:hover:bg-dark-card-hover"
            >
              <Icon d={IC.plus} className="size-4 text-white" />
              <span className="text-white">
                {t("adminDepartments.actions.add")}
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          label={t("adminDepartments.summary.total.label")}
          value={departmentsData.length}
          hint={t("adminDepartments.summary.total.hint")}
          tone="slate"
        />
        <SummaryCard
          label={t("adminDepartments.summary.active.label")}
          value={summary.active}
          hint={t("adminDepartments.summary.active.hint")}
          tone="green"
        />
        <SummaryCard
          label={t("adminDepartments.summary.attention.label")}
          value={summary.pending + summary.inactive}
          hint={t("adminDepartments.summary.attention.hint")}
          tone="amber"
        />
      </div>

      <div className="flex-1">
        <Table
          toolbar={
            <TableToolbar>
              <TableToolbar.Row
                justify="between"
                className="items-stretch gap-3 sm:items-center"
              >
                <TableToolbar.ViewTabs
                  value={viewTab}
                  onValueChange={(id) => {
                    setViewTab(id);
                    if (id === "board") {
                      window.GooeyToaster?.info?.(
                        t("adminDepartments.toolbar.boardPending"),
                      );
                    }
                  }}
                  tabs={[
                    {
                      id: "list",
                      label: t("adminDepartments.toolbar.list"),
                      icon: (
                        <LayoutList
                          className="size-3.5 shrink-0"
                          strokeWidth={2}
                          aria-hidden
                        />
                      ),
                    },
                    {
                      id: "board",
                      label: t("adminDepartments.toolbar.board"),
                      icon: (
                        <LayoutGrid
                          className="size-3.5 shrink-0"
                          strokeWidth={2}
                          aria-hidden
                        />
                      ),
                    },
                  ]}
                />
              </TableToolbar.Row>
              <TableToolbar.Row justify="start" className="gap-2">
                <div className="min-w-0 flex-1 sm:min-w-[12rem]">
                  <Field
                    id="departments-search"
                    placeholder={t(
                      "adminDepartments.filters.searchPlaceholder",
                    )}
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    iconD={IC.search}
                  />
                </div>
                <div className="w-full shrink-0 sm:w-48">
                  <Select
                    options={statusOptions}
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                  />
                </div>
                <TableToolbar.Section className="w-full shrink-0 justify-start sm:ml-auto sm:w-auto md:justify-end">
                  <TableToolbar.IconButton
                    type="button"
                    aria-label={t("adminDepartments.toolbar.filter")}
                    icon={
                      <Filter className="size-3.5 shrink-0" strokeWidth={2} />
                    }
                    onClick={() =>
                      window.GooeyToaster?.info?.(
                        t("adminDepartments.toolbar.filtersPending"),
                      )
                    }
                  >
                    {t("adminDepartments.toolbar.filter")}
                  </TableToolbar.IconButton>
                  <TableToolbar.IconButton
                    type="button"
                    aria-label={t("adminDepartments.toolbar.sort")}
                    icon={
                      <ArrowUpDown
                        className="size-3.5 shrink-0"
                        strokeWidth={2}
                      />
                    }
                    onClick={() =>
                      window.GooeyToaster?.info?.(
                        t("adminDepartments.toolbar.sortPending"),
                      )
                    }
                  >
                    {t("adminDepartments.toolbar.sort")}
                  </TableToolbar.IconButton>
                  <TableToolbar.IconButton
                    type="button"
                    aria-label={t("adminDepartments.toolbar.columns")}
                    icon={
                      <Columns3 className="size-3.5 shrink-0" strokeWidth={2} />
                    }
                    onClick={() =>
                      window.GooeyToaster?.info?.(
                        t("adminDepartments.toolbar.columnsPending"),
                      )
                    }
                  >
                    {t("adminDepartments.toolbar.columns")}
                  </TableToolbar.IconButton>
                  <TableToolbar.IconButton
                    type="button"
                    aria-label={t("adminDepartments.toolbar.hide")}
                    icon={
                      <EyeOff className="size-3.5 shrink-0" strokeWidth={2} />
                    }
                    onClick={() =>
                      window.GooeyToaster?.info?.(
                        t("adminDepartments.toolbar.densityPending"),
                      )
                    }
                  >
                    {t("adminDepartments.toolbar.hide")}
                  </TableToolbar.IconButton>
                </TableToolbar.Section>
              </TableToolbar.Row>
            </TableToolbar>
          }
        >
          <TableHeader headerData={headerData} />
          <TableBody>
            {pageDepartments.map((department) => (
              <TableRow key={departmentKey(department)}>
                <TableColumn className="w-10">
                  <Checkbox />
                </TableColumn>

                <TableColumn className="font-mono text-xs">
                  #{departmentKey(department)}
                </TableColumn>

                <TableColumn nowrap={false}>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-default bg-light-app-tertiary text-secondary dark:border-dark-default dark:bg-dark-app-tertiary dark:text-dark-secondary">
                      <Building2
                        className="size-4"
                        strokeWidth={2}
                        aria-hidden
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="line-clamp-1 text-sm font-medium text-primary dark:text-dark-primary">
                        {department.name || t("adminDepartments.fallback.name")}
                      </div>
                      <div className="text-xs text-muted dark:text-dark-muted">
                        {department.facultyName ||
                          t("adminDepartments.fallback.faculty")}
                      </div>
                    </div>
                  </div>
                </TableColumn>

                <TableColumn nowrap={false}>
                  <span className="line-clamp-1 text-sm text-secondary dark:text-dark-secondary">
                    {department.head || t("adminDepartments.fallback.head")}
                  </span>
                </TableColumn>

                <TableColumn>
                  <StatusPill variant={statusToPillVariant(department.status)}>
                    {t(
                      `adminShared.status.${String(
                        department.status || "inactive",
                      ).toLowerCase()}`,
                      t("adminDepartments.status.inactive"),
                    )}
                  </StatusPill>
                </TableColumn>

                <TableColumn className="whitespace-nowrap text-xs">
                  {department.created
                    ? formatDepartmentDate(
                        department.created,
                        locale,
                        t("adminDepartments.fallback.date"),
                      )
                    : t("adminDepartments.fallback.date")}
                </TableColumn>

                <TableColumn className="text-center">
                  <DropdownMenuRoot>
                    <DropdownTrigger showArrow={false}>
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM12.5 8.625C13.1213 8.625 13.625 8.12132 13.625 7.5C13.625 6.87868 13.1213 6.375 12.5 6.375C11.8787 6.375 11.375 6.87868 11.375 7.5C11.375 8.12132 11.8787 8.625 12.5 8.625Z"
                          fill="currentColor"
                          fillRule="evenodd"
                          clipRule="evenodd"
                        />
                      </svg>
                    </DropdownTrigger>
                    <DropdownContent align="end">
                      <DropdownItem
                        onClick={() =>
                          navigate(`/admin/department/${department.id}`)
                        }
                      >
                        <span>{t("adminShared.actions.viewProfile")}</span>
                      </DropdownItem>
                      <DropdownItem
                        onClick={() => {
                          setSelectedDepartment(department);
                          setShowEditModal(true);
                        }}
                      >
                        <span>{t("adminShared.actions.editDetails")}</span>
                      </DropdownItem>
                      <DropdownItem
                        onClick={() =>
                          window.GooeyToaster?.info?.(
                            t("adminDepartments.toolbar.messagingPending"),
                          )
                        }
                      >
                        <span>{t("adminShared.actions.sendMessage")}</span>
                      </DropdownItem>

                      <DropdownSeparator />

                      <DropdownItem
                        variant="danger"
                        onClick={() => setDeleteDepartmentId(department.id)}
                      >
                        <span>{t("adminShared.actions.delete")}</span>
                      </DropdownItem>
                    </DropdownContent>
                  </DropdownMenuRoot>
                </TableColumn>
              </TableRow>
            ))}

            {pageDepartments.length === 0 && (
              <TableRow className="table-advanced-tr--empty cursor-default">
                <TableColumn
                  colSpan={headerData.length}
                  nowrap={false}
                  className="py-12 text-center text-muted dark:text-dark-muted"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <Building2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <span className="font-medium">
                      {t("adminDepartments.empty")}
                    </span>
                    <span className="text-xs opacity-75">
                      {t("adminDepartments.emptyHint")}
                    </span>
                  </div>
                </TableColumn>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={totalElements}
          pageSize={pageSize}
          onPageChange={(nextPage, nextSize) => {
            if (nextSize !== pageSize) {
              setPageSize(nextSize);
              setPage(1);
              return;
            }
            setPage(nextPage);
          }}
        />
      </div>

      <GlobalModal open={showAddModal} setOpen={setShowAddModal} isClose={true}>
        <AddDepartmentForm
          onClose={() => setShowAddModal(false)}
          onSuccess={() =>
            queryClient.invalidateQueries({ queryKey: ["departments"] })
          }
        />
      </GlobalModal>

      <GlobalModal
        open={showEditModal}
        setOpen={setShowEditModal}
        isClose={true}
      >
        {selectedDepartment ? (
          <EditDepartmentForm
            department={selectedDepartment}
            onClose={() => {
              setShowEditModal(false);
              setSelectedDepartment(null);
            }}
            onSuccess={() =>
              queryClient.invalidateQueries({ queryKey: ["departments"] })
            }
          />
        ) : null}
      </GlobalModal>

      {deleteDepartmentId != null ? (
        <DeleteConfirmModal
          department={deletingDepartment}
          onCancel={() => {
            if (!deleteSubmitting) setDeleteDepartmentId(null);
          }}
          onConfirm={confirmDeleteDepartment}
          submitting={deleteSubmitting}
        />
      ) : null}
    </div>
  );
}

function SummaryCard({ label, value, hint, tone }) {
  const tones = {
    slate:
      "border-default bg-light-card-bg dark:border-dark-default dark:bg-dark-card-bg",
    green:
      "border-emerald-200 bg-emerald-50/80 dark:border-emerald-900/60 dark:bg-emerald-950/30",
    amber:
      "border-amber-200 bg-amber-50/80 dark:border-amber-900/60 dark:bg-amber-950/30",
  };

  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm ${tones[tone] ?? tones.slate}`}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted dark:text-dark-muted">
        {label}
      </p>
      <p className="mt-3 text-3xl font-bold text-primary dark:text-dark-primary">
        {value}
      </p>
      <p className="mt-2 text-sm text-secondary dark:text-dark-secondary">
        {hint}
      </p>
    </div>
  );
}

function DeleteConfirmModal({ department, onCancel, onConfirm, submitting }) {
  const { t } = useTranslation();
  const departmentName =
    department?.name || t("adminDepartments.delete.fallbackName");
  const headDisplay = department?.head || t("adminDepartments.fallback.head");

  return (
    <GlobalModal open={true} setOpen={() => (!submitting ? onCancel() : null)}>
      <div className="z-1000 flex max-h-[70vh] w-full max-w-[450px] shrink-0 flex-col rounded-xl border border-default bg-light-card-bg p-6 shadow-2xl dark:border-dark-default dark:bg-dark-card-bg">
        <div className="mb-6 flex shrink-0 items-start gap-3 border-b border-default pb-4 dark:border-dark-divider">
          <div className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-light-error-bg text-light-error-text dark:bg-dark-error-bg dark:text-dark-error-text">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </div>
          <div className="min-w-0">
            <h2 className="mb-1 text-xl font-bold text-primary dark:text-dark-primary">
              {t("adminDepartments.delete.title")}
            </h2>
            <p className="mb-2 text-sm text-secondary dark:text-dark-secondary">
              {t("adminDepartments.delete.descriptionPrefix")}{" "}
              <span className="font-semibold text-primary dark:text-dark-primary">
                "{departmentName}"
              </span>
              {t("adminDepartments.delete.descriptionSuffix")}
            </p>
            <p className="mb-4 text-xs text-muted dark:text-dark-muted">
              <span className="font-medium">
                {t("adminDepartments.delete.headLabel")}
              </span>{" "}
              <span className="rounded bg-light-app-tertiary px-2 py-0.5 font-mono text-secondary dark:bg-dark-app-tertiary dark:text-dark-secondary">
                {headDisplay}
              </span>
            </p>
            <p className="text-xs font-medium text-light-error-text dark:text-dark-error-text">
              {t("adminDepartments.delete.warning")}
            </p>
          </div>
        </div>
        <div className="mt-auto flex shrink-0 flex-wrap gap-3 border-t border-default pt-4 dark:border-dark-divider">
          <Button
            type="button"
            variant="secondary"
            className="min-w-24"
            disabled={submitting}
            onClick={onCancel}
          >
            {t("adminDepartments.delete.cancel")}
          </Button>
          <Button
            type="button"
            variant="danger"
            className="min-w-24"
            disabled={submitting}
            onClick={() => void onConfirm()}
          >
            {submitting
              ? t("adminDepartments.delete.submitting")
              : t("adminDepartments.delete.confirm")}
          </Button>
        </div>
      </div>
    </GlobalModal>
  );
}
