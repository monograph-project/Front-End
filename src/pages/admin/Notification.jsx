import { Badge } from "@radix-ui/themes/dist/cjs/index.js";
import { useState } from "react";
import Button from "../../components/Button";
import {
  DropdownContent,
  DropdownItem,
  DropdownMenuRoot,
  DropdownSeparator,
  DropdownTrigger,
} from "../../components/DropdownMenu";
import IC from "../../components/IC";
import Icon from "../../components/Icon";
import AvatarDemo from "../../components/Avatar";
import { useTranslation } from "react-i18next";

const mockNotifications = [
  {
    id: 1,
    title: "New Student Registration",
    type: "system",
    status: "delivered",
    sent: "2024-03-15 10:30",
    recipient: "john.doe@school.edu",
  },
  {
    id: 2,
    title: "Grade Assignment Due",
    type: "teacher",
    status: "pending",
    sent: "2024-03-14 16:45",
    recipient: "jane.smith@school.edu",
  },
  {
    id: 3,
    title: "System Maintenance Notice",
    type: "system",
    status: "delivered",
    sent: "2024-03-14 09:20",
    recipient: "all users",
  },
  {
    id: 4,
    title: "Project Deadline Reminder",
    type: "student",
    status: "failed",
    sent: "2024-03-13 14:15",
    recipient: "group-cs101",
  },
  {
    id: 5,
    title: "New Course Enrollment",
    type: "admin",
    status: "delivered",
    sent: "2024-03-13 11:00",
    recipient: "admin@school.edu",
  },
];

function Notification() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [notifications] = useState(mockNotifications);
  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch = [notification.title, notification.recipient, notification.type]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || notification.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-success text-success-light dark:bg-dark-success dark:text-dark-success-light";
      case "pending":
        return "bg-warning text-warning-light dark:bg-dark-warning dark:text-dark-warning-light";
      case "failed":
        return "bg-error text-error-light dark:bg-dark-error dark:text-dark-error-light";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="flex p-2  min- h-screen bg-shell dark:bg-dark-shell overflow-hidden">
      {/* Sidebar */}
      <div className="w-full lg:w-78.5 border border-default rounded-md  dark:border-dark-default  flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-2 border-b border-default dark:border-dark-default">
          <div>
            <h2 className="text-md font-semibold text-primary dark:text-dark-primary">
              {t("adminNotification.sidebar.title")}
            </h2>
            <span className="text-xs text-muted dark:text-dark-muted">
              {t("adminNotification.sidebar.unread", { count: 12 })}
            </span>
          </div>
          <span className=" cursor-pointer p-2">
            <svg
              width="18"
              height="18"
              viewBox="0 0 15 15"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12.1464 1.14645C12.3417 0.951184 12.6583 0.951184 12.8535 1.14645L14.8535 3.14645C15.0488 3.34171 15.0488 3.65829 14.8535 3.85355L10.9109 7.79618C10.8349 7.87218 10.7471 7.93543 10.651 7.9835L6.72359 9.94721C6.53109 10.0435 6.29861 10.0057 6.14643 9.85355C5.99425 9.70137 5.95652 9.46889 6.05277 9.27639L8.01648 5.34897C8.06455 5.25283 8.1278 5.16507 8.2038 5.08907L12.1464 1.14645ZM12.5 2.20711L8.91091 5.79618L7.87266 7.87267L8.12731 8.12732L10.2038 7.08907L13.7929 3.5L12.5 2.20711ZM9.99998 2L8.99998 3H4.9C4.47171 3 4.18056 3.00039 3.95552 3.01877C3.73631 3.03668 3.62421 3.06915 3.54601 3.10899C3.35785 3.20487 3.20487 3.35785 3.10899 3.54601C3.06915 3.62421 3.03669 3.73631 3.01878 3.95552C3.00039 4.18056 3 4.47171 3 4.9V11.1C3 11.5283 3.00039 11.8194 3.01878 12.0445C3.03669 12.2637 3.06915 12.3758 3.10899 12.454C3.20487 12.6422 3.35785 12.7951 3.54601 12.891C3.62421 12.9309 3.73631 12.9633 3.95552 12.9812C4.18056 12.9996 4.47171 13 4.9 13H11.1C11.5283 13 11.8194 12.9996 12.0445 12.9812C12.2637 12.9633 12.3758 12.9309 12.454 12.891C12.6422 12.7951 12.7951 12.6422 12.891 12.454C12.9309 12.3758 12.9633 12.2637 12.9812 12.0445C12.9996 11.8194 13 11.5283 13 11.1V6.99998L14 5.99998V11.1V11.1207C14 11.5231 14 11.8553 13.9779 12.1259C13.9549 12.407 13.9057 12.6653 13.782 12.908C13.5903 13.2843 13.2843 13.5903 12.908 13.782C12.6653 13.9057 12.407 13.9549 12.1259 13.9779C11.8553 14 11.5231 14 11.1207 14H11.1H4.9H4.87934C4.47686 14 4.14468 14 3.87409 13.9779C3.59304 13.9549 3.33469 13.9057 3.09202 13.782C2.7157 13.5903 2.40973 13.2843 2.21799 12.908C2.09434 12.6653 2.04506 12.407 2.0221 12.1259C1.99999 11.8553 1.99999 11.5231 2 11.1207V11.1206V11.1V4.9V4.87935V4.87932V4.87931C1.99999 4.47685 1.99999 4.14468 2.0221 3.87409C2.04506 3.59304 2.09434 3.33469 2.21799 3.09202C2.40973 2.71569 2.7157 2.40973 3.09202 2.21799C3.33469 2.09434 3.59304 2.04506 3.87409 2.0221C4.14468 1.99999 4.47685 1.99999 4.87932 2H4.87935H4.9H9.99998Z"
                fill="currentColor"
                fill-rule="evenodd"
                clip-rule="evenodd"
              ></path>
            </svg>
          </span>
        </div>

        {/* Search */}
        <div className="p-3 border-b border-default dark:border-dark-default">
          <div className="relative">
            <Icon
              d={IC.search}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 "
            />
            <input
              type="text"
              placeholder={t("adminNotification.sidebar.searchPlaceholder")}
              className="w-full pl-10 pr-4 bg-transparent py-1.5 focus:border-default dark:focus:border-dark-default  rounded-md border border-default dark:border-dark-default    transition-all"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className="p-3 border-b border-default dark:border-dark-default  hover:bg-accent/10 dark:hover:bg-dark-accent/10 cursor-pointer transition-colors flex gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-accent  flex items-center justify-center">
                <Icon d={IC.bell} className="w-6 h-6 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-sm text-primary dark:text-dark-primary truncate">
                    {notification.title}
                  </h3>
                  <Badge className="text-xs" variant="outline">
                    {t(`adminShared.notificationType.${notification.type}`)}
                  </Badge>
                </div>
                <p className="text-xs text-muted dark:text-dark-muted line-clamp-2 mb-1">
                  {t("adminNotification.sidebar.sentTo", {
                    recipient: notification.recipient,
                  })}
                </p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>
                    {new Date(notification.sent).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <div className="w-2 h-2 bg-success rounded-full"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center p-3 border-b border-default dark:border-dark-default  sticky top-0 z-10">
          <div className="flex items-center gap-3 mr-auto">
            <div className="w-12 h-12 rounded-full  flex items-center justify-center">
              <AvatarDemo />
            </div>
            <div>
                <h1 className="font-semibold text-lg text-primary dark:text-dark-primary">
                {t("adminNotification.detail.title")}
              </h1>
              <p className="text-sm text-muted dark:text-dark-muted">
                {t("adminNotification.detail.subtitle")}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenuRoot>
              <DropdownTrigger asChild>{t("adminShared.labels.action")}</DropdownTrigger>
              <DropdownContent align="end">
                <DropdownItem>{t("adminNotification.actions.edit")}</DropdownItem>
                <DropdownItem>{t("adminShared.actions.duplicate")}</DropdownItem>
                <DropdownItem>{t("adminShared.actions.archive")}</DropdownItem>
                <DropdownSeparator />
                <DropdownItem variant="destructive">
                  {t("adminShared.actions.delete")}
                </DropdownItem>
              </DropdownContent>
            </DropdownMenuRoot>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 relative overflow-y-auto p-4 space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full  flex items-center justify-center">
              <AvatarDemo />
            </div>
            <div className="flex-1 min-w-0 left-0">
              <div className="bg-card dark:bg-dark-card rounded-2xl p-4 max-w-[80%]">
                <p className="text-sm mb-2">
                  {t("adminNotification.messages.maintenance")}
                </p>
                <div className="flex items-center  gap-4 text-xs text-muted dark:text-dark-muted">
                  <span>{t("adminNotification.messages.yesterday")}</span>
                  <Badge variant="outline" size="1">
                    {t("adminShared.notificationType.system")}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-end gap-4 absolute right-0">
            <div className="w-10 h-10 rounded-full  flex items-center justify-center">
              <AvatarDemo />
            </div>
            <div className="flex-1 min-w-0">
              <div className="bg-success/10 dark:bg-dark-success/20 rounded-2xl p-4 max-w-[80%] border border-success/20">
                <p className="text-sm mb-2">
                  {t("adminNotification.messages.backup")}
                </p>
                <div className="flex items-center gap-4 text-xs text-success dark:text-dark-success">
                  <span>10:35 AM</span>
                  <Badge variant="outline">{t("adminNotification.messages.auto")}</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-default dark:border-dark-default ">
          <div className="flex-1 p-3 cursor-pointer  relative  border border-default dark:border-dark-default rounded-md  flex gap-2 items-center h-12">
            <button className="p-2 hover:bg-accent/20 dark:hover:bg-dark-accent/20 rounded-lg transition-colors flex items-center">
              <svg
                className=" -rotate-45"
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1.20308 1.04312C1.00481 0.954998 0.772341 1.0048 0.627577 1.16641C0.482813 1.32802 0.458794 1.56455 0.568117 1.75196L3.92115 7.50002L0.568117 13.2481C0.458794 13.4355 0.482813 13.672 0.627577 13.8336C0.772341 13.9952 1.00481 14.045 1.20308 13.9569L14.7031 7.95693C14.8836 7.87668 15 7.69762 15 7.50002C15 7.30243 14.8836 7.12337 14.7031 7.04312L1.20308 1.04312ZM4.84553 7.10002L2.21234 2.586L13.2689 7.50002L2.21234 12.414L4.84552 7.90002H9C9.22092 7.90002 9.4 7.72094 9.4 7.50002C9.4 7.27911 9.22092 7.10002 9 7.10002H4.84553Z"
                  fill="currentColor"
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </button>
            <input
              type="text"
              placeholder={t("adminNotification.replyPlaceholder")}
              className="flex-1 bg-transparent outline-none text-sm resize-none h-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Notification;
