import { CgProfile } from "react-icons/cg";
import { AiOutlineDelete } from "react-icons/ai";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQueryClient } from "@tanstack/react-query";
import Table from "../../components/Table";
import TableBody from "../../components/TableBody";
import TableColumn from "../../components/TableColumn";
import TableHeader from "../../components/TableHeader";
import TableRow from "../../components/TableRow";
import EditStudentForm from "./EditStudentForm";
import Icon from "../../components/Icon";
import IC from "../../components/IC";
import Select from "../../components/Select";
import Checkbox from "../../components/Checkbox";
import {
  DropdownContent,
  DropdownItem,
  DropdownLabel,
  DropdownMenuRoot,
  DropdownSeparator,
  DropdownTrigger,
} from "../../components/DropdownMenu";
import Button from "../../components/Button";
import GlobalModal from "../../components/GlobalModal";
import StudentForm from "../../components/StudentForm";
import { useStudents } from "../../services/useApi";
import { deleteStudent } from "../../services/apiRoute";

const EMPTY_STUDENTS = [];

export default function Students() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { data: studentsData, isLoading, isError, error } = useStudents();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [deleteStudentId, setDeleteStudentId] = useState(null);

  const students = studentsData ?? EMPTY_STUDENTS;
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

  const filteredStudents = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return students.filter((student) => {
      const matchesSearch =
        !normalizedSearch ||
        [
          student.firstName,
          student.lastName,
          student.email,
          student.department,
          student.code,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" ||
        (student.status || "").toLowerCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, students]);

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

  const handleOpenEditModal = (student) => {
    setSelectedStudent(student);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedStudent(null);
  };

  const handleDeleteStudent = async () => {
    if (!deleteStudentId) return;

    try {
      await deleteStudent(deleteStudentId);
      queryClient.invalidateQueries({ queryKey: ["students"] });
      window.GooeyToaster?.success?.(t("adminStudents.delete.success"));
    } catch (deleteError) {
      window.GooeyToaster?.error?.(
        deleteError.message || t("adminStudents.delete.error"),
      );
    }

    setDeleteStudentId(null);
  };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-5 flex flex-col gap-[14px] bg-shell dark:bg-dark-shell">
        <div className="flex items-center justify-center h-64">
          <div className="text-primary dark:text-dark-primary">
            {t("adminStudents.loading")}
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-5 flex flex-col gap-[14px] bg-shell dark:bg-dark-shell">
        <div className="flex flex-col items-center justify-center h-64 gap-3">
          <div className="w-12 h-12 bg-error/10 dark:bg-dark-error/20 rounded-full flex items-center justify-center">
            <Icon
              d={IC.x}
              className="w-5 h-5 text-error dark:text-dark-error"
            />
          </div>
          <div className="text-center">
            <p className="text-primary dark:text-dark-primary font-medium">
              Failed to load students
            </p>
            <p className="text-muted dark:text-dark-muted text-sm mt-1 max-w-md">
              {error?.message ||
                "Could not connect to the server. Make sure json-server is running (npm run server)."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 min-h-screen md:p-5 flex flex-col bg-shell dark:bg-dark-shell gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary dark:text-dark-primary mb-1">
            {t("adminStudents.header.title")}
          </h1>
          <p className="text-muted dark:text-dark-muted">
            {t("adminStudents.header.description", {
              count: filteredStudents.length,
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
              onClick={() => setShowAddModal(true)}
            >
              {t("adminStudents.actions.add")}
            </Button>
          </div>
        </div>
      </div>

      <GlobalModal
        open={showAddModal}
        setOpen={setShowAddModal}
        isClose={true}
        className="w-[min(94vw,1000px)] bg-app dark:bg-dark-app max-h-[92vh] overflow-y-auto  p-2 rounded-md"
      >
        <StudentForm onClose={() => setShowAddModal(false)} />
      </GlobalModal>

      <GlobalModal
        open={showEditModal}
        setOpen={setShowEditModal}
        isClose={true}
      >
        {selectedStudent && (
          <EditStudentForm
            student={selectedStudent}
            onClose={handleCloseEditModal}
          />
        )}
      </GlobalModal>

      <GlobalModal
        open={Boolean(deleteStudentId)}
        setOpen={() => setDeleteStudentId(null)}
        isClose={true}
        className="w-[min(92vw,460px)]"
      >
        <div className="bg-shell dark:bg-dark-card p-6 rounded-xl shadow-2xl border border-default dark:border-dark-default flex flex-col">
          <div className="flex items-start gap-3 mb-6 pb-4 border-b border-default dark:border-dark-default">
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 text-red-600 dark:text-red-400">
              <AiOutlineDelete />
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary dark:text-dark-primary mb-1">
                {t("adminStudents.delete.title")}
              </h2>
              <p className="text-muted dark:text-dark-muted text-sm mb-2">
                {t("adminStudents.delete.descriptionPrefix")}{" "}
                <span className="font-semibold text-primary dark:text-dark-primary">
                  {deletingStudent
                    ? `${deletingStudent.firstName} ${deletingStudent.lastName}`
                    : t("adminStudents.delete.fallbackName")}
                </span>
                {t("adminStudents.delete.descriptionSuffix")}
              </p>
              <p className="text-muted dark:text-dark-muted text-xs mb-4">
                {t("adminStudents.delete.emailLabel")}{" "}
                <span className="font-mono bg-card dark:bg-gray-800 text-primary dark:text-dark-primary px-2 py-0.5 rounded text-xs">
                  {deletingStudent?.email || t("adminStudents.delete.noEmail")}
                </span>
              </p>
              <p className="text-red-600 dark:text-red-400 text-xs font-medium">
                {t("adminStudents.delete.warning")}
              </p>
            </div>
          </div>

          <div className="flex gap-3 pt-4 mt-auto border-t border-default dark:border-dark-default">
            <Button
              type="button"
              onClick={() => setDeleteStudentId(null)}
              className="flex-1 text-sm h-10 font-medium bg-card dark:bg-dark-input text-primary dark:text-dark-primary border border-default dark:border-dark-default"
            >
              {t("adminStudents.delete.cancel")}
            </Button>
            <Button
              type="button"
              onClick={handleDeleteStudent}
              className="flex-1 text-sm h-10 font-medium bg-error text-white text-center"
            >
              {t("adminStudents.delete.confirm")}
            </Button>
          </div>
        </div>
      </GlobalModal>

      <div className="flex-1 bg-shell dark:bg-dark-shell border border-default dark:border-dark-default rounded-md">
        <div className="overflow-hidden border-b border-default dark:border-dark-default">
          <div className="flex flex-col px-4 py-3 sm:flex-row gap-3 bg-shell dark:bg-dark-shell">
            <div className="relative flex-1">
              <Icon
                d={IC.search}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 stroke-muted dark:stroke-dark-muted"
              />
              <input
                type="text"
                placeholder={t("adminStudents.filters.searchPlaceholder")}
                className="w-full pl-10 pr-4 py-1.5 border border-default dark:border-dark-default rounded-md text-sm transition-all placeholder:text-muted dark:placeholder:text-dark-muted"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
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
              {filteredStudents.map((student) => (
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
                          onClick={() => handleOpenEditModal(student)}
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

              {filteredStudents.length === 0 && (
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
    </div>
  );
}
