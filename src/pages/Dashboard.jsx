import CalendarCard from "../components/CalendarCard";
import IC from "../components/IC";
import LeadsCard from "../components/LeadsCard";
import RetentionCard from "../components/RetentionCard";
import RevenueCard from "../components/RevenueCard";
import StatCard from "../components/StatCard";
import TopCountryCard from "../components/TopContriesCard";

export default function Dashboard() {
  return (
    <div
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "16px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 14,
        background: "var(--c-bg-shell)",
      }}
    >
      {/* Stat Cards Row */}
      <div style={{ display: "flex", gap: 12 }}>
        <StatCard
          icon={IC.contact}
          label="Leads"
          value="129"
          delta="2%"
          deltaDir="up"
          period="vs last week"
        />
        <StatCard
          icon={IC.zap}
          label="CLV"
          value="14d"
          delta="4%"
          deltaDir="down"
          period="vs last week"
        />
        <StatCard
          icon={IC.globe}
          label="Convertion Rate"
          value="24%"
          delta="2%"
          deltaDir="up"
          period="vs last week"
        />
        <StatCard
          icon={IC.reports}
          label="Revenue"
          value="$1.4K"
          delta="4%"
          deltaDir="down"
          period="vs last month"
        />
      </div>

      {/* Charts Row */}
      <div style={{ display: "flex", gap: 12 }}>
        <RevenueCard />
        <CalendarCard />
      </div>

      {/* Bottom Row */}
      <div style={{ display: "flex", gap: 12 }}>
        <LeadsCard />
        <TopCountryCard />
        <RetentionCard />
      </div>
    </div>
  );
}
