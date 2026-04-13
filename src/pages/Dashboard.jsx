import CalendarCard from "../components/CalendarCard";
import IC from "../components/IC";
import LeadsCard from "../components/LeadsCard";
import RetentionCard from "../components/RetentionCard";
import RevenueCard from "../components/RevenueCard";
import StatCard from "../components/StatCard";
import TopCountryCard from "../components/TopContriesCard";
import { useAuth } from "../context/AuthContext";
import { getDashboardView } from "../lib/roles";

const STAT_SETS = {
  admin: [
    {
      icon: IC.contact,
      label: "Total students",
      value: "1,245",
      delta: "5%",
      deltaDir: "up",
      period: "vs last month",
    },
    {
      icon: IC.projects,
      label: "Active projects",
      value: "87",
      delta: "12%",
      deltaDir: "up",
      period: "vs last month",
    },
    {
      icon: IC.meeting,
      label: "Teaching staff",
      value: "56",
      delta: "3%",
      deltaDir: "up",
      period: "vs last month",
    },
    {
      icon: IC.company,
      label: "Departments",
      value: "12",
      delta: "0%",
      deltaDir: "up",
      period: "vs last year",
    },
  ],
  dean: [
    {
      icon: IC.contact,
      label: "Students (faculty)",
      value: "1,245",
      delta: "4%",
      deltaDir: "up",
      period: "vs last term",
    },
    {
      icon: IC.deals,
      label: "Programs tracked",
      value: "18",
      delta: "2",
      deltaDir: "up",
      period: "new this year",
    },
    {
      icon: IC.reports,
      label: "At-risk alerts",
      value: "7",
      delta: "2",
      deltaDir: "down",
      period: "vs last month",
    },
    {
      icon: IC.projects,
      label: "Research projects",
      value: "34",
      delta: "6%",
      deltaDir: "up",
      period: "vs last month",
    },
  ],
  staff: [
    {
      icon: IC.deals,
      label: "Open tasks",
      value: "18",
      delta: "3",
      deltaDir: "down",
      period: "cleared this week",
    },
    {
      icon: IC.calendar,
      label: "Events this week",
      value: "24",
      delta: "8%",
      deltaDir: "up",
      period: "vs avg",
    },
    {
      icon: IC.notes,
      label: "Notes & forms",
      value: "112",
      delta: "12%",
      deltaDir: "up",
      period: "vs last month",
    },
    {
      icon: IC.contact,
      label: "Faculty served",
      value: "142",
      delta: "1%",
      deltaDir: "up",
      period: "vs last month",
    },
  ],
  teacher: [
    {
      icon: IC.deals,
      label: "Assigned groups",
      value: "6",
      delta: "1",
      deltaDir: "up",
      period: "from admin",
    },
    {
      icon: IC.contact,
      label: "Students in groups",
      value: "128",
      delta: "4%",
      deltaDir: "up",
      period: "vs last term",
    },
    {
      icon: IC.notes,
      label: "Drafts & rubrics",
      value: "14",
      delta: "2",
      deltaDir: "up",
      period: "this week",
    },
    {
      icon: IC.calendar,
      label: "Sessions scheduled",
      value: "22",
      delta: "0",
      deltaDir: "up",
      period: "this month",
    },
  ],
  student: [
    {
      icon: IC.projects,
      label: "Your projects",
      value: "3",
      delta: "1",
      deltaDir: "up",
      period: "active",
    },
    {
      icon: IC.deals,
      label: "Group memberships",
      value: "2",
      delta: "0",
      deltaDir: "up",
      period: "pending invites: 1",
    },
    {
      icon: IC.notes,
      label: "Assignments due",
      value: "5",
      delta: "2",
      deltaDir: "down",
      period: "next 7 days",
    },
    {
      icon: IC.meeting,
      label: "Collaboration",
      value: "4",
      delta: "1",
      deltaDir: "up",
      period: "classmates active",
    },
  ],
};

export default function Dashboard() {
  const { user } = useAuth();
  const view = getDashboardView(user?.role);
  const stats = STAT_SETS[view];

  return (
    <div className="flex flex-1 flex-col gap-[14px] overflow-y-auto bg-shell p-4 md:p-5 dark:bg-dark-shell">
      <div className="rounded-xl border border-default bg-card px-4 py-3 dark:border-dark-default dark:bg-dark-card">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted dark:text-dark-muted">
          Role
        </p>
        <p className="mt-0.5 text-sm font-bold text-primary capitalize dark:text-dark-primary">
          {user?.role ?? "guest"}
        </p>
        <p className="mt-1 text-xs text-secondary dark:text-dark-secondary">
          {view === "student" &&
            "Projects, groups, and collaboration are scoped to you — admins control who teaches which groups."}
          {view === "teacher" &&
            "You work with groups and rosters assigned by an admin; grading and lessons stay in those groups."}
          {view === "admin" &&
            "Full directory and configuration; connect APIs to enforce permissions on the server."}
          {view === "dean" &&
            "Oversight across students and programs; sensitive actions can remain admin-only in the API."}
          {view === "staff" &&
            "Operational tools — calendar, notes, and tasks without full admin rights."}
        </p>
      </div>

      <div className="flex gap-3">
        {stats.map((s) => (
          <StatCard
            key={s.label}
            icon={s.icon}
            label={s.label}
            value={s.value}
            delta={s.delta}
            deltaDir={s.deltaDir}
            period={s.period}
          />
        ))}
      </div>

      <div className="flex gap-3">
        <RevenueCard />
        <CalendarCard />
      </div>

      <div className="flex gap-3">
        <LeadsCard />
        <TopCountryCard />
        <RetentionCard />
      </div>
    </div>
  );
}
