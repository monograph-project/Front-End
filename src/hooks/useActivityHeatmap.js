import { useMemo } from "react";

function eventTimestamp(event) {
  if (!event || typeof event !== "object") return 0;
  const raw =
    event.timestamp ??
    event.time ??
    event.createdAt ??
    event.created_at ??
    event.date ??
    event.occurredAt ??
    "";
  const date = typeof raw === "number" ? new Date(raw) : new Date(String(raw));
  const time = date.getTime();
  return Number.isNaN(time) ? 0 : time;
}

function isoDay(date) {
  return date.toISOString().slice(0, 10);
}

function eventKind(event) {
  const hay = JSON.stringify(event ?? {}).toLowerCase();
  if (hay.includes("task") && (hay.includes("completed") || hay.includes("complete"))) {
    return "tasks";
  }
  if (hay.includes("push")) return "pushes";
  if (hay.includes("commit")) return "commits";
  if (hay.includes("pull_request") || hay.includes("pull request")) return "pushes";
  return "commits";
}

export default function useActivityHeatmap(events) {
  return useMemo(() => {
    const counts = {};
    const details = {};
    for (const event of Array.isArray(events) ? events : []) {
      const time = eventTimestamp(event);
      if (!time) continue;
      const key = isoDay(new Date(time));
      counts[key] = (counts[key] ?? 0) + 1;
      const kind = eventKind(event);
      details[key] = details[key] ?? { commits: 0, pushes: 0, tasks: 0 };
      details[key][kind] = (details[key][kind] ?? 0) + 1;
    }

    const end = new Date();
    end.setHours(0, 0, 0, 0);
    const start = new Date(end);
    start.setDate(end.getDate() - 364);
    const days = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = isoDay(d);
      days.push({
        key,
        date: new Date(d),
        value: counts[key] ?? 0,
        details: details[key] ?? { commits: 0, pushes: 0, tasks: 0 },
      });
    }

    const weeks = [];
    for (let i = 0; i < days.length; i += 7) weeks.push(days.slice(i, i + 7));
    return {
      weeks,
      total: days.reduce((sum, day) => sum + day.value, 0),
      max: Math.max(1, ...days.map((day) => day.value)),
    };
  }, [events]);
}
