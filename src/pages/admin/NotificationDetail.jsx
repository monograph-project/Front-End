import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Icon from "../../components/Icon";
import IC from "../../components/IC";
import Button from "../../components/Button";
import { Badge } from "@radix-ui/themes/dist/cjs/index.js";
import Table from "../../components/Table";
import TableBody from "../../components/TableBody";
import TableColumn from "../../components/TableColumn";
import TableHeader from "../../components/TableHeader";
import TableRow from "../../components/TableRow";
import {
  DropdownContent,
  DropdownItem,
  DropdownMenuRoot,
  DropdownSeparator,
  DropdownTrigger,
} from "../../components/DropdownMenu";
import { useTranslation } from "react-i18next";

// Mock notification data
const MOCK_NOTIFICATION_DETAIL = {
  id: 123,
  title: "System Maintenance Notice",
  type: "system",
  status: "delivered",
  sent: "2024-03-14 09:20 AM",
  recipients: 1564,
  opened: 1423,
  clickRate: "18.2%",
  subject: "Important: Scheduled Maintenance Tomorrow",
  content:
    "Dear Faculty Portal Users,\n\nWe will be performing scheduled maintenance on our servers this Saturday from 2:00 AM to 4:00 AM. During this time, all services will be temporarily unavailable.\n\nPlease save your work and plan accordingly.\n\nThis maintenance is to improve system performance and security.\n\nThank you for your understanding!\n\nBest regards,\nFaculty Portal Team",
  attachments: [{ name: "maintenance_schedule.pdf", size: "245 KB" }],
  deliveryStats: {
    delivered: 1564,
    opened: 1423,
    clicked: 285,
    bounced: 12,
    unsubscribed: 3,
  },
};

function NotificationDetail() {
  const { t } = useTranslation();
  const { notificationId } = useParams();
  const navigate = useNavigate();
  const [notification, setNotification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("content");

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setNotification(MOCK_NOTIFICATION_DETAIL);
      setLoading(false);
    }, 1000);
  }, [notificationId]);

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-5 flex items-center justify-center bg-shell dark:bg-dark-shell">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
      </div>
    );
  }

  if (!notification) {
    return (
      <div className="flex-1 overflow-y-auto p-4 md:p-5 flex flex-col items-center justify-center bg-shell dark:bg-dark-shell text-center">
        <div className="text-5xl mb-4 text-muted">📧</div>
        <h2 className="text-2xl font-bold text-primary dark:text-dark-primary mb-2">
          {t("adminNotificationDetail.notFound.title")}
        </h2>
        <p className="text-muted dark:text-dark-muted mb-6 max-w-md">
          {t("adminNotificationDetail.notFound.description")}
        </p>
        <Button onClick={() => navigate("/admin/notification")}>
          {t("adminNotificationDetail.notFound.back")}
        </Button>
      </div>
    );
  }

  const getStatusClass = (status) => {
    switch (status) {
      case "delivered":
        return "bg-success text-success-light dark:bg-dark-success dark:text-dark-success-light";
      case "sending":
        return "bg-warning text-warning-light dark:bg-dark-warning dark:text-dark-warning-light";
      case "failed":
        return "bg-error text-error-light dark:bg-dark-error dark:text-dark-error-light";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const deliveryStats = [
    {
      metric: t("adminNotificationDetail.analytics.metrics.delivered"),
      count: notification.deliveryStats.delivered,
      rate: "100%",
      status: "success",
    },
    {
      metric: t("adminNotificationDetail.analytics.metrics.opened"),
      count: notification.deliveryStats.opened,
      rate: "91%",
      status: "success",
    },
    {
      metric: t("adminNotificationDetail.analytics.metrics.clicked"),
      count: notification.deliveryStats.clicked,
      rate: "18.2%",
      status: "warning",
    },
    {
      metric: t("adminNotificationDetail.analytics.metrics.bounced"),
      count: notification.deliveryStats.bounced,
      rate: "0.8%",
      status: "error",
    },
  ];

  const deliveryHeaderData = [
    { title: t("adminNotificationDetail.table.metric") },
    { title: t("adminNotificationDetail.table.count") },
    { title: t("adminNotificationDetail.table.rate") },
    { title: t("adminNotificationDetail.table.status") },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 min-h-screen md:p-8 bg-shell dark:bg-dark-shell">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between mb-8 pb-6 border-b border-default dark:border-dark-default gap-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-accent/80 flex items-center justify-center">
                <Icon d={IC.bell} className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-primary dark:text-dark-primary">
                  {notification.title}
                </h1>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="text-muted dark:text-dark-muted">
                    {t("adminNotificationDetail.header.sent", {
                      value: new Date(notification.sent).toLocaleString(),
                    })}
                  </span>
                  <Badge className={getStatusClass(notification.status)}>
                    {notification.status.toUpperCase()}
                  </Badge>
                  <span className="px-3 py-1 bg-card dark:bg-dark-card border border-default dark:border-dark-default rounded-full text-xs">
                    {notification.type.toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DropdownMenuRoot>
              <DropdownTrigger>{t("adminShared.labels.action")}</DropdownTrigger>
              <DropdownContent align="end">
                <DropdownItem>{t("adminShared.actions.viewProfile")}</DropdownItem>
                <DropdownItem>{t("adminShared.actions.editDetails")}</DropdownItem>
                <DropdownItem>{t("adminShared.actions.sendMessage")}</DropdownItem>
                <DropdownSeparator />
                <DropdownItem variant="danger">
                  {t("adminNotificationDetail.actions.remove")}
                </DropdownItem>
              </DropdownContent>
            </DropdownMenuRoot>
          </div>
        </div>

        {/* Tabs */}
        <div className="border border-default dark:border-dark-default rounded-md overflow-hidden mb-8 ">
          <div className="flex bg-shell dark:bg-dark-shell">
            <button
              className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-all ${
                tab === "content"
                  ? "border-accent text-primary dark:text-dark-primary"
                  : "border-transparent text-muted dark:text-dark-muted hover:text-primary"
              }`}
              onClick={() => setTab("content")}
            >
              {t("adminNotificationDetail.tabs.content")}
            </button>
            <button
              className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-all ${
                tab === "analytics"
                  ? "border-accent text-primary dark:text-dark-primary"
                  : "border-transparent text-muted dark:text-dark-muted hover:text-primary"
              }`}
              onClick={() => setTab("analytics")}
            >
              {t("adminNotificationDetail.tabs.analytics")}
            </button>
            <button
              className={`flex-1 py-3 px-4 text-sm font-medium border-b-2 transition-all ${
                tab === "recipients"
                  ? "border-accent text-primary dark:text-dark-primary"
                  : "border-transparent text-muted dark:text-dark-muted hover:text-primary"
              }`}
              onClick={() => setTab("recipients")}
            >
              {t("adminNotificationDetail.tabs.recipients")}
            </button>
          </div>

          {/* Content Tab */}
          {tab === "content" && (
            <div className="p-6 bg-card dark:bg-dark-card">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-primary dark:text-dark-primary">
                  {t("adminNotificationDetail.content.subject")}
                </h3>
                <div className="bg-muted/50 dark:bg-dark-muted/50 p-4 rounded-lg font-medium text-primary dark:text-dark-primary">
                  {notification.subject}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-primary dark:text-dark-primary">
                  {t("adminNotificationDetail.content.message")}
                </h3>
                <div className="prose prose-sm max-w-none bg-muted/50 dark:bg-dark-muted/50 p-6 rounded-lg">
                  <div
                    dangerouslySetInnerHTML={{
                      __html: notification.content.replace(/\n/g, "<br>"),
                    }}
                  />
                </div>
              </div>

              {notification.attachments?.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 text-primary dark:text-dark-primary">
                    {t("adminNotificationDetail.content.attachments")}
                  </h3>
                  <div className="space-y-2">
                    {notification.attachments.map((attachment, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-card dark:bg-dark-card border border-default dark:border-dark-default rounded-lg"
                      >
                        <Icon
                          d={IC.file}
                          className="w-5 h-5 text-muted dark:text-dark-muted"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-primary dark:text-dark-primary truncate">
                            {attachment.name}
                          </div>
                          <div className="text-xs text-muted dark:text-dark-muted">
                            {attachment.size}
                          </div>
                        </div>
                        <Button size="sm" variant="ghost">
                          {t("adminShared.actions.download")}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Analytics Tab */}
          {tab === "analytics" && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-card dark:bg-dark-card p-6 rounded-lg border border-default dark:border-dark-default">
                  <h4 className="text-lg font-semibold mb-4 text-primary dark:text-dark-primary">
                    {t("adminNotificationDetail.analytics.deliveryOverview")}
                  </h4>
                  <Table>
                    <TableHeader headerData={deliveryHeaderData} />
                    <TableBody>
                      {deliveryStats.map((stat, index) => (
                        <TableRow key={index}>
                          <TableColumn className="font-medium">
                            {stat.metric}
                          </TableColumn>
                          <TableColumn className="font-mono">
                            {stat.count.toLocaleString()}
                          </TableColumn>
                          <TableColumn className="font-medium">
                            {stat.rate}
                          </TableColumn>
                          <TableColumn>
                            <Badge className={getStatusClass(stat.status)}>
                              {stat.status}
                            </Badge>
                          </TableColumn>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="space-y-6">
                  <div className="p-6 rounded-lg border border-default dark:border-dark-default bg-card dark:bg-dark-card">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-primary dark:text-dark-primary">
                        {t("adminNotificationDetail.analytics.openRate")}
                      </h4>
                      <Badge className="bg-success text-success-light">
                        91%
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted dark:text-dark-muted">
                          {t("adminNotificationDetail.analytics.metrics.delivered")}
                        </span>
                        <span>1,564</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full">
                        <div
                          className="h-full bg-success rounded-full"
                          style={{ width: "91%" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 rounded-lg border border-default dark:border-dark-default bg-card dark:bg-dark-card">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-lg font-semibold text-primary dark:text-dark-primary">
                        {t("adminNotificationDetail.analytics.clickRate")}
                      </h4>
                      <Badge className="bg-warning text-warning-light">
                        18.2%
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted dark:text-dark-muted">
                          {t("adminNotificationDetail.analytics.metrics.opened")}
                        </span>
                        <span>1,423</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full">
                        <div
                          className="h-full bg-warning rounded-full"
                          style={{ width: "18.2%" }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recipients Tab */}
          {tab === "recipients" && (
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4 text-primary dark:text-dark-primary">
                  {t("adminNotificationDetail.recipients.title", {
                    count: notification.recipients.toLocaleString(),
                  })}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="p-4 border border-default dark:border-dark-default rounded-lg text-center">
                    <div className="text-2xl font-bold text-primary dark:text-dark-primary mb-1">
                      1,564
                    </div>
                    <div className="text-sm text-muted dark:text-dark-muted">
                      {t("adminNotificationDetail.analytics.metrics.delivered")}
                    </div>
                  </div>
                  <div className="p-4 border border-default dark:border-dark-default rounded-lg text-center">
                    <div className="text-2xl font-bold text-success mb-1">
                      1,423
                    </div>
                    <div className="text-sm text-muted dark:text-dark-muted">
                      {t("adminNotificationDetail.analytics.metrics.opened")}
                    </div>
                  </div>
                  <div className="p-4 border border-default dark:border-dark-default rounded-lg text-center">
                    <div className="text-2xl font-bold text-warning mb-1">
                      285
                    </div>
                    <div className="text-sm text-muted dark:text-dark-muted">
                      {t("adminNotificationDetail.analytics.metrics.clicked")}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default NotificationDetail;
