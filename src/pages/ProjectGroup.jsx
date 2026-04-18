import {
  Activity,
  AlertTriangle,
  FolderOpen,
  GripVertical,
  Keyboard,
  ListTodo,
  Loader2,
  Moon,
  Pencil,
  Plus,
  RefreshCcw,
  Search,
  Sun,
  Trash2,
  UserPlus,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  CounterBadge,
  EmptyState,
  InlineAlert,
  Panel,
  ToastStack,
  UiButton,
  UiInput,
} from "../components/project-group/ProjectGroupPrimitives";

const STORAGE_KEY = "project-groups-v1";
const THEME_KEY = "project-groups-theme";

const defaultGroups = [
  {
    name: "My Team",
    members: [
      { id: 1, name: "Ali", role: "Admin" },
      { id: 2, name: "Sara", role: "Member" },
      { id: 3, name: "Ahmad", role: "Member" },
    ],
    projects: [
      { id: 1, title: "Dashboard UI" },
      { id: 2, title: "Auth System" },
    ],
    tasks: {
      todo: [
        { id: 1, title: "Fix navbar bug" },
        { id: 2, title: "Improve UI design" },
      ],
      doing: [],
      done: [],
    },
    activity: ["Ali created Dashboard UI", "Sara joined the team"],
  },
  {
    name: "Dev Team",
    members: [
      { id: 1, name: "Omar", role: "Admin" },
      { id: 2, name: "Nadia", role: "Member" },
    ],
    projects: [{ id: 1, title: "API Development" }],
    tasks: {
      todo: [{ id: 1, title: "Build REST API" }],
      doing: [],
      done: [],
    },
    activity: ["Omar deployed backend"],
  },
  {
    name: "Design Team",
    members: [
      { id: 1, name: "Lina", role: "Admin" },
      { id: 2, name: "Yusuf", role: "Member" },
    ],
    projects: [{ id: 1, title: "UI Kit Design" }],
    tasks: {
      todo: [{ id: 1, title: "Create color system" }],
      doing: [],
      done: [],
    },
    activity: ["Lina updated color system"],
  },
];

const taskColumns = {
  todo: { label: "To do" },
  doing: { label: "In progress" },
  done: { label: "Done" },
};

const createId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const readGroupsFromStorage = () => {
  if (typeof window === "undefined") {
    return { groups: defaultGroups, error: "" };
  }

  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return { groups: defaultGroups, error: "" };
  }

  try {
    const parsed = JSON.parse(saved);
    if (!Array.isArray(parsed)) {
      throw new Error("Invalid workspace format");
    }

    return {
      groups: parsed.length ? parsed : defaultGroups,
      error: "",
    };
  } catch {
    return {
      groups: defaultGroups,
      error:
        "Saved workspace data could not be loaded. Defaults are shown until you reload or reset storage.",
    };
  }
};

const getInitials = (name) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
};

const getRoleBadgeClass = (role, isDark) => {
  if (role === "Admin") {
    return isDark
      ? "border-[#9e6a03] bg-[#463800] text-[#d29922]"
      : "border-[#eac54f] bg-[#fff8c5] text-[#9a6700]";
  }

  return isDark
    ? "border-[#1f6feb] bg-[#0d419d33] text-[#58a6ff]"
    : "border-[#54aeff] bg-[#ddf4ff] text-[#0550ae]";
};

const getTaskTone = (column, isDark) => {
  if (column === "doing") {
    return {
      pill: isDark ? "bg-[#463800] text-[#d29922]" : "bg-[#fff8c5] text-[#9a6700]",
      dot: isDark ? "bg-[#d29922]" : "bg-[#bf8700]",
    };
  }

  if (column === "done") {
    return {
      pill: isDark ? "bg-[#1f6f3a66] text-[#3fb950]" : "bg-[#dafbe1] text-[#1a7f37]",
      dot: isDark ? "bg-[#3fb950]" : "bg-[#1a7f37]",
    };
  }

  return {
    pill: isDark ? "bg-[#0d419d33] text-[#58a6ff]" : "bg-[#ddf4ff] text-[#0969da]",
    dot: isDark ? "bg-[#58a6ff]" : "bg-[#0969da]",
  };
};

export default function ProjectGroup() {
  const [initialWorkspace] = useState(() => readGroupsFromStorage());
  const [groups, setGroups] = useState(initialWorkspace.groups);
  const [storageError, setStorageError] = useState(initialWorkspace.error);
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return "light";
    return window.localStorage.getItem(THEME_KEY) === "dark" ? "dark" : "light";
  });
  const [activeTab, setActiveTab] = useState("members");
  const [selectedGroup, setSelectedGroup] = useState(0);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", role: "Member" });
  const [newTask, setNewTask] = useState("");
  const [dragItem, setDragItem] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [memberError, setMemberError] = useState("");
  const [taskError, setTaskError] = useState("");
  const [toasts, setToasts] = useState([]);
  const [pending, setPending] = useState({
    reload: false,
    addMember: false,
    addTask: false,
    saveTaskId: null,
    deleteTaskId: null,
  });

  const searchInputRef = useRef(null);
  const isDark = theme === "dark";

  const palette = isDark
    ? {
        page: "bg-[#0d1117] text-[#e6edf3]",
        panel: "bg-[#161b22]",
        panelMuted: "bg-[#0d1117]",
        border: "border-[#30363d]",
        text: "text-[#e6edf3]",
        muted: "text-[#8b949e]",
        input:
          "border-[#30363d] bg-[#0d1117] text-[#e6edf3] placeholder:text-[#7d8590] focus:border-[#1f6feb]",
        primaryBtn: "border-transparent bg-[#238636] text-white hover:bg-[#2ea043]",
        secondaryBtn:
          "border-[#30363d] bg-[#21262d] text-[#c9d1d9] hover:bg-[#30363d]",
        redBtn: "border-[#f85149]/40 bg-[#da3633]/20 text-[#ff7b72] hover:bg-[#f85149]/25",
        ghostBtn: "border-transparent bg-transparent text-[#8b949e] hover:bg-[#21262d]",
        tabActive: "border-[#30363d] bg-[#161b22] text-[#e6edf3]",
        tabIdle: "border-transparent text-[#8b949e] hover:bg-[#21262d]",
        itemHover: "hover:bg-[#21262d]",
        badge: "bg-[#21262d] text-[#8b949e]",
        sidebarActive: "border-[#1f6feb] bg-[#0d419d33]",
        taskCardHover: "hover:border-[#1f6feb]",
        avatar: "bg-[#30363d] text-[#e6edf3]",
        blueLink: "text-[#58a6ff]",
      }
    : {
        page: "bg-[#f6f8fa] text-[#1f2328]",
        panel: "bg-white",
        panelMuted: "bg-[#f6f8fa]",
        border: "border-[#d0d7de]",
        text: "text-[#24292f]",
        muted: "text-[#57606a]",
        input:
          "border-[#d0d7de] bg-white text-[#24292f] placeholder:text-[#656d76] focus:border-[#0969da]",
        primaryBtn: "border-transparent bg-[#1f883d] text-white hover:bg-[#1a7f37]",
        secondaryBtn: "border-[#d0d7de] bg-white text-[#24292f] hover:bg-[#f3f4f6]",
        redBtn: "border-[#d1242f3d] bg-[#ffebe9] text-[#cf222e] hover:bg-[#ffd7d5]",
        ghostBtn: "border-transparent bg-transparent text-[#57606a] hover:bg-[#f3f4f6]",
        tabActive: "border-[#d0d7de] bg-white text-[#24292f]",
        tabIdle: "border-transparent text-[#57606a] hover:bg-[#f3f4f6]",
        itemHover: "hover:bg-[#f3f4f6]",
        badge: "bg-[#eaeef2] text-[#57606a]",
        sidebarActive: "border-[#0969da] bg-[#ddf4ff]",
        taskCardHover: "hover:border-[#0969da]",
        avatar: "bg-[#d0d7de] text-[#24292f]",
        blueLink: "text-[#0969da]",
      };

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
    }
  }, [groups]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(THEME_KEY, theme);
    }
  }, [theme]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toLowerCase();
      const isModifier = event.metaKey || event.ctrlKey;
      const target = event.target;
      const tagName =
        target && typeof target === "object" && "tagName" in target ? target.tagName : "";
      const isTypingField =
        tagName === "INPUT" ||
        tagName === "TEXTAREA" ||
        tagName === "SELECT" ||
        Boolean(
          target &&
            typeof target === "object" &&
            "isContentEditable" in target &&
            target.isContentEditable
        );

      if (isModifier && key === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      if (isModifier && key === "i") {
        event.preventDefault();
        setShowModal(true);
        return;
      }

      if (isModifier && key === "t") {
        event.preventDefault();
        setActiveTab("tasks");
        return;
      }

      if (isModifier && event.shiftKey && key === "l") {
        event.preventDefault();
        setTheme((prev) => (prev === "light" ? "dark" : "light"));
        return;
      }

      if (key === "escape") {
        if (showModal) {
          setShowModal(false);
          setNewMember({ name: "", role: "Member" });
          setMemberError("");
        }

        if (editingTask) {
          setEditingTask(null);
        }

        return;
      }

      if (isTypingField) {
        return;
      }

      if (key === "1") setActiveTab("members");
      if (key === "2") setActiveTab("projects");
      if (key === "3") setActiveTab("tasks");
      if (key === "4") setActiveTab("activity");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [editingTask, showModal]);

  const currentGroup = groups[selectedGroup] ?? groups[0];

  const totalTasks =
    currentGroup.tasks.todo.length +
    currentGroup.tasks.doing.length +
    currentGroup.tasks.done.length;

  const tabs = [
    { key: "members", label: "Members", icon: Users, count: currentGroup.members.length },
    { key: "projects", label: "Projects", icon: FolderOpen, count: currentGroup.projects.length },
    { key: "tasks", label: "Tasks", icon: ListTodo, count: totalTasks },
    { key: "activity", label: "Activity", icon: Activity, count: currentGroup.activity.length },
  ];

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const pushToast = ({ type = "info", title, message }) => {
    const id = createId();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      dismissToast(id);
    }, 3200);
  };

  const updateCurrentGroup = (updater) => {
    setGroups((prevGroups) =>
      prevGroups.map((group, index) => (index === selectedGroup ? updater(group) : group))
    );
  };

  const closeInviteModal = () => {
    setShowModal(false);
    setNewMember({ name: "", role: "Member" });
    setMemberError("");
  };

  const reloadFromStorage = async () => {
    setPending((prev) => ({ ...prev, reload: true }));
    await sleep(260);
    const next = readGroupsFromStorage();
    setGroups(next.groups);
    setStorageError(next.error);
    setSelectedGroup(0);
    setPending((prev) => ({ ...prev, reload: false }));

    if (next.error) {
      pushToast({
        type: "error",
        title: "Reload completed with warning",
        message: "Stored data is still invalid. Defaults remain active.",
      });
      return;
    }

    pushToast({
      type: "success",
      title: "Workspace reloaded",
      message: "Latest saved data is now applied.",
    });
  };

  const resetStorage = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
    }

    setGroups(defaultGroups);
    setStorageError("");
    setSelectedGroup(0);

    pushToast({
      type: "success",
      title: "Storage reset",
      message: "Workspace data was reset to defaults.",
    });
  };

  const addMember = async () => {
    const memberName = newMember.name.trim();
    if (!memberName) {
      setMemberError("Please enter a member name.");
      return;
    }

    setMemberError("");
    setPending((prev) => ({ ...prev, addMember: true }));
    await sleep(180);

    const groupName = currentGroup.name;

    updateCurrentGroup((group) => ({
      ...group,
      members: [
        ...group.members,
        {
          id: createId(),
          name: memberName,
          role: newMember.role,
        },
      ],
      activity: [`${memberName} joined the group`, ...group.activity],
    }));

    setPending((prev) => ({ ...prev, addMember: false }));
    setNewMember({ name: "", role: "Member" });
    setShowModal(false);

    pushToast({
      type: "success",
      title: "Member invited",
      message: `${memberName} added to ${groupName}.`,
    });
  };

  const addTask = async () => {
    const taskTitle = newTask.trim();
    if (!taskTitle) {
      setTaskError("Task title is required.");
      return;
    }

    setTaskError("");
    setPending((prev) => ({ ...prev, addTask: true }));
    await sleep(160);

    updateCurrentGroup((group) => ({
      ...group,
      tasks: {
        ...group.tasks,
        todo: [...group.tasks.todo, { id: createId(), title: taskTitle }],
      },
      activity: [`New task added: ${taskTitle}`, ...group.activity],
    }));

    setPending((prev) => ({ ...prev, addTask: false }));
    setNewTask("");

    pushToast({
      type: "success",
      title: "Task created",
      message: `"${taskTitle}" added to To do.`,
    });
  };

  const deleteTask = async (column, taskId) => {
    const taskToDelete = currentGroup.tasks[column].find((task) => task.id === taskId);
    if (!taskToDelete) return;

    setPending((prev) => ({ ...prev, deleteTaskId: taskId }));
    await sleep(120);

    updateCurrentGroup((group) => ({
      ...group,
      tasks: {
        ...group.tasks,
        [column]: group.tasks[column].filter((task) => task.id !== taskId),
      },
      activity: [`Task deleted: ${taskToDelete.title}`, ...group.activity],
    }));

    setPending((prev) => ({ ...prev, deleteTaskId: null }));
    setEditingTask((prev) => (prev && prev.id === taskId ? null : prev));

    pushToast({
      type: "success",
      title: "Task deleted",
      message: taskToDelete.title,
    });
  };

  const onDragStart = (task, from) => {
    setDragItem({ task, from });
  };

  const onDrop = (to) => {
    if (!dragItem || dragItem.from === to) {
      setDragItem(null);
      return;
    }

    const taskToMove = currentGroup.tasks[dragItem.from].find(
      (task) => task.id === dragItem.task.id
    );

    if (!taskToMove) {
      setDragItem(null);
      return;
    }

    updateCurrentGroup((group) => ({
      ...group,
      tasks: {
        ...group.tasks,
        [dragItem.from]: group.tasks[dragItem.from].filter(
          (task) => task.id !== dragItem.task.id
        ),
        [to]: [...group.tasks[to], taskToMove],
      },
      activity: [`Task moved to ${taskColumns[to].label}: ${taskToMove.title}`, ...group.activity],
    }));

    setDragItem(null);
  };

  const startEditTask = (column, task) => {
    setEditingTask({ id: task.id, column, title: task.title });
  };

  const saveEditTask = async () => {
    if (!editingTask) return;

    const updatedTitle = editingTask.title.trim();
    if (!updatedTitle) {
      pushToast({
        type: "error",
        title: "Task title missing",
        message: "Please enter a valid task title.",
      });
      return;
    }

    const oldTask = currentGroup.tasks[editingTask.column].find(
      (task) => task.id === editingTask.id
    );

    if (!oldTask) {
      setEditingTask(null);
      return;
    }

    setPending((prev) => ({ ...prev, saveTaskId: editingTask.id }));
    await sleep(120);

    updateCurrentGroup((group) => ({
      ...group,
      tasks: {
        ...group.tasks,
        [editingTask.column]: group.tasks[editingTask.column].map((task) =>
          task.id === editingTask.id ? { ...task, title: updatedTitle } : task
        ),
      },
      activity:
        oldTask.title === updatedTitle
          ? group.activity
          : [`Task updated: ${oldTask.title} -> ${updatedTitle}`, ...group.activity],
    }));

    setPending((prev) => ({ ...prev, saveTaskId: null }));
    setEditingTask(null);

    if (oldTask.title !== updatedTitle) {
      pushToast({
        type: "success",
        title: "Task updated",
        message: updatedTitle,
      });
    }
  };

  const filteredMembers = currentGroup.members.filter((member) =>
    member.name.toLowerCase().includes(search.toLowerCase())
  );

  const ThemeIcon = isDark ? Sun : Moon;

  const renderTaskColumn = (column) => {
    const tone = getTaskTone(column, isDark);
    const tasks = currentGroup.tasks[column];

    return (
      <Panel key={column} palette={palette}>
        <header className={`flex items-center justify-between border-b px-3 py-2 ${palette.border}`}>
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${tone.dot}`} />
            <h3 className={`text-sm font-semibold ${palette.text}`}>{taskColumns[column].label}</h3>
          </div>
          <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tone.pill}`}>
            {tasks.length}
          </span>
        </header>

        <div
          className={`min-h-52 space-y-2 p-3 ${palette.panelMuted}`}
          onDragOver={(event) => event.preventDefault()}
          onDrop={() => onDrop(column)}
        >
          {tasks.length === 0 ? (
            <p className={`rounded-md border border-dashed p-3 text-xs italic ${palette.border} ${palette.muted}`}>
              Drop a task here.
            </p>
          ) : null}

          {tasks.map((task) => {
            const isEditing =
              editingTask && editingTask.id === task.id && editingTask.column === column;
            const isSaving = pending.saveTaskId === task.id;
            const isDeleting = pending.deleteTaskId === task.id;

            return (
              <article
                key={task.id}
                draggable={!isEditing && !isSaving && !isDeleting}
                onDragStart={() => onDragStart(task, column)}
                className={`rounded-md border p-3 shadow-sm transition ${palette.border} ${palette.panel} ${palette.taskCardHover}`}
              >
                {isEditing ? (
                  <div className="space-y-2">
                    <UiInput
                      palette={palette}
                      value={editingTask.title}
                      onChange={(event) =>
                        setEditingTask((prev) => ({ ...prev, title: event.target.value }))
                      }
                      onKeyDown={(event) => {
                        if (event.key === "Enter") saveEditTask();
                        if (event.key === "Escape") setEditingTask(null);
                      }}
                      aria-label="Edit task title"
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <UiButton
                        palette={palette}
                        variant="primary"
                        size="sm"
                        onClick={saveEditTask}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <span className="inline-flex items-center gap-1">
                            <Loader2 size={12} className="animate-spin" />
                            Saving...
                          </span>
                        ) : (
                          "Save"
                        )}
                      </UiButton>
                      <UiButton
                        palette={palette}
                        variant="secondary"
                        size="sm"
                        onClick={() => setEditingTask(null)}
                        disabled={isSaving}
                      >
                        Cancel
                      </UiButton>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2">
                      <GripVertical size={14} className={`mt-0.5 ${palette.muted}`} />
                      <p className={`text-sm leading-5 ${palette.text}`}>{task.title}</p>
                    </div>

                    <div className="flex gap-1">
                      <UiButton
                        palette={palette}
                        variant="secondary"
                        size="sm"
                        icon={Pencil}
                        iconSize={12}
                        onClick={() => startEditTask(column, task)}
                        disabled={isSaving || isDeleting}
                      >
                        Edit
                      </UiButton>
                      <UiButton
                        palette={palette}
                        variant="danger"
                        size="sm"
                        icon={Trash2}
                        iconSize={12}
                        onClick={() => deleteTask(column, task.id)}
                        disabled={isSaving || isDeleting}
                      >
                        {isDeleting ? "Deleting..." : "Delete"}
                      </UiButton>
                    </div>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </Panel>
    );
  };

  return (
    <div className={`min-h-screen ${palette.page}`}>
      <ToastStack toasts={toasts} palette={palette} onDismiss={dismissToast} />

      <div className={`border-b ${palette.border} ${palette.panel}`}>
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-between px-4 py-3 sm:px-6">
          <p className={`text-sm ${palette.muted}`}>
            Teams / <span className={`font-medium ${palette.text}`}>{currentGroup.name}</span>
          </p>

          <div className="flex items-center gap-2">
            <UiButton
              palette={palette}
              variant="secondary"
              onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
              icon={ThemeIcon}
              title="Toggle theme (Ctrl/Cmd+Shift+L)"
            >
              {isDark ? "Light" : "Dark"}
            </UiButton>

            <UiButton
              palette={palette}
              variant="secondary"
              icon={RefreshCcw}
              disabled={pending.reload}
              onClick={reloadFromStorage}
            >
              {pending.reload ? "Reloading..." : "Reload"}
            </UiButton>

            <UiButton
              palette={palette}
              variant="primary"
              icon={UserPlus}
              onClick={() => setShowModal(true)}
            >
              Invite member
            </UiButton>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-[1400px] flex-col lg:flex-row">
        <aside className={`w-full border-b lg:w-72 lg:border-b-0 lg:border-r ${palette.border} ${palette.panel}`}>
          <div className="p-4">
            <h2 className={`text-sm font-semibold uppercase tracking-wide ${palette.muted}`}>Groups</h2>
            <ul className="mt-3 space-y-1">
              {groups.map((group, index) => {
                const isActive = selectedGroup === index;

                return (
                  <li key={group.name}>
                    <button
                      type="button"
                      onClick={() => setSelectedGroup(index)}
                      className={`flex w-full items-center justify-between rounded-md border px-3 py-2 text-left transition ${
                        isActive
                          ? `${palette.sidebarActive} ${palette.border}`
                          : `${palette.border} ${palette.itemHover}`
                      }`}
                    >
                      <span className={`text-sm font-medium ${palette.text}`}>{group.name}</span>
                      <CounterBadge palette={palette}>{group.members.length}</CounterBadge>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        <main className="flex-1 px-4 py-6 sm:px-6">
          {storageError ? (
            <InlineAlert
              palette={palette}
              title="Workspace recovery mode"
              description={storageError}
              actionLabel="Reset Storage"
              onAction={resetStorage}
              className="mb-4"
            />
          ) : null}

          <Panel palette={palette} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className={`text-2xl font-semibold tracking-tight ${palette.text}`}>
                  {currentGroup.name}
                </h1>
                <p className={`mt-1 text-sm ${palette.muted}`}>
                  Professional team workspace with reusable UI primitives and robust states.
                </p>
              </div>

              <div className="w-full sm:w-80">
                <UiInput
                  ref={searchInputRef}
                  palette={palette}
                  icon={Search}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search members"
                  aria-label="Search members"
                />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className={`rounded-md border p-3 ${palette.border} ${palette.panelMuted}`}>
                <p className={`text-xs ${palette.muted}`}>Members</p>
                <p className={`mt-1 text-lg font-semibold ${palette.text}`}>{currentGroup.members.length}</p>
              </div>
              <div className={`rounded-md border p-3 ${palette.border} ${palette.panelMuted}`}>
                <p className={`text-xs ${palette.muted}`}>Projects</p>
                <p className={`mt-1 text-lg font-semibold ${palette.text}`}>{currentGroup.projects.length}</p>
              </div>
              <div className={`rounded-md border p-3 ${palette.border} ${palette.panelMuted}`}>
                <p className={`text-xs ${palette.muted}`}>Open tasks</p>
                <p className={`mt-1 text-lg font-semibold ${palette.text}`}>
                  {currentGroup.tasks.todo.length + currentGroup.tasks.doing.length}
                </p>
              </div>
              <div className={`rounded-md border p-3 ${palette.border} ${palette.panelMuted}`}>
                <p className={`text-xs ${palette.muted}`}>Completed</p>
                <p className={`mt-1 text-lg font-semibold ${palette.text}`}>{currentGroup.tasks.done.length}</p>
              </div>
            </div>
          </Panel>

          <nav className={`mt-6 border-b ${palette.border}`}>
            <ul className="flex flex-wrap gap-2">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.key;
                const Icon = tab.icon;

                return (
                  <li key={tab.key}>
                    <button
                      type="button"
                      onClick={() => setActiveTab(tab.key)}
                      className={`flex items-center gap-2 rounded-t-md border border-b-0 px-3 py-2 text-sm font-medium transition ${
                        isActive ? palette.tabActive : palette.tabIdle
                      }`}
                    >
                      <Icon size={14} />
                      <span>{tab.label}</span>
                      <CounterBadge palette={palette}>{tab.count}</CounterBadge>
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          {activeTab === "members" ? (
            <Panel palette={palette} className="mt-4 overflow-hidden">
              <header
                className={`grid grid-cols-[1fr_auto] border-b px-4 py-2 text-xs font-semibold uppercase tracking-wide ${palette.border} ${palette.panelMuted} ${palette.muted}`}
              >
                <span>Member</span>
                <span>Role</span>
              </header>

              <div>
                {filteredMembers.length ? (
                  filteredMembers.map((member) => (
                    <div
                      key={member.id}
                      className={`grid grid-cols-[1fr_auto] items-center border-b px-4 py-3 last:border-b-0 ${palette.border}`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ${palette.avatar}`}
                        >
                          {getInitials(member.name)}
                        </div>
                        <p className={`text-sm font-medium ${palette.text}`}>{member.name}</p>
                      </div>

                      <span
                        className={`rounded-full border px-2 py-0.5 text-xs font-medium ${getRoleBadgeClass(
                          member.role,
                          isDark
                        )}`}
                      >
                        {member.role}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-4">
                    <EmptyState
                      palette={palette}
                      icon={Users}
                      title="No members found"
                      description="Try another search keyword or clear the filter."
                    />
                  </div>
                )}
              </div>
            </Panel>
          ) : null}

          {activeTab === "projects" ? (
            <Panel palette={palette} className="mt-4">
              {currentGroup.projects.length ? (
                currentGroup.projects.map((project, index) => (
                  <div
                    key={project.id}
                    className={`flex items-center justify-between border-b px-4 py-3 last:border-b-0 ${palette.border}`}
                  >
                    <div>
                      <p className={`text-sm font-semibold ${palette.blueLink}`}>{project.title}</p>
                      <p className={`text-xs ${palette.muted}`}>Repository-style project board</p>
                    </div>
                    <CounterBadge palette={palette}>Active #{index + 1}</CounterBadge>
                  </div>
                ))
              ) : (
                <div className="p-4">
                  <EmptyState
                    palette={palette}
                    icon={FolderOpen}
                    title="No projects yet"
                    description="Create your first project to track delivery status."
                  />
                </div>
              )}
            </Panel>
          ) : null}

          {activeTab === "tasks" ? (
            <section className="mt-4 space-y-4">
              <Panel palette={palette} className="p-3">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <UiInput
                    palette={palette}
                    value={newTask}
                    onChange={(event) => {
                      setNewTask(event.target.value);
                      if (taskError) setTaskError("");
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") addTask();
                    }}
                    placeholder="Create a new task"
                    aria-label="New task title"
                    className={taskError ? "border-[#da3633]" : ""}
                  />
                  <UiButton
                    palette={palette}
                    variant="primary"
                    icon={Plus}
                    onClick={addTask}
                    disabled={pending.addTask}
                  >
                    {pending.addTask ? "Adding..." : "Add task"}
                  </UiButton>
                </div>
                {taskError ? <p className="mt-2 text-xs text-[#f85149]">{taskError}</p> : null}
              </Panel>

              {totalTasks === 0 ? (
                <EmptyState
                  palette={palette}
                  icon={ListTodo}
                  title="No tasks in this group"
                  description="Create your first task to start planning work across columns."
                />
              ) : null}

              <div className="grid gap-4 xl:grid-cols-3">
                {Object.keys(taskColumns).map((column) => renderTaskColumn(column))}
              </div>
            </section>
          ) : null}

          {activeTab === "activity" ? (
            <Panel palette={palette} className="mt-4">
              {currentGroup.activity.length ? (
                currentGroup.activity.map((item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className={`flex items-start gap-3 border-b px-4 py-3 last:border-b-0 ${palette.border}`}
                  >
                    <span
                      className={`mt-1 h-2 w-2 rounded-full ${isDark ? "bg-[#58a6ff]" : "bg-[#0969da]"}`}
                    />
                    <p className={`text-sm ${palette.text}`}>{item}</p>
                  </div>
                ))
              ) : (
                <div className="p-4">
                  <EmptyState
                    palette={palette}
                    icon={Activity}
                    title="No activity yet"
                    description="Actions like adding members and moving tasks will appear here."
                  />
                </div>
              )}
            </Panel>
          ) : null}

          <Panel palette={palette} className={`mt-4 border ${palette.border} ${palette.panelMuted} px-4 py-3`}>
            <p className={`mb-2 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide ${palette.muted}`}>
              <Keyboard size={13} />
              Keyboard Shortcuts
            </p>
            <p className={`text-xs ${palette.muted}`}>
              Ctrl/Cmd+K search, Ctrl/Cmd+I invite, Ctrl/Cmd+T tasks, 1-4 switch tabs, Ctrl/Cmd+Shift+L toggle theme.
            </p>
          </Panel>
        </main>
      </div>

      {showModal ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeInviteModal}
        >
          <Panel
            palette={palette}
            className="w-full max-w-md"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Invite member modal"
          >
            <div className={`border-b px-5 py-4 ${palette.border}`}>
              <h2 className={`text-lg font-semibold ${palette.text}`}>Invite member</h2>
              <p className={`mt-1 text-sm ${palette.muted}`}>Add a teammate to this group workspace.</p>
            </div>

            <div className="space-y-3 px-5 py-4">
              <label className={`block text-sm font-medium ${palette.text}`}>
                Name
                <UiInput
                  palette={palette}
                  value={newMember.name}
                  onChange={(event) => {
                    setNewMember((prev) => ({ ...prev, name: event.target.value }));
                    if (memberError) setMemberError("");
                  }}
                  placeholder="Enter full name"
                  className={`mt-1 ${memberError ? "border-[#da3633]" : ""}`}
                />
              </label>

              {memberError ? <p className="-mt-1 text-xs text-[#f85149]">{memberError}</p> : null}

              <label className={`block text-sm font-medium ${palette.text}`}>
                Role
                <select
                  value={newMember.role}
                  onChange={(event) =>
                    setNewMember((prev) => ({ ...prev, role: event.target.value }))
                  }
                  className={`mt-1 w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[#1f6feb] ${palette.input}`}
                >
                  <option value="Member">Member</option>
                  <option value="Admin">Admin</option>
                </select>
              </label>
            </div>

            <div className={`flex justify-end gap-2 border-t px-5 py-4 ${palette.border}`}>
              <UiButton
                palette={palette}
                variant="secondary"
                onClick={closeInviteModal}
                disabled={pending.addMember}
              >
                Cancel
              </UiButton>
              <UiButton
                palette={palette}
                variant="primary"
                onClick={addMember}
                disabled={pending.addMember}
                icon={pending.addMember ? Loader2 : UserPlus}
              >
                {pending.addMember ? "Inviting..." : "Add member"}
              </UiButton>
            </div>
          </Panel>
        </div>
      ) : null}

      {storageError ? (
        <div className="fixed bottom-4 left-4 z-40">
          <UiButton palette={palette} variant="secondary" icon={AlertTriangle} onClick={reloadFromStorage}>
            Recover Data
          </UiButton>
        </div>
      ) : null}
    </div>
  );
}
