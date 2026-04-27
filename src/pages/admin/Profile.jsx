import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../../components/Avatar";
import Icon from "../../components/Icon";
import IC from "../../components/IC";
import Button from "../../components/Button";
import {
  DropdownContent,
  DropdownMenuRoot,
  DropdownItem,
  DropdownTrigger,
} from "../../components/DropdownMenu";
import { GooeyToaster } from "goey-toast";
import { useTranslation } from "react-i18next";

// Fake data - replace with API/userId
const FAKE_USER_DATA = {
  id: 1,
  fullName: "Elyas Admin",
  email: "elyas@gmail.com",
  role: "admin",
  status: "active",
  phone: "+93 777 123 456",
  avatar:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  registered: "2024-01-10",
  lastLogin: "2024-03-15",
  department: "IT Administration",
  bio: "Senior System Administrator with 8+ years experience in educational technology infrastructure.",
  stats: {
    projects: 23,
    students: 156,
    classes: 12,
    groups: 8,
  },
  activity: [
    { date: "Mar 15", action: "Updated student roster for Group A-101" },
    { date: "Mar 14", action: "Reviewed teacher performance report" },
    { date: "Mar 12", action: "Created new exam schedule for Semester 1" },
    { date: "Mar 10", action: "Approved 5 new student applications" },
    { date: "Mar 8", action: "Updated department calendar events" },
  ],
  permissions: [
    "manage_users",
    "view_reports",
    "edit_schedule",
    "manage_projects",
  ],
};

export default function UserProfile() {
  const { t } = useTranslation();
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // const [editing, setEditing] = useState(false);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setUser({ ...FAKE_USER_DATA, id: parseInt(userId) });
      setLoading(false);
    }, 800);
  }, [userId]);

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex-1 p-8 text-center">
        <div className="text-6xl mb-4 text-muted">👤</div>
        <h2 className="text-2xl font-bold text-primary mb-2">
          {t("adminProfile.notFound.title")}
        </h2>
        <Button onClick={() => navigate(-1)}>
          {t("adminProfile.notFound.back")}
        </Button>
      </div>
    );
  }

  const isOwner = currentUser?.id === user.id;

  const statusColors = {
    active: "bg-success text-success-light",
    pending: "bg-warning text-warning-light",
    suspended: "bg-error text-error-light",
    rejected: "bg-muted text-muted",
  };

  const handleStatusChange = (status) => {
    GooeyToaster.success(
      t("adminProfile.toast.statusUpdated", {
        status: t(`adminShared.status.${status}`),
      }),
    );
    setUser({ ...user, status });
  };

  const handleAction = (action) => {
    switch (action) {
      case "suspend":
        handleStatusChange("suspended");
        break;
      case "activate":
        handleStatusChange("active");
        break;
      case "delete":
        GooeyToaster.success(t("adminProfile.toast.deleted"));
        navigate("/admin/users");
        break;
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 bg-shell dark:bg-dark-shell">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-default dark:border-dark-default pb-3 gap-6 mb-8">
          <div className="flex items-start gap-4">
            <Avatar
              src={user.avatar}
              name={user.fullName}
              size="lg"
              className="ring-4 ring-accent/20 dark:ring-accent-dark/30 shrink-0"
            />
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-primary dark:text-dark-primary">
                  {user.fullName}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[user.status]}`}
                >
                  {user.status?.toUpperCase()}
                </span>
              </div>
              <p className="text-lg text-secondary dark:text-dark-secondary mb-1">
                {user.role}
              </p>
              <p className="text-sm text-muted dark:text-dark-muted">
                {user.bio || t("adminProfile.bioFallback")}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-auto">
            {isOwner ? (
              <Button variant="secondary">
                {t("adminProfile.actions.editProfile")}
              </Button>
            ) : (
              <>
                <DropdownMenuRoot>
                  <DropdownTrigger>{t("adminShared.labels.actions")}</DropdownTrigger>
                  <DropdownContent align="end">
                    <DropdownItem onClick={() => handleAction("activate")}>
                      {t("adminProfile.actions.activate")}
                    </DropdownItem>
                    <DropdownItem onClick={() => handleAction("suspend")}>
                      {t("adminProfile.actions.suspend")}
                    </DropdownItem>
                    <DropdownItem
                      variant="danger"
                      onClick={() => handleAction("delete")}
                    >
                      {t("adminProfile.actions.deleteUser")}
                    </DropdownItem>
                  </DropdownContent>
                </DropdownMenuRoot>
              </>
            )}
          </div>
        </div>

        {/* Stats & Contact */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Stats */}
          <div className="lg:col-span-2 border border-default dark:border-dark-default p-3 rounded-md ">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className=" p-6 rounded-md border border-default dark:border-dark-default  text-center">
                <div className="text-3xl font-bold text-primary dark:text-dark-primary mb-1">
                  {user.stats?.projects || 0}
                </div>
              <div className="text-xs text-muted dark:text-dark-muted uppercase tracking-wide font-medium">
                  {t("adminProfile.stats.projects")}
                </div>
              </div>
              <div className=" p-6 rounded-md border border-default dark:border-dark-default  text-center">
                <div className="text-3xl font-bold text-primary dark:text-dark-primary mb-1">
                  {user.stats?.students || 0}
                </div>
                <div className="text-xs text-muted dark:text-dark-muted uppercase tracking-wide font-medium">
                  {t("adminProfile.stats.students")}
                </div>
              </div>
              <div className=" p-6 rounded-md border border-default dark:border-dark-default  text-center">
                <div className="text-3xl font-bold text-primary dark:text-dark-primary mb-1">
                  {user.stats?.classes || 0}
                </div>
                <div className="text-xs text-muted dark:text-dark-muted uppercase tracking-wide font-medium">
                  {t("adminProfile.stats.classes")}
                </div>
              </div>
              <div className=" p-6 rounded-md border border-default dark:border-dark-default  text-center">
                <div className="text-3xl font-bold text-primary dark:text-dark-primary mb-1">
                  {user.stats?.groups || 0}
                </div>
                <div className="text-xs text-muted dark:text-dark-muted uppercase tracking-wide font-medium">
                  {t("adminProfile.stats.groups")}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className=" p-6 rounded-md border border-default dark:border-dark-default ">
            <h3 className="font-semibold text-primary dark:text-dark-primary mb-4 flex items-center gap-2">
              <Icon d={IC.contact} className="w-4 h-4 stroke-current" />
              {t("adminProfile.contact.title")}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-card-2 dark:bg-dark-card-2 rounded-lg">
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 2C0.447715 2 0 2.44772 0 3V12C0 12.5523 0.447715 13 1 13H14C14.5523 13 15 12.5523 15 12V3C15 2.44772 14.5523 2 14 2H1ZM1 3L14 3V3.92494C13.9174 3.92486 13.8338 3.94751 13.7589 3.99505L7.5 7.96703L1.24112 3.99505C1.16621 3.94751 1.0826 3.92486 1 3.92494V3ZM1 4.90797V12H14V4.90797L7.74112 8.87995C7.59394 8.97335 7.40606 8.97335 7.25888 8.87995L1 4.90797Z"
                    fill="currentColor"
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                  ></path>
                </svg>
                <div>
                  <div className="text-xs text-muted dark:text-dark-muted uppercase tracking-wide font-medium">
                    {t("adminProfile.contact.email")}
                  </div>
                  <a
                    href={`mailto:${user.email}`}
                    className="font-medium text-primary dark:text-dark-primary hover:text-accent dark:hover:text-accent-dark"
                  >
                    {user.email}
                  </a>
                </div>
              </div>
              {user.phone && (
                <div className="flex items-center gap-3 p-3 bg-card-2 dark:bg-dark-card-2 rounded-lg">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 15 15"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4 2.5C4 2.22386 4.22386 2 4.5 2H10.5C10.7761 2 11 2.22386 11 2.5V12.5C11 12.7761 10.7761 13 10.5 13H4.5C4.22386 13 4 12.7761 4 12.5V2.5ZM4.5 1C3.67157 1 3 1.67157 3 2.5V12.5C3 13.3284 3.67157 14 4.5 14H10.5C11.3284 14 12 13.3284 12 12.5V2.5C12 1.67157 11.3284 1 10.5 1H4.5ZM6 11.65C5.8067 11.65 5.65 11.8067 5.65 12C5.65 12.1933 5.8067 12.35 6 12.35H9C9.1933 12.35 9.35 12.1933 9.35 12C9.35 11.8067 9.1933 11.65 9 11.65H6Z"
                      fill="currentColor"
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                    ></path>
                  </svg>
                  <div>
                    <div className="text-xs text-muted dark:text-dark-muted uppercase tracking-wide font-medium">
                      {t("adminProfile.contact.phone")}
                    </div>
                    <a
                      href={`tel:${user.phone}`}
                      className="font-medium text-primary dark:text-dark-primary hover:text-accent dark:hover:text-accent-dark"
                    >
                      {user.phone}
                    </a>
                  </div>
                </div>
              )}
              {user.department && (
                <div className="flex items-center gap-3 p-3 bg-card-2 dark:bg-dark-card-2 rounded-lg">
                  <Icon
                    d={IC.company}
                    className="w-4 h-4 text-muted dark:text-dark-muted stroke-[1.75]"
                  />
                  <div>
                    <div className="text-xs text-muted dark:text-dark-muted uppercase tracking-wide font-medium">
                      {t("adminProfile.contact.department")}
                    </div>
                    <div className="font-medium text-primary dark:text-dark-primary">
                      {user.department}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Activity & Permissions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Activity */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Icon
                d={IC.zap}
                className="w-5 h-5 text-accent dark:text-accent-dark stroke-[2]"
              />
              <h3 className="text-xl font-bold text-primary dark:text-dark-primary">
                {t("adminProfile.activity.title")}
              </h3>
            </div>
            <div className="space-y-4">
              {user.activity?.map((item, index) => (
                <div
                  key={index}
                  className="flex gap-3 p-4  rounded-md border border-default dark:border-dark-default transition-all"
                >
                  <div className="w-2 h-2 mt-2 bg-accent dark:bg-accent-dark rounded-full shrink-0" />
                  <div>
                    <p className="font-medium text-primary dark:text-dark-primary text-sm">
                      {item.action}
                    </p>
                    <p className="text-xs text-muted dark:text-dark-muted mt-0.5">
                      {item.date}
                    </p>
                  </div>
                </div>
              )) || (
                <p className="text-sm text-muted dark:text-dark-muted p-4">
                  {t("adminProfile.activity.empty")}
                </p>
              )}
            </div>
          </div>

          {/* Permissions */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <Icon
                d={IC.settings}
                className="w-5 h-5 text-accent dark:text-accent-dark stroke-[2]"
              />
              <h3 className="text-xl font-bold text-primary dark:text-dark-primary">
                {t("adminProfile.permissions.title")}
              </h3>
            </div>
            <div className="space-y-2">
              {user.permissions?.map((permission, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3  rounded-md border border-default dark:border-dark-default"
                >
                  <div className="w-1.5 h-1.5 bg-success rounded-full" />
                  <span className="text-sm text-primary dark:text-dark-primary font-medium capitalize">
                    {permission.replace("_", " ")}
                  </span>
                </div>
              )) || (
                <p className="text-sm text-muted dark:text-dark-muted p-3">
                  {t("adminProfile.permissions.empty")}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Login History & More */}
        <div className="mt-12 pt-12 border-t border-default dark:border-dark-default">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-lg font-semibold text-primary dark:text-dark-primary mb-4">
                {t("adminProfile.history.title")}
              </h4>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between p-3  rounded-md border border-default dark:border-dark-default">
                  <span>
                    {t("adminProfile.history.lastLogin", {
                      value: user.lastLogin,
                    })}
                  </span>
                  <span className="px-2 py-0.5 bg-success/10 text-success text-xs rounded-full">
                    Kabul, AF
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 bg-card-2 dark:bg-dark-card-2 rounded-md border border-default dark:border-dark-default">
                  <span>Jan 20, 2024</span>
                  <span className="px-2 py-0.5 bg-warning/10 text-warning text-xs rounded-full">
                    Chrome • Windows
                  </span>
                </div>
                <div className="flex items-center justify-between p-3  rounded-md border border-default dark:border-dark-default">
                  <span>Jan 15, 2024</span>
                  <span className="px-2 py-0.5 bg-muted/20 text-muted text-xs rounded-full">
                    Safari • iOS
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-primary dark:text-dark-primary mb-4">
                {t("adminProfile.account.title")}
              </h4>
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-muted dark:text-dark-muted block text-xs uppercase tracking-wide font-medium mb-1">
                      {t("adminProfile.account.memberSince")}
                    </span>
                    <span className="font-medium">{user.registered}</span>
                  </div>
                  <div>
                    <span className="text-muted dark:text-dark-muted block text-xs uppercase tracking-wide font-medium mb-1">
                      {t("adminProfile.account.id")}
                    </span>
                    <span className="font-mono text-xs">{user.id}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
