import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { TrendingUp } from "lucide-react";

const TOPICS = [
  "Technology", "Science", "Programming", "Design", "Business",
  "Health", "Culture", "AI", "Startups"
];

export default function TrendingSidebar() {
  const [trending, setTrending] = useState([]);

  useEffect(() => {
    base44.entities.Story.filter({ status: "published" }, "-claps_count", 5).then(setTrending);
  }, []);

  return (
    <aside className="space-y-8">
      {/* Trending */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-primary" />
          <h3 className="font-body text-sm font-semibold uppercase tracking-wider">Trending</h3>
        </div>
        <div className="space-y-4">
          {trending.map((story, i) => (
            <Link key={story.id} to={`/story/${story.id}`} className="group flex gap-3">
              <span className="text-3xl font-heading font-bold text-muted/80">{String(i + 1).padStart(2, "0")}</span>
              <div className="min-w-0">
                <p className="text-xs font-body text-muted-foreground mb-0.5">
                  {story.author_name || "Anonymous"}
                </p>
                <h4 className="font-heading text-sm font-bold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                  {story.title}
                </h4>
                <p className="text-xs text-muted-foreground font-body mt-0.5">
                  {story.reading_time || 1} min read
                </p>
              </div>
            </Link>
          ))}
          {trending.length === 0 && (
            <p className="text-sm text-muted-foreground font-body">No trending stories yet.</p>
          )}
        </div>
      </div>

      {/* Topics */}
      <div>
        <h3 className="font-body text-sm font-semibold uppercase tracking-wider mb-3">
          Recommended Topics
        </h3>
        <div className="flex flex-wrap gap-2">
          {TOPICS.map((topic) => (
            <Link
              key={topic}
              to={`/topic/${encodeURIComponent(topic)}`}
              className="px-3 py-1.5 bg-muted rounded-full text-xs font-body text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              {topic}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}