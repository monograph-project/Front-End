import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Table from "../../components/Table";
import TableBody from "../../components/TableBody";
import TableColumn from "../../components/TableColumn";
import TableHeader from "../../components/TableHeader";
import TableRow from "../../components/TableRow";
import { getStudents } from "../../services/apiRoute";
import Icon from "../../components/Icon";
import IC from "../../components/IC";
import { Badge } from "@radix-ui/themes/dist/cjs/index.js";
import Select from "../../components/Select";
import {
  DropdownContent,
  DropdownItem,
  DropdownLabel,
  DropdownMenuRoot,
  DropdownSeparator,
  DropdownTrigger,
} from "../../components/DropdownMenu";
import Button from "../../components/Button";

const headerData = [
  { title: "" },
  { title: "ID" },
  { title: "Student" },
  { title: "Department" },
  { title: "Status" },
  { title: "Enrolled" },
  { title: "Actions" },
];

export default function Students() {
  const { data: studentsData, isLoading } = useQuery({
    queryKey: ["students"],
    queryFn: getStudents,
  });

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const students = studentsData || [];

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-5 flex flex-col gap-[14px] bg-shell dark:bg-dark-shell">
        <div className="flex items-center justify-center h-64">
          <div className="text-primary dark:text-dark-primary">
            Loading students...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 min-h-screen  md:p-5 flex flex-col bg-shell dark:bg-dark-shell gap-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary dark:text-dark-primary mb-1">
            Student Management
          </h1>
          <p className="text-muted dark:text-dark-muted">
            Manage {students.length} students and their enrollment status
          </p>
        </div>
        <Button icon={<Icon d={IC.plus} className="size-4" />}>
          Add Student
        </Button>
      </div>

      {/* Filters */}

      {/* Table */}
      <div className="flex-1 bg-shell dark:bg-dark-shell border border-default dark:border-dark-default rounded-md ">
        <div className="overflow-hidden border-b  border-default dark:border-dark-default ">
          <div className="flex flex-col px-4 py-3 sm:flex-row gap-3 bg-shell dark:bg-dark-shell  ">
            <div className="relative flex-1">
              <Icon
                d={IC.search}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 stroke-muted dark:stroke-dark-muted"
              />
              <input
                type="text"
                placeholder="Search students by name, email or department..."
                className="w-full pl-10 pr-4 py-1.5 border  border-default dark:border-dark-default rounded-md text-sm  transition-all placeholder:text-muted dark:placeholder:text-dark-muted"
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
        </div>
        <div className="w-full  rounded-lg overflow-hidden  p-3">
          <Table className="shadow-sm">
            <TableHeader headerData={headerData} />
            <TableBody>
              {students.map((student) => (
                <TableRow key={student.id}>
                  <TableColumn>{student.id}</TableColumn>
                  <TableColumn className="font-medium">
                    {student.firstName} {student.lastName}
                  </TableColumn>
                  <TableColumn>{student.department}</TableColumn>
                  <TableColumn>
                    <Badge
                      color={`student.status === "Active" ?  "green" : "red`}
                    >
                      {student.status}
                    </Badge>
                  </TableColumn>
                  <TableColumn>{student.enrollmentDate}</TableColumn>
                  <TableColumn className="flex gap-1">
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
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                          ></path>
                        </svg>
                      </DropdownTrigger>
                      {/* <AccountTrigger /> */}

                      <DropdownContent>
                        <DropdownLabel>Account</DropdownLabel>

                        <DropdownItem
                          icon={
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 15 15"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M9.94969 7.49989C9.94969 8.85288 8.85288 9.94969 7.49989 9.94969C6.14691 9.94969 5.0501 8.85288 5.0501 7.49989C5.0501 6.14691 6.14691 5.0501 7.49989 5.0501C8.85288 5.0501 9.94969 6.14691 9.94969 7.49989ZM10.8632 8C10.6213 9.64055 9.20764 10.8997 7.49989 10.8997C5.79214 10.8997 4.37847 9.64055 4.13662 8H0.5C0.223858 8 0 7.77614 0 7.5C0 7.22386 0.223858 7 0.5 7H4.13659C4.37835 5.35935 5.79206 4.1001 7.49989 4.1001C9.20772 4.1001 10.6214 5.35935 10.8632 7H14.5C14.7761 7 15 7.22386 15 7.5C15 7.77614 14.7761 8 14.5 8H10.8632Z"
                                fill="currentColor"
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                              ></path>
                            </svg>
                          }
                        >
                          <span>Profile</span>
                        </DropdownItem>
                        <DropdownItem
                          icon={
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 15 15"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M9.94969 7.49989C9.94969 8.85288 8.85288 9.94969 7.49989 9.94969C6.14691 9.94969 5.0501 8.85288 5.0501 7.49989C5.0501 6.14691 6.14691 5.0501 7.49989 5.0501C8.85288 5.0501 9.94969 6.14691 9.94969 7.49989ZM10.8632 8C10.6213 9.64055 9.20764 10.8997 7.49989 10.8997C5.79214 10.8997 4.37847 9.64055 4.13662 8H0.5C0.223858 8 0 7.77614 0 7.5C0 7.22386 0.223858 7 0.5 7H4.13659C4.37835 5.35935 5.79206 4.1001 7.49989 4.1001C9.20772 4.1001 10.6214 5.35935 10.8632 7H14.5C14.7761 7 15 7.22386 15 7.5C15 7.77614 14.7761 8 14.5 8H10.8632Z"
                                fill="currentColor"
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                              ></path>
                            </svg>
                          }
                        >
                          Settings
                        </DropdownItem>

                        <DropdownSeparator />

                        <DropdownLabel>Actions</DropdownLabel>

                        <DropdownItem
                          icon={
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 15 15"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M9.94969 7.49989C9.94969 8.85288 8.85288 9.94969 7.49989 9.94969C6.14691 9.94969 5.0501 8.85288 5.0501 7.49989C5.0501 6.14691 6.14691 5.0501 7.49989 5.0501C8.85288 5.0501 9.94969 6.14691 9.94969 7.49989ZM10.8632 8C10.6213 9.64055 9.20764 10.8997 7.49989 10.8997C5.79214 10.8997 4.37847 9.64055 4.13662 8H0.5C0.223858 8 0 7.77614 0 7.5C0 7.22386 0.223858 7 0.5 7H4.13659C4.37835 5.35935 5.79206 4.1001 7.49989 4.1001C9.20772 4.1001 10.6214 5.35935 10.8632 7H14.5C14.7761 7 15 7.22386 15 7.5C15 7.77614 14.7761 8 14.5 8H10.8632Z"
                                fill="currentColor"
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                              ></path>
                            </svg>
                          }
                          variant="warning"
                        >
                          Archive
                        </DropdownItem>
                        <DropdownItem
                          icon={
                            <svg
                              width="15"
                              height="15"
                              viewBox="0 0 15 15"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M7.50005 1.04999C7.74858 1.04999 7.95005 1.25146 7.95005 1.49999V8.41359L10.1819 6.18179C10.3576 6.00605 10.6425 6.00605 10.8182 6.18179C10.994 6.35753 10.994 6.64245 10.8182 6.81819L7.81825 9.81819C7.64251 9.99392 7.35759 9.99392 7.18185 9.81819L4.18185 6.81819C4.00611 6.64245 4.00611 6.35753 4.18185 6.18179C4.35759 6.00605 4.64251 6.00605 4.81825 6.18179L7.05005 8.41359V1.49999C7.05005 1.25146 7.25152 1.04999 7.50005 1.04999ZM2.5 10C2.77614 10 3 10.2239 3 10.5V12C3 12.5539 3.44565 13 3.99635 13H11.0012C11.5529 13 12 12.5528 12 12V10.5C12 10.2239 12.2239 10 12.5 10C12.7761 10 13 10.2239 13 10.5V12C13 13.1041 12.1062 14 11.0012 14H3.99635C2.89019 14 2 13.103 2 12V10.5C2 10.2239 2.22386 10 2.5 10Z"
                                fill="currentColor"
                                fill-rule="evenodd"
                                clip-rule="evenodd"
                              ></path>
                            </svg>
                          }
                          variant="danger"
                        >
                          Delete
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
                    className="text-center py-8 text-muted dark:text-dark-muted"
                  >
                    No students found
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
