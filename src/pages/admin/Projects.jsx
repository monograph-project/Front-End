import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import IC from "../../components/IC";
import Icon from "../../components/Icon";
import Button from "../../components/Button";
import { Badge } from "@radix-ui/themes/dist/cjs/index.js";
import Pagination from "../../components/Pagination";
import {
  DropdownContent,
  DropdownItem,
  DropdownMenuRoot,
  DropdownSeparator,
  DropdownTrigger,
} from "../../components/DropdownMenu";
import Select from "../../components/Select";
import Table from "../../components/Table";
import TableBody from "../../components/TableBody";
import TableColumn from "../../components/TableColumn";
import TableHeader from "../../components/TableHeader";
import TableRow from "../../components/TableRow";
import Checkbox from "../../components/Checkbox";
import { useTranslation } from "react-i18next";

// Mock data for faculty projects
const mockProjects = [
  {
    id: "#PJ-001",
    title: "AI-Powered Student Analytics Dashboard",
    faculty: "Computer Science",
    lead: "Dr. Sarah Johnson",
    status: "active",
    budget: "$45,200",
    deadline: "Apr 15, 2024",
    members: 12,
    progress: 78,
  },
  {
    id: "#PJ-002",
    title: "Renewable Energy Research Lab",
    faculty: "Engineering",
    lead: "Prof. Michael Chen",
    status: "planning",
    budget: "$120,500",
    deadline: "Jun 30, 2024",
    members: 8,
    progress: 32,
  },
  {
    id: "#PJ-003",
    title: "Biomedical Signal Processing",
    faculty: "Medical Sciences",
    lead: "Dr. Aisha Khan",
    status: "completed",
    budget: "$89,300",
    deadline: "Feb 28, 2024",
    members: 15,
    progress: 100,
  },
  {
    id: "#PJ-004",
    title: "Digital Humanities Archive",
    faculty: "Arts & Humanities",
    lead: "Prof. Elena Rossi",
    status: "active",
    budget: "$32,100",
    deadline: "May 20, 2024",
    members: 6,
    progress: 65,
  },
  {
    id: "#PJ-005",
    title: "Quantum Computing Simulations",
    faculty: "Physics",
    lead: "Dr. Raj Patel",
    status: "paused",
    budget: "$156,000",
    deadline: "Dec 31, 2024",
    members: 20,
    progress: 45,
  },
];

const getStatusColor = (status) => {
  switch (status) {
    case "active":
      return "bg-success text-success-light dark:bg-dark-success dark:text-dark-success-light";
    case "planning":
      return "bg-warning text-warning-light dark:bg-dark-warning dark:text-dark-warning-light";
    case "completed":
      return "bg-muted text-muted-foreground dark:bg-dark-muted dark:text-dark-muted-foreground";
    case "paused":
      return "bg-secondary text-secondary-foreground dark:bg-dark-secondary dark:text-dark-secondary-foreground";
    default:
      return "bg-muted text-muted-foreground dark:bg-dark-muted dark:text-dark-muted-foreground";
  }
};

function Projects() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [projects, setProjects] = useState(mockProjects);
  const navigate = useNavigate();
  const headerData = [
    { title: "" },
    { title: t("adminProjects.table.projectId") },
    { title: t("adminProjects.table.title") },
    { title: t("adminProjects.table.faculty") },
    { title: t("adminProjects.table.lead") },
    { title: t("adminProjects.table.status") },
    { title: t("adminProjects.table.budget") },
    { title: t("adminProjects.table.deadline") },
    { title: t("adminProjects.table.actions") },
  ];
  const statusOptions = [
    { value: "all", label: t("adminShared.filters.allStatus") },
    { value: "active", label: t("adminShared.status.active") },
    { value: "planning", label: t("adminShared.status.planning") },
    { value: "completed", label: t("adminShared.status.completed") },
    { value: "paused", label: t("adminShared.status.paused") },
  ];

  const filteredProjects = projects
    .filter(
      (project) =>
        project.title.toLowerCase().includes(search.toLowerCase()) ||
        project.faculty.toLowerCase().includes(search.toLowerCase()) ||
        project.lead.toLowerCase().includes(search.toLowerCase()),
    )
    .filter(
      (project) => statusFilter === "all" || project.status === statusFilter,
    );

  const handleStatusChange = (id, newStatus) => {
    setProjects(
      projects.map((p) => (p.id === id ? { ...p, status: newStatus } : p)),
    );
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-5 flex flex-col bg-shell dark:bg-dark-shell gap-[14px]">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-primary dark:text-dark-primary">
            {t("adminProjects.header.title")}
          </h1>
          <p className="text-muted dark:text-dark-muted">
            {t("adminProjects.header.description", {
              count: filteredProjects.length,
            })}
          </p>
        </div>
        <Button icon={<Icon d={IC.plus} className="size-4" />}>
          {t("adminProjects.actions.new")}
        </Button>
      </div>

      {/* Filters */}
      <div className=" border border-default dark:border-dark-default rounded-md">
        <div className="flex flex-col border-b mb-1  border-default dark:border-dark-default p-3  sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative flex-1">
            <Icon
              d={IC.search}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 stroke-muted dark:stroke-dark-muted"
            />
            <input
              type="text"
              placeholder={t("adminProjects.filters.searchPlaceholder")}
              className="w-full pl-10 pr-4 py-1.5 border border-default dark:border-dark-default rounded-md bg-card dark:bg-dark-card text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all placeholder:text-muted dark:placeholder:text-dark-muted"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              options={statusOptions}
              value={statusFilter}
              onValueChange={setStatusFilter}
            />
          </div>
        </div>
        <div className="flex-1 p-3 rounded-md overflow-hidden">
          <Table>
            <TableHeader headerData={headerData} />
            <TableBody>
              {filteredProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableColumn className="w-12">
                    <Checkbox />
                  </TableColumn>
                  <TableColumn className="font-mono font-medium text-sm">
                    {project.id}
                  </TableColumn>
                  <TableColumn>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                        <Icon d={IC.folder} className="w-5 h-5 text-white" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-sm text-primary dark:text-dark-primary line-clamp-1">
                          {project.title}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted dark:text-dark-muted">
                          <span>
                            {t("adminProjects.meta.members", {
                              count: project.members,
                            })}
                          </span>
                          <div className="w-2 h-2 bg-accent rounded-full" />
                          <span>
                            {t("adminProjects.meta.complete", {
                              progress: project.progress,
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </TableColumn>
                  <TableColumn>
                    <Badge variant="outline" className="text-xs">
                      {project.faculty}
                    </Badge>
                  </TableColumn>
                  <TableColumn className="font-medium text-primary dark:text-dark-primary">
                    {project.lead}
                  </TableColumn>
                  <TableColumn>
                    <DropdownMenuRoot>
                      <DropdownTrigger asChild>
                        <Badge
                          className={`${getStatusColor(project.status)} cursor-pointer hover:opacity-80`}
                          onClick={() => {}}
                        >
                          {t(`adminShared.status.${project.status}`)}
                        </Badge>
                      </DropdownTrigger>
                      <DropdownContent>
                        <DropdownItem
                          onClick={() =>
                            handleStatusChange(project.id, "active")
                          }
                        >
                          {t("adminShared.status.active")}
                        </DropdownItem>
                        <DropdownItem
                          onClick={() =>
                            handleStatusChange(project.id, "planning")
                          }
                        >
                          {t("adminShared.status.planning")}
                        </DropdownItem>
                        <DropdownItem
                          onClick={() =>
                            handleStatusChange(project.id, "paused")
                          }
                        >
                          {t("adminShared.status.paused")}
                        </DropdownItem>
                        <DropdownItem
                          onClick={() =>
                            handleStatusChange(project.id, "completed")
                          }
                        >
                          {t("adminShared.status.completed")}
                        </DropdownItem>
                      </DropdownContent>
                    </DropdownMenuRoot>
                  </TableColumn>
                  <TableColumn className="font-mono font-semibold text-sm">
                    {project.budget}
                  </TableColumn>
                  <TableColumn className="text-sm font-medium whitespace-nowrap">
                    {project.deadline}
                  </TableColumn>
                  <TableColumn className="w-20">
                    <DropdownMenuRoot>
                      <DropdownTrigger showArrow={false}>
                        <Icon
                          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zM12 13a1 1 0 110-2 1 1 0 010 2zM12 20a1 1 0 110-2 1 1 0 010 2z"
                          className="w-5 h-5 text-muted dark:text-dark-muted hover:text-primary dark:hover:text-dark-primary cursor-pointer"
                        />
                      </DropdownTrigger>
                      <DropdownContent align="end">
                        <DropdownItem
                          onClick={() =>
                            navigate(`/admin/projects/${project.id}`)
                          }
                        >
                          {t("adminShared.actions.viewDetails")}
                        </DropdownItem>
                        <DropdownItem>{t("adminProjects.actions.edit")}</DropdownItem>
                        <DropdownItem>{t("adminShared.actions.share")}</DropdownItem>
                        <DropdownItem>{t("adminShared.actions.duplicate")}</DropdownItem>
                        <DropdownSeparator />
                        <DropdownItem variant="danger">
                          {t("adminShared.actions.archive")}
                        </DropdownItem>
                      </DropdownContent>
                    </DropdownMenuRoot>
                  </TableColumn>
                </TableRow>
              ))}
              {filteredProjects.length === 0 && (
                <TableRow>
                  <TableColumn
                    colSpan={headerData.length}
                    className="text-center py-12"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-16 h-16 bg-muted dark:bg-dark-muted rounded-xl flex items-center justify-center">
                        <Icon
                          d={IC.folder}
                          className="w-8 h-8 text-muted-foreground"
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-primary dark:text-dark-primary mb-1">
                          {t("adminProjects.empty.title")}
                        </h3>
                        <p className="text-sm text-muted dark:text-dark-muted">
                          {search || statusFilter !== "all"
                            ? t("adminProjects.empty.filtered")
                            : t("adminProjects.empty.default")}
                        </p>
                      </div>
                    </div>
                  </TableColumn>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Projects Table */}

      {filteredProjects.length > 0 && (
        <div className="pt-4">
          <Pagination />
        </div>
      )}
    </div>
  );
}

export default Projects;
