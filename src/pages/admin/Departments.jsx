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
    const matchesSearch = dept.name.toLowerCase().includes(search.toLowerCase()) ||
                         dept.head.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || dept.status === statusFilter;
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
    const headers = ['ID', 'Name', 'Head', 'Status', 'Created'];
    const csvContent = [
      headers.join(','),
      ...filteredDepartments.map(dept => [
        dept.id,
        dept.name,
        dept.head,
        dept.status,
        dept.created
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'departments.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-5 flex flex-col gap-[14px] bg-shell dark:bg-dark-shell">
        <div className="flex items-center justify-center h-64">
          <div className="text-primary dark:text-dark-primary">Loading departments...</div>
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
              <DropdownItem icon={<Icon d={IC.download} className="size-4" />} onClick={() => handleAction("export")}>
                Export
              </DropdownItem>
              <DropdownItem icon={<Icon d={IC.upload} className="size-4" />} onClick={() => handleAction("import")}>
                Import
              </DropdownItem>
            </DropdownContent>
          </DropdownMenuRoot>
          <div className="flex-none">
          <Button icon={<Icon d={IC.plus} className="size-4" />} onClick={() => setShowAddModal(true)}>
            Add Department
          </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <GlobalModal open={showAddModal} setOpen={setShowAddModal} isClose={true}>
        <AddDepartmentForm 
          onClose={() => setShowAddModal(false)} 
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ["departments"] })}
        />
      </GlobalModal>

      <GlobalModal open={showEditModal} setOpen={setShowEditModal} isClose={true}>
        {selectedDepartment && (
          <EditDepartmentForm
            department={selectedDepartment}
            onClose={() => {
              setShowEditModal(false);
              setSelectedDepartment(null);
            }}
            onSuccess={() => queryClient.invalidateQueries({ queryKey: ["departments"] })}
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
                    <div className="min-w-0">
                      <div className="font-medium text-sm text-primary dark:text-dark-primary line-clamp-1">
                        {department.name}
                      </div>
                    </div>
                  </TableColumn>
                  <TableColumn>
                    <span className="text-sm text-primary dark:text-dark-primary font-medium">
                      {department.head}
                    </span>
                  </TableColumn>
                  <TableColumn className="text-center">
                    <Badge color={department.status === "active" ? "green" : "gray"}>
                      {department.status}
                    </Badge>
                  </TableColumn>
                  <TableColumn className="text-xs text-center">
                    {new Date(department.created).toLocaleDateString()}
                  </TableColumn>
                  <TableColumn className="text-center">
                    <DropdownMenuRoot>
                      <DropdownTrigger showArrow={false}>
                        <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                          <path d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM12.5 8.625C13.1213 8.625 13.625 8.12132 13.625 7.5C13.625 6.87868 13.1213 6.375 12.5 6.375C11.8787 6.375 11.375 6.87868 11.375 7.5C11.375 8.12132 11.8787 8.625 12.5 8.625Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
                        </svg>
                      </DropdownTrigger>
                      <DropdownContent>
                        <DropdownLabel>Account</DropdownLabel>
                        <DropdownItem
                          icon={
                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                              <path d="M9.94969 7.49989C9.94969 8.85288 8.85288 9.94969 7.49989 9.94969C6.14691 9.94969 5.0501 8.85288 5.0501 7.49989C5.0501 6.14691 6.14691 5.0501 7.49989 5.0501C8.85288 5.0501 9.94969 6.14691 9.94969 7.49989ZM10.8632 8C10.6213 9.64055 9.20764 10.8997 7.49989 10.8997C5.79214 10.8997 4.37847 9.64055 4.13662 8H0.5C0.223858 8 0 7.77614 0 7.5C0 7.22386 0.223858 7 0.5 7H4.13659C4.37835 5.35935 5.79206 4.1001 7.49989 4.1001C9.20772 4.1001 10.6214 5.35935 10.8632 7H14.5C14.7761 7 15 7.22386 15 7.5C15 7.77614 14.7761 8 14.5 8H10.8632Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
                            </svg>
                          }
                          onClick={() => navigate(`/admin/department/${department.id}`)}
                        >
                          <span>Profile</span>
                        </DropdownItem>
                        <DropdownSeparator />
                        <DropdownLabel>Actions</DropdownLabel>
                        <DropdownItem
                          icon={
                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                              <path d="M9.94969 7.49989C9.94969 8.85288 8.85288 9.94969 7.49989 9.94969C6.14691 9.94969 5.0501 8.85288 5.0501 7.49989C5.0501 6.14691 6.14691 5.0501 7.49989 5.0501C8.85288 5.0501 9.94969 6.14691 9.94969 7.49989ZM10.8632 8C10.6213 9.64055 9.20764 10.8997 7.49989 10.8997C5.79214 10.8997 4.37847 9.64055 4.13662 8H0.5C0.223858 8 0 7.77614 0 7.5C0 7.22386 0.223858 7 0.5 7H4.13659C4.37835 5.35935 5.79206 4.1001 7.49989 4.1001C9.20772 4.1001 10.6214 5.35935 10.8632 7H14.5C14.7761 7 15 7.22386 15 7.5C15 7.77614 14.7761 8 14.5 8H10.8632Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
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
                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                              <path d="M7.50005 1.04999C7.74858 1.04999 7.95005 1.25146 7.95005 1.49999V8.41359L10.1819 6.18179C10.3576 6.00605 10.6425 6.00605 10.8182 6.18179C10.994 6.35753 10.994 6.64245 10.8182 6.81819L7.81825 9.81819C7.64251 9.99392 7.35759 9.99392 7.18185 9.81819L4.18185 6.81819C4.00611 6.64245 4.00611 6.35753 4.18185 6.18179C4.35759 6.00605 4.64251 6.00605 4.81825 6.18179L7.05005 8.41359V1.49999C7.05005 1.25146 7.25152 1.04999 7.50005 1.04999ZM2.5 10C2.77614 10 3 10.2239 3 10.5V12C3 12.5539 3.44565 13 3.99635 13H11.0012C11.5529 13 12 12.5528 12 12V10.5C12 10.2239 12.2239 10 12.5 10C12.7761 10 13 10.2239 13 10.5V12C13 13.1041 12.1062 14 11.0012 14H3.99635C2.89019 14 2 13.103 2 12V10.5C2 10.2239 2.22386 10 2.5 10Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"/>
                            </svg>
                          }
                          variant="danger"
                          onClick={() => setDeleteDepartmentId(department.id)}
                        >
                          Delete
                        </DropdownItem>
                      </DropdownContent>
                    </DropdownMenuRoot>
                  </TableColumn>
                </TableRow>
              ))}
              {filteredDepartments.length === 0 && (
                <TableRow>
                  <TableColumn colSpan={headerData.length} className="text-center py-12 text-muted dark:text-dark-muted">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
                        <Icon d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <span className="font-medium">No departments found</span>
                      <span className="text-xs opacity-75">Try adjusting your search or filter criteria</span>
                    </div>
                  </TableColumn>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {deleteDepartmentId && (
          <DeleteConfirmModal
            departmentId={deleteDepartmentId}
            department={departments.find((d) => d.id === deleteDepartmentId)}
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
      window.GooeyToaster?.success?.("Department deleted successfully");
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
            Delete Department
          </Button>
        </div>
      </div>
    </GlobalModal>
  );
}

