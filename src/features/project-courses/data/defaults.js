export const DEFAULT_COURSES = [
  {
    id: "c-1",
    title: "React Frontend Engineering",
    description:
      "Build production-grade React apps with component architecture and state patterns.",
    instructor: "Nadia Rahimi",
    level: "Intermediate",
    status: "published",
    lessons: 24,
    students: 512,
    tags: ["react", "frontend", "tailwind"],
    updatedAt: "2026-04-12T09:20:00.000Z",
  },
  {
    id: "c-2",
    title: "Node.js API Design",
    description:
      "Design secure and scalable REST APIs with validation, auth, and testing fundamentals.",
    instructor: "Omar Farhad",
    level: "Advanced",
    status: "published",
    lessons: 31,
    students: 390,
    tags: ["node", "api", "backend"],
    updatedAt: "2026-04-10T14:00:00.000Z",
  },
  {
    id: "c-3",
    title: "UI Systems and Accessibility",
    description:
      "Craft reusable design systems with strong accessibility and interaction states.",
    instructor: "Lina Ahmadi",
    level: "Intermediate",
    status: "draft",
    lessons: 18,
    students: 0,
    tags: ["design-system", "a11y", "ui"],
    updatedAt: "2026-04-16T11:45:00.000Z",
  },
  {
    id: "c-4",
    title: "Git Collaboration Mastery",
    description:
      "Master branching, PR reviews, release strategy, and team collaboration workflows.",
    instructor: "Ali Hassani",
    level: "Beginner",
    status: "archived",
    lessons: 12,
    students: 221,
    tags: ["git", "workflow", "collaboration"],
    updatedAt: "2026-03-28T08:15:00.000Z",
  },
];

export const DEFAULT_ACTIVITY = [
  {
    id: "a-1",
    message: "React Frontend Engineering was published.",
    createdAt: "2026-04-12T09:30:00.000Z",
  },
  {
    id: "a-2",
    message: "UI Systems and Accessibility moved to draft.",
    createdAt: "2026-04-16T12:00:00.000Z",
  },
];

export const INITIAL_COURSE_FORM = {
  title: "",
  description: "",
  instructor: "",
  level: "Beginner",
  status: "draft",
  lessons: 1,
  students: 0,
  tags: "",
};
