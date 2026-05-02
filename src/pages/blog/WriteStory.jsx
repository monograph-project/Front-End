import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { gooeyToast } from "goey-toast";
import { Link, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import {
  Bell,
  Eye,
  Image as ImageIcon,
  MoreHorizontal,
  Play,
  Search,
  X,
} from "lucide-react";
import Select from "../../components/Select";
import {
  DropdownContent,
  DropdownItem,
  DropdownMenuRoot,
  DropdownSeparator,
  DropdownTrigger,
} from "../../components/DropdownMenu";
import { useAuth } from "../../context/AuthContext";
import { htmlToArticleBlocks } from "../../lib/htmlToArticleBlocks";
import {
  useCreateArticle,
  useCreateArticleWithFiles,
  useCreateDraftArticle,
} from "../../services/useApi";

const STORAGE_KEY = "draft_story_v2";

/** Medium-style editor chrome */
const M = {
  green: "#1a8917",
  greenMuted: "rgba(26, 137, 23, 0.45)",
};

function insertAtCaret(editorEl, node) {
  if (!editorEl) return;
  editorEl.focus();
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) {
    editorEl.appendChild(node);
    return;
  }
  const range = sel.getRangeAt(0);
  let anchor = range.commonAncestorContainer;
  if (anchor.nodeType !== Node.ELEMENT_NODE && anchor.parentElement) {
    anchor = anchor.parentElement;
  }
  const inside =
    anchor instanceof Element && editorEl.contains(anchor);
  if (!inside) {
    editorEl.appendChild(node);
    return;
  }
  range.deleteContents();
  range.insertNode(node);
  range.setStartAfter(node);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
}

function IconPlus() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function IconEmbed() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.85}
    >
      <path d="M10 19H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M14 5h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
    </svg>
  );
}

function IconBraces() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.85}
    >
      <path d="M8 8l-4 4 4 4M16 8l4 4-4 4M14 4l-4 16" />
    </svg>
  );
}

function IconDividerDots() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-[18px]"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
    >
      <circle cx="5" cy="12" r="1.25" />
      <circle cx="12" cy="12" r="1.25" />
      <circle cx="19" cy="12" r="1.25" />
    </svg>
  );
}

function ToolChip({ title: label, children, onClick }) {
  return (
    <button
      type="button"
      title={label}
      onClick={onClick}
      className="flex size-9 shrink-0 items-center justify-center rounded-full border bg-white text-[#1a8917] transition-colors hover:bg-[rgba(26,137,23,0.06)] dark:border-[rgba(74,222,128,0.35)] dark:bg-zinc-900 dark:text-green-400 dark:hover:bg-green-950/40"
      style={{ borderColor: M.greenMuted }}
    >
      {children}
    </button>
  );
}

function mapAudienceToVisibility(v) {
  if (v === "unlisted") return "UNLISTED";
  if (v === "members") return "MEMBERS_ONLY";
  return "PUBLIC";
}

export default function WriteStory() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const userInitial =
    (
      user?.first_name?.[0] ||
      user?.last_name?.[0] ||
      user?.user_name?.[0] ||
      user?.email?.[0] ||
      "U"
    ).toUpperCase();

  const initialDraft = useMemo(() => {
    const defaults = {
      title: "",
      subtitle: "",
      tags: "",
      visibility: "public",
      cover: null,
      body: "",
      restoredAt: null,
    };

    try {
      if (typeof window === "undefined") return defaults;
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaults;

      const data = JSON.parse(raw);
      return {
        title: data.title || "",
        subtitle: data.subtitle || "",
        tags: (data.tags || []).join(", "),
        visibility: data.visibility || "public",
        cover: data.cover || null,
        body: data.body || "",
        restoredAt:
          typeof data.lastSaved === "number" ? data.lastSaved : null,
      };
    } catch {
      return defaults;
    }
  }, []);

  const [title, setTitle] = useState(initialDraft.title);
  const [subtitle, setSubtitle] = useState(initialDraft.subtitle);
  const [tags, setTags] = useState(initialDraft.tags);
  const [visibility, setVisibility] = useState(initialDraft.visibility);
  /** Data URL preview (local autosave); optional uploaded file below. */
  const [cover, setCover] = useState(initialDraft.cover);
  const [coverFile, setCoverFile] = useState(null);
  const [contentKind, setContentKind] = useState("WEBLOG");
  const [savedNote, setSavedNote] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHTML, setPreviewHTML] = useState("");
  const [isBodyEmpty, setIsBodyEmpty] = useState(
    !(initialDraft.body || "").trim(),
  );
  const [toolbarOpen, setToolbarOpen] = useState(false);

  const editorRef = useRef(null);
  const titleRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  const createJson = useCreateArticle({
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      const nextId = data?.id ?? data?.articleId;
      if (nextId) navigate(`/story/${nextId}`);
    },
    showSuccessToast: true,
    toastSuccess: t("writerStory.success.published"),
  });

  const createMultipart = useCreateArticleWithFiles({
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      const nextId = data?.id ?? data?.articleId;
      if (nextId) navigate(`/story/${nextId}`);
    },
    showSuccessToast: true,
    toastSuccess: t("writerStory.success.published"),
  });

  const saveDraft = useCreateDraftArticle({
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      const nextId = data?.id ?? data?.articleId;
      if (nextId) {
        gooeyToast.success(t("writerStory.success.draftWithId", { id: nextId }));
      }
    },
    showSuccessToast: false,
  });

  const submitBusy =
    createJson.isPending || createMultipart.isPending || saveDraft.isPending;

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!initialDraft.restoredAt) return;
    setSavedNote(
      t("writerStory.autosave.restoredAt", {
        time: new Date(initialDraft.restoredAt).toLocaleString(),
      }),
    );
    const tid = window.setTimeout(() => setSavedNote(""), 5200);
    return () => window.clearTimeout(tid);
  }, [initialDraft.restoredAt, t]);

  useEffect(() => {
    if (!editorRef.current) return;
    editorRef.current.innerHTML = initialDraft.body || "";
  }, [initialDraft.body]);

  const autosave = useCallback(() => {
    const payload = {
      title,
      subtitle,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      visibility,
      cover,
      body: editorRef.current?.innerHTML || "",
      lastSaved: Date.now(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setSavedNote(t("writerStory.autosave.localSaved"));

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      setSavedNote("");
    }, 2000);
  }, [cover, subtitle, tags, title, visibility, t]);

  useEffect(() => {
    const intervalId = setInterval(autosave, 5000);
    return () => {
      clearInterval(intervalId);
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [autosave]);

  const exec = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const appendOrInsert = useCallback((el) => {
    const ed = editorRef.current;
    if (!ed) return;
    insertAtCaret(ed, el);
    autosave();
  }, [autosave]);

  const insertImageFile = useCallback(
    (file) => {
      if (!file || !file.type.startsWith("image/")) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const wrapper = document.createElement("figure");
        wrapper.className =
          "my-8 flex flex-col items-center text-center max-w-full";

        const img = document.createElement("img");
        img.src = event.target?.result || "";
        img.alt = file.name || "Story image";
        img.className =
          "mx-auto max-h-[min(70vh,520px)] max-w-full rounded-sm object-contain";

        wrapper.appendChild(img);
        appendOrInsert(wrapper);
      };
      reader.readAsDataURL(file);
    },
    [appendOrInsert],
  );

  const handleDrop = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files || []);
    files.forEach(insertImageFile);
  };

  const handlePaste = (event) => {
    const items = Array.from(event.clipboardData?.items || []);
    const imageItem = items.find((item) => item.type?.startsWith("image/"));
    if (!imageItem) return;

    const file = imageItem.getAsFile();
    insertImageFile(file);
    event.preventDefault();
  };

  const handleInsert = useCallback(
    (type) => {
      const ed = editorRef.current;

      if (type === "divider") {
        const divider = document.createElement("hr");
        divider.className =
          "my-10 border-0 border-t border-neutral-200 dark:border-neutral-700";
        appendOrInsert(divider);
        return;
      }

      if (type === "image" || type === "gallery") {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.multiple = type === "gallery";
        input.onchange = (event) => {
          const files = Array.from(event.target.files || []);
          files.forEach(insertImageFile);
        };
        input.click();
        return;
      }

      if (type === "stock") {
        const term =
          typeof window !== "undefined"
            ? window.prompt("Stock image keyword (demo uses placeholder):", "")
            : "";
        if (!term?.trim()) return;
        const seed = encodeURIComponent(term.trim().slice(0, 40));
        const wrapper = document.createElement("figure");
        wrapper.className = "my-8 flex flex-col items-center max-w-full";
        const img = document.createElement("img");
        img.src = `https://picsum.photos/seed/${seed}/920/560`;
        img.alt = term;
        img.loading = "lazy";
        img.className =
          "mx-auto max-h-[min(70vh,520px)] max-w-full rounded-sm object-cover";
        wrapper.appendChild(img);
        const cap = document.createElement("figcaption");
        cap.className =
          "mt-2 font-blog-serif text-sm text-muted dark:text-dark-muted";
        cap.textContent = `Photo · ${term.trim()}`;
        wrapper.appendChild(cap);
        appendOrInsert(wrapper);
        return;
      }

      if (type === "video") {
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "video/*";
        input.onchange = (event) => {
          const file = event.target.files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
              const video = document.createElement("video");
              video.src = loadEvent.target?.result || "";
              video.controls = true;
              video.className =
                "mx-auto my-8 max-h-[420px] w-full max-w-full rounded-sm border border-neutral-200 object-contain dark:border-neutral-700";
              appendOrInsert(video);
            };
            reader.readAsDataURL(file);
          }
        };
        input.click();
        return;
      }

      if (type === "embed") {
        const url =
          typeof window !== "undefined"
            ? window.prompt(
                "Embed URL (many sites allow iframe previews):",
                "https://",
              )
            : "";
        if (!url?.trim()) return;
        const embed = document.createElement("div");
        embed.className = "my-8 w-full overflow-hidden rounded-sm bg-neutral-50 dark:bg-zinc-900";
        embed.innerHTML = `<iframe src="${encodeURI(url.trim())}" class="aspect-video min-h-[240px] w-full" title="Embedded content" referrerpolicy="no-referrer" loading="lazy" />`;
        appendOrInsert(embed);
        return;
      }

      if (type === "code") {
        ed?.focus();
        exec("formatBlock", "PRE");
        return;
      }

      if (type === "quote") {
        ed?.focus();
        exec("formatBlock", "BLOCKQUOTE");
      }
    },
    [appendOrInsert, exec, insertImageFile],
  );

  const handleCover = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setCoverFile(file);

    const reader = new FileReader();
    reader.onload = (loadEvent) => setCover(loadEvent.target?.result || null);
    reader.readAsDataURL(file);
  };

  const canPublish =
    Boolean(title.trim()) &&
    !isBodyEmpty &&
    Boolean((editorRef.current?.innerText || "").trim()) &&
    Boolean(user?.id);

  const buildArticlePayload = () => {
    const tagsArr = tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    let blocks = htmlToArticleBlocks(editorRef.current);
    if (!blocks.length) {
      blocks = [
        {
          type: "TEXT",
          order: 0,
          data: { text: (editorRef.current?.innerText || "").trim() || " " },
        },
      ];
    }
    const subtitleStr = subtitle.trim();
    const desc = subtitleStr || (tagsArr.length ? tagsArr.join(", ") : undefined);
    return {
      title: title.trim(),
      subtitle: subtitleStr || undefined,
      description: desc,
      blocks,
      tags: tagsArr.length ? tagsArr : [],
      keywords: tagsArr.length ? tagsArr : undefined,
      visibility: mapAudienceToVisibility(visibility),
      contentType: contentKind === "MONOGRAPH" ? "MONOGRAPH" : "WEBLOG",
      coverImageUrl:
        typeof cover === "string" && cover.startsWith("http") ? cover : undefined,
    };
  };

  const handlePublish = () => {
    if (!user?.id) {
      gooeyToast.error(t("writerStory.error.signInRequired"));
      return;
    }
    autosave();

    const base = buildArticlePayload();

    if (coverFile instanceof File) {
      const fd = new FormData();
      fd.append("title", base.title);
      if (base.description != null && base.description !== "")
        fd.append("description", String(base.description));
      fd.append("blocks", JSON.stringify(base.blocks ?? []));
      fd.append(
        "tags",
        Array.isArray(base.tags) ? base.tags.join(",") : String(base.tags ?? ""),
      );
      fd.append("visibility", String(base.visibility ?? "PUBLIC"));
      fd.append(
        "contentType",
        base.contentType === "MONOGRAPH" ? "MONOGRAPH" : "WEBLOG",
      );
      if (base.subtitle) fd.append("subtitle", base.subtitle);
      fd.append("coverImage", coverFile);
      createMultipart.mutate({
        authorUserId: user.id,
        formData: fd,
      });
      return;
    }

    createJson.mutate({ userId: user.id, ...base });
  };

  const handleSaveDraft = () => {
    if (!user?.id) {
      gooeyToast.error(t("writerStory.error.signInRequired"));
      return;
    }
    if (!title.trim()) {
      gooeyToast.error(t("writerStory.error.titleRequired"));
      return;
    }

    autosave();

    const base = buildArticlePayload();

    if (coverFile instanceof File) {
      gooeyToast.success(t("writerStory.warning.draftCoverDeferred"));
    }

    saveDraft.mutate({ userId: user.id, ...base });
  };

  const handlePreview = () => {
    autosave();
    setPreviewHTML(editorRef.current?.innerHTML || "");
    setPreviewOpen(true);
  };

  const closeToolbarAnd = (fn) => {
    fn();
    setToolbarOpen(false);
  };

  return (
    <div className="min-h-full bg-white pb-28 text-neutral-900 dark:bg-zinc-950 dark:text-neutral-50">
      <header
        className="sticky top-0 z-20 flex h-[52px] items-center justify-between gap-4 border-b border-neutral-200/90 bg-white/90 px-4 backdrop-blur-md dark:border-neutral-800 dark:bg-zinc-950/90 sm:px-6"
      >
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to="/"
            className="font-blog-display truncate text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50"
          >
            Campus
          </Link>
          <span className="hidden text-sm text-neutral-400 sm:inline dark:text-neutral-500">
            {t("writerStory.meta.draft")}
          </span>
          {savedNote ? (
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
              {savedNote}
            </span>
          ) : null}
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <button
            type="button"
            disabled={!canPublish || submitBusy}
            onClick={handlePublish}
            className="rounded-full px-4 py-1.5 text-sm font-medium text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-35"
            style={{ backgroundColor: M.green }}
          >
            {submitBusy && (createJson.isPending || createMultipart.isPending)
              ? t("writerStory.publishing")
              : t("writerStory.publish")}
          </button>

          <DropdownMenuRoot modal={false}>
            <DropdownTrigger
              compactIcon
              showArrow={false}
              className="!size-9 rounded-full border-0 bg-transparent hover:bg-neutral-100 dark:hover:bg-zinc-800"
              aria-label={t("writerStory.menu.more")}
            >
              <MoreHorizontal className="size-[18px] text-neutral-600 dark:text-neutral-400" />
            </DropdownTrigger>
            <DropdownContent align="end" className="min-w-[220px]">
              <DropdownItem
                icon={<Eye className="size-4" />}
                onSelect={(e) => {
                  e.preventDefault();
                  handlePreview();
                }}
              >
                {t("writerStory.menu.preview")}
              </DropdownItem>
              <DropdownItem
                disabled={submitBusy || !user?.id}
                onSelect={(e) => {
                  e.preventDefault();
                  handleSaveDraft();
                }}
              >
                {t("writerStory.menu.saveDraft")}
              </DropdownItem>
              <DropdownSeparator />
              <div
                className="flex flex-col gap-2 px-2 py-2"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <Link
                  to="/"
                  className="rounded-md px-2 py-1.5 text-sm text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-zinc-800"
                >
                  {t("writerStory.menu.backHome")}
                </Link>
              </div>
              <DropdownSeparator />
              <div
                className="max-h-[260px] space-y-2 overflow-auto px-2 py-2"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <label className="text-[11px] font-semibold uppercase text-neutral-400 dark:text-neutral-500">
                  {t("writerStory.fields.subtitle")}
                </label>
                <textarea
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  rows={2}
                  placeholder={t("writerStory.placeholders.subtitle")}
                  className="mb-3 w-full resize-none rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none placeholder:text-neutral-400 focus:border-neutral-400 dark:border-zinc-700 dark:bg-zinc-900 dark:placeholder:text-zinc-500"
                />
                <label className="text-[11px] font-semibold uppercase text-neutral-400 dark:text-neutral-500">
                  {t("writerStory.fields.tags")}
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="mb-3 w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none placeholder:text-neutral-400 dark:border-zinc-700 dark:bg-zinc-900"
                  placeholder={t("writerStory.placeholders.tags")}
                />
                <Select
                  label={t("writerStory.fields.audience")}
                  value={visibility}
                  onChange={(val) => setVisibility(val)}
                  options={[
                    { value: "public", label: t("writerStory.audience.public") },
                    {
                      value: "unlisted",
                      label: t("writerStory.audience.unlisted"),
                    },
                    {
                      value: "members",
                      label: t("writerStory.audience.members"),
                    },
                  ]}
                  className="mb-3"
                />
                <Select
                  label={t("writerStory.fields.format")}
                  value={contentKind}
                  onChange={(val) => setContentKind(val)}
                  options={[
                    {
                      value: "WEBLOG",
                      label: t("writerStory.format.weblog"),
                    },
                    {
                      value: "MONOGRAPH",
                      label: t("writerStory.format.monograph"),
                    },
                  ]}
                  className="mb-3"
                />
                <label
                  htmlFor="writer-cover-v2"
                  className="block cursor-pointer rounded-lg border border-dashed border-neutral-300 px-3 py-2 text-center text-xs font-medium text-neutral-600 transition-colors hover:border-[#1a8917]/50 hover:bg-[rgba(26,137,23,0.04)] dark:border-zinc-600 dark:text-neutral-400"
                >
                  {cover
                    ? t("writerStory.cover.replace")
                    : t("writerStory.cover.add")}
                </label>
                <input
                  id="writer-cover-v2"
                  type="file"
                  accept="image/*"
                  onChange={handleCover}
                  className="hidden"
                />
              </div>
            </DropdownContent>
          </DropdownMenuRoot>

          <button
            type="button"
            title={t("writerStory.notificationsBell")}
            className="flex size-9 items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-zinc-800"
          >
            <Bell className="size-[18px]" strokeWidth={1.85} />
          </button>

          <div className="ms-1 flex size-8 items-center justify-center rounded-full bg-amber-800 text-xs font-semibold uppercase text-white shadow-inner dark:bg-amber-900">
            {userInitial}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[680px] px-6 sm:px-10">
        <div className="pt-14 sm:pt-16">
          <input
            ref={titleRef}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t("writerStory.placeholders.title")}
            className="font-blog-display w-full border-0 bg-transparent px-0 py-2 text-[2.625rem] font-bold leading-[1.06] tracking-tight text-neutral-900 outline-none placeholder:text-neutral-400 sm:text-[2.875rem] dark:text-neutral-50 dark:placeholder:text-zinc-500"
          />
        </div>

        <div className="mt-2">
          <input
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            placeholder={t("writerStory.placeholders.optionalSubtitle")}
            className="font-blog-serif w-full border-0 bg-transparent px-0 py-1 text-[1.2rem] font-normal italic leading-snug text-neutral-600 outline-none placeholder:text-neutral-400 sm:text-xl dark:text-zinc-400 dark:placeholder:text-zinc-500"
          />
        </div>

        {cover && (
          <figure className="mt-10 overflow-hidden rounded-sm border border-neutral-200 dark:border-neutral-800">
            <img
              src={cover}
              alt=""
              className="max-h-[min(420px,50vh)] w-full object-cover"
            />
          </figure>
        )}

        <div className={`mt-10 flex flex-wrap items-center gap-2 ${cover ? "" : ""}`}>
          {toolbarOpen ? (
            <>
              <ToolChip
                title="Close menu"
                onClick={() => setToolbarOpen(false)}
              >
                <X className="size-[18px]" strokeWidth={2.2} />
              </ToolChip>
              <ToolChip
                title="Insert image"
                onClick={() => closeToolbarAnd(() => handleInsert("image"))}
              >
                <ImageIcon className="size-[18px]" strokeWidth={1.85} />
              </ToolChip>
              <ToolChip
                title="Stock-style image (demo)"
                onClick={() => closeToolbarAnd(() => handleInsert("stock"))}
              >
                <Search className="size-[18px]" strokeWidth={1.85} />
              </ToolChip>
              <ToolChip
                title="Insert video"
                onClick={() => closeToolbarAnd(() => handleInsert("video"))}
              >
                <Play className="size-[18px]" strokeWidth={1.85} />
              </ToolChip>
              <ToolChip
                title="Embed iframe"
                onClick={() => closeToolbarAnd(() => handleInsert("embed"))}
              >
                <IconEmbed />
              </ToolChip>
              <ToolChip
                title="Code block"
                onClick={() => closeToolbarAnd(() => handleInsert("code"))}
              >
                <IconBraces />
              </ToolChip>
              <ToolChip
                title="Section divider"
                onClick={() => closeToolbarAnd(() => handleInsert("divider"))}
              >
                <IconDividerDots />
              </ToolChip>
            </>
          ) : (
            <ToolChip title="Rich media" onClick={() => setToolbarOpen(true)}>
              <IconPlus />
            </ToolChip>
          )}
        </div>

        <div className="relative mt-8 min-h-[50vh]">
          {isBodyEmpty && (
            <div className="pointer-events-none absolute left-0 top-1 select-none font-blog-serif text-xl font-normal leading-[1.8] text-neutral-400 dark:text-zinc-500">
              {t("writerStory.bodyPlaceholder")}
            </div>
          )}
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            spellCheck
            onDrop={handleDrop}
            onPaste={handlePaste}
            onInput={(e) =>
              setIsBodyEmpty(!e.currentTarget.innerText.trim())
            }
            className="font-blog-serif relative z-[1] min-h-[50vh] w-full border-0 bg-transparent pb-24 text-xl leading-[1.8] text-neutral-900 outline-none empty:before:text-neutral-400 focus:outline-none dark:text-neutral-100"
          />
        </div>
      </main>

      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-auto bg-black/50 p-4 md:p-8">
          <div className="mt-12 w-full max-w-3xl rounded-xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-zinc-700 dark:bg-zinc-900">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400 dark:text-zinc-500">
                  {t("writerStory.preview.badge")}
                </p>
                <h2 className="font-blog-display mt-1 text-2xl font-bold text-neutral-900 dark:text-neutral-50 md:text-3xl">
                  {title || t("writerStory.preview.untitled")}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-zinc-800"
                aria-label={t("writerStory.preview.closeAria")}
              >
                <X className="size-5" />
              </button>
            </div>

            {cover && (
              <img
                src={cover}
                alt=""
                className="mb-5 max-h-56 w-full rounded-lg object-cover"
              />
            )}

            {subtitle && (
              <p className="font-blog-serif text-lg text-neutral-600 dark:text-zinc-400">
                {subtitle}
              </p>
            )}

            <article
              className="blog-article-prose mt-6 text-neutral-900 dark:text-neutral-100"
              dangerouslySetInnerHTML={{
                __html:
                  previewHTML ||
                  `<p>${t("writerStory.preview.emptyBody")}</p>`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
