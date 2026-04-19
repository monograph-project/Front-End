import { safeNumber } from "./common";

const TAG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/i;

export const validationLimits = {
  title: { min: 5, max: 100 },
  description: { min: 25, max: 500 },
  instructor: { min: 3, max: 60 },
  lessons: { min: 1, max: 300 },
  students: { min: 0, max: 100000 },
  tags: { maxCount: 10, maxLength: 24 },
};

export const normalizeTags = (value) => {
  if (Array.isArray(value)) {
    return value
      .map((tag) => String(tag).trim().toLowerCase())
      .filter(Boolean);
  }

  return String(value || "")
    .split(",")
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean);
};

export const validateCourseForm = (form) => {
  const title = String(form.title || "").trim();
  const description = String(form.description || "").trim();
  const instructor = String(form.instructor || "").trim();
  const lessons = safeNumber(form.lessons, 0);
  const students = safeNumber(form.students, 0);
  const tags = normalizeTags(form.tags);
  const errors = {};

  if (title.length < validationLimits.title.min || title.length > validationLimits.title.max) {
    errors.title = `Title must be ${validationLimits.title.min}-${validationLimits.title.max} characters.`;
  }

  if (
    description.length < validationLimits.description.min ||
    description.length > validationLimits.description.max
  ) {
    errors.description = `Description must be ${validationLimits.description.min}-${validationLimits.description.max} characters.`;
  }

  if (
    instructor.length < validationLimits.instructor.min ||
    instructor.length > validationLimits.instructor.max
  ) {
    errors.instructor = `Instructor must be ${validationLimits.instructor.min}-${validationLimits.instructor.max} characters.`;
  }

  if (lessons < validationLimits.lessons.min || lessons > validationLimits.lessons.max) {
    errors.lessons = `Lessons must be ${validationLimits.lessons.min}-${validationLimits.lessons.max}.`;
  }

  if (students < validationLimits.students.min || students > validationLimits.students.max) {
    errors.students = `Students must be ${validationLimits.students.min}-${validationLimits.students.max}.`;
  }

  if (tags.length > validationLimits.tags.maxCount) {
    errors.tags = `Use up to ${validationLimits.tags.maxCount} tags.`;
  } else if (
    tags.some((tag) => tag.length > validationLimits.tags.maxLength || !TAG_PATTERN.test(tag))
  ) {
    errors.tags =
      "Tags must be lowercase words/hyphen format (e.g. react-hooks) and max 24 chars.";
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
    normalized: {
      title,
      description,
      instructor,
      level: form.level,
      status: form.status,
      lessons,
      students,
      tags,
    },
  };
};
