import { useState, useMemo, useCallback } from "react";
import Dropdown from "./Dropdown";
import IC from "./IC";
import Icon from "./Icon";
import Avatar from "./Avatar";
import { useClickOutSide } from "../hooks/useClickOutside";
import { useTranslation } from "react-i18next";
const INITIAL = [
  {
    id: 1,
    type: "exam",
    avatar: "JW",
    color: "bg-violet-500",
    title: "New exam scheduled",
    desc: "Math Exam has been added for Class 302 on Feb 15.",
    time: "2 min ago",
    unread: true,
  },
  {
    id: 2,
    type: "attendance",
    avatar: "SA",
    color: "bg-emerald-500",
    title: "Attendance alert",
    desc: "Sarah Anderson was marked absent today.",
    time: "18 min ago",
    unread: true,
  },
  {
    id: 3,
    type: "message",
    avatar: "DR",
    color: "bg-blue-500",
    title: "New message from Daniel Roberts",
    desc: "Can we reschedule Friday's session?",
    time: "1 hr ago",
    unread: true,
  },
  {
    id: 4,
    type: "report",
    avatar: "OB",
    color: "bg-amber-500",
    title: "Monthly report ready",
    desc: "February student performance report is available.",
    time: "3 hr ago",
    unread: false,
  },
  {
    id: 5,
    type: "system",
    avatar: "SY",
    color: "bg-slate-400",
    title: "System maintenance",
    desc: "Scheduled maintenance on Sun, 10 Mar at 2:00 AM.",
    time: "Yesterday",
    unread: false,
  },
];
export default function NotificationDropdown({ onClose }) {
  const { t } = useTranslation();
  const ref = useClickOutSide(onClose);

  const [notifications, setNotifications] = useState(INITIAL);
  const [activeTab, setActiveTab] = useState("all");

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.unread).length,
    [notifications],
  );

  const filtered = useMemo(
    () =>
      activeTab === "unread"
        ? notifications.filter((n) => n.unread)
        : notifications,
    [activeTab, notifications],
  );

  const markAllRead = useCallback(
    () =>
      setNotifications((prev) => prev.map((n) => ({ ...n, unread: false }))),
    [],
  );

  const markRead = useCallback(
    (id) =>
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, unread: false } : n)),
      ),
    [],
  );

  return (
    <Dropdown className="w-85 sm:w-95 overflow-hidden" ref={ref}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-default dark:border-dark-default">
        <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-primary dark:text-dark-primary">
            {t("notificationDropdown.title")}
          </span>
          {unreadCount > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-accent/15 text-accent dark:bg-dark-accent/20 dark:text-dark-accent leading-none">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-[11px] text-accent dark:text-dark-accent hover:underline font-medium"
            >
              {t("notificationDropdown.markAllRead")}
            </button>
          )}
          <button
            onClick={onClose}
            className="w-6 h-6 flex cursor-pointer items-center justify-center rounded-lg hover:bg-hover dark:hover:bg-dark-hover text-muted dark:text-dark-muted"
          >
            <Icon
              d={IC.close ?? "M18 6L6 18M6 6l12 12"}
              className="size-3.5 stroke-2"
            />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 px-4 py-2.5">
        {["all", "unread"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-colors ${
              activeTab === tab
                ? "bg-nav-active dark:bg-dark-nav-active text-accent dark:text-dark-accent"
                : "text-muted dark:text-dark-muted hover:bg-hover dark:hover:bg-dark-hover"
            }`}
          >
            {t(`notificationDropdown.tabs.${tab}`)}
            {tab === "unread" && unreadCount > 0 && (
              <span className="ml-1.5 text-[10px]">({unreadCount})</span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      <ul className="max-h-80 overflow-y-auto divide-y divide-default dark:divide-dark-default">
        {filtered.length === 0 ? (
          <li className="py-10 text-center text-xs text-muted dark:text-dark-muted">
            {t("notificationDropdown.empty")}
          </li>
        ) : (
          filtered.map((n) => (
            <li
              key={n.id}
              onClick={() => markRead(n.id)}
              className={`flex gap-3 px-4 py-3 cursor-pointer group transition-colors hover:bg-accent/90 dark:hover:bg-accent-dark ${
                n.unread ? "bg-accent/4 dark:bg-dark-accent/6" : ""
              }`}
            >
              <div className="relative shrink-0 mt-0.5">
                <Avatar
                  initials={n.avatar}
                  colorClass={n.color}
                  size="w-8 h-8"
                />
                {n.unread && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-accent dark:bg-dark-accent border-2 border-bg-shell dark:border-dark-shell" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <p
                    className={`text-xs font-semibold group-hover:text-white leading-snug truncate ${
                      n.unread
                        ? "text-primary dark:text-dark-primary"
                        : "text-secondary dark:text-dark-secondary"
                    }`}
                  >
                    {n.title}
                  </p>
                  <span className="text-[10px] text-muted dark:text-dark-muted group-hover:text-white shrink-0 mt-0.5">
                    {n.time}
                  </span>
                </div>
                <p className="text-[11px] group-hover:text-white text-muted dark:text-dark-muted mt-0.5 leading-snug line-clamp-2">
                  {n.desc}
                </p>
              </div>
            </li>
          ))
        )}
      </ul>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-default dark:border-dark-default">
        <button className="w-full text-xs text-accent dark:text-dark-accent font-medium hover:underline">
          {t("notificationDropdown.viewAll")}
        </button>
      </div>
    </Dropdown>
  );
}
