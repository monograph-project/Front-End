import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Table from "../components/Table";
import TableBody from "../components/TableBody";
import TableColumn from "../components/TableColumn";
import TableHeader from "../components/TableHeader";
import TableRow from "../components/TableRow";
import { getStudents } from "../services/apiRoute";
import Icon from "../components/Icon";
import IC from "../components/IC";
import { Badge } from "@radix-ui/themes/dist/cjs/index.js";

const headerData = [
  { title: "ID" },
  { title: "Name" },
  { title: "Department" },
  { title: "Status" },
  { title: "Enrollment" },
  { title: "Actions" },
];

export default function StudentManagement() {
  const { data: studentsData, isLoading } = useQuery({
    queryKey: ["students"],
    queryFn: getStudents,
  });

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
    <div className="flex-1 overflow-y-auto p-4 md:p-5 flex flex-col gap-[14px] bg-shell dark:bg-dark-shell">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary dark:text-dark-primary">
          Student Management
        </h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:opacity-90">
          <Icon d={IC.plus} className="size-4" />
          Add Student
        </button>
      </div>

      <div className=" w-full p-1 border border-default dark:border-dark-default rounded-md">
        <div className="w-full m-1"></div>
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
                  <button className="p-1 text-muted hover:text-primary dark:hover:text-dark-primary">
                    <Icon d={IC.edit} className="size-4" />
                  </button>
                  <button className="p-1 text-muted hover:text-destructive dark:hover:text-dark-destructive">
                    <Icon d={IC.delete} className="size-4" />
                  </button>
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
  );
}
