import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import Table from "../../components/Table";
import TableBody from "../../components/TableBody";
import TableColumn from "../../components/TableColumn";
import TableHeader from "../../components/TableHeader";
import TableRow from "../../components/TableRow";
import Icon from "../../components/Icon";
import IC from "../../components/IC";
import Select from "../../components/Select";
import Checkbox from "../../components/Checkbox";
import Button from "../../components/Button";
import GlobalModal from "../../components/GlobalModal";
import AddDepartmentForm from "./AddDepartmentForm";
import EditDepartmentForm from "./EditDepartmentForm";
import {
  DropdownContent,
  DropdownItem,
  DropdownLabel,
  DropdownMenuRoot,
  DropdownSeparator,
  DropdownTrigger,
} from "../../components/DropdownMenu";
import { Badge } from "@radix-ui/themes/dist/cjs/index.js";
import { deleteDepartment, getDepartments } from "../../services/apiRoute";

const headerData = [
  { title: "" },
  { title: "ID" },
  { title: "Department" },
  { title: "Head" },
  { title: "Status" },
  { title: "Created" },
  { title: "Actions" },
];

export default function Departments() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [deleteDepartmentId, setDeleteDepartmentId] = useState(null);

  const { data: departmentsData, isLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,
  });

  const departments = departmentsData || [];

  const filteredDepartments = departments.filter((dept) => {
    const matchesSearch =
      dept.name.toLowerCase().includes(search.toLowerCase()) ||
      dept.head.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || dept.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

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

  const exportToCSV = () => {
    const headers = ["ID", "Name", "Head", "Status", "Created"];
    const csvContent = [
      headers.join(","),
      ...filteredDepartments.map((dept) =>
        [dept.id, dept.name, dept.head, dept.status, dept.created]
          .map((field) => `"${field}"`)
          .join(",")
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

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-5 flex flex-col gap-[14px] bg-shell dark:bg-dark-shell">
        <div className="flex items-center justify-center h-64">
          <div className="text-primary dark:text-dark-primary">
            Loading departments...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-5 flex flex-col bg-shell dark:bg-dark-shell gap-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary dark:text-dark-primary mb-1">
            Departments Management
          </h1>
          <p className="text-muted dark:text-dark-muted">
            Manage {departments.length} departments and their status
          </p>
        </div>

        <div className="flex items-center gap-3">
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

          <div className="flex-none">
            <Button
              icon={<Icon d={IC.plus} className="size-4" />}
              onClick={() => setShowAddModal(true)}
            >
              Add Department
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <GlobalModal
        open={showAddModal}
        setOpen={setShowAddModal}
        isClose={true}
      >
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
        {selectedDepartment && (
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
        )}
      </GlobalModal>

      {/* Filters & Table */}
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
                placeholder="Search departments by name or head..."
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
                  { value: "suspended", label: "Suspended" },
                  { value: "inactive", label: "Inactive" },
                ]}
                value={statusFilter}
                onValueChange={setStatusFilter}
              />
            </div>
          </div>
        </div>

        <div className="w-full overflow-hidden p-2">
          <Table>
            <TableHeader headerData={headerData} />
            <TableBody>
              {filteredDepartments.map((department) => (
                <TableRow key={department.id}>
                  <TableColumn className="w-10">
                    <Checkbox />
                  </TableColumn>

                  <TableColumn className="font-mono text-xs">
                    #{department.id.slice(-4)}
                  </TableColumn>

                  <TableColumn className="font-medium">
                    <div className="font-medium text-sm text-primary dark:text-dark-primary">
                      {department.name}
                    </div>
                  </TableColumn>

                  <TableColumn>{department.head}</TableColumn>

                  <TableColumn className="text-center">
                    <Badge
                      color={
                        department.status === "active" ? "green" : "gray"
                      }
                    >
                      {department.status}
                    </Badge>
                  </TableColumn>

                  <TableColumn className="text-xs text-center">
                    {new Date(department.created).toLocaleDateString()}
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
                        <DropdownLabel>Account</DropdownLabel>

                        <DropdownItem
                          icon={
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                              <circle cx="12" cy="7" r="4" />
                            </svg>
                          }
                          onClick={() =>
                            navigate(`/admin/department/${department.id}`)
                          }
                        >
                          <span>Profile</span>
                        </DropdownItem>

                        <DropdownSeparator />

                        <DropdownLabel>Actions</DropdownLabel>

                        <DropdownItem
                          icon={
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          }
                          onClick={() => {
                            setSelectedDepartment(department);
                            setShowEditModal(true);
                          }}
                        >
                          Edit
                        </DropdownItem>

                        <DropdownItem
                          icon={
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              <line x1="10" y1="11" x2="10" y2="17" />
                              <line x1="14" y1="11" x2="14" y2="17" />
                            </svg>
                          }
                          variant="danger"
                          onClick={() =>
                            setDeleteDepartmentId(department.id)
                          }
                        >
                          Delete
                        </DropdownItem>
                      </DropdownContent>
                    </DropdownMenuRoot>
                  </TableColumn>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {deleteDepartmentId && (
          <DeleteConfirmModal
            departmentId={deleteDepartmentId}
            department={departments.find(
              (d) => d.id === deleteDepartmentId
            )}
            setDeleteDepartmentId={setDeleteDepartmentId}
          />
        )}
      </div>
    </div>
  );
}

function DeleteConfirmModal({ departmentId, department, setDeleteDepartmentId }) {
  const queryClient = useQueryClient();

  const confirmDelete = async () => {
    try {
      await deleteDepartment(departmentId);
      queryClient.invalidateQueries({ queryKey: ["departments"] });
    } catch (error) {
      window.GooeyToaster?.error?.(error.message || "Delete failed");
    }
    setDeleteDepartmentId(null);
  };

  const cancelDelete = () => {
    setDeleteDepartmentId(null);
  };

  const departmentName = department ? department.name : "";

  return (
    <GlobalModal open={true} setOpen={cancelDelete}>
      <div className="w-[450px] max-h-[70vh] bg-shell dark:bg-dark-card p-6 rounded-xl shadow-2xl border border-default dark:border-dark-default flex flex-col z-[1000]">
        <div className="flex items-start gap-3 mb-6 pb-4 border-b border-default dark:border-dark-default">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 text-red-600 dark:text-red-400">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              <line x1="10" y1="11" x2="10" y2="17" />
              <line x1="14" y1="11" x2="14" y2="17" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              Delete Department
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-900 dark:text-gray-100">
                {departmentName}
              </span>
              ?
            </p>
            <p className="text-gray-600 dark:text-gray-300 text-xs mb-4">
              Head:{" "}
              <span className="font-mono bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded text-xs">
                {department?.head}
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
           Delete
          </Button>
        </div>
      </div>
    </GlobalModal>
  );
}

