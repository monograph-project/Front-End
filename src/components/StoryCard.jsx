import { Link } from "react-router-dom";
import { Bookmark, Heart } from "lucide-react";
import { format } from "date-fns";

export default function StoryCard({ story, variant = "default" }) {
  const date = story.created_date ? format(new Date(story.created_date), "MMM d, yyyy") : "";
  const readTime = story.reading_time || 1;

  if (variant === "featured") {
    return (
      <Link to={`/story/${story.id}`} className="group block">
        <div className="relative overflow-hidden rounded-xl aspect-[16/9] mb-4">
          {story.cover_image ? (
            <img
              src={story.cover_image}
              alt={story.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <span className="font-heading text-4xl text-primary/30">{story.title?.[0]}</span>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
            <span className="font-medium text-foreground">{story.author_name || "Anonymous"}</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-bold leading-tight group-hover:text-primary transition-colors">
            {story.title}
          </h2>
          {story.subtitle && (
            <p className="text-muted-foreground font-serif text-base leading-relaxed line-clamp-2">
              {story.subtitle}
            </p>
          )}
          <div className="flex items-center gap-3 text-sm text-muted-foreground font-body pt-1">
            <span>{date}</span>
            <span>·</span>
            <span>{readTime} min read</span>
            {story.claps_count > 0 && (
              <>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Heart className="w-3.5 h-3.5" /> {story.claps_count}
                </span>
              </>
            )}
          </div>
          {story.tags?.length > 0 && (
            <div className="flex gap-2 pt-1">
              {story.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="px-3 py-1 bg-muted rounded-full text-xs font-body text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </Link>
    );
  }

  return (
    <Link to={`/story/${story.id}`} className="group flex gap-4 sm:gap-6 py-6 border-b border-border last:border-0">
      <div className="flex-1 min-w-0 space-y-1.5">
        <div className="flex items-center gap-2 text-sm text-muted-foreground font-body">
          <span className="font-medium text-foreground">{story.author_name || "Anonymous"}</span>
        </div>
        <h3 className="font-heading text-lg sm:text-xl font-bold leading-snug group-hover:text-primary transition-colors line-clamp-2">
          {story.title}
        </h3>
        {story.subtitle && (
          <p className="text-muted-foreground font-serif text-sm leading-relaxed line-clamp-2 hidden sm:block">
            {story.subtitle}
          </p>
        )}
        <div className="flex items-center gap-3 text-sm text-muted-foreground font-body pt-1">
          <span>{date}</span>
          <span>·</span>
          <span>{readTime} min read</span>
          {story.claps_count > 0 && (
            <>
              <span>·</span>
              <span className="flex items-center gap-1">
                <Heart className="w-3.5 h-3.5" /> {story.claps_count}
              </span>
            </>
          )}
        </div>
        {story.tags?.length > 0 && (
          <div className="flex gap-2 pt-1">
            {story.tags.slice(0, 2).map((tag) => (
              <span key={tag} className="px-2.5 py-0.5 bg-muted rounded-full text-xs font-body text-muted-foreground">
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
      {story.cover_image && (
        <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-lg overflow-hidden flex-shrink-0">
          <img src={story.cover_image} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
      )}
    </Link>
  );
}