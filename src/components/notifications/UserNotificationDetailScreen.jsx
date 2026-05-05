import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { format, isValid, parseISO } from "date-fns";
import { useAuth } from "../../context/AuthContext";
import { useMarkNotificationRead, useNotification } from "../../services/useApi";
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
 * Single-message detail for the signed-in user’s notification.
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
    data?.body ??
    data?.message ??
    data?.content ??
    data?.description ??
    "";
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
    data?.status &&
    i18n.exists(`adminShared.notificationStatus.${statusKey}`)
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
      <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-light-app-bg p-6 dark:bg-dark-shell">
        <p className="text-sm text-(--color-light-text-muted) dark:text-dark-text-muted">
          {t("notificationInbox.invalidId")}
        </p>
        <Button variant="secondary" onClick={() => navigate(inboxPath)}>
          {t("notificationInbox.back")}
        </Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-light-app-bg p-8 dark:bg-dark-shell">
        <div className="flex items-center gap-2 text-sm text-(--color-light-text-muted) dark:text-dark-text-muted">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
          {t("notificationInbox.loading")}
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 bg-light-app-bg p-6 text-center dark:bg-dark-shell">
        <Icon
          d={IC.bell}
          className="mx-auto size-12 text-(--color-light-text-muted) dark:text-dark-text-muted"
        />
        <h2 className="text-lg font-semibold text-primary dark:text-dark-primary">
          {t("notificationInbox.notFound")}
        </h2>
        <p className="max-w-md text-sm text-(--color-light-text-muted) dark:text-dark-text-muted">
          {error?.message ? String(error.message) : t("notificationInbox.notFoundHint")}
        </p>
        <Button variant="secondary" onClick={() => navigate(inboxPath)}>
          {t("notificationInbox.back")}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-y-auto bg-light-app-bg p-4 md:p-5 dark:bg-dark-shell">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="tertiary"
          icon={<Icon d={IC.chevLeft} className="size-4 stroke-2" />}
          onClick={() => navigate(inboxPath)}
        >
          {t("notificationInbox.back")}
        </Button>
      </div>

      <article
        className={[
          "mx-auto w-full max-w-3xl overflow-hidden rounded-2xl border border-(--color-light-card-border) border-l-4 bg-(--color-light-card-bg) shadow-md dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg) dark:shadow-black/25",
          notificationChannelStripeClass(channelRaw),
        ].join(" ")}
      >
        <header className="border-b border-light-divider px-5 py-4 dark:border-dark-divider md:px-6 md:py-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-(--color-light-text-muted) dark:text-dark-text-muted">
                {t("notificationInbox.messageLabel")}
              </p>
              <h1 className="mt-1 text-lg font-bold leading-snug text-(--color-light-text-primary) dark:text-(--color-dark-text-primary) md:text-xl">
                {subject || t("notificationInbox.noSubject")}
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span
                  className={[
                    "rounded-full border px-2.5 py-0.5 text-[10px] font-semibold",
                    notificationTypePillClasses(data?.type),
                  ].join(" ")}
                >
                  {typeLabel}
                </span>
                {channelLabel ? (
                  <span
                    className={[
                      "rounded-full border px-2.5 py-0.5 text-[10px] font-semibold",
                      notificationChannelPillClasses(channelRaw),
                    ].join(" ")}
                  >
                    {channelLabel}
                  </span>
                ) : null}
                <span
                  className={[
                    "rounded-full border px-2.5 py-0.5 text-[10px] font-semibold",
                    incoming
                      ? "border-(--color-light-success-border) bg-(--color-light-success-bg) text-(--color-light-success-text) dark:border-(--color-dark-success-border) dark:bg-(--color-dark-success-bg) dark:text-(--color-dark-success-text)"
                      : "border-(--color-light-card-border) bg-(--color-light-app-secondary) text-(--color-light-text-secondary) dark:border-(--color-dark-card-border) dark:bg-(--color-dark-app-secondary) dark:text-(--color-dark-text-secondary)",
                  ].join(" ")}
                >
                  {incoming
                    ? t("notificationInbox.directionToYou")
                    : t("notificationInbox.directionOtherRecipient")}
                </span>
                {data?.status ? (
                  <StatusPill
                    variant={notificationStatusVariant(data.status)}
                    dot={false}
                  >
                    {statusDisplay}
                  </StatusPill>
                ) : null}
              </div>
            </div>
          </div>
          <dl className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
            {sentDisplay ? (
              <div className="flex gap-2">
                <dt className="shrink-0 text-(--color-light-text-muted) dark:text-dark-text-muted">
                  {t("notificationInbox.received")}
                </dt>
                <dd className="font-medium text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
                  {sentDisplay}
                </dd>
              </div>
            ) : null}
            {channelLabel ? (
              <div className="flex gap-2">
                <dt className="shrink-0 text-(--color-light-text-muted) dark:text-dark-text-muted">
                  {t("notificationInbox.channel")}
                </dt>
                <dd className="font-medium text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
                  {channelLabel}
                </dd>
              </div>
            ) : null}
            {reference !== "" && reference != null ? (
              <div className="flex gap-2 sm:col-span-2">
                <dt className="shrink-0 text-(--color-light-text-muted) dark:text-dark-text-muted">
                  {t("notificationInbox.reference")}
                </dt>
                <dd className="min-w-0 break-all font-mono text-[11px] text-(--color-light-text-secondary) dark:text-(--color-dark-text-secondary)">
                  {String(reference)}
                </dd>
              </div>
            ) : null}
          </dl>
        </header>

        <div className="px-5 py-5 md:px-6 md:py-6">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-(--color-light-text-muted) dark:text-dark-text-muted">
            {t("notificationInbox.body")}
          </p>
          <div className="mt-3 rounded-xl border border-(--color-light-card-border) bg-light-app-secondary px-4 py-4 text-sm leading-relaxed text-(--color-light-text-primary) whitespace-pre-wrap dark:border-(--color-dark-card-border) dark:bg-dark-app-secondary dark:text-(--color-dark-text-primary)">
            {body ? body : t("notificationInbox.noBody")}
          </div>
        </div>
      </article>
    </div>
  );
}
