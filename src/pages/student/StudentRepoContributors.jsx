import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Mail,
  Send,
  ShieldCheck,
  UserPlus,
  Users,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useOutletContext } from "react-router-dom";
import Avatar from "../../components/Avatar";
import Button from "../../components/Button";
import GlobalModal from "../../components/GlobalModal";
import SearchableSelect from "../../components/SearchableSelect";
import SettingsSectionCard from "../../components/SettingsSectionCard";
import { buildPersonInitials, resolveProfilePhotoUrl } from "../../lib/profileMedia";
import {
  useSessionProfile,
  useUserSearch,
  useVcInviteRepositoryCollaborator,
  useVcRepositoryInvitations,
  useVcRepository,
} from "../../services/useApi";

function normalizeList(raw) {
  if (Array.isArray(raw)) return raw;
  if (Array.isArray(raw?.content)) return raw.content;
  if (Array.isArray(raw?.data)) return raw.data;
  if (Array.isArray(raw?.items)) return raw.items;
  return [];
}

function collaboratorList(rawRepo, fallbackRepo) {
  const source =
    rawRepo?.collaborators ??
    rawRepo?.collaborator ??
    fallbackRepo?.collaborators ??
    fallbackRepo?.Collaborators ??
    [];
  if (Array.isArray(source)) return source;
  if (source && typeof source === "object") return Object.values(source);
  return [];
}

function displayName(entry) {
  if (!entry) return "—";
  if (typeof entry === "string") return entry;
  const full = [
    entry.first_name ?? entry.firstName,
    entry.last_name ?? entry.lastName,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
  return (
    full ||
    entry.displayName ||
    entry.username ||
    entry.userName ||
    entry.email ||
    String(entry.id ?? "—")
  );
}

function usernameOf(entry) {
  if (!entry || typeof entry !== "object") return "";
  return String(entry.username ?? entry.userName ?? "").trim();
}

function emailOf(entry) {
  if (!entry || typeof entry !== "object") return "";
  return String(entry.email ?? "").trim();
}

function roleLabel(entry) {
  if (!entry || typeof entry !== "object") return "Collaborator";
  const roles = Array.isArray(entry.roles)
    ? entry.roles
        .map((role) =>
          typeof role === "string"
            ? role
            : role?.name ?? role?.roleName ?? role?.authority ?? "",
        )
        .filter(Boolean)
    : [];
  if (roles.length) return roles[0];
  return entry.contributorRole ?? entry.role ?? entry.status ?? "Collaborator";
}

function formatInviteTime(raw, locale) {
  if (!raw) return "Just now";
  const value = new Date(raw);
  if (Number.isNaN(value.getTime())) return "Just now";
  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(value);
  } catch {
    return value.toISOString();
  }
}

function invitationRow(raw) {
  if (!raw || typeof raw !== "object") return null;
  return {
    id: String(raw.id ?? raw.invitationId ?? crypto.randomUUID()),
    invitedUser: String(raw.invited_user ?? raw.invitedUser ?? raw.guest ?? "—"),
    status: String(raw.status ?? "PENDING"),
    createdAt: String(raw.created_at ?? raw.createdAt ?? ""),
    role: String(raw.role ?? "Collaborator"),
  };
}

export default function StudentRepoContributors() {
  const { t, i18n } = useTranslation();
  const locale = i18n.language || undefined;
  const { owner, repo, repositoryMeta } = useOutletContext() ?? {};
  const queryClient = useQueryClient();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteSearchOpen, setInviteSearchOpen] = useState(false);
  const [inviteQuery, setInviteQuery] = useState("");
  const [selectedInvitee, setSelectedInvitee] = useState("");

  const { data: sessionUser } = useSessionProfile({
    notifyOnError: false,
  });
  const { data: fresh } = useVcRepository(owner, repo, {
    notifyOnError: false,
    enabled: Boolean(owner && repo),
    refetchInterval: 15000,
  });
  const invitationsQ = useVcRepositoryInvitations(owner, repo, {
    notifyOnError: false,
    enabled: Boolean(owner && repo),
    refetchInterval: 10000,
  });
  const searchQ = useUserSearch(inviteQuery, {
    notifyOnError: false,
    enabled: inviteOpen && inviteQuery.trim().length > 0,
  });
  const inviteMutation = useVcInviteRepositoryCollaborator({
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["vc", "repos", owner, repo, "invitations"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["vc", "repos", owner, repo],
      });
      setSelectedInvitee("");
      setInviteQuery("");
      setInviteSearchOpen(false);
      setInviteOpen(false);
    },
  });

  const collaborators = useMemo(
    () => collaboratorList(repositoryMeta, fresh),
    [fresh, repositoryMeta],
  );

  const canManage = useMemo(() => {
    const sessionUsername = String(
      sessionUser?.username ?? sessionUser?.preferred_username ?? "",
    ).trim();
    const ownerId = String(
      repositoryMeta?.ownerUserId ?? fresh?.ownerUserId ?? "",
    ).trim();
    const sessionId = String(sessionUser?.id ?? "").trim();
    return Boolean(
      (sessionUsername && owner && sessionUsername === owner) ||
        (ownerId && sessionId && ownerId === sessionId),
    );
  }, [fresh?.ownerUserId, owner, repositoryMeta?.ownerUserId, sessionUser?.id, sessionUser?.preferred_username, sessionUser?.username]);

  const collaboratorCards = useMemo(
    () =>
      collaborators.map((entry, index) => ({
        key: String(entry?.id ?? usernameOf(entry) ?? index),
        name: displayName(entry),
        username: usernameOf(entry),
        email: emailOf(entry),
        role: roleLabel(entry),
        avatarUrl: resolveProfilePhotoUrl(entry),
        initials: buildPersonInitials(entry),
      })),
    [collaborators],
  );

  const existingUsernames = useMemo(
    () => new Set(collaboratorCards.map((row) => row.username).filter(Boolean)),
    [collaboratorCards],
  );

  const searchOptions = useMemo(() => {
    return normalizeList(searchQ.data)
      .map((user) => {
        const username = usernameOf(user);
        const id = String(user?.id ?? "").trim();
        const inviteKey = id;
        const email = emailOf(user);
        const label = displayName(user);
        const description = [username ? `@${username}` : "", email]
          .filter(Boolean)
          .join(" • ");
        if (!inviteKey) return null;
        return {
          value: inviteKey,
          label,
          description: description || id,
          username,
          email,
          searchText: [label, username, email, id].filter(Boolean).join(" "),
          avatarUrl: resolveProfilePhotoUrl(user),
          initials: buildPersonInitials(user),
        };
      })
      .filter(Boolean)
      .filter((option) => {
        const sessionId = String(sessionUser?.id ?? "").trim();
        const ownerId = String(
          repositoryMeta?.ownerUserId ?? fresh?.ownerUserId ?? "",
        ).trim();
        return option.value !== sessionId && option.value !== ownerId;
      })
      .filter((option) => !existingUsernames.has(option.username));
  }, [
    existingUsernames,
    fresh?.ownerUserId,
    repositoryMeta?.ownerUserId,
    searchQ.data,
    sessionUser?.id,
  ]);

  const selectedInviteeOption =
    searchOptions.find((option) => option.value === selectedInvitee) ?? null;

  const invitationRows = useMemo(
    () =>
      normalizeList(invitationsQ.data)
        .map(invitationRow)
        .filter(Boolean),
    [invitationsQ.data],
  );

  const totalInvites = invitationRows.filter(
    (row) => row.status.toUpperCase() === "PENDING",
  ).length;

  useEffect(() => {
    if (!inviteOpen) {
      setInviteSearchOpen(false);
    }
  }, [inviteOpen]);

  async function submitInvite() {
    if (!selectedInvitee || !owner || !repo) return;
    await inviteMutation.mutateAsync({
      owner,
      repo,
      guest: selectedInvitee,
    });
  }

  return (
    <div className="space-y-5">
      <SettingsSectionCard
        title={t("studentRepo.contributors.title")}
        description={t("studentRepo.contributors.subtitle")}
        icon={Users}
        action={
          canManage ? (
            <Button
              type="button"
              icon={<UserPlus className="h-4 w-4" strokeWidth={1.8} />}
              onClick={() => {
                setInviteOpen(true);
                setInviteSearchOpen(true);
              }}
            >
              Invite collaborator
            </Button>
          ) : null
        }
      >
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-(--color-light-card-border) bg-light-app-tertiary px-4 py-3 dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted dark:text-dark-muted">
              Collaborators
            </p>
            <p className="mt-2 text-2xl font-bold text-primary dark:text-dark-primary">
              {collaboratorCards.length}
            </p>
          </div>
          <div className="rounded-xl border border-(--color-light-card-border) bg-light-app-tertiary px-4 py-3 dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted dark:text-dark-muted">
              Pending invites
            </p>
            <p className="mt-2 text-2xl font-bold text-primary dark:text-dark-primary">
              {totalInvites}
            </p>
          </div>
          <div className="rounded-xl border border-(--color-light-card-border) bg-light-app-tertiary px-4 py-3 dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted dark:text-dark-muted">
              Access
            </p>
            <div className="mt-2 inline-flex items-center gap-2 rounded-full border border-(--color-light-card-border) bg-(--color-light-card-bg) px-2.5 py-1 text-xs font-medium text-secondary dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg) dark:text-dark-secondary">
              <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.8} />
              {canManage ? "Can manage invitations" : "View only"}
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {!collaboratorCards.length ? (
            <p className="text-sm text-muted dark:text-dark-muted">
              {t("studentRepo.contributors.empty")}
            </p>
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {collaboratorCards.map((person) => (
                <article
                  key={person.key}
                  className="rounded-xl border border-(--color-light-card-border) bg-light-app-tertiary px-4 py-3 dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary"
                >
                  <div className="flex items-start gap-3">
                    <Avatar
                      src={person.avatarUrl}
                      alt={person.name}
                      initials={person.initials}
                      className="rounded-full border border-(--color-light-card-border) dark:border-(--color-dark-card-border)"
                      sizeClass="inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-full"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate text-sm font-semibold text-primary dark:text-dark-primary">
                          {person.name}
                        </p>
                        <span className="rounded-full border border-(--color-light-card-border) px-2 py-0.5 text-[10px] font-semibold uppercase text-secondary dark:border-(--color-dark-card-border) dark:text-dark-secondary">
                          {person.role}
                        </span>
                      </div>
                      {person.username ? (
                        <p className="mt-1 text-xs font-mono text-muted dark:text-dark-muted">
                          @{person.username}
                        </p>
                      ) : null}
                      {person.email ? (
                        <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-secondary dark:text-dark-secondary">
                          <Mail className="h-3.5 w-3.5 text-muted dark:text-dark-muted" strokeWidth={1.8} />
                          <span className="truncate">{person.email}</span>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}

          {invitationRows.length ? (
            <section className="rounded-xl border border-(--color-light-card-border) bg-(--color-light-card-bg) dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)">
              <div className="border-b border-(--color-light-card-border) px-4 py-3 dark:border-(--color-dark-card-border)">
                <p className="text-sm font-semibold text-primary dark:text-dark-primary">
                  Recent invitations
                </p>
              </div>
              <div className="space-y-2 p-4">
                {invitationRows.map((invite) => (
                  <div
                    key={invite.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-(--color-light-card-border) bg-light-app-tertiary px-3 py-3 dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-primary dark:text-dark-primary">
                        {invite.invitedUser}
                      </p>
                      <p className="mt-1 text-xs text-muted dark:text-dark-muted">
                        Sent {formatInviteTime(invite.createdAt, locale)}
                      </p>
                    </div>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${
                      invite.status === "ACCEPTED"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/12 dark:text-emerald-300"
                        : invite.status === "REJECTED"
                          ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/12 dark:text-rose-300"
                          : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/12 dark:text-amber-300"
                    }`}>
                      {invite.status}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      </SettingsSectionCard>

      <GlobalModal
        variant="sheet"
        open={inviteOpen}
        setOpen={setInviteOpen}
        title="Invite collaborator"
        subtitle="Search for a user, preview the selection, and send a repository invitation."
        isClose
        footer={
          <>
            <Button
              type="button"
              variant="tertiary"
              onClick={() => {
                setInviteSearchOpen(false);
                setInviteOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              type="button"
              icon={<Send className="h-4 w-4" strokeWidth={1.8} />}
              disabled={!selectedInvitee || inviteMutation.isPending}
              loading={inviteMutation.isPending}
              onClick={submitInvite}
            >
              Send invitation
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted dark:text-dark-muted">
              Find user
            </p>
            <SearchableSelect
              open={inviteSearchOpen}
              onOpenChange={setInviteSearchOpen}
              value={selectedInvitee}
              onValueChange={setSelectedInvitee}
              closeOnSelect={false}
              options={searchOptions}
              placeholder="Search by name, username, or email"
              searchPlaceholder="Type to search users"
              searchValue={inviteQuery}
              onSearchChange={(nextValue) => {
                setInviteQuery(nextValue);
                if (selectedInvitee) {
                  setSelectedInvitee("");
                }
              }}
              loading={searchQ.isFetching}
              clearable
              clearSearchOnOpen={false}
              className="min-h-8 bg-(--color-light-card-bg) dark:bg-(--color-dark-card-bg)"
              contentClassName="z-[1105]"
              renderOption={(option) => (
                <div className="flex min-w-0 items-start gap-3">
                  <Avatar
                    src={option.avatarUrl}
                    alt={option.label}
                    initials={option.initials}
                    className="rounded-full border border-(--color-light-card-border) dark:border-(--color-dark-card-border)"
                    sizeClass="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-primary dark:text-dark-primary">
                      {option.label}
                    </div>
                    <div className="truncate text-xs text-muted dark:text-dark-muted">
                      {option.username ? `@${option.username}` : option.value}
                    </div>
                    <div className="truncate text-xs text-muted dark:text-dark-muted">
                      {option.email || option.description}
                    </div>
                  </div>
                </div>
              )}
            />
            <p className="mt-2 text-[11px] text-muted dark:text-dark-muted">
              Searches one backend term across name, username, and email. Existing collaborators are filtered out automatically.
            </p>
          </div>

          <div className="rounded-xl border border-(--color-light-card-border) bg-light-app-tertiary p-4 dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted dark:text-dark-muted">
              Invitation preview
            </p>
            {selectedInviteeOption ? (
              <div className="mt-3 flex items-start gap-3 rounded-xl border border-(--color-light-card-border) bg-(--color-light-card-bg) px-3 py-3 dark:border-(--color-dark-card-border) dark:bg-(--color-dark-card-bg)">
                <Avatar
                  src={selectedInviteeOption.avatarUrl}
                  alt={selectedInviteeOption.label}
                  initials={selectedInviteeOption.initials}
                  className="rounded-full border border-(--color-light-card-border) dark:border-(--color-dark-card-border)"
                  sizeClass="inline-flex h-11 w-11 items-center justify-center overflow-hidden rounded-full"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-primary dark:text-dark-primary">
                    {selectedInviteeOption.label}
                  </p>
                  <p className="mt-1 text-xs text-muted dark:text-dark-muted">
                    {selectedInviteeOption.description || selectedInviteeOption.value}
                  </p>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-muted dark:text-dark-muted">
                Select a user to preview the invitation.
              </p>
            )}
          </div>
        </div>
      </GlobalModal>
    </div>
  );
}
