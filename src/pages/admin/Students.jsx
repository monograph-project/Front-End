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
  UserSquare2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import AvatarDemo from "../../components/Avatar";
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
import { useDeleteStudent, useStudentsPage } from "../../services/useApi";

const EMPTY = [];

export default function Students() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 400);
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewTab, setViewTab] = useState("list");
  const [deleteStudentId, setDeleteStudentId] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const deleteStudentMutation = useDeleteStudent({
    showSuccessToast: false,
    showErrorToast: false,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        predicate: (q) =>
          Array.isArray(q.queryKey) && q.queryKey[0] === "students",
      });
    },
  });

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  const {
    data: pageData,
    isLoading,
    isError,
    error,
  } = useStudentsPage({
    page: page - 1,
    pageSize,
    search: debouncedSearch,
    status: statusFilter,
  });

  const students = pageData?.content ?? EMPTY;
  const totalElements = pageData?.totalElements ?? 0;
  const totalPages = pageData?.totalPages ?? 0;

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const deletingStudent = students.find(
    (row) => String(row.id) === String(deleteStudentId),
  );

  const headerData = useMemo(
    () => [
      { title: "" },
      {
        title: t("adminStudents.table.id"),
        icon: (
          <Hash className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
        ),
      },
      {
        title: t("adminStudents.table.student"),
        icon: (
          <UserSquare2
            className="size-3.5 shrink-0"
            strokeWidth={2}
            aria-hidden
          />
        ),
      },
      {
        title: t("adminStudents.table.department"),
        icon: (
          <Building2
            className="size-3.5 shrink-0"
            strokeWidth={2}
            aria-hidden
          />
        ),
      },
      {
        title: t("adminStudents.table.status"),
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
        title: t("adminStudents.table.enrolled"),
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
        title: t("adminStudents.table.actions"),
        align: "center",
      },
    ],
    [t],
  );

  const locale =
    i18n.language === "ps"
      ? "ps-AF"
      : i18n.language === "prs"
        ? "fa-AF"
        : "en-US";

  const statusOptions = [
    { value: "all", label: t("adminShared.filters.allStatus") },
    { value: "active", label: t("adminShared.status.active") },
    { value: "pending", label: t("adminShared.status.pending") },
    { value: "rejected", label: t("adminShared.status.rejected") },
    { value: "suspended", label: t("adminShared.status.suspended") },
  ];

  const exportToCSV = () => {
    const headers = [
      "ID",
      "First Name",
      "Last Name",
      "Email",
      "Username",
      "Department",
      "Status",
      "Enrollment Date",
    ];
    const csvContent = [
      headers.join(","),
      ...students.map((student) =>
        [
          student.id,
          student.firstName ?? "",
          student.lastName ?? "",
          student.email ?? "",
          student.username ?? "",
          student.department ?? "",
          student.status ?? "",
          student.enrollmentDate ?? "",
        ]
          .map((field) => `"${field}"`)
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "students.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleViewProfile = (student) => {
    navigate(`/admin/student/${student.id}`);
  };

  const confirmDeleteStudent = async () => {
    if (deleteStudentId == null || deleteSubmitting) return;
    setDeleteSubmitting(true);
    try {
      await deleteStudentMutation.mutateAsync(deleteStudentId);
      window.GooeyToaster?.success?.(t("adminStudents.delete.success"));
      setDeleteStudentId(null);
    } catch (e) {
      window.GooeyToaster?.error?.(
        e?.message || t("adminStudents.delete.error"),
      );
    } finally {
      setDeleteSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-[14px] overflow-y-auto bg-light-app-bg p-4 md:p-5 dark:bg-dark-shell">
        <div className="flex h-64 items-center justify-center text-primary dark:text-dark-primary">
          {t("adminStudents.loading")}
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
              {t("apiErrors.failed_to_load_students")}
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
            {t("adminStudents.header.title")}
          </h1>
          <p className="text-muted dark:text-dark-muted">
            {t("adminStudents.header.description", {
              count: totalElements,
            })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-none">
            <DropdownMenuRoot>
              <DropdownTrigger>
                {t("adminShared.labels.actions")}
              </DropdownTrigger>
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
                      t("adminStudents.toolbar.importPending"),
                    )
                  }
                >
                  {t("adminStudents.toolbar.import")}
                </DropdownItem>
              </DropdownContent>
            </DropdownMenuRoot>
          </div>

          <div className="flex-none">
            <button
              type="button"
              onClick={() => navigate("/admin/student/new")}
              className="inline-flex w-fit items-center gap-2 rounded-xl border border-default bg-light-btn-primary-bg  px-3 py-2 text-xs font-semibold text-secondary transition-colors hover:bg-light-btn-primary-hover dark:border-dark-default  dark:text-dark-secondary dark:hover:bg-dark-card-hover"
            >
              {<Icon d={IC.plus} className="size-4 text-white" />}
              <span className="text-white ">
                {t("adminStudents.actions.add")}
              </span>
            </button>
          </div>
        </div>
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
                        t("adminStudents.toolbar.boardPending"),
                      );
                    }
                  }}
                  tabs={[
                    {
                      id: "list",
                      label: t("adminStudents.toolbar.list"),
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
                      label: t("adminStudents.toolbar.board"),
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
                    id="students-search"
                    placeholder={t("adminStudents.filters.searchPlaceholder")}
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
                    aria-label={t("adminStudents.toolbar.filter")}
                    icon={
                      <Filter className="size-3.5 shrink-0" strokeWidth={2} />
                    }
                    onClick={() =>
                      window.GooeyToaster?.info?.(
                        t("adminStudents.toolbar.filtersPending"),
                      )
                    }
                  >
                    {t("adminStudents.toolbar.filter")}
                  </TableToolbar.IconButton>
                  <TableToolbar.IconButton
                    type="button"
                    aria-label={t("adminStudents.toolbar.sort")}
                    icon={
                      <ArrowUpDown
                        className="size-3.5 shrink-0"
                        strokeWidth={2}
                      />
                    }
                    onClick={() =>
                      window.GooeyToaster?.info?.(
                        t("adminStudents.toolbar.sortPending"),
                      )
                    }
                  >
                    {t("adminStudents.toolbar.sort")}
                  </TableToolbar.IconButton>
                  <TableToolbar.IconButton
                    type="button"
                    aria-label={t("adminStudents.toolbar.columns")}
                    icon={
                      <Columns3 className="size-3.5 shrink-0" strokeWidth={2} />
                    }
                    onClick={() =>
                      window.GooeyToaster?.info?.(
                        t("adminStudents.toolbar.columnsPending"),
                      )
                    }
                  >
                    {t("adminStudents.toolbar.columns")}
                  </TableToolbar.IconButton>
                  <TableToolbar.IconButton
                    type="button"
                    aria-label={t("adminStudents.toolbar.hide")}
                    icon={
                      <EyeOff className="size-3.5 shrink-0" strokeWidth={2} />
                    }
                    onClick={() =>
                      window.GooeyToaster?.info?.(
                        t("adminStudents.toolbar.densityPending"),
                      )
                    }
                  >
                    {t("adminStudents.toolbar.hide")}
                  </TableToolbar.IconButton>
                </TableToolbar.Section>
              </TableToolbar.Row>
            </TableToolbar>
          }
        >
          <TableHeader headerData={headerData} />
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableColumn className="w-10">
                  <Checkbox />
                </TableColumn>

                <TableColumn className="font-mono text-xs">
                  #{String(student.code).padStart(2, "0")}
                </TableColumn>

                <TableColumn>
                  <div className="flex items-center gap-3">
                    <AvatarDemo />
                    <div className="min-w-0">
                      <div className="line-clamp-1 text-sm font-medium text-primary dark:text-dark-primary">
                        {student.firstName} {student.lastName}
                      </div>
                      <div className="text-xs text-muted dark:text-dark-muted">
                        {student.email || student.username || student.code}
                      </div>
                    </div>
                  </div>
                </TableColumn>

                <TableColumn nowrap={false}>
                  <span className="inline-flex max-w-[14rem] rounded-full border border-default bg-light-app-tertiary px-2.5 py-1 text-[11px] font-semibold capitalize text-secondary dark:border-dark-default dark:bg-dark-app-tertiary dark:text-dark-secondary">
                    {student.department || t("adminStudents.emptyHint")}
                  </span>
                </TableColumn>

                <TableColumn>
                  <StatusPill variant={statusToPillVariant(student.status)}>
                    {t(
                      `adminShared.status.${String(student.status).toLowerCase()}`,
                    )}
                  </StatusPill>
                </TableColumn>

                <TableColumn className="whitespace-nowrap text-xs">
                  {student.enrollmentDate
                    ? new Date(student.enrollmentDate).toLocaleDateString(
                        locale,
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        },
                      )
                    : "—"}
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
                      <DropdownItem onClick={() => handleViewProfile(student)}>
                        <span>{t("adminShared.actions.viewProfile")}</span>
                      </DropdownItem>
                      <DropdownItem
                        onClick={() =>
                          navigate(`/admin/student/${student.id}/edit`)
                        }
                      >
                        <span>{t("adminShared.actions.editDetails")}</span>
                      </DropdownItem>
                      <DropdownItem>
                        <span>{t("adminShared.actions.sendMessage")}</span>
                      </DropdownItem>

                      <DropdownSeparator />

                      <DropdownItem
                        variant="danger"
                        onClick={() => setDeleteStudentId(student.id)}
                      >
                        <span>{t("adminShared.actions.delete")}</span>
                      </DropdownItem>
                    </DropdownContent>
                  </DropdownMenuRoot>
                </TableColumn>
              </TableRow>
            ))}

            {students.length === 0 && (
              <TableRow className="table-advanced-tr--empty cursor-default">
                <TableColumn
                  colSpan={headerData.length}
                  nowrap={false}
                  className="py-12 text-center text-muted dark:text-dark-muted"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <Icon
                        d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
                        className="h-5 w-5 text-muted-foreground"
                      />
                    </div>
                    <span className="font-medium">
                      {t("adminStudents.empty")}
                    </span>
                    <span className="text-xs opacity-75">
                      {t("adminStudents.emptyHint")}
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

      {deleteStudentId != null ? (
        <StudentDeleteModal
          student={deletingStudent}
          onCancel={() => {
            if (!deleteSubmitting) setDeleteStudentId(null);
          }}
          onConfirm={confirmDeleteStudent}
          submitting={deleteSubmitting}
        />
      ) : null}
    </div>
  );
}

function StudentDeleteModal({ student, onCancel, onConfirm, submitting }) {
  const { t } = useTranslation();
  const displayName =
    student && `${student.firstName ?? ""} ${student.lastName ?? ""}`.trim();
  const namePhrase = displayName
    ? `\u201c${displayName}\u201d`
    : t("adminStudents.delete.fallbackName");
  const emailDisplay = student?.email?.trim()
    ? student.email
    : t("adminStudents.delete.noEmail");

  return (
    <GlobalModal open={true} setOpen={() => (!submitting ? onCancel() : null)}>
      <div className="z-1000 flex max-h-[70vh] w-full max-w-[450px] shrink-0 flex-col rounded-xl border border-default bg-light-card-bg p-6 shadow-2xl dark:border-dark-default dark:bg-dark-card-bg">
        <div className="mb-6 flex shrink-0 items-start gap-3 border-b border-default pb-4 dark:border-dark-divider">
          <div className="mt-0.5 flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-light-error-bg text-light-error-text dark:bg-dark-error-bg dark:text-dark-error-text">
            <svg
              width="20"
              height="20"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
            >
              <path
                d="M7.5 1.125C7.74858 1.125 7.95 1.32647 7.95 1.575V7.3125L10.1819 5.08071C10.3576 4.90497 10.6425 4.90497 10.8182 5.08071C10.994 5.25645 10.994 5.54137 10.8182 5.71711L7.81825 8.71711C7.64251 8.89284 7.35759 8.89284 7.18185 8.71711L4.18185 5.71711C4.00611 5.54137 4.00611 5.25645 4.18185 5.08071C4.35759 4.90497 4.64251 4.90497 4.81825 5.08071L7.05 7.3125V1.575C7.05 1.32647 7.25152 1.125 7.5 1.125ZM2.625 9.75C2.90114 9.75 3.125 9.97411 3.125 10.25V12C3.125 12.5523 3.57268 13 4.00365 13H11.0012C11.5529 13 12 12.5528 12 12V10.25C12 9.97411 12.2239 9.75 12.5 9.75C12.7761 9.75 13 9.97411 13 10.25V12C13 13.1041 12.1062 14 11.0012 14H4.00365C2.89749 14 2 13.103 2 12V10.25C2 9.97411 2.22386 9.75 2.625 9.75Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="min-w-0">
            <h2 className="mb-1 text-xl font-bold text-primary dark:text-dark-primary">
              {t("adminStudents.delete.title")}
            </h2>
            <p className="mb-2 text-sm text-secondary dark:text-dark-secondary">
              {t("adminStudents.delete.descriptionPrefix")}{" "}
              <span className="font-semibold text-primary dark:text-dark-primary">
                {namePhrase}
              </span>
              {t("adminStudents.delete.descriptionSuffix")}
            </p>
            <p className="mb-4 text-xs text-muted dark:text-dark-muted">
              <span className="font-medium">
                {t("adminStudents.delete.emailLabel")}
              </span>{" "}
              <span className="rounded bg-light-app-tertiary px-2 py-0.5 font-mono text-secondary dark:bg-dark-app-tertiary dark:text-dark-secondary">
                {emailDisplay}
              </span>
            </p>
            <p className="text-xs font-medium text-light-error-text dark:text-dark-error-text">
              {t("adminStudents.delete.warning")}
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
            {t("adminStudents.delete.cancel")}
          </Button>
          <Button
            type="button"
            variant="danger"
            className="min-w-24"
            disabled={submitting}
            onClick={() => void onConfirm()}
          >
            {submitting
              ? t("studentForm.actions.submitting")
              : t("adminStudents.delete.confirm")}
          </Button>
        </div>
      </div>
    </GlobalModal>
  );
}
