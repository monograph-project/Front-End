export const MOCK_STORIES = [
  {
    id: "1",
    title: "Designing for Focus in a Noisy Digital World",
    subtitle:
      "How we structure reading and writing so students and faculty can think clearly.",
    author_name: "Faculty Commons",
    created_date: "2026-03-28T10:00:00.000Z",
    reading_time: 6,
    claps_count: 128,
    cover_image:
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=1200&q=80",
    tags: ["Design", "Education", "Writing"],
  },
  {
    id: "2",
    title: "Why Group Projects Need Clear Roles",
    subtitle:
      "A practical framework for repositories, invites, and teacher oversight.",
    author_name: "Dr. A. Rahman",
    created_date: "2026-04-02T14:30:00.000Z",
    reading_time: 5,
    claps_count: 64,
    tags: ["Collaboration", "Teaching"],
  },
  {
    id: "3",
    title: "From Topic to Thread: Writing Like Medium",
    subtitle: "Public stories sit beside private coursework — here is how we separate them.",
    author_name: "Student Voice",
    created_date: "2026-04-08T09:15:00.000Z",
    reading_time: 4,
    claps_count: 41,
    tags: ["Productivity", "Community"],
  },
  {
    id: "4",
    title: "Staff Workflows That Scale Across Departments",
    subtitle: "Notes, calendar, and reports for everyday faculty operations.",
    author_name: "Ops Team",
    created_date: "2026-04-10T16:00:00.000Z",
    reading_time: 7,
    claps_count: 22,
    tags: ["Operations", "Faculty"],
  },
];

export function getStoryById(id) {
  return MOCK_STORIES.find((s) => String(s.id) === String(id)) ?? null;
}

export function storiesForTopic(topic) {
  if (!topic) return MOCK_STORIES;
  const t = decodeURIComponent(topic).toLowerCase();
  return MOCK_STORIES.filter((s) =>
    s.tags?.some((tag) => tag.toLowerCase() === t),
  );
}
