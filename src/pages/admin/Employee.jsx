import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  ListChecks,
  UserSquare2,
} from "lucide-react";
import {
  DropdownContent,
  DropdownItem,
  DropdownMenuRoot,
  DropdownSeparator,
  DropdownTrigger,
} from "../../components/DropdownMenu";
import IC from "../../components/IC";
import Icon from "../../components/Icon";
import Select from "../../components/Select";
import Table from "../../components/Table";
import TableBody from "../../components/TableBody";
import TableColumn from "../../components/TableColumn";
import TableHeader from "../../components/TableHeader";
import TableRow from "../../components/TableRow";
import Pagination from "../../components/Pagination";
import PersonAvatar from "../../components/PersonAvatar";
import Checkbox from "../../components/Checkbox";
import Button from "../../components/Button";
import Field from "../../components/Field";
import TableToolbar from "../../components/TableToolbar";
import OperationsDropdown from "../../components/OperationsDropdown";
import SensitiveActionModal from "../../components/SensitiveActionModal";
import StatusPill, { statusToPillVariant } from "../../components/StatusPill";
import {
  useDeleteEmployee,
  useEmployeesPage,
  useEmployees,
} from "../../services/useApi";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";

const EMPTY = [];

export default function Employee() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 400);

  const deleteEmployeeMutation = useDeleteEmployee({
    showSuccessToast: false,
    showErrorToast: false,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        predicate: (q) =>
          Array.isArray(q.queryKey) && q.queryKey[0] === "employees",
      });
    },
  });

  const [statusFilter, setStatusFilter] = useState("all");
  const [viewTab, setViewTab] = useState("list");
  const [deleteEmployeeId, setDeleteEmployeeId] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  const { data: pageData } = useEmployeesPage({
    page: page - 1,
    pageSize,
    search: debouncedSearch,
    status: statusFilter,
  });
  const { data: employeesfa } = useEmployees();
  console.log(employeesfa);
  const employees = pageData?.content ?? EMPTY;
  const totalElements = pageData?.totalElements ?? 0;
  const totalPages = pageData?.totalPages ?? 0;

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const deletingEmployee = employees.find(
    (row) => String(row.id) === String(deleteEmployeeId),
  );

  const headerData = useMemo(
    () => [
      {
        title: "",
        tooltip: t("adminShared.tableHints.bulkSelection"),
        icon: (
          <ListChecks
            className="size-3.5 shrink-0 opacity-70"
            strokeWidth={2}
            aria-hidden
          />
        ),
      },
      {
        title: t("adminEmployee.table.id"),
        tooltip: t("adminShared.tableHints.recordId"),
        icon: (
          <Hash className="size-3.5 shrink-0" strokeWidth={2} aria-hidden />
        ),
      },
      {
        title: t("adminEmployee.table.employee"),
        tooltip: t("adminShared.tableHints.displayName"),
        icon: (
          <UserSquare2
            className="size-3.5 shrink-0"
            strokeWidth={2}
            aria-hidden
          />
        ),
      },
      {
        title: t("adminEmployee.table.department"),
        tooltip: t("adminShared.tableHints.department"),
        icon: (
          <Building2
            className="size-3.5 shrink-0"
            strokeWidth={2}
            aria-hidden
          />
        ),
      },
      {
        title: t("adminEmployee.table.status"),
        tooltip: t("adminShared.tableHints.columnStatus"),
        icon: (
          <BadgeCheck
            className="size-3.5 shrink-0"
            strokeWidth={2}
            aria-hidden
          />
        ),
      },
      {
        title: t("adminEmployee.table.joined"),
        tooltip: t("adminShared.tableHints.dateJoined"),
        icon: (
          <CalendarDays
            className="size-3.5 shrink-0"
            strokeWidth={2}
            aria-hidden
          />
        ),
      },
      {
        title: t("adminEmployee.table.actions"),
        align: "center",
        tooltip: t("adminShared.tableHints.rowActions"),
        icon: (
          <LayoutList
            className="size-3.5 shrink-0 opacity-80"
            strokeWidth={2}
            aria-hidden
          />
        ),
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
      "Joined",
    ];
    const csvContent = [
      headers.join(","),
      ...employees.map((employee) =>
        [
          employee.id,
          employee.firstName,
          employee.lastName,
          employee.email,
          employee.username ?? "",
          employee.department,
          employee.status,
          employee.joined,
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
    link.download = "employees.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAction = (action) => {
    switch (action) {
      case "export":
        exportToCSV();
        break;
      case "import":
        window.GooeyToaster?.info?.("Import functionality coming soon");
        break;
      default:
        break;
    }
  };

  const handleViewProfile = (employee) => {
    navigate(`/admin/employee/${employee.id}`);
  };

  const confirmDeleteEmployee = async () => {
    if (deleteEmployeeId == null || deleteSubmitting) return;
    setDeleteSubmitting(true);
    try {
      await deleteEmployeeMutation.mutateAsync(deleteEmployeeId);
      window.GooeyToaster?.success?.(t("adminEmployee.delete.success"));
      setDeleteEmployeeId(null);
    } catch (e) {
      window.GooeyToaster?.error?.(
        e?.message || t("adminEmployee.delete.error"),
      );
    } finally {
      setDeleteSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto bg-white  min-h-screen p-4 md:p-5 dark:bg-dark-card-bg">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="mb-1 text-2xl font-bold text-primary dark:text-dark-primary">
            {t("adminEmployee.header.title")}
          </h1>
          <p className="text-muted dark:text-dark-muted">
            {t("adminEmployee.header.description", {
              count: totalElements,
            })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-none">
            <OperationsDropdown
              items={[
                {
                  key: "export",
                  icon: <Icon d={IC.download} className="size-4" />,
                  label: t("adminShared.actions.download"),
                  onClick: () => handleAction("export"),
                },
                {
                  key: "import",
                  icon: <Icon d={IC.upload} className="size-4" />,
                  label: t("adminShared.actions.import"),
                  onClick: () => handleAction("import"),
                },
              ]}
            />
          </div>

          <div className="flex-none">
            <Button
              icon={<Icon d={IC.plus} className="size-4" />}
              onClick={() => navigate("/admin/employee/new")}
            >
              {t("adminEmployee.actions.add")}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1">
        <Table
          className=""
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
                      window.GooeyToaster?.info?.("Board view coming soon");
                    }
                  }}
                  tabs={[
                    {
                      id: "list",
                      label: t("adminEmployee.toolbar.list"),
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
                      label: t("adminEmployee.toolbar.board"),
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
                    id="employees-search"
                    placeholder={t("adminEmployee.filters.searchPlaceholder")}
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
                    aria-label={t("adminEmployee.toolbar.filter")}
                    icon={
                      <Filter className="size-3.5 shrink-0" strokeWidth={2} />
                    }
                    onClick={() =>
                      window.GooeyToaster?.info?.(
                        "Saved views & filters coming soon",
                      )
                    }
                  >
                    {t("adminEmployee.toolbar.filter")}
                  </TableToolbar.IconButton>
                  <TableToolbar.IconButton
                    type="button"
                    aria-label={t("adminEmployee.toolbar.sort")}
                    icon={
                      <ArrowUpDown
                        className="size-3.5 shrink-0"
                        strokeWidth={2}
                      />
                    }
                    onClick={() =>
                      window.GooeyToaster?.info?.("Column sort coming soon")
                    }
                  >
                    {t("adminEmployee.toolbar.sort")}
                  </TableToolbar.IconButton>
                  <TableToolbar.IconButton
                    type="button"
                    aria-label={t("adminEmployee.toolbar.columns")}
                    icon={
                      <Columns3 className="size-3.5 shrink-0" strokeWidth={2} />
                    }
                    onClick={() =>
                      window.GooeyToaster?.info?.(
                        "Show / hide columns coming soon",
                      )
                    }
                  >
                    {t("adminEmployee.toolbar.columns")}
                  </TableToolbar.IconButton>
                  <TableToolbar.IconButton
                    type="button"
                    aria-label="Dense rows"
                    icon={
                      <EyeOff className="size-3.5 shrink-0" strokeWidth={2} />
                    }
                    onClick={() =>
                      window.GooeyToaster?.info?.("Row density coming soon")
                    }
                  >
                    Hide
                  </TableToolbar.IconButton>
                </TableToolbar.Section>
              </TableToolbar.Row>
            </TableToolbar>
          }
        >
          <TableHeader headerData={headerData} />
          <TableBody>
            {employees.map((employee) => (
              <TableRow key={employee.id}>
                <TableColumn className="w-10">
                  <Checkbox />
                </TableColumn>

                <TableColumn className="font-mono text-xs">
                  #{String(employee.code).padStart(2, "0")}
                </TableColumn>

                <TableColumn>
                  <div className="flex items-center gap-3">
                    <PersonAvatar person={employee} />
                    <div className="min-w-0">
                      <div className="line-clamp-1 text-sm font-medium text-primary dark:text-dark-primary">
                        {employee.firstName} {employee.lastName}
                      </div>
                      <div className="text-xs text-muted dark:text-dark-muted">
                        {employee.email}
                      </div>
                    </div>
                  </div>
                </TableColumn>

                <TableColumn nowrap={false}>
                  <span className="inline-flex max-w-[14rem] rounded-full border border-default bg-light-app-tertiary px-2.5 py-1 text-[11px] font-semibold capitalize text-secondary dark:border-dark-default dark:bg-dark-app-tertiary dark:text-dark-secondary">
                    {employee.department}
                  </span>
                </TableColumn>

                <TableColumn>
                  <StatusPill variant={statusToPillVariant(employee.status)}>
                    {t(`adminShared.status.${employee.status}`)}
                  </StatusPill>
                </TableColumn>

                <TableColumn className="whitespace-nowrap text-xs">
                  {new Date(employee.joined).toLocaleDateString(locale, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
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
                      <DropdownItem onClick={() => handleViewProfile(employee)}>
                        <span>{t("adminShared.actions.viewProfile")}</span>
                      </DropdownItem>
                      <DropdownItem
                        onClick={() =>
                          navigate(`/admin/employee/${employee.id}/edit`)
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
                        onClick={() => setDeleteEmployeeId(employee.id)}
                      >
                        <span>{t("adminEmployee.actions.remove")}</span>
                      </DropdownItem>
                    </DropdownContent>
                  </DropdownMenuRoot>
                </TableColumn>
              </TableRow>
            ))}

            {employees.length === 0 && (
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
                      {t("adminEmployee.empty.title")}
                    </span>
                    <span className="text-xs opacity-75">
                      {t("adminEmployee.empty.description")}
                    </span>
                  </div>
                </TableColumn>
              </TableRow>
            )}
          </TableBody>
        </Table>
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
      </div>

      {deleteEmployeeId != null ? (
        <SensitiveActionModal
          open={true}
          setOpen={(open) => {
            if (!open && !deleteSubmitting) setDeleteEmployeeId(null);
          }}
          title={t("adminEmployee.delete.title")}
          subtitle={`${t("adminEmployee.delete.descriptionPrefix")} ${
            deletingEmployee
              ? `“${`${deletingEmployee.firstName ?? ""} ${deletingEmployee.lastName ?? ""}`.trim()}”`
              : t("adminEmployee.delete.fallbackName")
          }${t("adminEmployee.delete.descriptionSuffix")}`}
          summaryItems={[
            {
              label: t("adminEmployee.delete.emailLabel"),
              value:
                deletingEmployee?.email?.trim() ||
                t("adminEmployee.delete.noEmail"),
              mono: true,
            },
          ]}
          warning={t("adminEmployee.delete.warning")}
          cancelLabel={t("adminEmployee.delete.cancel")}
          confirmLabel={
            deleteSubmitting
              ? t("studentForm.actions.submitting")
              : t("adminEmployee.delete.confirm")
          }
          onConfirm={confirmDeleteEmployee}
          submitting={deleteSubmitting}
        />
      ) : null}
    </div>
  );
}
