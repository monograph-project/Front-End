import { useState } from "react";
import {
  DropdownContent,
  DropdownItem,
  DropdownLabel,
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
import AvatarDemo from "./../../components/Avatar";
import Checkbox from "./../../components/Checkbox";
import Button from "../../components/Button";
import AddEmployeeForm from "../../components/AddEmployeeForm";
import { useNavigate } from "react-router-dom";
import GlobalModal from "../../components/GlobalModal";

const headerData = [
  { title: "" },
  { title: "ID" },
  { title: "Employee" },
  { title: "Department" },
  { title: "Status" },
  { title: "Joined" },
  { title: "Actions" },
];

function Employee() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  // Actions handler
  const handleAction = (action) => {
    switch (action) {
      case "export":
        exportToCSV();
        break;
      case "import":
        window.GooeyToaster?.info?.("Import functionality coming soon");
        break;
    }
  };

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

  const exportToCSV = () => {
    const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Department', 'Status', 'Joined'];
    const csvContent = [
      headers.join(','),
      ...employees.map(employee => [
        employee.id,
        employee.firstName,
        employee.lastName,
        employee.email,
        employee.department,
        employee.status,
        employee.joined
      ].map(field => `"${field}"`).join(','))
    ].join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'employees.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-5 flex flex-col bg-shell dark:bg-dark-shell gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary dark:text-dark-primary mb-1">
            Employee Management
          </h1>
          <p className="text-muted dark:text-dark-muted">
            Manage {employees.length} employees and their employment status
          </p>
        </div>
        <div className="flex items-center gap-3">
  <div className="flex-none">
    <DropdownMenuRoot>
      <DropdownTrigger>
        Actions
      </DropdownTrigger>
      <DropdownContent align="end">
        <DropdownItem icon={<Icon d={IC.download} className="size-4" />} onClick={() => handleAction("export")}>
          Export
        </DropdownItem>
        <DropdownItem icon={<Icon d={IC.upload} className="size-4" />} onClick={() => handleAction("import")}>
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
      Add Employee
    </Button>
  </div>
</div>
      </div>

      <div className="flex-1 border border-default dark:border-dark-default rounded-md ">
        <div className="flex mb-2 flex-col px-4 py-3 sm:flex-row gap-3 bg-shell dark:bg-dark-shell border-b border-default dark:border-dark-default">
          <div className="relative flex-1">
            <Icon
              d={IC.search}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 stroke-muted dark:stroke-dark-muted"
            />
            <input
              type="text"
              placeholder="Search employees by name, email or department..."
              className="w-full pl-10 pr-4 py-1.5  border border-default dark:border-dark-default rounded-md text-sm focus:border-accent dark:focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all placeholder:text-muted dark:placeholder:text-dark-muted"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-48">
            <Select
              options={[
                { value: "all", label: "All Status" },
                { value: "active", label: "Active" },
                { value: "pending", label: "Pending" },
                { value: "rejected", label: "Rejected" },
                { value: "suspended", label: "Suspended" },
              ]}
              value={statusFilter}
              onValueChange={setStatusFilter}
            />
          </div>
        </div>
        <div className="w-full    overflow-hidden p-2">
          <Table>
            <TableHeader headerData={headerData} />
            <TableBody>
              {employees.map((employee) => (
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
                      {employee.status}
                    </span>
                  </TableColumn>
                  <TableColumn className="text-xs whitespace-nowrap">
                    {new Date(employee.joined).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </TableColumn>
                  <TableColumn className="w-16">
                    <DropdownMenuRoot>
                      <DropdownTrigger showArrow={false}>
                        <Icon
                          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zM12 13a1 1 0 110-2 1 1 0 010 2zM12 20a1 1 0 110-2 1 1 0 010 2z"
                          className="w-4 h-4 text-muted dark:text-dark-muted hover:text-primary dark:hover:text-dark-primary transition-colors cursor-pointer"
                        />
                      </DropdownTrigger>
                      <DropdownContent align="end">
                        <DropdownItem onClick={() => navigate(`/admin/employee/${employee.id}`)}>
                          <span>View Profile</span>
                        </DropdownItem>
                        <DropdownItem onClick={() => {
                          setEditingEmployee(employee);
                          setShowEditModal(true);
                        }}>
                          <span>Edit Details</span>
                        </DropdownItem>
                        <DropdownItem>
                          <span>Send Message</span>
                        </DropdownItem>
                        <DropdownSeparator />
                        <DropdownItem variant="danger">
                          <span>Remove Employee</span>
                        </DropdownItem>
                      </DropdownContent>
                    </DropdownMenuRoot>
                  </TableColumn>
                </TableRow>
              ))}
              {employees.length === 0 && (
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
                      <span className="font-medium">No employees found</span>
                      <span className="text-xs opacity-75">
                        Try adjusting your search or filter criteria
                      </span>
                    </div>
                  </TableColumn>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {employees.length > 0 && (
        <div className="pt-4">
          <Pagination />
        </div>
      )}
      <GlobalModal open={showAddModal} setOpen={setShowAddModal}>
        <AddEmployeeForm employees={employees} setEmployees={setEmployees} onClose={() => setShowAddModal(false)} />
      </GlobalModal>
      <GlobalModal open={showEditModal} setOpen={setShowEditModal}>
        <div className="w-full max-w-md bg-shell dark:bg-dark-shell p-6 rounded-xl shadow-xl border border-default dark:border-dark-default">
          <h2 className="text-xl font-bold text-primary dark:text-dark-primary mb-6">Edit Employee Details</h2>
          {editingEmployee && (
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const updatedEmployee = {
                ...editingEmployee,
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                department: formData.get('department'),
                status: formData.get('status'),
                joined: formData.get('joined'),
              };
              setEmployees(employees.map(emp => emp.id === editingEmployee.id ? updatedEmployee : emp));
              window.GooeyToaster?.success?.('Employee updated successfully');
              (() => {
                setShowEditModal(false);
                setEditingEmployee(null);
              })();
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted dark:text-dark-muted mb-1 text-primary dark:text-dark-primary">First Name</label>
                  <input type="text" name="firstName" defaultValue={editingEmployee.firstName} className="w-full px-3 py-2.5 border border-default dark:border-dark-default rounded-lg bg-card dark:bg-dark-card focus:border-accent dark:focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all text-sm text-primary dark:text-dark-primary" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted dark:text-dark-muted mb-1 text-primary dark:text-dark-primary">Last Name</label>
                  <input type="text" name="lastName" defaultValue={editingEmployee.lastName} className="w-full px-3 py-2.5 border border-default dark:border-dark-default rounded-lg bg-card dark:bg-dark-card focus:border-accent dark:focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all text-sm text-primary dark:text-dark-primary" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted dark:text-dark-muted mb-1 text-primary dark:text-dark-primary">Email</label>
                  <input type="email" name="email" defaultValue={editingEmployee.email} className="w-full px-3 py-2.5 border border-default dark:border-dark-default rounded-lg bg-card dark:bg-dark-card focus:border-accent dark:focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all text-sm text-primary dark:text-dark-primary" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted dark:text-dark-muted mb-1 text-primary dark:text-dark-primary">Department</label>
                  <input type="text" name="department" defaultValue={editingEmployee.department} className="w-full px-3 py-2.5 border border-default dark:border-dark-default rounded-lg bg-card dark:bg-dark-card focus:border-accent dark:focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all text-sm text-primary dark:text-dark-primary" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted dark:text-dark-muted mb-1 text-primary dark:text-dark-primary">Status</label>
                  <select name="status" defaultValue={editingEmployee.status} className="w-full px-3 py-2.5 border border-default dark:border-dark-default rounded-lg bg-card dark:bg-dark-card focus:border-accent dark:focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all text-sm text-primary dark:text-dark-primary">
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted dark:text-dark-muted mb-1 text-primary dark:text-dark-primary">Joined Date</label>
                  <input type="date" name="joined" defaultValue={editingEmployee.joined} className="w-full px-3 py-2.5 border border-default dark:border-dark-default rounded-lg bg-card dark:bg-dark-card focus:border-accent dark:focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all text-sm text-primary dark:text-dark-primary" required />
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

export default Employee;
