import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import {
  ArrowLeft,
  BadgeCheck,
  BookOpen,
  CalendarDays,
  CheckCheck,
  Clock3,
  Eye,
  Heart,
  MessageCircle,
  NotebookText,
  PanelsTopLeft,
  Send,
  Share2,
  Star,
  UserRound,
  XCircle,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { cn } from "../../lib/utils";
import {
  getAdminBlogById,
  loadAdminBlogs,
  saveAdminBlogs,
} from "../../data/adminBlogs";
import BlogDetailTabs from "../../components/BlogDetailTabs";
import BlogOverviewPanel from "../../components/BlogOverviewPanel";
import BlogWriterPanel from "../../components/BlogWriterPanel";
import BlogWriterPostsPanel from "../../components/BlogWriterPostsPanel";
import BlogReviewPanel from "../../components/BlogReviewPanel";
import BlogMoreBlogsPanel from "../../components/BlogMoreBlogsPanel";

const statusStyles = {
  pending:
    "bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-200 dark:bg-amber-500/15 dark:text-amber-200 dark:ring-amber-400/20",
  accepted:
    "bg-sky-100 text-sky-800 ring-1 ring-inset ring-sky-200 dark:bg-sky-500/15 dark:text-sky-200 dark:ring-sky-400/20",
  published:
    "bg-emerald-100 text-emerald-800 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-200 dark:ring-emerald-400/20",
  rejected:
    "bg-rose-100 text-rose-800 ring-1 ring-inset ring-rose-200 dark:bg-rose-500/15 dark:text-rose-200 dark:ring-rose-400/20",
  draft:
    "bg-slate-200 text-slate-700 ring-1 ring-inset ring-slate-300 dark:bg-slate-500/15 dark:text-slate-200 dark:ring-slate-400/20",
};

const statusLabels = {
  pending: "Waiting review",
  accepted: "Accepted",
  published: "Published",
  rejected: "Rejected",
  draft: "Draft",
};

function AdminActionButton({
  children,
  tone = "default",
  className,
  ...props
}) {
  const toneClass =
    tone === "primary"
      ? "bg-primary text-white hover:opacity-90"
      : tone === "success"
        ? "bg-emerald-600 text-white hover:bg-emerald-700"
        : tone === "danger"
          ? "bg-rose-600 text-white hover:bg-rose-700"
          : "border border-default bg-card text-primary hover:bg-card-2 dark:border-dark-default dark:bg-dark-card dark:text-dark-primary dark:hover:bg-dark-card-2";

  return (
    <button
      type="button"
      className={cn(
        "inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
        toneClass,
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export default function BlogDetailPage() {
  const { id } = useParams();
  const [blogs, setBlogs] = useState(() => loadAdminBlogs());
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    saveAdminBlogs(blogs);
  }, [blogs]);

  const blog = useMemo(
    () =>
      blogs.find((item) => String(item.id) === String(id)) ||
      getAdminBlogById(id),
    [blogs, id],
  );

  if (!blog) {
    return (
      <div className="flex min-h-screen flex-1 items-center justify-center bg-shell px-4 dark:bg-dark-shell">
        <div className="max-w-md rounded-md border border-default bg-card p-8 text-center dark:border-dark-default dark:bg-dark-card">
          <h1 className="text-2xl font-bold text-primary dark:text-dark-primary">
            Blog not found
          </h1>
          <p className="mt-3 text-sm leading-6 text-secondary dark:text-dark-secondary">
            The article may have been removed or the moderation link is invalid.
          </p>
          <Link
            to="/admin/blogs"
            className="mt-6 inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white"
          >
            Back to blogs
          </Link>
        </div>
      </div>
    );
  }

  const relatedBlogs = blogs.filter((item) => item.id !== blog.id).slice(0, 3);
  const authorBlogs = blogs.filter(
    (item) => item.author === blog.author && item.id !== blog.id,
  );

  const tabs = [
    { id: "overview", label: "Overview", icon: PanelsTopLeft },
    { id: "writer", label: "Writer", icon: UserRound },
    { id: "posts", label: "Writer posts", icon: NotebookText },
    { id: "review", label: "Review info", icon: BadgeCheck },
    { id: "more", label: "More blogs", icon: Eye },
  ];

  const updateBlog = (updater) => {
    setBlogs((current) =>
      current.map((item) =>
        item.id === blog.id ? { ...item, ...updater(item) } : item,
      ),
    );
  };

  const handleStatusChange = (nextStatus) => {
    updateBlog(() => ({ status: nextStatus }));
  };

  const handleToggleFeatured = () => {
    updateBlog((item) => ({ featured: !item.featured }));
  };

  const formattedDate = blog.date
    ? format(new Date(blog.date), "MMMM d, yyyy")
    : "No date";

  return (
    <div className="min-h-screen flex-1 bg-shell dark:bg-dark-shell border border-default dark:border-dark-default rounded-md m-2">
      <div className="mx-auto w-full max-w-7xl px-2 py-3 md:px-3">
        <section className="mb-6 rounded-md border border-default bg-card p-5 dark:border-dark-default dark:bg-dark-card">
          <BlogDetailTabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={setActiveTab}
          />
        </section>

        {activeTab === "overview" && (
          <section className="mb-6">
            <BlogOverviewPanel blog={blog} formattedDate={formattedDate} />
          </section>
        )}

        {activeTab === "writer" && (
          <section className="mb-6">
            <BlogWriterPanel blog={blog} blogs={blogs} />
          </section>
        )}

        {activeTab === "posts" && (
          <section className="mb-6">
            <BlogWriterPostsPanel
              author={blog.author}
              authorBlogs={authorBlogs}
              statusLabels={statusLabels}
              statusStyles={statusStyles}
            />
          </section>
        )}

        {activeTab === "review" && (
          <section className="mb-6">
            <BlogReviewPanel blog={blog} statusLabels={statusLabels} />
          </section>
        )}

        {activeTab === "more" && (
          <section className="mb-6">
            <BlogMoreBlogsPanel relatedBlogs={relatedBlogs} />
          </section>
        )}

        <main className="min-w-0">
          <div className="rounded-md border border-default bg-card dark:border-dark-default dark:bg-dark-card">
            <div className="border-b border-default px-6 py-5 dark:border-dark-default md:px-10">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <Link
                  to="/admin/blogs"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-secondary dark:text-dark-primary dark:hover:text-dark-secondary"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to blog collection
                </Link>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex rounded-md px-3 py-1.5 text-xs font-semibold",
                      statusStyles[blog.status],
                    )}
                  >
                    {statusLabels[blog.status]}
                  </span>
                  <button
                    type="button"
                    onClick={handleToggleFeatured}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-md border border-default px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:bg-card-2 dark:border-dark-default dark:text-dark-primary dark:hover:bg-dark-card-2",
                      blog.featured &&
                        "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-300",
                    )}
                  >
                    <Star
                      className={cn("h-4 w-4", blog.featured && "fill-current")}
                    />
                    {blog.featured ? "Featured" : "Mark featured"}
                  </button>
                </div>
              </div>
            </div>

            <div className="border-b border-default bg-shell/90 px-6 py-5 backdrop-blur dark:border-dark-default dark:bg-dark-shell/90 md:px-10 xl:sticky xl:top-12 xl:z-20">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="max-w-148">
                  <div className="flex items-center gap-2 text-sm font-semibold text-primary dark:text-dark-primary">
                    <BookOpen className="h-4 w-4" />
                    Moderation controls
                  </div>
                  <p className="mt-2 text-sm leading-6 text-secondary dark:text-dark-secondary">
                    Place review actions beside the article status near the top,
                    so admins can act immediately after reading the opening
                    section instead of hunting in a sidebar.
                  </p>
                </div>

                <div className="flex gap-2">
                  {blog.status === "pending" && (
                    <>
                      <AdminActionButton
                        tone="success"
                        onClick={() => handleStatusChange("accepted")}
                      >
                        <CheckCheck className="mr-2 h-4 w-4" />
                        Accept article
                      </AdminActionButton>
                      <AdminActionButton
                        tone="danger"
                        onClick={() => handleStatusChange("rejected")}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject article
                      </AdminActionButton>
                    </>
                  )}

                  {blog.status === "accepted" && (
                    <>
                      <AdminActionButton
                        tone="primary"
                        onClick={() => handleStatusChange("published")}
                      >
                        <Send className="mr-2 h-4 w-4" />
                        Publish article
                      </AdminActionButton>
                      <AdminActionButton
                        onClick={() => handleStatusChange("pending")}
                      >
                        Return to waiting
                      </AdminActionButton>
                    </>
                  )}

                  {blog.status === "published" && (
                    <>
                      <AdminActionButton
                        onClick={() => handleStatusChange("accepted")}
                      >
                        Unpublish to accepted
                      </AdminActionButton>
                      <AdminActionButton
                        onClick={() => handleStatusChange("draft")}
                      >
                        Move to draft
                      </AdminActionButton>
                    </>
                  )}

                  {blog.status === "rejected" && (
                    <AdminActionButton
                      tone="success"
                      onClick={() => handleStatusChange("accepted")}
                    >
                      Restore and accept
                    </AdminActionButton>
                  )}

                  {blog.status === "draft" && (
                    <AdminActionButton
                      tone="primary"
                      onClick={() => handleStatusChange("pending")}
                    >
                      Send for approval
                    </AdminActionButton>
                  )}
                </div>
              </div>
            </div>

            <article className="px-6 py-8 md:px-10 md:py-10">
              <header className="mx-auto max-w-3xl">
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted dark:text-dark-muted">
                  <span className="rounded-full bg-shell px-3 py-1 dark:bg-dark-shell">
                    {blog.category}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <CalendarDays className="h-4 w-4" />
                    {formattedDate}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <Clock3 className="h-4 w-4" />
                    {blog.readTime}
                  </span>
                </div>

                <h1 className="mt-6 text-4xl font-bold leading-tight tracking-tight text-primary dark:text-dark-primary md:text-5xl">
                  {blog.title}
                </h1>
                <p className="mt-5 text-lg leading-8 text-secondary dark:text-dark-secondary">
                  {blog.excerpt}
                </p>

                <div className="mt-8 flex flex-wrap items-center justify-between gap-5 border-y border-default py-5 dark:border-dark-default">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-sm font-bold text-white dark:bg-dark-primary dark:text-dark-shell">
                      {blog.author
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-primary dark:text-dark-primary">
                        {blog.author}
                      </p>
                      <p className="text-sm text-muted dark:text-dark-muted">
                        {blog.authorRole}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-5 text-sm text-muted dark:text-dark-muted">
                    <span className="inline-flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      {blog.claps} claps
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      {blog.comments} comments
                    </span>
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 font-semibold text-primary dark:text-dark-primary"
                    >
                      <Share2 className="h-4 w-4" />
                      Share
                    </button>
                  </div>
                </div>
              </header>

              {blog.coverImage && (
                <div className="mx-auto mt-10 max-w-5xl overflow-hidden rounded-md">
                  <img
                    src={blog.coverImage}
                    alt={blog.title}
                    className="h-[260px] w-full object-cover md:h-[420px]"
                  />
                </div>
              )}

              <section className="mx-auto mt-10 max-w-5xl">
                <div
                  className="space-y-6 text-[17px] leading-8 text-primary dark:text-dark-primary [&_blockquote]:border-l-4 [&_blockquote]:border-default [&_blockquote]:pl-5 [&_blockquote]:text-xl [&_blockquote]:font-medium [&_blockquote]:italic [&_h2]:mt-12 [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:leading-tight [&_p]:text-secondary dark:[&_blockquote]:border-dark-default dark:[&_p]:text-dark-secondary"
                  dangerouslySetInnerHTML={{ __html: blog.content }}
                />

                {blog.tags?.length > 0 && (
                  <div className="mt-12 flex flex-wrap gap-2 border-t border-default pt-8 dark:border-dark-default">
                    {blog.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-default bg-shell px-4 py-2 text-sm font-medium text-secondary dark:border-dark-default dark:bg-dark-shell dark:text-dark-secondary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </section>
            </article>
          </div>
        </main>
      </div>
    </div>
  );
}
