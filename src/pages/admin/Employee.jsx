import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
import AvatarDemo from "../../components/Avatar";
import Checkbox from "../../components/Checkbox";
import Button from "../../components/Button";
import AddEmployeeForm from "../../components/AddEmployeeForm";
import GlobalModal from "../../components/GlobalModal";

function Employee() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [deleteEmployeeId, setDeleteEmployeeId] = useState(null);
  const [employees, setEmployees] = useState([
    {
      id: 1,
      firstName: "Robert",
      lastName: "Miller",
      email: "robert.miller@company.com",
      department: "HR",
      status: "active",
      joined: "2023-07-01",
    },
    {
      id: 2,
      firstName: "Lisa",
      lastName: "Davis",
      email: "lisa.davis@company.com",
      department: "Finance",
      status: "active",
      joined: "2023-07-15",
    },
    {
      id: 3,
      firstName: "James",
      lastName: "Wilson",
      email: "james.wilson@company.com",
      department: "IT",
      status: "pending",
      joined: "2023-08-01",
    },
    {
      id: 4,
      firstName: "Mary",
      lastName: "Taylor",
      email: "mary.taylor@company.com",
      department: "Administration",
      status: "suspended",
      joined: "2023-06-20",
    },
    {
      id: 5,
      firstName: "Richard",
      lastName: "Moore",
      email: "richard.moore@company.com",
      department: "HR",
      status: "rejected",
      joined: "2023-08-10",
    },
  ]);

  const headerData = [
    { title: "" },
    { title: t("adminEmployee.table.id") },
    { title: t("adminEmployee.table.employee") },
    { title: t("adminEmployee.table.department") },
    { title: t("adminEmployee.table.status") },
    { title: t("adminEmployee.table.joined") },
    { title: t("adminEmployee.table.actions") },
  ];

  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch = [
      employee.firstName,
      employee.lastName,
      employee.email,
      employee.department,
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || employee.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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

  const handleOpenEditModal = (employee) => {
    setEditingEmployee(employee);
    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingEmployee(null);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-5 flex flex-col bg-shell dark:bg-dark-shell gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary dark:text-dark-primary mb-1">
            {t("adminEmployee.header.title")}
          </h1>
          <p className="text-muted dark:text-dark-muted">
            {t("adminEmployee.header.description", {
              count: filteredEmployees.length,
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
              type="button"
              icon={<Icon d={IC.plus} className="size-4" />}
              onClick={() => setShowAddModal(true)}
            >
              {t("adminEmployee.actions.add")}
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 border border-default dark:border-dark-default rounded-md">
        <div className="flex mb-2 flex-col px-4 py-3 sm:flex-row gap-3 bg-shell dark:bg-dark-shell border-b border-default dark:border-dark-default">
          <div className="relative flex-1">
            <Icon
              d={IC.search}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 stroke-muted dark:stroke-dark-muted"
            />
            <input
              type="text"
              placeholder={t("adminEmployee.filters.searchPlaceholder")}
              className="w-full pl-10 pr-4 py-1.5 border border-default dark:border-dark-default rounded-md text-sm focus:border-accent dark:focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all placeholder:text-muted dark:placeholder:text-dark-muted"
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

        <div className="w-full overflow-hidden p-2">
          <Table>
            <TableHeader headerData={headerData} />
            <TableBody>
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableColumn className="w-10">
                    <Checkbox />
                  </TableColumn>

                  <TableColumn className="font-mono text-xs">
                    #{employee.id.toString().padStart(2, "0")}
                  </TableColumn>

                  <TableColumn>
                    <div className="flex items-center gap-3">
                      <AvatarDemo />
                      <div className="min-w-0">
                        <div className="font-medium text-sm text-primary dark:text-dark-primary line-clamp-1">
                          {employee.firstName} {employee.lastName}
                        </div>
                        <div className="text-xs text-muted dark:text-dark-muted">
                          {employee.email}
                        </div>
                      </div>
                    </div>
                  </TableColumn>

                  <TableColumn>
                    <span className="px-2.5 py-1 bg-card dark:bg-dark-card border border-default dark:border-dark-default rounded-full text-xs font-medium capitalize">
                      {employee.department}
                    </span>
                  </TableColumn>

                  <TableColumn>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        employee.status === "active"
                          ? "bg-success text-success-light dark:bg-dark-success dark:text-dark-success-light"
                          : employee.status === "pending"
                            ? "bg-warning text-warning-light dark:bg-dark-warning dark:text-dark-warning-light"
                            : employee.status === "suspended"
                              ? "bg-error text-error-light dark:bg-dark-error dark:text-dark-error-light"
                              : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {t(`adminShared.status.${employee.status}`)}
                    </span>
                  </TableColumn>

                  <TableColumn className="text-xs whitespace-nowrap">
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
                          onClick={() => handleOpenEditModal(employee)}
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

              {filteredEmployees.length === 0 && (
                <TableRow>
                  <TableColumn
                    colSpan={headerData.length}
                    className="text-center py-12 text-muted dark:text-dark-muted"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                        <Icon
                          d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"
                          className="w-5 h-5 text-muted-foreground"
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
        </div>

        {deleteEmployeeId && (
          <DeleteConfirmModal
            employeeId={deleteEmployeeId}
            employee={employees.find((emp) => emp.id === deleteEmployeeId)}
            setDeleteEmployeeId={setDeleteEmployeeId}
            employees={employees}
            setEmployees={setEmployees}
          />
        )}
      </div>

      {filteredEmployees.length > 0 && (
        <div className="pt-4">
          <Pagination />
        </div>
      )}

      <GlobalModal open={showAddModal} setOpen={setShowAddModal}>
        <AddEmployeeForm
          employees={employees}
          setEmployees={setEmployees}
          onClose={() => setShowAddModal(false)}
        />
      </GlobalModal>

      <GlobalModal open={showEditModal} setOpen={setShowEditModal}>
        <div className="w-full max-w-md bg-shell dark:bg-dark-shell p-6 rounded-xl shadow-xl border border-default dark:border-dark-default">
          <h2 className="text-xl font-bold text-primary dark:text-dark-primary mb-6">
            Edit Employee Details
          </h2>

          {editingEmployee && (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                const formData = new FormData(event.target);
                const updatedEmployee = {
                  ...editingEmployee,
                  firstName: formData.get("firstName"),
                  lastName: formData.get("lastName"),
                  email: formData.get("email"),
                  department: formData.get("department"),
                  status: formData.get("status"),
                  joined: formData.get("joined"),
                };

                setEmployees(
                  employees.map((employee) =>
                    employee.id === editingEmployee.id
                      ? updatedEmployee
                      : employee,
                  ),
                );
                window.GooeyToaster?.success?.("Employee updated successfully");
                handleCloseEditModal();
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted dark:text-dark-muted mb-1 text-primary dark:text-dark-primary">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    defaultValue={editingEmployee.firstName}
                    className="w-full px-3 py-2.5 border border-default dark:border-dark-default rounded-lg bg-card dark:bg-dark-card focus:border-accent dark:focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all text-sm text-primary dark:text-dark-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted dark:text-dark-muted mb-1 text-primary dark:text-dark-primary">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    defaultValue={editingEmployee.lastName}
                    className="w-full px-3 py-2.5 border border-default dark:border-dark-default rounded-lg bg-card dark:bg-dark-card focus:border-accent dark:focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all text-sm text-primary dark:text-dark-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted dark:text-dark-muted mb-1 text-primary dark:text-dark-primary">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    defaultValue={editingEmployee.email}
                    className="w-full px-3 py-2.5 border border-default dark:border-dark-default rounded-lg bg-card dark:bg-dark-card focus:border-accent dark:focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all text-sm text-primary dark:text-dark-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted dark:text-dark-muted mb-1 text-primary dark:text-dark-primary">
                    Department
                  </label>
                  <input
                    type="text"
                    name="department"
                    defaultValue={editingEmployee.department}
                    className="w-full px-3 py-2.5 border border-default dark:border-dark-default rounded-lg bg-card dark:bg-dark-card focus:border-accent dark:focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all text-sm text-primary dark:text-dark-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted dark:text-dark-muted mb-1 text-primary dark:text-dark-primary">
                    Status
                  </label>
                  <select
                    name="status"
                    defaultValue={editingEmployee.status}
                    className="w-full px-3 py-2.5 border border-default dark:border-dark-default rounded-lg bg-card dark:bg-dark-card focus:border-accent dark:focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all text-sm text-primary dark:text-dark-primary"
                  >
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-muted dark:text-dark-muted mb-1 text-primary dark:text-dark-primary">
                    Joined Date
                  </label>
                  <input
                    type="date"
                    name="joined"
                    defaultValue={editingEmployee.joined}
                    className="w-full px-3 py-2.5 border border-default dark:border-dark-default rounded-lg bg-card dark:bg-dark-card focus:border-accent dark:focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all text-sm text-primary dark:text-dark-primary"
                    required
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit">Save</Button>
              </div>
            </form>
          )}
        </div>
      </GlobalModal>
    </div>
  );
}

function DeleteConfirmModal({
  employeeId,
  employee,
  setDeleteEmployeeId,
  employees,
  setEmployees,
}) {
  const confirmDelete = () => {
    setEmployees(employees.filter((emp) => emp.id !== employeeId));
    window.GooeyToaster?.success?.("Employee removed successfully");
    setDeleteEmployeeId(null);
  };

  const cancelDelete = () => {
    setDeleteEmployeeId(null);
  };

  const employeeName = employee
    ? `${employee.firstName} ${employee.lastName}`
    : "";

  return (
    <GlobalModal open={true} setOpen={cancelDelete}>
      <div className="w-[450px] max-h-[70vh] bg-shell dark:bg-dark-card p-6 rounded-xl shadow-2xl border border-default dark:border-dark-default flex flex-col z-[1000]">
        <div className="flex items-start gap-3 mb-6 pb-4 border-b border-default dark:border-dark-default">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 text-red-600 dark:text-red-400">
            <svg
              width="20"
              height="20"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M7.5 1.125C7.74858 1.125 7.95 1.32647 7.95 1.575V7.3125L10.1819 5.08071C10.3576 4.90497 10.6425 4.90497 10.8182 5.08071C10.994 5.25645 10.994 5.54137 10.8182 5.71711L7.81825 8.71711C7.64251 8.89284 7.35759 8.89284 7.18185 8.71711L4.18185 5.71711C4.00611 5.54137 4.00611 5.25645 4.18185 5.08071C4.35759 4.90497 4.64251 4.90497 4.81825 5.08071L7.05 7.3125V1.575C7.05 1.32647 7.25152 1.125 7.5 1.125ZM2.625 9.75C2.90114 9.75 3.125 9.97411 3.125 10.25V12C3.125 12.5523 3.57268 13 4.00365 13H11.0012C11.5529 13 12 12.5528 12 12V10.25C12 9.97411 12.2239 9.75 12.5 9.75C12.7761 9.75 13 9.97411 13 10.25V12C13 13.1041 12.1062 14 11.0012 14H4.00365C2.89749 14 2 13.103 2 12V10.25C2 9.97411 2.22386 9.75 2.625 9.75Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              Delete Employee
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {employeeName}
              </span>
              ?
            </p>
            <p className="text-gray-600 dark:text-gray-300 text-xs mb-4">
              Email:{" "}
              <span className="font-mono bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded text-xs">
                {employee?.email}
              </span>
            </p>
            <p className="text-red-600 dark:text-red-400 text-xs font-medium">
              This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex gap-3 pt-4 mt-auto border-t border-default dark:border-dark-default">
          <Button
            onClick={confirmDelete}
            variant="destructive"
            className="flex-1 text-sm h-10 font-medium"
          >
            Delete Employee
          </Button>
        </div>
      </div>
    </GlobalModal>
  );
}

export default Employee;
