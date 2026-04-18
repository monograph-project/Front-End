import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import AvatarDemo from "../../components/Avatar";
import Select from "../../components/Select";
import { useAuth } from "../../context/AuthContext";
import Field from "../../components/Field";
const STORAGE_KEY = "draft_story_v2";

function WriterIcon({ children, title, onClick, variant = "ghost" }) {
  const base =
    "h-9 w-9 rounded-full border border-default dark:border-dark-default flex items-center justify-center cursor-pointer text-secondary dark:text-dark-secondary hover:bg-app dark:hover:bg-dark-app transition-colors";
  const filled =
    "bg-accent/10 dark:bg-accent-light/10 border-accent/20 dark:border-dark-accent/20";

  const classes = variant === "filled" ? `${base} ${filled}` : base;

  return (
    <button type="button" title={title} onClick={onClick} className={classes}>
      {children}
    </button>
  );
}

function WriterBadge({ children }) {
  return (
    <span className="inline-flex items-center rounded-md py-2 border border-default dark:border-dark-default bg-card dark:bg-dark-card px-3 py-1 text-xs font-medium text-secondary dark:text-dark-secondary">
      {children}
    </span>
  );
}

function IconPlus() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function IconImage() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="3.5" y="5" width="17" height="14" rx="2" />
      <circle cx="9" cy="10" r="1.5" />
      <path d="M20.5 16l-4.8-4.8a1 1 0 0 0-1.42 0L8 17.5" />
    </svg>
  );
}

function IconCode() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M8 8l-4 4 4 4M16 8l4 4-4 4M14 4l-4 16" />
    </svg>
  );
}

function IconQuote() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M9 8H6.8A2.8 2.8 0 0 0 4 10.8V13a3 3 0 0 0 3 3h2v-5H6.5M20 8h-2.2A2.8 2.8 0 0 0 15 10.8V13a3 3 0 0 0 3 3h2v-5h-2.5" />
    </svg>
  );
}

function IconList() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export default function WriteStory() {
  // No account dropdown here — account actions are centralized in AppHeader
  const initialDraft = useMemo(() => {
    const defaults = {
      title: "",
      subtitle: "",
      tags: "",
      visibility: "public",
      cover: null,
      body: "",
      savedNote: "",
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
        savedNote: data.lastSaved
          ? `Restored ${new Date(data.lastSaved).toLocaleString()}`
          : "Restored draft",
      };
    } catch {
      return defaults;
    }
  }, []);

  const { user } = useAuth();
  const [title, setTitle] = useState(initialDraft.title);
  const [subtitle, setSubtitle] = useState(initialDraft.subtitle);
  const [tags, setTags] = useState(initialDraft.tags);
  const [visibility, setVisibility] = useState(initialDraft.visibility);
  const [cover, setCover] = useState(initialDraft.cover);
  const [savedNote, setSavedNote] = useState(initialDraft.savedNote);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHTML, setPreviewHTML] = useState("");
  const [isBodyEmpty, setIsBodyEmpty] = useState(
    !(initialDraft.body || "").trim(),
  );
  const [toolbarOpen, setToolbarOpen] = useState(false);

  const editorRef = useRef(null);
  const titleRef = useRef(null);
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  useEffect(() => {
    // contentEditable is not React-controlled; restore it imperatively.
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
    setSavedNote("Draft saved");

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      setSavedNote("");
    }, 1800);
  }, [cover, subtitle, tags, title, visibility]);

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

  const insertImageFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const wrapper = document.createElement("figure");
      wrapper.className = "my-8 text-center";

      const img = document.createElement("img");
      img.src = event.target?.result;
      img.alt = file.name || "story media";
      img.className =
        "mx-auto max-w-full rounded-lg border border-default dark:border-dark-default";

      wrapper.appendChild(img);
      editorRef.current?.appendChild(wrapper);
      autosave();
    };
    reader.readAsDataURL(file);
  };

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

  const handleInsert = (type) => {
    if (type === "divider") {
      const divider = document.createElement("hr");
      divider.className =
        "my-8 border-t border-default dark:border-dark-default";
      editorRef.current?.appendChild(divider);
      editorRef.current?.focus();
      autosave();
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
            video.src = loadEvent.target?.result;
            video.controls = true;
            video.className =
              "mx-auto max-w-full rounded-lg border border-default dark:border-dark-default my-8";
            video.style.maxHeight = "400px";
            editorRef.current?.appendChild(video);
            autosave();
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
      return;
    }

    if (type === "embed") {
      const url = prompt("Enter embed URL (e.g., YouTube, Twitter, etc.):");
      if (url) {
        const embed = document.createElement("div");
        embed.className = "my-8 text-center";
        embed.innerHTML = `<iframe src="${url}" width="100%" height="400" frameborder="0" allowfullscreen></iframe>`;
        editorRef.current?.appendChild(embed);
        autosave();
      }
      return;
    }

    if (type === "code") {
      exec("formatBlock", "PRE");
      return;
    }

    if (type === "quote") {
      exec("formatBlock", "BLOCKQUOTE");
      return;
    }

    if (type === "list") {
      exec("insertUnorderedList");
    }
  };

  const handleCover = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (loadEvent) => setCover(loadEvent.target?.result || null);
    reader.readAsDataURL(file);
  };

  const handlePublish = () => {
    autosave();
    alert("Publish clicked. Connect your API here to send the story.");
  };

  const handlePreview = () => {
    autosave();
    setPreviewHTML(editorRef.current?.innerHTML || "");
    setPreviewOpen(true);
  };

  return (
    <div className="w-full mx-auto bg-shell dark:bg-dark-shell">
      <header className="sticky px-3 w-full top-14 z-10 flex items-center justify-between gap-4 mb-6 py-3 bg-shell/80 dark:bg-dark-shell/80 backdrop-blur border-b border-default dark:border-dark-default">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="text-xl font-bold tracking-tight hover:opacity-90"
          ></Link>
          <span className="text-sm font-medium text-muted-foreground">
            Draft
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2">
            <WriterBadge>{savedNote || "Start writing freely"}</WriterBadge>
          </div>

          <button
            type="button"
            onClick={handlePreview}
            className="rounded-md border border-default dark:border-dark-default px-3 py-1.5 text-sm font-medium text-secondary dark:text-dark-secondary hover:bg-app dark:hover:bg-dark-app transition-colors"
          >
            Preview
          </button>

          <button
            type="button"
            onClick={handlePublish}
            className="rounded-md bg-success cursor-pointer  text-white px-4 py-1.5 text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Publish
          </button>
        </div>
      </header>

      <main className="flex lg:px-8 lg:py-8 flex-col gap-6 w-full   mx-auto">
        {/* Settings Bar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
          <input
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            className="w-full sm:w-72 bg-transparent border border-default dark:border-dark-default rounded-md px-4 py-2 text-sm text-secondary dark:text-dark-secondary placeholder:text-muted-foreground dark:placeholder:text-dark-muted outline-none"
            placeholder="Add tags"
          />

          <div className="w-44">
            <Select
              value={visibility}
              onChange={(val) => setVisibility(val)}
              options={[
                { value: "public", label: "Public" },
                { value: "unlisted", label: "Unlisted" },
                { value: "members", label: "Members only" },
              ]}
            />
          </div>

          <label
            htmlFor="writer-cover"
            className="rounded-md border border-default dark:border-dark-default px-4 py-2 text-sm font-medium text-secondary dark:text-dark-secondary hover:bg-app dark:hover:bg-dark-app transition-colors cursor-pointer text-center"
          >
            Cover image
          </label>
          <input
            id="writer-cover"
            type="file"
            accept="image/*"
            onChange={handleCover}
            className="hidden"
          />
        </div>

        {/* Cover Preview */}
        {cover && (
          <figure className="w-full h-56 overflow-hidden rounded-xl border border-default dark:border-dark-default">
            <img
              src={cover}
              alt="Selected cover"
              className="w-full h-full object-cover"
            />
          </figure>
        )}

        {/* Title and Subtitle */}
        <div>
          <input
            ref={titleRef}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Title"
            className="w-full bg-transparent border-0 outline-none text-4xl md:text-5xl font-bold font-serif text-primary dark:text-dark-primary placeholder:text-muted-foreground"
          />

          <input
            value={subtitle}
            onChange={(event) => setSubtitle(event.target.value)}
            placeholder="Tell your story..."
            className="mt-3 w-full bg-transparent border-0 outline-none text-lg md:text-xl text-muted-foreground placeholder:text-muted-foreground focus:outline-none"
          />
        </div>

        {/* Editor Content with Inline Toolbar */}
        <div className="flex gap-2">
          {/* Toolbar */}
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => setToolbarOpen(!toolbarOpen)}
              className={`h-9 w-9 rounded-full border-2 flex items-center justify-center transition-all ${
                toolbarOpen
                  ? "border-accent bg-accent/10 dark:bg-accent-light/10"
                  : "border-default dark:border-dark-default hover:border-accent"
              }`}
            >
              {toolbarOpen ? (
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 stroke-accent dark:stroke-accent-light"
                  fill="none"
                  strokeWidth="2"
                >
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5 stroke-secondary dark:stroke-dark-secondary"
                  fill="none"
                  strokeWidth="2"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              )}
            </button>

            {/* Expanded Toolbar */}
            {toolbarOpen && (
              <div className="flex flex-col gap-2 mt-2 py-2 px-1 border-l-2 border-accent">
                <WriterIcon
                  title="Add image"
                  onClick={() => {
                    handleInsert("image");
                    setToolbarOpen(false);
                  }}
                >
                  <IconImage />
                </WriterIcon>
                <WriterIcon
                  title="Add gallery"
                  onClick={() => {
                    handleInsert("gallery");
                    setToolbarOpen(false);
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <rect x="2" y="3" width="20" height="18" rx="2" />
                    <path d="M8 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    <path d="M21 15l-5-5L7 22" />
                  </svg>
                </WriterIcon>
                <WriterIcon
                  title="Add video"
                  onClick={() => {
                    handleInsert("video");
                    setToolbarOpen(false);
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M23 7l-7 5 7 5V7z" />
                    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
                  </svg>
                </WriterIcon>
                <WriterIcon
                  title="Add code"
                  onClick={() => {
                    handleInsert("code");
                    setToolbarOpen(false);
                  }}
                >
                  <IconCode />
                </WriterIcon>
                <WriterIcon
                  title="Add embed"
                  onClick={() => {
                    handleInsert("embed");
                    setToolbarOpen(false);
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M10 19H5c-1.1 0-2-.9-2-2V5c0-1.1.9-2 2-2h4M14 5h5c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2h-4" />
                  </svg>
                </WriterIcon>
                <WriterIcon
                  title="Add quote"
                  onClick={() => {
                    handleInsert("quote");
                    setToolbarOpen(false);
                  }}
                >
                  <IconQuote />
                </WriterIcon>
                <WriterIcon
                  title="Insert divider"
                  onClick={() => {
                    handleInsert("divider");
                    setToolbarOpen(false);
                  }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <path d="M4 12h16" />
                  </svg>
                </WriterIcon>
              </div>
            )}
          </div>

          {/* Editor Content */}
          <div className="flex-1">
            <div className="relative">
              {isBodyEmpty && (
                <div className="pointer-events-none absolute left-0 top-2 text-muted-foreground">
                  Tell your story...
                </div>
              )}
              <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onDrop={handleDrop}
                onPaste={handlePaste}
                onInput={(e) =>
                  setIsBodyEmpty(!e.currentTarget.innerText.trim())
                }
                className="w-full rounded-lg border border-default dark:border-dark-default bg-input dark:bg-dark-input p-6 font-serif text-lg leading-relaxed outline-none focus:border-accent dark:focus:border-dark-accent"
              />
            </div>
          </div>
        </div>

        {/* Save and Footer */}
        <div className="mt-8 pt-6 border-t border-default dark:border-dark-default flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <span className="text-sm text-muted-foreground">
            {savedNote || "Your draft autosaves every 5 seconds."}
          </span>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={autosave}
              className="rounded-full border border-default dark:border-dark-default px-4 py-2 text-sm font-medium text-secondary dark:text-dark-secondary hover:bg-app dark:hover:bg-dark-app transition-colors"
            >
              Save draft
            </button>
            <Link
              to="/"
              className="rounded-full border border-default dark:border-dark-default px-4 py-2 text-sm font-medium text-secondary dark:text-dark-secondary hover:bg-app dark:hover:bg-dark-app transition-colors"
            >
              Leave editor
            </Link>
          </div>
        </div>
      </main>

      {previewOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center p-4 md:p-6 overflow-auto">
          <div className="bg-card dark:bg-dark-card border border-default dark:border-dark-default rounded-xl shadow-lg w-full max-w-3xl mt-16 p-4 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Preview
                </p>
                <h2 className="text-2xl md:text-3xl font-semibold">
                  {title || "Untitled story"}
                </h2>
              </div>

              <WriterIcon
                title="Close preview"
                onClick={() => setPreviewOpen(false)}
                variant="filled"
              >
                <IconClose />
              </WriterIcon>
            </div>

            {cover && (
              <img
                src={cover}
                alt="Story cover preview"
                className="w-full h-56 object-cover rounded-lg border border-default dark:border-dark-default mb-4"
              />
            )}

            {subtitle && (
              <p className="text-base text-muted-foreground mt-2">{subtitle}</p>
            )}

            <article
              className="prose max-w-none font-serif text-muted-foreground dark:text-dark-muted mt-4"
              dangerouslySetInnerHTML={{
                __html:
                  previewHTML || "<p>Start typing to preview your story.</p>",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
