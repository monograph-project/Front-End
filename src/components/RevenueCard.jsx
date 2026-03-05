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
import { useTheme } from "../context/themContext";

export default function RevenueCard() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

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

  // Theme-aware colors for recharts
  const colors = {
    grid: isDark ? "var(--color-dark-default)" : "var(--color-default)",
    text: isDark ? "var(--color-dark-muted)" : "var(--color-muted)",
    barBg: isDark ? "var(--color-bar-dark-bg)" : "var(--color-bar-bg)",
    purpleBar: isDark
      ? "var(--color-purple-dark-bar)"
      : "var(--color-purple-bar)",
  };

  const [period, setPeriod] = useState("1Y");
  const periods = ["1D", "1W", "1M", "6M", "1Y", "ALL"];
  return (
    <div className="bg-card dark:bg-dark-card border border-default dark:border-dark-default rounded-xl p-4 md:p-[18px] flex-1">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-semibold text-primary dark:text-dark-primary">
            Revenue
          </span>
          <Icon
            className="text-muted dark:text-dark-muted"
            d={IC.chevDown}
            size={13}
            strokeWidth={2}
          />
        </div>
        <div className="flex gap-0.5">
          {periods.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-2 py-0.75 rounded-md border-none text-[11px] cursor-pointer transition-colors ${
                period === p
                  ? "bg-nav-main-active dark:bg-dark-nav-main-active text-nav-text-active dark:text-nav-text-active font-semibold"
                  : "bg-transparent text-muted dark:text-dark-muted font-normal hover:bg-nav-hover dark:hover:bg-dark-nav-hover"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>
      <div className="mb-3">
        <span className="text-[22px] font-extrabold text-primary dark:text-dark-primary tracking-tight">
          $32.209
        </span>
        <span className="text-[11px] text-success dark:text-success-dark ml-2 font-medium">
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
            stroke={colors.grid}
            strokeDasharray="3 3"
          />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: colors.text }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 10, fill: colors.text }}
            tickFormatter={(v) => `${v / 1000}k`}
          />
          <Tooltip content={<CustomTooltip />} cursor={false} />
          <Bar
            dataKey="value"
            radius={[4, 4, 0, 0]}
            fill={colors.barBg}
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
                  fill={isActive ? colors.purpleBar : colors.barBg}
                />
              );
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
