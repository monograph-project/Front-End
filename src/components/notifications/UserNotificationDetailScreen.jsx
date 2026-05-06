import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { format, isValid, parseISO } from "date-fns";
import { useAuth } from "../../context/AuthContext";
import {
  useMarkNotificationRead,
  useNotification,
} from "../../services/useApi";
import Button from "../Button";
import IC from "../IC";
import Icon from "../Icon";
import StatusPill from "../StatusPill";
import {
  isNotificationIncoming,
  isNotificationUnread,
  notificationStatusVariant,
  notificationSubject,
} from "../../utils/notificationDisplay";
import {
  notificationChannelPillClasses,
  notificationChannelStripeClass,
  notificationTypePillClasses,
} from "../../utils/notificationVisuals";
import { resolveNotificationRecipientId } from "../../lib/notificationRecipientId";

function formatDetailDate(raw) {
  if (!raw) return "";
  try {
    const d =
      typeof raw === "string"
        ? parseISO(raw)
        : raw instanceof Date
          ? raw
          : null;
    if (!d || !isValid(d)) return "";
    return format(d, "PPpp");
  } catch {
    return "";
  }
}

/**
 * Single-message detail for the signed-in user's notification.
 * Redesigned with modern, refined luxury-minimalism aesthetic.
 * @param {string} basePath - inbox path for back navigation (no trailing slash)
 */
export default function UserNotificationDetailScreen({ basePath }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const notificationId = id != null ? String(id).trim() : "";
  const { user } = useAuth();
  const userId = resolveNotificationRecipientId(user);
  const queryClient = useQueryClient();
  const markedRef = useRef(false);

  const { data, isLoading, isError, error } = useNotification(notificationId, {
    enabled: Boolean(notificationId),
    notifyOnError: true,
  });

  const { mutate: markReadMutate } = useMarkNotificationRead({
    showErrorToast: false,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["notifications", "user", userId],
      });
      await queryClient.invalidateQueries({
        queryKey: ["notifications", "unread", userId],
      });
    },
  });

  useEffect(() => {
    markedRef.current = false;
  }, [notificationId]);

  useEffect(() => {
    if (!data || !notificationId || !isNotificationUnread(data)) return;
    if (markedRef.current) return;
    markedRef.current = true;
    markReadMutate(notificationId);
  }, [data, notificationId, markReadMutate]);

  const subject = notificationSubject(data ?? {});
  const body =
    data?.body ?? data?.message ?? data?.content ?? data?.description ?? "";
  const typeKey = String(data?.type ?? "custom")
    .toLowerCase()
    .replace(/-/g, "_");
  const typeLabel = i18n.exists(`adminShared.notificationType.${typeKey}`)
    ? t(`adminShared.notificationType.${typeKey}`)
    : String(data?.type ?? "—");
  const channelRaw =
    data?.channel != null ? String(data.channel).toUpperCase() : "";
  const channelKey = channelRaw.toLowerCase();
  const channelLabel = channelRaw
    ? i18n.exists(`adminShared.notificationChannel.${channelKey}`)
      ? t(`adminShared.notificationChannel.${channelKey}`)
      : channelRaw
    : "";
  const statusKey = String(data?.status ?? "")
    .toLowerCase()
    .replace(/-/g, "_");
  const statusDisplay =
    data?.status && i18n.exists(`adminShared.notificationStatus.${statusKey}`)
      ? t(`adminShared.notificationStatus.${statusKey}`)
      : data?.status != null
        ? String(data.status)
        : "";

  const incoming = isNotificationIncoming(data ?? {}, userId);
  const reference = data?.referenceId ?? data?.reference ?? "";

  const sentDisplay = formatDetailDate(
    data?.createdAt ?? data?.sentAt ?? data?.created_at,
  );

  const inboxPath = basePath.replace(/\/$/, "");

  if (!notificationId) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 bg-gradient-to-br from-light-app-bg via-white to-light-app-tertiary p-6 dark:from-dark-app-bg dark:via-dark-shell dark:to-dark-app-tertiary">
        <div className="animate-fade-in">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-light-app-tertiary dark:bg-dark-app-tertiary">
            <Icon
              d={IC.bell}
              className="h-8 w-8 text-light-text-muted dark:text-dark-text-muted"
            />
          </div>
          <p className="text-center text-sm font-medium text-light-text-muted dark:text-dark-text-muted">
            {t("notificationInbox.invalidId")}
          </p>
        </div>
        <Button variant="secondary" onClick={() => navigate(inboxPath)}>
          {t("notificationInbox.back")}
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-gradient-to-br from-light-app-bg via-white to-light-app-tertiary p-8 dark:from-dark-app-bg dark:via-dark-shell dark:to-dark-app-tertiary">
        <div className="flex flex-col items-center gap-3">
          <div className="relative h-10 w-10">
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-blue-500 border-r-blue-400 dark:border-t-blue-400 dark:border-r-blue-300" />
          </div>
          <p className="text-sm font-medium text-light-text-muted dark:text-dark-text-muted">
            {t("notificationInbox.loading")}
          </p>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-5 bg-gradient-to-br from-light-app-bg via-white to-light-app-tertiary p-6 dark:from-dark-app-bg dark:via-dark-shell dark:to-dark-app-tertiary">
        <div className="animate-fade-in">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-light-error-bg dark:bg-dark-error-bg">
            <Icon
              d={IC.bell}
              className="h-8 w-8 text-light-error-text dark:text-dark-error-text"
            />
          </div>
          <h2 className="mb-2 text-center text-lg font-semibold text-light-text-primary dark:text-dark-text-primary">
            {t("notificationInbox.notFound")}
          </h2>
          <p className="max-w-md text-center text-sm text-light-text-secondary dark:text-dark-text-secondary">
            {error?.message
              ? String(error.message)
              : t("notificationInbox.notFoundHint")}
          </p>
        </div>
        <Button variant="secondary" onClick={() => navigate(inboxPath)}>
          {t("notificationInbox.back")}
        </Button>
      </div>
    );
  }

  // Determine accent color based on channel
  const channelColorMap = {
    "IN-APP": "from-blue-500 to-blue-600",
    EMAIL: "from-purple-500 to-purple-600",
    PUSH: "from-emerald-500 to-emerald-600",
    SMS: "from-orange-500 to-orange-600",
  };
  const accentGradient =
    channelColorMap[channelRaw] || "from-slate-400 to-slate-500";

  return (
    <div className="flex w-full  flex-col gap-0 overflow-y-auto bg-gradient-to-br from-light-app-bg via-light-app-secondary to-white p-4 dark:from-dark-app-bg dark:via-dark-shell dark:to-dark-app-secondary md:p-6">
      {/* Header Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(inboxPath)}
          className="inline-flex w-fit items-center gap-2 rounded-xl border border-default bg-bg-shell px-3 py-2 text-xs font-semibold text-secondary transition-colors hover:bg-hover dark:border-dark-default dark:bg-dark-shell dark:text-dark-secondary dark:hover:bg-dark-hover"
        >
          <Icon d={IC.chevLeft} className="size-3.5 stroke-[2]" />
          {t("notificationInbox.back")}
        </button>
      </div>

      {/* Main Content Card with accent stripe */}
      <div className="animate-slide-up mx-auto w-full max-w-6xl">
        <article className="relative overflow-hidden rounded-2xl border border-light-card-border shadow-lg dark:border-dark-card-border dark:shadow-2xl">
          {/* Decorative gradient accent bar */}
          <div
            className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r ${accentGradient}`}
          />
          {/* Header Section */}
          <header className="relative bg-light-card-bg dark:bg-dark-card-bg px-6 py-8 md:px-8 md:py-10">
            {/* Subtle background pattern */}
            <div className="absolute inset-0 opacity-30 dark:opacity-10">
              <svg
                className="h-full w-full"
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <pattern
                    id="dot-pattern"
                    x="0"
                    y="0"
                    width="20"
                    height="20"
                    patternUnits="userSpaceOnUse"
                  >
                    <circle cx="10" cy="10" r="0.5" fill="currentColor" />
                  </pattern>
                </defs>
                <rect width="100" height="100" fill="url(#dot-pattern)" />
              </svg>
            </div>

            <div className="relative">
              {/* Type, Channel, Direction Pills */}
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span
                  className={[
                    "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all hover:shadow-sm",
                    notificationTypePillClasses(data?.type),
                  ].join(" ")}
                >
                  <span className="h-2 w-2 rounded-full opacity-60" />
                  {typeLabel}
                </span>
                {channelLabel ? (
                  <span
                    className={[
                      "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all hover:shadow-sm",
                      notificationChannelPillClasses(channelRaw),
                    ].join(" ")}
                  >
                    <span className="h-2 w-2 rounded-full opacity-60" />
                    {channelLabel}
                  </span>
                ) : null}
                <span
                  className={[
                    "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all hover:shadow-sm",
                    incoming
                      ? "border-emerald-300 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300"
                      : "border-slate-200 bg-slate-50 text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300",
                  ].join(" ")}
                >
                  <span
                    className={`h-2 w-2 rounded-full ${incoming ? "bg-emerald-500" : "bg-slate-400"}`}
                  />
                  {incoming
                    ? t("notificationInbox.directionToYou")
                    : t("notificationInbox.directionOtherRecipient")}
                </span>
                {data?.status ? (
                  <StatusPill
                    variant={notificationStatusVariant(data.status)}
                    dot={true}
                  >
                    {statusDisplay}
                  </StatusPill>
                ) : null}
              </div>

              {/* Subject/Title */}
              <div className="mb-6">
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-light-text-muted dark:text-dark-text-muted opacity-70">
                  {t("notificationInbox.messageLabel")}
                </p>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-light-text-primary dark:text-dark-text-primary leading-tight">
                  {subject || (
                    <span className="text-light-text-muted dark:text-dark-text-muted opacity-50">
                      {t("notificationInbox.noSubject")}
                    </span>
                  )}
                </h1>
              </div>

              {/* Metadata Grid */}
              {(sentDisplay || channelLabel || reference) && (
                <div className="grid gap-4 border-t border-light-card-border pt-6 dark:border-dark-card-border sm:grid-cols-3">
                  {sentDisplay ? (
                    <div>
                      <dt className="mb-1 text-xs font-semibold uppercase tracking-widest text-light-text-muted dark:text-dark-text-muted opacity-70">
                        {t("notificationInbox.received")}
                      </dt>
                      <dd className="font-medium text-light-text-primary dark:text-dark-text-primary">
                        {sentDisplay}
                      </dd>
                    </div>
                  ) : null}
                  {channelLabel ? (
                    <div>
                      <dt className="mb-1 text-xs font-semibold uppercase tracking-widest text-light-text-muted dark:text-dark-text-muted opacity-70">
                        {t("notificationInbox.channel")}
                      </dt>
                      <dd className="font-medium text-light-text-primary dark:text-dark-text-primary">
                        {channelLabel}
                      </dd>
                    </div>
                  ) : null}
                  {reference !== "" && reference != null ? (
                    <div className="sm:col-span-1">
                      <dt className="mb-1 text-xs font-semibold uppercase tracking-widest text-light-text-muted dark:text-dark-text-muted opacity-70">
                        {t("notificationInbox.reference")}
                      </dt>
                      <dd className="font-mono text-xs text-light-text-secondary dark:text-dark-text-secondary break-all">
                        {String(reference)}
                      </dd>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </header>
          {/* Body Section */}
          <div className="border-t border-light-card-border px-6 py-8 dark:border-dark-card-border md:px-8 md:py-10">
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-light-text-muted dark:text-dark-text-muted opacity-70">
              {t("notificationInbox.body")}
            </p>
            <div className="relative rounded-xl border border-light-card-border bg-light-app-secondary p-5 text-light-text-primary dark:border-dark-card-border dark:bg-dark-app-secondary dark:text-dark-text-primary">
              {/* Subtle corners accent */}
              <div className="absolute top-0 left-0 h-8 w-8 border-l-2 border-t-2 border-blue-200 rounded-tl-lg opacity-20 dark:border-blue-800" />
              <div className="absolute bottom-0 right-0 h-8 w-8 border-r-2 border-b-2 border-blue-200 rounded-br-lg opacity-20 dark:border-blue-800" />

              <p className="relative whitespace-pre-wrap text-sm leading-relaxed font-light">
                {body ? (
                  body
                ) : (
                  <span className="text-light-text-muted dark:text-dark-text-muted opacity-50">
                    {t("notificationInbox.noBody")}
                  </span>
                )}
              </p>
            </div>
          </div>
        </article>
      </div>

      {/* Footer Spacing */}
      <div className="mt-8" />
    </div>
  );
}
