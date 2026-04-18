import { Link, useParams } from "react-router-dom";
import { format } from "date-fns";
import { useState, useEffect, useRef, useCallback } from "react";
import { Heart, MessageCircle, Share2 } from "lucide-react";
import { getStoryById } from "../../data/mockStories";
import AvatarDemo from "../../components/Avatar";

export default function StoryDetailPage() {
  const { id } = useParams();
  const story = getStoryById(id);

  const [localClaps, setLocalClaps] = useState(story?.claps_count || 0);
  const [clapped, setClapped] = useState(false);
  const [progress, setProgress] = useState(0);
  const contentRef = useRef(null);

  const handleClap = useCallback(() => {
    setLocalClaps((c) => c + 1);
    setClapped(true);
    // TODO: Sync with API later
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY;
      const height = document.documentElement.scrollHeight - window.innerHeight;
      const scrolledPercent = height > 0 ? (scrolled / height) * 100 : 0;
      setProgress(Math.min(scrolledPercent, 100));
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    <div className=" bg-shell dark:bg-dark-shell">
      <div
        className="fixed top-0 left-0 right-0 h-1 bg-shell dark:bg-dark-shell  z-50 shadow-sm transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
      <article className="mx-auto w-full  lg:max-w-5xl bg-shell dark:bg-dark-shell px-4 py-16 sm:px-6 lg:py-24">
        <header className="space-y-4">
          <h1 className="font-heading text-3xl md:text-4xl font-bold leading-tight tracking-tight">
            {story.title}
          </h1>
          {story.subtitle && (
            <p className="font-serif text-xl md:text-2xl leading-relaxed text-muted-foreground">
              {story.subtitle}
            </p>
          )}
          <div className=" py-3 flex items-center gap-x-4">
            <div className=" flex items-center gap-x-3">
              <Link
                className=" flex items-center gap-x-3"
                to={"/writer/profile"}
              >
                <AvatarDemo />
                <span className=" text-lg">Elyas Ahmadi</span>
              </Link>
              <button
                type="button"
                className="rounded-md border border-default dark:border-dark-default px-3 py-1.5 text-sm font-medium text-secondary dark:text-dark-secondary hover:bg-app dark:hover:bg-dark-app transition-colors"
              >
                follow
              </button>
            </div>
            <div className="flex items-center gap-x-1">
              <spa>9</spa>
              <spa>min</spa>
              <spa>read</spa>
            </div>
            <span>
              <svg
                width="15"
                height="15"
                viewBox="0 0 15 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.875 7.5C9.875 8.81168 8.81168 9.875 7.5 9.875C6.18832 9.875 5.125 8.81168 5.125 7.5C5.125 6.18832 6.18832 5.125 7.5 5.125C8.81168 5.125 9.875 6.18832 9.875 7.5Z"
                  fill="currentColor"
                ></path>
              </svg>
            </span>
            <div className=" items-center flex gap-x-1">{date}</div>
          </div>
          <div className="flex flex-wrap justify-between border-t border-b border-default dark:border-dark-default  py-4 items-center gap-3 text-sm text-muted-foreground font-body">
            <div className=" flex items-center gap-x-3">
              <button
                type="button"
                onClick={handleClap}
                className="group flex items-center gap-1.5 -ml-1  transition-all p-2"
                aria-label="Clap"
              >
                <Heart
                  className={`h-5 w-5 transition-all duration-200 group-hover:scale-110 ${clapped ? "fill-red-500 text-red-500" : ""}`}
                  strokeWidth={clapped ? 0 : 2}
                />
                <span className="font-semibold text-sm">{localClaps}</span>
              </button>
              <button
                type="button"
                className="flex items-center gap-1.5 -ml-1  transition-all p-2 "
              >
                <MessageCircle className="h-5 w-5" />
                <span className="font-semibold text-sm">12</span>
              </button>
            </div>

            <div className="flex items-center gap-6 pt-1">
              <button
                type="button"
                className="flex items-center gap-1.5 -ml-1  transition-all p-2 rounded-xl cursor-pointer"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3.5 5.00006C3.22386 5.00006 3 5.22392 3 5.50006L3 11.5001C3 11.7762 3.22386 12.0001 3.5 12.0001L11.5 12.0001C11.7761 12.0001 12 11.7762 12 11.5001L12 5.50006C12 5.22392 11.7761 5.00006 11.5 5.00006L10.25 5.00006C9.97386 5.00006 9.75 4.7762 9.75 4.50006C9.75 4.22392 9.97386 4.00006 10.25 4.00006L11.5 4.00006C12.3284 4.00006 13 4.67163 13 5.50006L13 11.5001C13 12.3285 12.3284 13.0001 11.5 13.0001L3.5 13.0001C2.67157 13.0001 2 12.3285 2 11.5001L2 5.50006C2 4.67163 2.67157 4.00006 3.5 4.00006L4.75 4.00006C5.02614 4.00006 5.25 4.22392 5.25 4.50006C5.25 4.7762 5.02614 5.00006 4.75 5.00006L3.5 5.00006ZM7 1.6364L5.5682 3.0682C5.39246 3.24393 5.10754 3.24393 4.9318 3.0682C4.75607 2.89246 4.75607 2.60754 4.9318 2.4318L7.1818 0.181802C7.26619 0.09741 7.38065 0.049999 7.5 0.049999C7.61935 0.049999 7.73381 0.09741 7.8182 0.181802L10.0682 2.4318C10.2439 2.60754 10.2439 2.89246 10.0682 3.0682C9.89246 3.24393 9.60754 3.24393 9.4318 3.0682L8 1.6364L8 8.5C8 8.77614 7.77614 9 7.5 9C7.22386 9 7 8.77614 7 8.5L7 1.6364Z"
                    fill="currentColor"
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                  ></path>
                </svg>
              </button>
              <button
                type="button"
                className="flex items-center gap-1.5 -ml-1  transition-all p-2 rounded-xl cursor-pointer"
              >
                <svg
                  width="15"
                  height="15"
                  viewBox="0 0 15 15"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 2.5C3 2.22386 3.22386 2 3.5 2H11.5C11.7761 2 12 2.22386 12 2.5V13.5C12 13.6818 11.9014 13.8492 11.7424 13.9373C11.5834 14.0254 11.3891 14.0203 11.235 13.924L7.5 11.5896L3.765 13.924C3.61087 14.0203 3.41659 14.0254 3.25762 13.9373C3.09864 13.8492 3 13.6818 3 13.5V2.5ZM4 3V12.5979L6.97 10.7416C7.29427 10.539 7.70573 10.539 8.03 10.7416L11 12.5979V3H4Z"
                    fill="currentColor"
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
        </header>

        {story.cover_image && (
          <div className="mt-12 overflow-hidden rounded-md ">
            <img
              src={story.cover_image}
              alt={story.title}
              className="w-full h-auto object-cover"
              loading="lazy"
            />
          </div>
        )}

        <section ref={contentRef} className=" mt-3 ">
          {story.content ? (
            <div dangerouslySetInnerHTML={{ __html: story.content }} />
          ) : (
            <p className="text-muted-foreground/80 italic text-center py-32 text-xl">
              Content coming soon...
            </p>
          )}
        </section>

        {story.tags?.length > 0 && (
          <footer className="mt-20 pt-16 border-t border-default dark:border-dark-default flex flex-wrap gap-2 pb-12">
            {story.tags.map((tag) => (
              <Link
                key={tag}
                to={`/topic/${encodeURIComponent(tag)}`}
                className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted rounded-full transition-all duration-200"
              >
                {tag}
              </Link>
            ))}
          </footer>
        )}
      </article>
    </div>
  );
}
