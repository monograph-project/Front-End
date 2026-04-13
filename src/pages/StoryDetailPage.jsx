import { Link, useParams } from "react-router-dom";
import { format } from "date-fns";
import { Heart } from "lucide-react";
import { getStoryById } from "../data/mockStories";

export default function StoryDetailPage() {
  const { id } = useParams();
  const story = getStoryById(id);

  if (!story) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center font-body">
        <h1 className="font-heading text-2xl font-bold">Story not found</h1>
        <p className="mt-2 text-muted-foreground">
          That story may have been removed or the link is incorrect.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block text-primary font-medium underline-offset-4 hover:underline"
        >
          Back to feed
        </Link>
      </div>
    );
  }

  const date = story.created_date
    ? format(new Date(story.created_date), "MMMM d, yyyy")
    : "";

  return (
    <article className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <p className="mb-8 text-sm text-muted-foreground font-body">
        <Link to="/" className="text-primary underline-offset-4 hover:underline">
          ← Home
        </Link>
      </p>

      <header className="space-y-4">
        <p className="text-sm font-medium text-foreground">{story.author_name}</p>
        <h1 className="font-heading text-4xl font-bold leading-tight tracking-tight">
          {story.title}
        </h1>
        {story.subtitle && (
          <p className="font-serif text-xl leading-relaxed text-muted-foreground">
            {story.subtitle}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground font-body">
          <span>{date}</span>
          <span>·</span>
          <span>{story.reading_time} min read</span>
          {story.claps_count > 0 && (
            <>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Heart className="h-4 w-4" /> {story.claps_count}
              </span>
            </>
          )}
        </div>
      </header>

      {story.cover_image && (
        <div className="mt-10 overflow-hidden rounded-xl">
          <img
            src={story.cover_image}
            alt=""
            className="h-auto w-full object-cover"
          />
        </div>
      )}

      <div className="prose prose-neutral mt-10 max-w-none font-serif text-lg leading-relaxed dark:prose-invert">
        <p>
          This is sample body content for the story. Replace with rich text from
          your API when the backend is connected.
        </p>
        <p>
          Public articles live in this Medium-style area; signed-in students and
          teachers still use the faculty dashboard for groups, projects, and
          permissions that admins assign.
        </p>
      </div>

      {story.tags?.length > 0 && (
        <div className="mt-10 flex flex-wrap gap-2">
          {story.tags.map((tag) => (
            <Link
              key={tag}
              to={`/topic/${encodeURIComponent(tag)}`}
              className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground transition hover:text-foreground"
            >
              {tag}
            </Link>
          ))}
        </div>
      )}
    </article>
  );
}
