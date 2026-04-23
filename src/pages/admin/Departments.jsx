import React, { useMemo, useState } from "react";
import {
  BookOpen,
  Building2,
  GraduationCap,
  Microscope,
  Search,
  UserRound,
  Users,
} from "lucide-react";
import { cn } from "../../lib/utils";

const faculty = {
  name: "Faculty of Computer Science",
  shortName: "Computer Science",
  code: "FCS",
  dean: "Dr. Laila Rahmani",
  deanEmail: "laila.rahmani@university.edu",
  established: "2008",
  location: "North Campus, Block A",
  students: 1240,
  teachers: 58,
  programs: 6,
  labs: 4,
  description:
    "The Faculty of Computer Science manages software-focused teaching, research supervision, laboratory work, and academic project coordination for undergraduate and applied research programs.",
  vision:
    "Prepare technically strong graduates who can design modern digital systems, contribute to research, and support national innovation needs.",
};

const departments = [
  {
    id: "se",
    name: "Software Engineering Department",
    head: "Prof. Ahmad Feroz",
    teachers: 18,
    students: 360,
    programs: 2,
    labs: 1,
    description:
      "Covers software architecture, web systems, mobile development, quality assurance, and capstone implementation projects.",
    focusAreas: [
      "Software design",
      "Web development",
      "Testing and QA",
      "Capstone supervision",
    ],
  },
  {
    id: "ai",
    name: "Artificial Intelligence Department",
    head: "Dr. Nargis Haidari",
    teachers: 12,
    students: 240,
    programs: 1,
    labs: 1,
    description:
      "Focused on machine learning, data science, intelligent systems, and applied research in AI-supported decision making.",
    focusAreas: [
      "Machine learning",
      "Data science",
      "Computer vision",
      "Research methods",
    ],
  },
  {
    id: "is",
    name: "Information Systems Department",
    head: "Dr. Farid Nazari",
    teachers: 11,
    students: 280,
    programs: 1,
    labs: 1,
    description:
      "Works on information management, enterprise systems, academic administration systems, and business process design.",
    focusAreas: [
      "Database systems",
      "Enterprise apps",
      "Business analysis",
      "Digital governance",
    ],
  },
  {
    id: "net",
    name: "Computer Networks Department",
    head: "Eng. Zabiullah Safi",
    teachers: 9,
    students: 190,
    programs: 1,
    labs: 1,
    description:
      "Handles networking, cloud infrastructure, distributed systems, and secure communications for practical lab-based learning.",
    focusAreas: [
      "Routing and switching",
      "Cloud systems",
      "Cybersecurity basics",
      "Infrastructure labs",
    ],
  },
];

const facultyPrograms = [
  "BSc in Computer Science",
  "BSc in Software Engineering",
  "Diploma in Web Systems",
  "Artificial Intelligence Research Track",
  "Network Administration Certificate",
  "Applied Data Analytics Lab Program",
];

const facultyFacilities = [
  "Software Engineering Lab",
  "AI and Data Lab",
  "Networking Lab",
  "Research Collaboration Room",
];

function MetricCard({ icon: Icon, label, value, note }) {
  return (
    <div className="rounded-md border border-default bg-card p-4 dark:border-dark-default dark:bg-dark-card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted dark:text-dark-muted">
            {label}
          </p>
          <p className="mt-3 text-3xl font-bold text-primary dark:text-dark-primary">
            {value}
          </p>
          <p className="mt-2 text-sm leading-6 text-secondary dark:text-dark-secondary">
            {note}
          </p>
        </div>
        <div className="rounded-md bg-shell p-3 dark:bg-dark-shell">
          <Icon className="h-5 w-5 text-primary dark:text-dark-primary" />
        </div>
      </div>
    </div>
  );
}

function Departments() {
  const [query, setQuery] = useState("");
  const [selectedDepartmentId, setSelectedDepartmentId] = useState(
    departments[0].id,
  );

  const filteredDepartments = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return departments;

    return departments.filter((department) =>
      [
        department.name,
        department.head,
        department.description,
        department.focusAreas.join(" "),
      ]
        .join(" ")
        .toLowerCase()
        .includes(normalized),
    );
  }, [query]);

  const selectedDepartment =
    departments.find((department) => department.id === selectedDepartmentId) ||
    departments[0];

  return (
    <div className="flex min-h-screen flex-1 flex-col gap-6 overflow-y-auto bg-shell p-4 dark:bg-dark-shell md:p-6">
      <section className="rounded-md border border-default bg-card p-6 dark:border-dark-default dark:bg-dark-card">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-md border border-default bg-shell px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted dark:border-dark-default dark:bg-dark-shell dark:text-dark-muted">
              <Building2 className="h-3.5 w-3.5" />
              {faculty.code}
            </div>
            <h1 className="mt-4 text-3xl font-bold tracking-tight text-primary dark:text-dark-primary">
              {faculty.name}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-secondary dark:text-dark-secondary">
              {faculty.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 xl:min-w-[360px]">
            <div className="rounded-md border border-default bg-shell p-4 dark:border-dark-default dark:bg-dark-shell">
              <p className="text-xs text-muted dark:text-dark-muted">
                Established
              </p>
              <p className="mt-2 text-sm font-semibold text-primary dark:text-dark-primary">
                {faculty.established}
              </p>
            </div>
            <div className="rounded-md border border-default bg-shell p-4 dark:border-dark-default dark:bg-dark-shell">
              <p className="text-xs text-muted dark:text-dark-muted">
                Dean
              </p>
              <p className="mt-2 text-sm font-semibold text-primary dark:text-dark-primary">
                {faculty.dean}
              </p>
            </div>
            <div className="rounded-md border border-default bg-shell p-4 dark:border-dark-default dark:bg-dark-shell">
              <p className="text-xs text-muted dark:text-dark-muted">
                Location
              </p>
              <p className="mt-2 text-sm font-semibold text-primary dark:text-dark-primary">
                {faculty.location}
              </p>
            </div>
            <div className="rounded-md border border-default bg-shell p-4 dark:border-dark-default dark:bg-dark-shell">
              <p className="text-xs text-muted dark:text-dark-muted">
                Programs
              </p>
              <p className="mt-2 text-sm font-semibold text-primary dark:text-dark-primary">
                {faculty.programs}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={GraduationCap}
          label="Students"
          value={faculty.students}
          note="Current enrolled students in this faculty."
        />
        <MetricCard
          icon={UserRound}
          label="Teachers"
          value={faculty.teachers}
          note="Academic staff and supervisors across departments."
        />
        <MetricCard
          icon={BookOpen}
          label="Programs"
          value={faculty.programs}
          note="Degree and certificate offerings under this faculty."
        />
        <MetricCard
          icon={Microscope}
          label="Labs"
          value={faculty.labs}
          note="Laboratories and collaborative faculty facilities."
        />
      </section>

      <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)] xl:items-start">
        <aside className="rounded-md border border-default bg-card dark:border-dark-default dark:bg-dark-card">
          <div className="border-b border-default p-5 dark:border-dark-default">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary dark:text-dark-primary" />
              <h2 className="text-lg font-semibold text-primary dark:text-dark-primary">
                Faculty departments
              </h2>
            </div>
            <div className="relative mt-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted dark:text-dark-muted" />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search department or head..."
                className="w-full rounded-md border border-default bg-shell py-2.5 pl-10 pr-4 text-sm text-primary outline-none transition-colors placeholder:text-muted focus:border-primary/30 dark:border-dark-default dark:bg-dark-shell dark:text-dark-primary dark:placeholder:text-dark-muted dark:focus:border-dark-primary/30"
              />
            </div>
          </div>

          <div className="space-y-3 p-4">
            {filteredDepartments.map((department) => {
              const isActive = selectedDepartment.id === department.id;

              return (
                <button
                  key={department.id}
                  type="button"
                  onClick={() => setSelectedDepartmentId(department.id)}
                  className={cn(
                    "w-full rounded-md border p-4 text-left transition-colors",
                    isActive
                      ? "border-primary bg-shell dark:border-dark-primary dark:bg-dark-shell"
                      : "border-default bg-card hover:bg-shell dark:border-dark-default dark:bg-dark-card dark:hover:bg-dark-shell",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-primary dark:text-dark-primary">
                        {department.name}
                      </p>
                      <p className="mt-1 text-sm text-secondary dark:text-dark-secondary">
                        Head: {department.head}
                      </p>
                    </div>
                    <span className="rounded-md border border-default bg-card px-2.5 py-1 text-xs font-medium text-secondary dark:border-dark-default dark:bg-dark-card dark:text-dark-secondary">
                      {department.programs} programs
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <div className="rounded-md bg-shell px-2 py-2 text-center dark:bg-dark-shell">
                      <p className="text-[11px] text-muted dark:text-dark-muted">
                        Students
                      </p>
                      <p className="mt-1 text-sm font-semibold text-primary dark:text-dark-primary">
                        {department.students}
                      </p>
                    </div>
                    <div className="rounded-md bg-shell px-2 py-2 text-center dark:bg-dark-shell">
                      <p className="text-[11px] text-muted dark:text-dark-muted">
                        Staff
                      </p>
                      <p className="mt-1 text-sm font-semibold text-primary dark:text-dark-primary">
                        {department.teachers}
                      </p>
                    </div>
                    <div className="rounded-md bg-shell px-2 py-2 text-center dark:bg-dark-shell">
                      <p className="text-[11px] text-muted dark:text-dark-muted">
                        Labs
                      </p>
                      <p className="mt-1 text-sm font-semibold text-primary dark:text-dark-primary">
                        {department.labs}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}

            {!filteredDepartments.length && (
              <div className="rounded-md border border-dashed border-default px-4 py-10 text-center dark:border-dark-default">
                <p className="font-semibold text-primary dark:text-dark-primary">
                  No department found
                </p>
                <p className="mt-2 text-sm text-secondary dark:text-dark-secondary">
                  Try another search term.
                </p>
              </div>
            )}
          </div>
        </aside>

        <main className="min-w-0 space-y-6">
          <div className="rounded-md border border-default bg-card p-6 dark:border-dark-default dark:bg-dark-card">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 rounded-md border border-default bg-shell px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-muted dark:border-dark-default dark:bg-dark-shell dark:text-dark-muted">
                  <Building2 className="h-3.5 w-3.5" />
                  Department details
                </div>
                <h2 className="mt-4 text-3xl font-bold text-primary dark:text-dark-primary">
                  {selectedDepartment.name}
                </h2>
                <p className="mt-3 text-sm leading-7 text-secondary dark:text-dark-secondary">
                  {selectedDepartment.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 lg:min-w-[320px]">
                <div className="rounded-md border border-default bg-shell p-4 dark:border-dark-default dark:bg-dark-shell">
                  <p className="text-xs text-muted dark:text-dark-muted">
                    Department head
                  </p>
                  <p className="mt-2 text-sm font-semibold text-primary dark:text-dark-primary">
                    {selectedDepartment.head}
                  </p>
                </div>
                <div className="rounded-md border border-default bg-shell p-4 dark:border-dark-default dark:bg-dark-shell">
                  <p className="text-xs text-muted dark:text-dark-muted">
                    Programs
                  </p>
                  <p className="mt-2 text-sm font-semibold text-primary dark:text-dark-primary">
                    {selectedDepartment.programs}
                  </p>
                </div>
                <div className="rounded-md border border-default bg-shell p-4 dark:border-dark-default dark:bg-dark-shell">
                  <p className="text-xs text-muted dark:text-dark-muted">
                    Students
                  </p>
                  <p className="mt-2 text-sm font-semibold text-primary dark:text-dark-primary">
                    {selectedDepartment.students}
                  </p>
                </div>
                <div className="rounded-md border border-default bg-shell p-4 dark:border-dark-default dark:bg-dark-shell">
                  <p className="text-xs text-muted dark:text-dark-muted">
                    Teachers
                  </p>
                  <p className="mt-2 text-sm font-semibold text-primary dark:text-dark-primary">
                    {selectedDepartment.teachers}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
            <section className="space-y-6">
              <div className="rounded-md border border-default bg-card p-6 dark:border-dark-default dark:bg-dark-card">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary dark:text-dark-primary" />
                  <h3 className="text-lg font-semibold text-primary dark:text-dark-primary">
                    Department focus areas
                  </h3>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  {selectedDepartment.focusAreas.map((area) => (
                    <div
                      key={area}
                      className="rounded-md border border-default bg-shell p-4 dark:border-dark-default dark:bg-dark-shell"
                    >
                      <p className="font-semibold text-primary dark:text-dark-primary">
                        {area}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-secondary dark:text-dark-secondary">
                        Academic and practical work stream supported by this
                        department inside {faculty.shortName}.
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-md border border-default bg-card p-6 dark:border-dark-default dark:bg-dark-card">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-primary dark:text-dark-primary" />
                  <h3 className="text-lg font-semibold text-primary dark:text-dark-primary">
                    Faculty-level programs
                  </h3>
                </div>
                <div className="mt-4 space-y-3">
                  {facultyPrograms.map((program) => (
                    <div
                      key={program}
                      className="rounded-md border border-default bg-shell px-4 py-3 dark:border-dark-default dark:bg-dark-shell"
                    >
                      <p className="text-sm font-semibold text-primary dark:text-dark-primary">
                        {program}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <aside className="space-y-6">
              <div className="rounded-md border border-default bg-card p-6 dark:border-dark-default dark:bg-dark-card">
                <div className="flex items-center gap-2">
                  <UserRound className="h-4 w-4 text-primary dark:text-dark-primary" />
                  <h3 className="text-lg font-semibold text-primary dark:text-dark-primary">
                    Faculty leadership
                  </h3>
                </div>
                <div className="mt-4 rounded-md border border-default bg-shell p-4 dark:border-dark-default dark:bg-dark-shell">
                  <p className="text-sm font-semibold text-primary dark:text-dark-primary">
                    {faculty.dean}
                  </p>
                  <p className="mt-1 text-sm text-secondary dark:text-dark-secondary">
                    Dean of {faculty.shortName}
                  </p>
                  <p className="mt-3 text-sm text-muted dark:text-dark-muted">
                    {faculty.deanEmail}
                  </p>
                </div>
                <p className="mt-4 text-sm leading-6 text-secondary dark:text-dark-secondary">
                  {faculty.vision}
                </p>
              </div>

              <div className="rounded-md border border-default bg-card p-6 dark:border-dark-default dark:bg-dark-card">
                <div className="flex items-center gap-2">
                  <Microscope className="h-4 w-4 text-primary dark:text-dark-primary" />
                  <h3 className="text-lg font-semibold text-primary dark:text-dark-primary">
                    Faculty facilities
                  </h3>
                </div>
                <div className="mt-4 space-y-3">
                  {facultyFacilities.map((facility) => (
                    <div
                      key={facility}
                      className="rounded-md border border-default bg-shell px-4 py-3 dark:border-dark-default dark:bg-dark-shell"
                    >
                      <p className="text-sm font-medium text-primary dark:text-dark-primary">
                        {facility}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-md border border-default bg-card p-6 dark:border-dark-default dark:bg-dark-card">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary dark:text-dark-primary" />
                  <h3 className="text-lg font-semibold text-primary dark:text-dark-primary">
                    Faculty capacity
                  </h3>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-md border border-default bg-shell p-4 dark:border-dark-default dark:bg-dark-shell">
                    <p className="text-xs text-muted dark:text-dark-muted">
                      Students
                    </p>
                    <p className="mt-2 text-2xl font-bold text-primary dark:text-dark-primary">
                      {faculty.students}
                    </p>
                  </div>
                  <div className="rounded-md border border-default bg-shell p-4 dark:border-dark-default dark:bg-dark-shell">
                    <p className="text-xs text-muted dark:text-dark-muted">
                      Teachers
                    </p>
                    <p className="mt-2 text-2xl font-bold text-primary dark:text-dark-primary">
                      {faculty.teachers}
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Departments;
