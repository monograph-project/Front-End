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
import { useTranslation } from "react-i18next";

function Teachers() {
  const { t, i18n } = useTranslation();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [teachers] = useState([
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

  const headerData = [
    { title: "" },
    { title: t("adminTeachers.table.id") },
    { title: t("adminTeachers.table.teacher") },
    { title: t("adminTeachers.table.department") },
    { title: t("adminTeachers.table.status") },
    { title: t("adminTeachers.table.joined") },
    { title: t("adminTeachers.table.actions") },
  ];

  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch = [teacher.firstName, teacher.lastName, teacher.email, teacher.department]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || teacher.status === statusFilter;
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

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-5 flex flex-col bg-shell dark:bg-dark-shell gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary dark:text-dark-primary mb-1">
            {t("adminTeachers.header.title")}
          </h1>
          <p className="text-muted dark:text-dark-muted">
            {t("adminTeachers.header.description", {
              count: filteredTeachers.length,
            })}
          </p>
        </div>
        <Button icon={<Icon d={IC.plus} className="size-4" />}>
          {t("adminTeachers.actions.add")}
        </Button>
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
              placeholder={t("adminTeachers.filters.searchPlaceholder")}
              className="w-full pl-10 pr-4 py-1.5 border border-default dark:border-dark-default rounded-md text-sm focus:border-accent dark:focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all placeholder:text-muted dark:placeholder:text-dark-muted"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
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

        <div className="w-full p-2 overflow-hidden ">
          <Table>
            <TableHeader headerData={headerData} />
            <TableBody>
              {filteredTeachers.map((teacher) => (
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
                      {t(`adminShared.status.${teacher.status}`)}
                    </span>
                  </TableColumn>
                  <TableColumn className="text-xs whitespace-nowrap">
                    {new Date(teacher.joined).toLocaleDateString(locale, {
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
                        <DropdownItem>
                          <span>{t("adminShared.actions.viewProfile")}</span>
                        </DropdownItem>
                        <DropdownItem>
                          <span>{t("adminShared.actions.editDetails")}</span>
                        </DropdownItem>
                        <DropdownItem>
                          <span>{t("adminShared.actions.sendMessage")}</span>
                        </DropdownItem>
                        <DropdownSeparator />
                        <DropdownItem variant="danger">
                          <span>{t("adminTeachers.actions.remove")}</span>
                        </DropdownItem>
                      </DropdownContent>
                    </DropdownMenuRoot>
                  </TableColumn>
                </TableRow>
              ))}
              {filteredTeachers.length === 0 && (
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
                        {t("adminTeachers.empty.title")}
                      </span>
                      <span className="text-xs opacity-75">
                        {t("adminTeachers.empty.description")}
                      </span>
                    </div>
                  </TableColumn>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {filteredTeachers.length > 0 && (
        <div className="pt-4">
          <Pagination />
        </div>
      )}
    </div>
  );
}

export default Teachers;
