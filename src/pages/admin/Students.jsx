import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { CgProfile } from "react-icons/cg";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import Checkbox from "../../components/Checkbox";
import {
  DropdownContent,
  DropdownItem,
  DropdownLabel,
  DropdownMenuRoot,
  DropdownSeparator,
  DropdownTrigger,
} from "../../components/DropdownMenu";
import Field from "../../components/Field";
import GlobalModal from "../../components/GlobalModal";
import IC from "../../components/IC";
import Icon from "../../components/Icon";
import Select from "../../components/Select";
import Table from "../../components/Table";
import TableBody from "../../components/TableBody";
import TableColumn from "../../components/TableColumn";
import TableHeader from "../../components/TableHeader";
import TableRow from "../../components/TableRow";
import Pagination from "../../components/Pagination";
import { deleteStudent } from "../../services/apiRoute";
import { useStudentsPage } from "../../services/useApi";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
const EMPTY_STUDENTS = [];

export default function Students() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const debouncedSearch = useDebouncedValue(searchInput, 400);
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteStudentId, setDeleteStudentId] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter]);

  const { data: pageData, isLoading, isError, error } = useStudentsPage({
    page: page - 1,
    pageSize,
    search: debouncedSearch,
    status: statusFilter,
  });

  const students = pageData?.content ?? EMPTY_STUDENTS;
  const totalElements = pageData?.totalElements ?? 0;
  const totalPages = pageData?.totalPages ?? 0;

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) setPage(totalPages);
  }, [totalPages, page]);

  const deletingStudent = students.find(
    (student) => student.id === deleteStudentId,
  );

  const headerData = [
    { title: "" },
    { title: t("adminStudents.table.id") },
    { title: t("adminStudents.table.student") },
    { title: t("adminStudents.table.department") },
    { title: t("adminStudents.table.status") },
    { title: t("adminStudents.table.enrolled") },
    { title: t("adminStudents.table.actions") },
  ];

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
      "Father Name",
      "Grand Father Name",
      "Nationality",
      "Gender",
      "Date of Birth",
      "Code",
      "Email",
      "Phone",
      "Enrollment Date",
      "Kankor ID",
      "Semester",
      "Department",
      "Status",
    ];

    const csvContent = [
      headers.join(","),
      ...students.map((student) =>
        [
          student.id,
          student.firstName,
          student.lastName,
          student.fatherName || "",
          student.grandFatherName || "",
          student.nationality || "",
          student.gender || "",
          student.dateOfBirth || "",
          student.code || "",
          student.email || "",
          student.phone || "",
          student.enrollmentDate || "",
          student.kankorId || "",
          student.semester || "",
          student.department || "",
          student.status || "",
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

  const handleViewProfile = (student) => {
    navigate(`/admin/student/${student.id}`);
  };

  const confirmDeleteStudent = async () => {
    if (!deleteStudentId || deleteSubmitting) return;

    setDeleteSubmitting(true);
    try {
      await deleteStudent(deleteStudentId);
      queryClient.invalidateQueries({
        predicate: (q) =>
          Array.isArray(q.queryKey) && q.queryKey[0] === "students",
      });
      window.GooeyToaster?.success?.(t("adminStudents.delete.success"));
      setDeleteStudentId(null);
    } catch (deleteError) {
      window.GooeyToaster?.error?.(
        deleteError.message || t("adminStudents.delete.error"),
      );
    } finally {
      setDeleteSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-5 flex flex-col gap-[14px] bg-light-app-bg dark:bg-dark-shell">
        <div className="flex items-center justify-center h-64">
          <div className="text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
            {t("adminStudents.loading")}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-5 flex flex-col gap-[14px] bg-light-app-bg dark:bg-dark-shell">
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-light-error-bg dark:bg-dark-error-bg">
            <Icon
              d={IC.x}
              className="w-5 h-5 text-light-error-text dark:text-dark-error-text"
            />
          </div>
          <div className="text-center">
            <p className="text-(--color-light-text-primary) dark:text-(--color-dark-text-primary) font-medium">
              Failed to load students
            </p>
            <p className="text-(--color-light-text-muted) dark:text-dark-text-muted text-sm mt-1 max-w-md">
              {error?.message ||
                "Could not connect to the server. Make sure json-server is running (npm run server)."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 min-h-screen md:p-5 flex flex-col bg-white  dark:bg-dark-shell gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-(--color-light-text-primary) dark:text-(--color-dark-text-primary) mb-1">
            {t("adminStudents.header.title")}
          </h1>
          <p className="text-(--color-light-text-muted) dark:text-dark-text-muted">
            {t("adminStudents.header.description", {
              count: totalElements,
            })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-none">
            <DropdownMenuRoot>
              <DropdownTrigger>Actions</DropdownTrigger>
              <DropdownContent align="end">
                <DropdownItem
                  icon={<Icon d={IC.download} className="size-4" />}
                  onClick={() => handleAction("export")}
                >
                  Export
                </DropdownItem>
                <DropdownItem
                  icon={<Icon d={IC.upload} className="size-4" />}
                  onClick={() => handleAction("import")}
                >
                  Import
                </DropdownItem>
              </DropdownContent>
            </DropdownMenuRoot>
          </div>

          <div className="flex-none">
            <Button
              icon={<Icon d={IC.plus} className="size-4" />}
              onClick={() => navigate("/admin/student/new")}
            >
              {t("adminStudents.actions.add")}
            </Button>
          </div>
        </div>
      </div>

      {totalElements === 0 &&
        totalPages <= 1 &&
        !debouncedSearch.trim() &&
        statusFilter === "all" && (
          <div
            className="rounded-xl border border-default/80 bg-input/40 px-4 py-3 text-xs text-secondary dark:border-dark-default dark:bg-dark-input/40 dark:text-dark-secondary"
            role="status"
          >
            {t("adminStudents.emptyHint")}
          </div>
        )}

      <div className="flex-1 rounded-xl border bg-(--color-light-card-bg) border-(--color-light-card-border) dark:bg-(--color-dark-card-bg) dark:border-(--color-dark-card-border)">
        <div className="overflow-hidden border-b border-light-divider dark:border-dark-divider">
          <div className="flex flex-col px-4 py-3 sm:flex-row gap-3">
            <div className="relative flex-1">
              <Field
                id="students-search"
                placeholder={t("adminStudents.filters.searchPlaceholder")}
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                iconD={IC.search}
              />
            </div>

            <div className="w-48">
              <Select
                options={statusOptions}
                value={statusFilter}
                onValueChange={setStatusFilter}
              />
            </div>
          </div>
        </div>

        <div className="w-full rounded-lg overflow-hidden p-3">
          <Table className="">
            <TableHeader headerData={headerData} />
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableColumn className="text-center">
                    <Checkbox />
                  </TableColumn>

                  <TableColumn className="text-center font-mono">
                    {student.id}
                  </TableColumn>

                  <TableColumn className="font-medium">
                    {student.firstName} {student.lastName}
                  </TableColumn>

                  <TableColumn>{student.department}</TableColumn>

                  <TableColumn className="text-center">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        (student.status || "").toLowerCase() === "active"
                          ? "bg-success text-success-light dark:bg-dark-success dark:text-dark-success-light"
                          : (student.status || "").toLowerCase() === "pending"
                            ? "bg-warning text-warning-light dark:bg-dark-warning dark:text-dark-warning-light"
                            : (student.status || "").toLowerCase() ===
                                "suspended"
                              ? "bg-error text-error-light dark:bg-dark-error dark:text-dark-error-light"
                              : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {t(
                        `adminShared.status.${(student.status || "active").toLowerCase()}`,
                      )}
                    </span>
                  </TableColumn>

                  <TableColumn className="text-center">
                    {student.enrollmentDate}
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

                      <DropdownContent>
                        <DropdownLabel>
                          {t("common.sections.account")}
                        </DropdownLabel>

                        <DropdownItem
                          icon={<CgProfile />}
                          onClick={() => handleViewProfile(student)}
                        >
                          <span>{t("common.actions.profile")}</span>
                        </DropdownItem>

                        <DropdownItem>
                          {t("common.actions.settings")}
                        </DropdownItem>

                        <DropdownSeparator />

                        <DropdownLabel>
                          {t("common.sections.actions")}
                        </DropdownLabel>

                        <DropdownItem
                          onClick={() =>
                            navigate(`/admin/student/${student.id}/edit`)
                          }
                        >
                          {t("common.actions.edit")}
                        </DropdownItem>

                        <DropdownItem
                          variant="danger"
                          onClick={() => setDeleteStudentId(student.id)}
                        >
                          {t("common.actions.delete")}
                        </DropdownItem>
                      </DropdownContent>
                    </DropdownMenuRoot>
                  </TableColumn>
                </TableRow>
              ))}

              {students.length === 0 && (
                <TableRow>
                  <TableColumn
                    colSpan={headerData.length}
                    className="text-center py-12 text-muted dark:text-dark-muted"
                  >
                    {t("adminStudents.empty")}
                  </TableColumn>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
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

      {deleteStudentId ? (
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
    student &&
    `${student.firstName ?? ""} ${student.lastName ?? ""}`.trim();
  const namePhrase = displayName
    ? `\u201c${displayName}\u201d`
    : t("adminStudents.delete.fallbackName");
  const emailDisplay = student?.email?.trim()
    ? student.email
    : t("adminStudents.delete.noEmail");

  return (
    <GlobalModal open={true} setOpen={() => (!submitting ? onCancel() : null)}>
      <div className="z-[1000] flex max-h-[70vh] w-full max-w-[450px] flex-col rounded-xl border border-default bg-shell p-6 shadow-2xl dark:border-dark-default dark:bg-dark-card">
        <div className="mb-6 flex flex-shrink-0 items-start gap-3 border-b border-default pb-4 dark:border-dark-default">
          <div className="mt-0.5 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
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
            <h2 className="mb-1 text-xl font-bold text-gray-900 dark:text-gray-100">
              {t("adminStudents.delete.title")}
            </h2>
            <p className="mb-2 text-sm text-gray-600 dark:text-gray-300">
              {t("adminStudents.delete.descriptionPrefix")}{" "}
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {namePhrase}
              </span>
              {t("adminStudents.delete.descriptionSuffix")}
            </p>
            <p className="mb-4 text-xs text-gray-600 dark:text-gray-300">
              <span className="font-medium">
                {t("adminStudents.delete.emailLabel")}
              </span>{" "}
              <span className="rounded bg-gray-100 px-2 py-0.5 font-mono text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                {emailDisplay}
              </span>
            </p>
            <p className="text-xs font-medium text-red-600 dark:text-red-400">
              {t("adminStudents.delete.warning")}
            </p>
          </div>
        </div>
        <div className="mt-auto flex flex-shrink-0 flex-wrap gap-3 border-t border-default pt-4 dark:border-dark-default">
          <Button
            type="button"
            variant="secondary"
            className="min-w-[6rem]"
            disabled={submitting}
            onClick={onCancel}
          >
            {t("adminStudents.delete.cancel")}
          </Button>
          <Button
            type="button"
            variant="danger"
            className="min-w-[6rem]"
            disabled={submitting}
            onClick={() => void onConfirm()}
          >
            {submitting ? t("studentForm.actions.submitting") : t("adminStudents.delete.confirm")}
          </Button>
        </div>
      </div>
    </GlobalModal>
  );
}
