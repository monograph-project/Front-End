import CalendarCard from "../components/CalendarCard";
import IC from "../components/IC";
import LeadsCard from "../components/LeadsCard";
import RetentionCard from "../components/RetentionCard";
import RevenueCard from "../components/RevenueCard";
import StatCard from "../components/StatCard";
import TopCountryCard from "../components/TopContriesCard";

export default function Dashboard() {
  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-5 flex flex-col gap-[14px] bg-shell dark:bg-dark-shell">
      {/* Stat Cards Row */}
      <div className="flex gap-3">
        <StatCard
          icon={IC.contact}
          label="Total Students"
          value="1,245"
          delta="5%"
          deltaDir="up"
          period="vs last month"
        />
        <StatCard
          icon={IC.projects}
          label="Total Projects"
          value="87"
          delta="12%"
          deltaDir="up"
          period="vs last month"
        />
        <StatCard
          icon={IC.meeting}
          label="Total Teachers"
          value="56"
          delta="3%"
          deltaDir="up"
          period="vs last month"
        />
        <StatCard
          icon={IC.company}
          label="Active Users"
          value="342"
          delta="8%"
          deltaDir="up"
          period="vs last month"
        />
      </div>

      {/* Charts Row */}
      <div className="flex gap-3">
        <RevenueCard />
        <CalendarCard />
      </div>

      {/* Bottom Row */}
      <div className="flex gap-3">
        <LeadsCard />
        <TopCountryCard />
        <RetentionCard />
      </div>
    </div>
  );
}
