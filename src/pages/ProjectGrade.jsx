import { useMemo, useState } from "react";

function createCriterion() {
  return {
    id:
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: "",
    points: "",
    notes: "",
  };
}

const DEFAULT_CRITERIA = [
  {
    id: "code-quality",
    name: "Code Quality",
    points: "40",
    notes: "Readability, structure, naming, and maintainability.",
  },
  {
    id: "functionality",
    name: "Functionality",
    points: "35",
    notes: "Features work as expected and edge cases are handled.",
  },
  {
    id: "documentation",
    name: "Documentation",
    points: "25",
    notes: "Clear setup, usage steps, and technical notes.",
  },
];

const MODE_OPTIONS = [
  { id: "build", label: "Rubric Builder" },
  { id: "grade", label: "Grade Mode" },
  { id: "preview", label: "Preview Mode" },
];

const INPUT_CLASS =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

const CARD_CLASS =
  "rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_12px_30px_rgba(15,23,42,0.08)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(15,23,42,0.12)] sm:p-5";

const GRADE_TONE = {
  A: {
    chip: "bg-emerald-100 text-emerald-800 ring-emerald-200",
    text: "text-emerald-700",
    progress: "from-emerald-400 to-emerald-600",
    stroke: "#16a34a",
  },
  B: {
    chip: "bg-blue-100 text-blue-800 ring-blue-200",
    text: "text-blue-700",
    progress: "from-blue-400 to-blue-600",
    stroke: "#2563eb",
  },
  C: {
    chip: "bg-amber-100 text-amber-800 ring-amber-200",
    text: "text-amber-700",
    progress: "from-amber-400 to-amber-600",
    stroke: "#d97706",
  },
  Pass: {
    chip: "bg-indigo-100 text-indigo-800 ring-indigo-200",
    text: "text-indigo-700",
    progress: "from-indigo-400 to-indigo-600",
    stroke: "#4f46e5",
  },
  Fail: {
    chip: "bg-rose-100 text-rose-800 ring-rose-200",
    text: "text-rose-700",
    progress: "from-rose-400 to-rose-600",
    stroke: "#e11d48",
  },
};

function formatDate(value) {
  if (!value) {
    return "Not set";
  }

  const parsed = new Date(`${value}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return "Invalid date";
  }

  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getGradeMeta(percentage, earnedPoints, passingScore) {
  if (earnedPoints < passingScore) {
    return { label: "Fail", detail: "Below passing score" };
  }

  if (percentage >= 90) {
    return { label: "A", detail: "Excellent performance" };
  }

  if (percentage >= 80) {
    return { label: "B", detail: "Strong performance" };
  }

  if (percentage >= 70) {
    return { label: "C", detail: "Satisfactory performance" };
  }

  return { label: "Pass", detail: "Meets minimum requirement" };
}

function getPublishStatus(publishDate) {
  if (!publishDate) {
    return { label: "Pending", tone: "text-slate-500" };
  }

  const now = new Date();
  const publish = new Date(`${publishDate}T00:00:00`);
  if (publish <= now) {
    return { label: "Published", tone: "text-emerald-700" };
  }

  return { label: "Scheduled", tone: "text-amber-700" };
}

function getDueStatus(dueDate) {
  if (!dueDate) {
    return { label: "No deadline", tone: "text-slate-500" };
  }

  const now = new Date();
  const due = new Date(`${dueDate}T23:59:59`);
  if (due < now) {
    return { label: "Closed", tone: "text-rose-700" };
  }

  return { label: "Open", tone: "text-emerald-700" };
}

function SectionCard({ title, description, actions, children }) {
  return (
    <section className={CARD_CLASS}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          {description ? <p className="mt-1 text-sm text-slate-600">{description}</p> : null}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

function ModeSwitcher({ activeMode, onChange }) {
  return (
    <div className="flex w-full flex-wrap gap-2 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">
      {MODE_OPTIONS.map((mode) => {
        const active = activeMode === mode.id;
        return (
          <button
            key={mode.id}
            type="button"
            onClick={() => onChange(mode.id)}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition duration-200 sm:px-4 ${
              active
                ? "bg-slate-900 text-white shadow"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {mode.label}
          </button>
        );
      })}
    </div>
  );
}

function EmptyCriteriaState({ canEdit, onAdd }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center">
      <p className="text-sm font-medium text-slate-700">No rubric criteria yet.</p>
      <p className="mt-1 text-sm text-slate-500">
        Add at least one criterion to define how this project will be graded.
      </p>
      {canEdit ? (
        <button
          type="button"
          className="mt-4 rounded-lg border border-sky-200 bg-sky-50 px-4 py-2 text-sm font-semibold text-blue-700 transition duration-200 hover:bg-sky-100"
          onClick={onAdd}
        >
          Add first criterion
        </button>
      ) : null}
    </div>
  );
}

function TimelineCard({ publishDate, dueDate }) {
  const publishStatus = getPublishStatus(publishDate);
  const dueStatus = getDueStatus(dueDate);

  return (
    <section className={CARD_CLASS}>
      <h3 className="text-sm font-semibold text-slate-900">Timeline</h3>
      <div className="relative mt-4 space-y-6 pl-6">
        <div className="absolute left-[9px] top-2 h-[calc(100%-16px)] w-px bg-slate-200" />

        <div className="relative">
          <span className="absolute -left-6 top-1.5 h-3 w-3 rounded-full border-2 border-blue-300 bg-blue-500" />
          <p className="text-sm font-semibold text-slate-900">Publish Date</p>
          <p className="text-sm text-slate-600">{formatDate(publishDate)}</p>
          <p className={`text-xs font-semibold ${publishStatus.tone}`}>{publishStatus.label}</p>
        </div>

        <div className="relative">
          <span className="absolute -left-6 top-1.5 h-3 w-3 rounded-full border-2 border-violet-300 bg-violet-500" />
          <p className="text-sm font-semibold text-slate-900">Due Date</p>
          <p className="text-sm text-slate-600">{formatDate(dueDate)}</p>
          <p className={`text-xs font-semibold ${dueStatus.tone}`}>{dueStatus.label}</p>
        </div>
      </div>
    </section>
  );
}

function CircularScore({ percentage, strokeColor }) {
  const clamped = Math.min(Math.max(percentage, 0), 100);
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <div className="relative h-36 w-36">
      <svg
        className="h-full w-full -rotate-90"
        viewBox="0 0 120 120"
        role="img"
        aria-label="Score percentage"
      >
        <circle cx="60" cy="60" r={radius} stroke="#e2e8f0" strokeWidth="10" fill="none" />
        <circle
          cx="60"
          cy="60"
          r={radius}
          stroke={strokeColor}
          strokeWidth="10"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-slate-900">{clamped.toFixed(1)}%</span>
        <span className="text-xs font-medium text-slate-500">Performance</span>
      </div>
    </div>
  );
}

function GradeBadge({ gradeMeta }) {
  const tone = GRADE_TONE[gradeMeta.label] || GRADE_TONE.Pass;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Final Grade</p>
      <div className="mt-3 flex items-end gap-3">
        <span
          className={`inline-flex min-h-16 min-w-16 items-center justify-center rounded-2xl px-4 text-3xl font-bold ring-1 ${tone.chip}`}
        >
          {gradeMeta.label}
        </span>
        <p className="text-sm text-slate-600">{gradeMeta.detail}</p>
      </div>
    </div>
  );
}

function CriteriaBuilder({ criteria, onUpdateCriterion, onRemoveCriterion, onAddCriterion }) {
  if (!criteria.length) {
    return <EmptyCriteriaState canEdit onAdd={onAddCriterion} />;
  }

  return (
    <div className="grid gap-3">
      {criteria.map((item, index) => (
        <article
          className="group rounded-xl border border-slate-200 bg-slate-50 p-3 transition duration-200 hover:border-slate-300 hover:bg-white"
          key={item.id}
        >
          <div className="mb-2.5 flex items-center justify-between">
            <strong className="text-sm text-slate-900">Criterion {index + 1}</strong>
            <button
              type="button"
              className="text-sm font-medium text-rose-600 transition duration-200 hover:text-rose-700"
              onClick={() => onRemoveCriterion(item.id)}
            >
              Remove
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-[2fr_1fr]">
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-slate-700">Title</span>
              <input
                type="text"
                className={INPUT_CLASS}
                placeholder="Code Quality"
                value={item.name}
                onChange={(event) => onUpdateCriterion(item.id, "name", event.target.value)}
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-sm font-medium text-slate-700">Points</span>
              <input
                type="number"
                min="0"
                className={INPUT_CLASS}
                value={item.points}
                onChange={(event) => onUpdateCriterion(item.id, "points", event.target.value)}
              />
            </label>
          </div>

          <label className="mt-3 block space-y-1.5">
            <span className="text-sm font-medium text-slate-700">Notes</span>
            <textarea
              rows="3"
              className={INPUT_CLASS}
              placeholder="What does excellent work look like for this criterion?"
              value={item.notes}
              onChange={(event) => onUpdateCriterion(item.id, "notes", event.target.value)}
            />
          </label>
        </article>
      ))}
    </div>
  );
}

function GradeModeTable({ criteria, scores, onUpdateScore }) {
  if (!criteria.length) {
    return <EmptyCriteriaState canEdit={false} />;
  }

  return (
    <div className="grid gap-3">
      {criteria.map((criterion, index) => {
        const maxPoints = Number(criterion.points) || 0;
        const rawValue = scores[criterion.id] ?? "";
        const numeric = Number(rawValue);
        const hasValue = rawValue !== "";
        const hasError = hasValue && (numeric < 0 || numeric > maxPoints);

        return (
          <article
            key={criterion.id}
            className={`rounded-xl border bg-white p-4 transition duration-200 ${
              hasError ? "border-rose-300" : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-900">Criterion {index + 1}</p>
                <p className="text-sm text-slate-600">{criterion.name || "Untitled Criterion"}</p>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                Max {maxPoints} pts
              </span>
            </div>

            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
              <label className="space-y-1.5">
                <span className="text-sm font-medium text-slate-700">Student score</span>
                <input
                  type="number"
                  min="0"
                  max={maxPoints}
                  className={`${INPUT_CLASS} ${
                    hasError ? "border-rose-400 focus:border-rose-500 focus:ring-rose-100" : ""
                  }`}
                  value={rawValue}
                  onChange={(event) => onUpdateScore(criterion.id, event.target.value)}
                  placeholder="0"
                />
              </label>
              <span className="text-xs text-slate-500">/{maxPoints} points</span>
            </div>

            {criterion.notes ? <p className="mt-3 text-xs text-slate-500">{criterion.notes}</p> : null}

            {hasError ? (
              <p className="mt-2 text-xs font-semibold text-rose-600">
                Score must be between 0 and {maxPoints}.
              </p>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}

function StudentPreview({ formData, criteria, totalPoints }) {
  return (
    <div className="grid gap-4">
      <SectionCard
        title={formData.assignmentName || "Untitled Assignment"}
        description="Student preview mode (read-only)"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Project</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {formData.projectName || "Not provided"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Total Points
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{totalPoints}</p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Publish Date
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-900">
              {formatDate(formData.publishDate)}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Due Date</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{formatDate(formData.dueDate)}</p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Instructions</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">
            {formData.description || "No instructions provided."}
          </p>
        </div>
      </SectionCard>

      <SectionCard title="Rubric" description="How your submission will be evaluated">
        {criteria.length ? (
          <div className="grid gap-3">
            {criteria.map((item, index) => {
              const points = Number(item.points) || 0;
              const share = totalPoints > 0 ? (points / totalPoints) * 100 : 0;

              return (
                <article
                  key={item.id}
                  className="rounded-xl border border-slate-200 bg-white p-4 transition duration-200 hover:border-slate-300"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {index + 1}. {item.name || "Untitled Criterion"}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">{item.notes || "No notes"}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                      {points} pts
                    </span>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-700"
                      style={{ width: `${Math.min(Math.max(share, 0), 100)}%` }}
                    />
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <EmptyCriteriaState canEdit={false} />
        )}
      </SectionCard>
    </div>
  );
}

export default function ProjectGrade() {
  const [activeMode, setActiveMode] = useState("build");
  const [formData, setFormData] = useState({
    projectName: "",
    assignmentName: "",
    gradeCategory: "Project",
    gradingModel: "Points",
    totalPoints: "100",
    passingScore: "60",
    publishDate: "",
    dueDate: "",
    visibility: "Private",
    allowResubmission: true,
    latePenalty: "10",
    description: "",
  });
  const [criteria, setCriteria] = useState(DEFAULT_CRITERIA);
  const [student, setStudent] = useState({ name: "", id: "" });
  const [studentScores, setStudentScores] = useState({});
  const [statusMessage, setStatusMessage] = useState("");

  const totalPoints = Number(formData.totalPoints) || 0;
  const passingScore = Number(formData.passingScore) || 0;

  const assignedPoints = useMemo(() => {
    return criteria.reduce((sum, item) => sum + (Number(item.points) || 0), 0);
  }, [criteria]);

  const remainingPoints = totalPoints - assignedPoints;
  const isOverAllocated = assignedPoints > totalPoints;
  const hasCriteria = criteria.length > 0;

  const completion = useMemo(() => {
    const required = [
      formData.projectName,
      formData.assignmentName,
      formData.totalPoints,
      formData.passingScore,
      formData.dueDate,
      formData.description,
      hasCriteria ? "has-criteria" : "",
    ];

    const done = required.filter((value) => String(value).trim().length > 0).length;
    return Math.round((done / required.length) * 100);
  }, [formData, hasCriteria]);

  const gradeScale = useMemo(() => {
    return [
      { label: "A", value: Math.round(totalPoints * 0.9), tone: "A" },
      { label: "B", value: Math.round(totalPoints * 0.8), tone: "B" },
      { label: "C", value: Math.round(totalPoints * 0.7), tone: "C" },
      { label: "Pass", value: passingScore, tone: "Pass" },
      { label: "Fail", value: Math.max(passingScore - 1, 0), tone: "Fail" },
    ];
  }, [passingScore, totalPoints]);

  const scoreStats = useMemo(() => {
    const issues = [];
    const earned = criteria.reduce((sum, criterion) => {
      const maxPoints = Number(criterion.points) || 0;
      const raw = studentScores[criterion.id];

      if (raw === undefined || raw === "") {
        return sum;
      }

      const numeric = Number(raw);
      if (Number.isNaN(numeric)) {
        issues.push(criterion.id);
        return sum;
      }

      if (numeric < 0 || numeric > maxPoints) {
        issues.push(criterion.id);
      }

      const clamped = Math.min(Math.max(numeric, 0), maxPoints);
      return sum + clamped;
    }, 0);

    const percentage = totalPoints > 0 ? (earned / totalPoints) * 100 : 0;
    const roundedPercentage = Number.isFinite(percentage) ? Math.round(percentage * 10) / 10 : 0;

    return {
      earned,
      percentage: roundedPercentage,
      hasScoreErrors: issues.length > 0,
      issues,
    };
  }, [criteria, studentScores, totalPoints]);

  const gradeMeta = useMemo(() => {
    return getGradeMeta(scoreStats.percentage, scoreStats.earned, passingScore);
  }, [scoreStats, passingScore]);

  const isRubricInvalid = totalPoints <= 0 || !hasCriteria || isOverAllocated;
  const canPublish = !isRubricInvalid;
  const canSubmitGrade = canPublish && !scoreStats.hasScoreErrors;

  const updateForm = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateCriterion = (criterionId, field, value) => {
    setCriteria((prev) =>
      prev.map((item) =>
        item.id === criterionId
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const addCriterion = () => {
    const next = createCriterion();
    setCriteria((prev) => [...prev, next]);
  };

  const removeCriterion = (criterionId) => {
    setCriteria((prev) => prev.filter((item) => item.id !== criterionId));
    setStudentScores((prev) => {
      const next = { ...prev };
      delete next[criterionId];
      return next;
    });
  };

  const updateStudentScore = (criterionId, value) => {
    setStudentScores((prev) => ({ ...prev, [criterionId]: value }));
  };

  const saveDraft = () => {
    setStatusMessage("UI draft saved. No backend call was made.");
  };

  const publishRubric = (event) => {
    event.preventDefault();
    if (!canPublish) {
      return;
    }

    setStatusMessage("Rubric published in demo mode.");
  };

  const submitGrade = () => {
    if (!canSubmitGrade) {
      return;
    }

    setStatusMessage("Grade submitted in demo mode.");
  };

  const tone = GRADE_TONE[gradeMeta.label] || GRADE_TONE.Pass;

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-50 px-3 py-4 sm:px-6 sm:py-6 lg:px-10 lg:py-8">
      <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-blue-200/60 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-indigo-200/60 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-7xl space-y-4 sm:space-y-5">
        <header className="space-y-3">
          <span className="inline-flex rounded-full border border-sky-200 bg-sky-100 px-2.5 py-1 text-xs font-semibold text-blue-700">
            Grading Workspace
          </span>
          <div>
            <h1 className="text-2xl font-bold leading-tight text-slate-900 sm:text-3xl">
              Project Rubric and Grading Interface
            </h1>
            <p className="mt-2 max-w-3xl text-sm text-slate-600 sm:text-base">
              Build rubric criteria, grade a student, and preview exactly what learners will see.
            </p>
          </div>
          <ModeSwitcher activeMode={activeMode} onChange={setActiveMode} />
        </header>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.65fr)_minmax(320px,1fr)] xl:items-start">
          <div className="space-y-4">
            {activeMode === "build" ? (
              <form className="space-y-4" onSubmit={publishRubric}>
                <SectionCard
                  title="Basic Details"
                  description="Name the project and choose your grading model."
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="space-y-1.5">
                      <span className="text-sm font-medium text-slate-700">Project Name</span>
                      <input
                        type="text"
                        className={INPUT_CLASS}
                        placeholder="Semester Web App"
                        value={formData.projectName}
                        onChange={(event) => updateForm("projectName", event.target.value)}
                      />
                    </label>

                    <label className="space-y-1.5">
                      <span className="text-sm font-medium text-slate-700">Assignment Title</span>
                      <input
                        type="text"
                        className={INPUT_CLASS}
                        placeholder="Final Frontend Delivery"
                        value={formData.assignmentName}
                        onChange={(event) => updateForm("assignmentName", event.target.value)}
                      />
                    </label>

                    <label className="space-y-1.5">
                      <span className="text-sm font-medium text-slate-700">Category</span>
                      <select
                        className={INPUT_CLASS}
                        value={formData.gradeCategory}
                        onChange={(event) => updateForm("gradeCategory", event.target.value)}
                      >
                        <option value="Project">Project</option>
                        <option value="Exam">Exam</option>
                        <option value="Homework">Homework</option>
                        <option value="Lab">Lab</option>
                      </select>
                    </label>

                    <label className="space-y-1.5">
                      <span className="text-sm font-medium text-slate-700">Grading Model</span>
                      <select
                        className={INPUT_CLASS}
                        value={formData.gradingModel}
                        onChange={(event) => updateForm("gradingModel", event.target.value)}
                      >
                        <option value="Points">Points</option>
                        <option value="Percentage">Percentage</option>
                        <option value="Letter">Letter Grade</option>
                      </select>
                    </label>
                  </div>
                </SectionCard>

                <SectionCard
                  title="Scoring and Schedule"
                  description="Define points, dates, and student access controls."
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="space-y-1.5">
                      <span className="text-sm font-medium text-slate-700">Total Points</span>
                      <input
                        type="number"
                        min="1"
                        className={INPUT_CLASS}
                        value={formData.totalPoints}
                        onChange={(event) => updateForm("totalPoints", event.target.value)}
                      />
                    </label>

                    <label className="space-y-1.5">
                      <span className="text-sm font-medium text-slate-700">Passing Score</span>
                      <input
                        type="number"
                        min="0"
                        className={INPUT_CLASS}
                        value={formData.passingScore}
                        onChange={(event) => updateForm("passingScore", event.target.value)}
                      />
                    </label>

                    <label className="space-y-1.5">
                      <span className="text-sm font-medium text-slate-700">Publish Date</span>
                      <input
                        type="date"
                        className={INPUT_CLASS}
                        value={formData.publishDate}
                        onChange={(event) => updateForm("publishDate", event.target.value)}
                      />
                    </label>

                    <label className="space-y-1.5">
                      <span className="text-sm font-medium text-slate-700">Due Date</span>
                      <input
                        type="date"
                        className={INPUT_CLASS}
                        value={formData.dueDate}
                        onChange={(event) => updateForm("dueDate", event.target.value)}
                      />
                    </label>

                    <label className="space-y-1.5">
                      <span className="text-sm font-medium text-slate-700">Visibility</span>
                      <select
                        className={INPUT_CLASS}
                        value={formData.visibility}
                        onChange={(event) => updateForm("visibility", event.target.value)}
                      >
                        <option value="Private">Private</option>
                        <option value="Classroom">Classroom</option>
                        <option value="Public">Public</option>
                      </select>
                    </label>

                    <label className="space-y-1.5">
                      <span className="text-sm font-medium text-slate-700">Late Penalty (%)</span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        className={INPUT_CLASS}
                        value={formData.latePenalty}
                        onChange={(event) => updateForm("latePenalty", event.target.value)}
                      />
                    </label>
                  </div>

                  <label className="mt-4 flex items-center gap-2 text-sm font-medium text-slate-700">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-blue-600"
                      checked={formData.allowResubmission}
                      onChange={(event) => updateForm("allowResubmission", event.target.checked)}
                    />
                    <span>Allow resubmission after feedback</span>
                  </label>
                </SectionCard>

                <SectionCard
                  title="Rubric Criteria"
                  description="Add scoring dimensions and point distribution."
                  actions={
                    <button
                      type="button"
                      className="rounded-lg border border-sky-200 bg-sky-50 px-3 py-2 text-sm font-semibold text-blue-700 transition duration-200 hover:bg-sky-100"
                      onClick={addCriterion}
                    >
                      Add Criterion
                    </button>
                  }
                >
                  <CriteriaBuilder
                    criteria={criteria}
                    onUpdateCriterion={updateCriterion}
                    onRemoveCriterion={removeCriterion}
                    onAddCriterion={addCriterion}
                  />
                </SectionCard>

                <SectionCard
                  title="Instructions"
                  description="Provide guidance students should read before submission."
                >
                  <label className="block space-y-1.5">
                    <span className="text-sm font-medium text-slate-700">Description</span>
                    <textarea
                      rows="5"
                      className={INPUT_CLASS}
                      placeholder="Explain requirements, submission format, and expected outcomes."
                      value={formData.description}
                      onChange={(event) => updateForm("description", event.target.value)}
                    />
                  </label>
                </SectionCard>

                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 transition duration-200 hover:border-slate-400 hover:bg-slate-50"
                    onClick={saveDraft}
                  >
                    Save Draft
                  </button>
                  <button
                    type="submit"
                    disabled={!canPublish}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold text-white shadow transition duration-200 ${
                      canPublish
                        ? "bg-blue-600 hover:-translate-y-0.5 hover:bg-blue-700"
                        : "cursor-not-allowed bg-slate-400"
                    }`}
                  >
                    Publish Rubric
                  </button>
                </div>
              </form>
            ) : null}

            {activeMode === "grade" ? (
              <div className="space-y-4">
                <SectionCard
                  title="Student"
                  description="Enter learner details and criterion scores."
                >
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="space-y-1.5">
                      <span className="text-sm font-medium text-slate-700">Student Name</span>
                      <input
                        type="text"
                        className={INPUT_CLASS}
                        placeholder="John Doe"
                        value={student.name}
                        onChange={(event) =>
                          setStudent((prev) => ({ ...prev, name: event.target.value }))
                        }
                      />
                    </label>
                    <label className="space-y-1.5">
                      <span className="text-sm font-medium text-slate-700">Student ID</span>
                      <input
                        type="text"
                        className={INPUT_CLASS}
                        placeholder="S-1024"
                        value={student.id}
                        onChange={(event) =>
                          setStudent((prev) => ({ ...prev, id: event.target.value }))
                        }
                      />
                    </label>
                  </div>
                </SectionCard>

                <SectionCard
                  title="Criterion Scores"
                  description="Input achieved points for each rubric criterion."
                >
                  <GradeModeTable
                    criteria={criteria}
                    scores={studentScores}
                    onUpdateScore={updateStudentScore}
                  />

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={submitGrade}
                      disabled={!canSubmitGrade}
                      className={`rounded-lg px-4 py-2 text-sm font-semibold text-white shadow transition duration-200 ${
                        canSubmitGrade
                          ? "bg-emerald-600 hover:-translate-y-0.5 hover:bg-emerald-700"
                          : "cursor-not-allowed bg-slate-400"
                      }`}
                    >
                      Submit Grade
                    </button>
                  </div>
                </SectionCard>
              </div>
            ) : null}

            {activeMode === "preview" ? (
              <StudentPreview formData={formData} criteria={criteria} totalPoints={totalPoints} />
            ) : null}

            {statusMessage ? (
              <p className="text-sm font-semibold text-emerald-700">{statusMessage}</p>
            ) : null}
          </div>

          <aside className="grid gap-4 xl:sticky xl:top-4">
            <section className={CARD_CLASS}>
              <h3 className="text-sm font-semibold text-slate-900">Rubric Health</h3>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-700 transition-all duration-700"
                  style={{ width: `${completion}%` }}
                />
              </div>
              <p className="mt-2 text-sm text-slate-600">{completion}% setup complete</p>

              <ul className="mt-3 grid gap-2 text-sm">
                <li className="flex items-center justify-between">
                  <span className="text-slate-600">Total points</span>
                  <strong className="text-slate-900">{totalPoints}</strong>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-slate-600">Assigned points</span>
                  <strong className="text-slate-900">{assignedPoints}</strong>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-slate-600">Remaining points</span>
                  <strong className={remainingPoints < 0 ? "text-rose-600" : "text-emerald-700"}>
                    {remainingPoints}
                  </strong>
                </li>
              </ul>

              {isOverAllocated ? (
                <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  Assigned points exceed total points. Adjust rubric allocation before publishing.
                </div>
              ) : null}

              {!hasCriteria ? (
                <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                  Add at least one criterion to make this rubric valid.
                </div>
              ) : null}
            </section>

            <TimelineCard publishDate={formData.publishDate} dueDate={formData.dueDate} />

            <section className={CARD_CLASS}>
              <h3 className="text-sm font-semibold text-slate-900">Grade Scale</h3>
              <ul className="mt-3 grid gap-2">
                {gradeScale.map((item) => {
                  const toneClass = GRADE_TONE[item.tone] || GRADE_TONE.Pass;
                  return (
                    <li className="flex items-center justify-between text-sm" key={item.label}>
                      <span
                        className={`inline-flex min-w-14 items-center justify-center rounded-full px-2 py-0.5 text-xs font-bold uppercase ring-1 ${toneClass.chip}`}
                      >
                        {item.label}
                      </span>
                      <span className="text-slate-600">{item.value}+ pts</span>
                    </li>
                  );
                })}
              </ul>
            </section>

            <section className={CARD_CLASS}>
              <h3 className="text-sm font-semibold text-slate-900">Performance</h3>
              <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-between xl:flex-col xl:items-start">
                <CircularScore percentage={scoreStats.percentage} strokeColor={tone.stroke} />
                <div className="w-full">
                  <GradeBadge gradeMeta={gradeMeta} />
                </div>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className={`h-full rounded-full bg-gradient-to-r transition-all duration-700 ${tone.progress}`}
                  style={{ width: `${Math.min(Math.max(scoreStats.percentage, 0), 100)}%` }}
                />
              </div>

              <div className="mt-3 grid gap-1 text-sm">
                <div className="flex items-center justify-between text-slate-700">
                  <span>Earned score</span>
                  <strong className={tone.text}>{scoreStats.earned.toFixed(1)} pts</strong>
                </div>
                <div className="flex items-center justify-between text-slate-700">
                  <span>Percentage</span>
                  <strong className={tone.text}>{scoreStats.percentage.toFixed(1)}%</strong>
                </div>
              </div>

              {scoreStats.hasScoreErrors ? (
                <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
                  One or more criterion scores are out of range. Fix errors to submit.
                </div>
              ) : null}
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
