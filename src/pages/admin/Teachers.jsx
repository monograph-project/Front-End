
import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import AddTeacherForm from "../../components/AddTeacherForm";
import GlobalModal from "../../components/GlobalModal";


const headerData = [
  { title: "" },
  { title: "ID" },
  { title: "Teacher" },
  { title: "Department" },
  { title: "Status" },
  { title: "Joined" },
  { title: "Actions" },
];

function Teachers() {
  const navigate = useNavigate();
  const [search, setSearch] = useState(""); 
  const [statusFilter, setStatusFilter] = useState("all");
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

  const handleViewProfile = (teacher) => {
    navigate(`/admin/teacher/${teacher.id}`);
  }; 

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [teachers, setTeachers] = useState([
    {
      id: 1,
      firstName: "John",
      lastName: "Doe",
      email: "john.doe@school.edu",
      department: "Mathematics",
      status: "active",
      joined: "2023-09-01",
    },
    {
      id: 2,
      firstName: "Jane",
      lastName: "Smith",
      email: "jane.smith@school.edu",
      department: "Physics",
      status: "pending",
      joined: "2023-09-15",
    },
    {
      id: 3,
      firstName: "Mike",
      lastName: "Johnson",
      email: "mike.johnson@school.edu",
      department: "Computer Science",
      status: "active",
      joined: "2023-08-20",
    },
    {
      id: 4,
      firstName: "Sarah",
      lastName: "Wilson",
      email: "sarah.wilson@school.edu",
      department: "Biology",
      status: "suspended",
      joined: "2023-10-01",
    },
    {
      id: 5,
      firstName: "David",
      lastName: "Brown",
      email: "david.brown@school.edu",
      department: "Chemistry",
      status: "rejected",
      joined: "2023-09-10",
    },
  ]);

  const exportToCSV = () => {
    const headers = ['ID', 'First Name', 'Last Name', 'Email', 'Department', 'Status', 'Joined'];
    const csvContent = [
      headers.join(','),
      ...teachers.map(teacher => [
        teacher.id,
        teacher.firstName,
        teacher.lastName,
        teacher.email,
        teacher.department,
        teacher.status,
        teacher.joined
      ].map(field => `"${field}"`).join(','))
    ].join('\\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'teachers.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-5 flex flex-col bg-shell dark:bg-dark-shell gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary dark:text-dark-primary mb-1">
            Teachers Management
          </h1>
          <p className="text-muted dark:text-dark-muted">
            Manage {teachers.length} teachers and their assignment status
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
          <Button icon={<Icon d={IC.plus} className="size-4" />} onClick={() => setShowAddModal(true)}>
            Add Teacher
          </Button>
        </div>
      </div>

      <div className="flex-1 border border-default dark:border-dark-default rounded-md ">
        <div className="flex mb-3 flex-col px-4 py-3 sm:flex-row gap-3 bg-shell dark:bg-dark-shell border-b border-default dark:border-dark-default">
          <div className="relative flex-1">
            <Icon
              d={IC.search}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 stroke-muted dark:stroke-dark-muted"
            />
            <input
              type="text"
              placeholder="Search teachers by name, email or department..."
              className="w-full pl-10 pr-4 py-1.5 border border-default dark:border-dark-default rounded-md text-sm focus:border-accent dark:focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all placeholder:text-muted dark:placeholder:text-dark-muted"
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

        <div className="w-full p-2 overflow-hidden ">
          <Table>
            <TableHeader headerData={headerData} />
            <TableBody>
              {teachers.map((teacher) => (
                <TableRow key={teacher.id}>
                  <TableColumn className="w-10">
                    <Checkbox />
                  </TableColumn>
                  <TableColumn className="font-mono text-xs">
                    #{teacher.id.toString().padStart(2, "0")}
                  </TableColumn>
                  <TableColumn>
                    <div className="flex items-center gap-3">
                      <AvatarDemo />
                      <div className="min-w-0">
                        <div className="font-medium text-sm text-primary dark:text-dark-primary line-clamp-1">
                          {teacher.firstName} {teacher.lastName}
                        </div>
                        <div className="text-xs text-muted dark:text-dark-muted">
                          {teacher.email}
                        </div>
                      </div>
                    </div>
                  </TableColumn>
                  <TableColumn>
                    <span className="px-2.5 py-1 bg-card dark:bg-dark-card border border-default dark:border-dark-default rounded-full text-xs font-medium capitalize">
                      {teacher.department}
                    </span>
                  </TableColumn>
                  <TableColumn>
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        teacher.status === "active"
                          ? "bg-success text-success-light dark:bg-dark-success dark:text-dark-success-light"
                          : teacher.status === "pending"
                            ? "bg-warning text-warning-light dark:bg-dark-warning dark:text-dark-warning-light"
                            : teacher.status === "suspended"
                              ? "bg-error text-error-light dark:bg-dark-error dark:text-dark-error-light"
                              : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {teacher.status}
                    </span>
                  </TableColumn>
                  <TableColumn className="text-xs whitespace-nowrap">
                    {new Date(teacher.joined).toLocaleDateString("en-US", {
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
                        <DropdownItem onClick={() => handleViewProfile(teacher)}>
                          <span>View Profile</span>
                        </DropdownItem>
                        <DropdownItem onClick={() => {
                          setEditingTeacher(teacher);
                          setShowEditModal(true);
                        }}>
                          <span>Edit Details</span>
                        </DropdownItem>
                        <DropdownItem>
                          <span>Send Message</span>
                        </DropdownItem>
                        <DropdownSeparator />
                        <DropdownItem variant="danger" onClick={() => {
                          if (confirm('Are you sure you want to remove this teacher?')) {
                            setTeachers(teachers.filter(t => t.id !== teacher.id));
                            window.GooeyToaster?.success?.('Teacher removed successfully');
                          }
                        }}>
                          <span>Remove Teacher</span>
                        </DropdownItem>
                      </DropdownContent>
                    </DropdownMenuRoot>
                  </TableColumn>
                </TableRow>
              ))}
              {teachers.length === 0 && (
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
                      <span className="font-medium">No teachers found</span>
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

{teachers.length > 0 && (
        <div className="pt-4">
          <Pagination />
        </div>
      )}
      <GlobalModal open={showAddModal} setOpen={setShowAddModal}>
        <AddTeacherForm teachers={teachers} setTeachers={setTeachers} onClose={() => setShowAddModal(false)} />
      </GlobalModal>
      <GlobalModal open={showEditModal} setOpen={setShowEditModal}>
        <div className="w-full max-w-md bg-shell dark:bg-dark-shell p-6 rounded-xl shadow-xl border border-default dark:border-dark-default">
          <h2 className="text-xl font-bold text-primary dark:text-dark-primary mb-6">Edit Teacher Details</h2>
          {editingTeacher && (
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const updatedTeacher = {
                ...editingTeacher,
                firstName: formData.get('firstName'),
                lastName: formData.get('lastName'),
                email: formData.get('email'),
                department: formData.get('department'),
                status: formData.get('status'),
                joined: formData.get('joined'),
              };
              setTeachers(teachers.map(t => t.id === editingTeacher.id ? updatedTeacher : t));
              window.GooeyToaster?.success?.('Teacher updated successfully');
              (() => {
                setShowEditModal(false);
                setEditingTeacher(null);
              })();
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-muted dark:text-dark-muted mb-1 text-primary dark:text-dark-primary">First Name</label>
                  <input type="text" name="firstName" defaultValue={editingTeacher.firstName} className="w-full px-3 py-2.5 border border-default dark:border-dark-default rounded-lg bg-card dark:bg-dark-card focus:border-accent dark:focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all text-sm text-primary dark:text-dark-primary" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted dark:text-dark-muted mb-1 text-primary dark:text-dark-primary">Last Name</label>
                  <input type="text" name="lastName" defaultValue={editingTeacher.lastName} className="w-full px-3 py-2.5 border border-default dark:border-dark-default rounded-lg bg-card dark:bg-dark-card focus:border-accent dark:focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all text-sm text-primary dark:text-dark-primary" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted dark:text-dark-muted mb-1 text-primary dark:text-dark-primary">Email</label>
                  <input type="email" name="email" defaultValue={editingTeacher.email} className="w-full px-3 py-2.5 border border-default dark:border-dark-default rounded-lg bg-card dark:bg-dark-card focus:border-accent dark:focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all text-sm text-primary dark:text-dark-primary" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted dark:text-dark-muted mb-1 text-primary dark:text-dark-primary">Department</label>
                  <input type="text" name="department" defaultValue={editingTeacher.department} className="w-full px-3 py-2.5 border border-default dark:border-dark-default rounded-lg bg-card dark:bg-dark-card focus:border-accent dark:focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all text-sm text-primary dark:text-dark-primary" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted dark:text-dark-muted mb-1 text-primary dark:text-dark-primary">Status</label>
                  <select name="status" defaultValue={editingTeacher.status} className="w-full px-3 py-2 border border-default dark:border-dark-default rounded-md focus:border-accent dark:focus:border-accent focus:outline-none text-primary dark:text-dark-primary">
                    <option value="active">Active</option>
                    <option value="pending">Pending</option>
                    <option value="rejected">Rejected</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-muted dark:text-dark-muted mb-1 text-primary dark:text-dark-primary">Joined Date</label>
                  <input type="date" name="joined" defaultValue={editingTeacher.joined} className="w-full px-3 py-2 border border-default dark:border-dark-default rounded-md focus:border-accent dark:focus:border-accent focus:outline-none text-primary dark:text-dark-primary" required />
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

export default Teachers;
