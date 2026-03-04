import { useState } from "react";
import IC from "./IC";
import Icon from "./Icon";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import CustomTooltip from "./CustomTooltip";

export default function RevenueCard() {
  const revenueData = [
    { month: "Mar", value: 22000 },
    { month: "Apr", value: 16000 },
    { month: "May", value: 19000 },
    { month: "Jun", value: 13000 },
    { month: "Jul", value: 6000 },
    { month: "Aug", value: 11000 },
    { month: "Sept", value: 18500, active: true },
    { month: "Oct", value: 15000 },
    { month: "Nov", value: 8000 },
    { month: "Des", value: 7000 },
    { month: "Jan", value: 6000 },
    { month: "Feb", value: 7500 },
  ];

  const [period, setPeriod] = useState("1Y");
  const periods = ["1D", "1W", "1M", "6M", "1Y", "ALL"];
  return (
    <div
      style={{
        background: "var(--c-bg-card)",
        border: "1px solid var(--c-border)",
        borderRadius: 12,
        padding: "16px 18px",
        flex: 1,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 4,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "var(--c-text-primary)",
            }}
          >
            Revenue
          </span>
          <Icon
            d={IC.chevDown}
            size={13}
            stroke="var(--c-text-muted)"
            strokeWidth={2}
          />
        </div>
        <div style={{ display: "flex", gap: 2 }}>
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: "3px 8px",
                borderRadius: 6,
                border: "none",
                background:
                  period === p ? "var(--c-bg-nav-active)" : "transparent",
                color:
                  period === p
                    ? "var(--c-text-nav-active)"
                    : "var(--c-text-muted)",
                fontSize: 11,
                fontWeight: period === p ? 600 : 400,
                cursor: "pointer",
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 12 }}>
        <span
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: "var(--c-text-primary)",
            letterSpacing: "-0.02em",
          }}
        >
          $32.209
        </span>
        <span
          style={{
            fontSize: 11,
            color: "var(--c-green)",
            marginLeft: 8,
            fontWeight: 500,
          }}
        >
          +22% vs last month
        </span>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <BarChart
          data={revenueData}
          barSize={18}
          margin={{ top: 5, right: 0, left: -20, bottom: 0 }}
        >
          <CartesianGrid
            vertical={false}
            stroke="var(--c-border)"
            strokeDasharray="3 3"
          />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "var(--c-text-muted)" }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: "var(--c-text-muted)" }}
            tickFormatter={(v) => `${v / 1000}k`}
          />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Bar
            dataKey="value"
            radius={[4, 4, 0, 0]}
            fill="var(--c-bar-bg)"
            shape={(props) => {
              const { x, y, width, height, index } = props;
              const isActive = revenueData[index]?.active;
              return (
                <rect
                  x={x}
                  y={y}
                  width={width}
                  height={height}
                  rx={4}
                  ry={4}
                  fill={isActive ? "var(--c-purple-bar)" : "var(--c-bar-bg)"}
                />
              );
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
