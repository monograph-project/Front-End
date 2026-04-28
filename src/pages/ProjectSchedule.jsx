import React, { useState, useEffect } from "react";

// =========================
// CONFIG
// =========================
const days = ["monday", "tuesday", "wednesday", "thursday", "friday"];
const hours = Array.from({ length: 11 }, (_, i) => 8 + i);

const STORAGE_KEY = "university_schedule_pro";

// =========================
// LOAD
// =========================
const loadCourses = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved
    ? JSON.parse(saved)
    : [
        { id: 1, name: "Math", teacher: "Mr. Ahmad", day: "monday", start: 8, end: 10 },
        { id: 2, name: "Physics", teacher: "Dr. Khan", day: "monday", start: 10, end: 12 },
        { id: 3, name: "Programming", teacher: "Ms. Sara", day: "tuesday", start: 13, end: 15 },
      ];
};

// =========================
// HEATMAP
// =========================
const generateHeatmap = () =>
  Array.from({ length: 140 }, () => Math.floor(Math.random() * 6));

// =========================
// MAIN
// =========================
export default function ProjectSchedule() {
  const [courses, setCourses] = useState(loadCourses);
  const [selected, setSelected] = useState(null);
  const [dragItem, setDragItem] = useState(null);
  const [heatmap] = useState(generateHeatmap);

  const [form, setForm] = useState({
    name: "",
    teacher: "",
    day: "monday",
    start: 8,
    end: 9,
  });

  // =========================
  // PERSISTENCE
  // =========================
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
  }, [courses]);

  // =========================
  // VALIDATION + CONFLICT
  // =========================
  const hasConflict = (newC, ignoreId = null) => {
    return courses.some((c) => {
      if (ignoreId && c.id === ignoreId) return false;
      if (c.day !== newC.day) return false;

      return (
        (newC.start >= c.start && newC.start < c.end) ||
        (newC.end > c.start && newC.end <= c.end)
      );
    });
  };

  const validate = () => {
    if (!form.name || !form.teacher) return "Fill all fields";
    if (form.start >= form.end) return "Invalid time range";
    if (hasConflict(form, selected?.id)) return "Schedule conflict detected";
    return null;
  };

  // =========================
  // CRUD
  // =========================
  const saveCourse = () => {
    const error = validate();
    if (error) return alert(error);

    if (selected) {
      setCourses((prev) =>
        prev.map((c) => (c.id === selected.id ? { ...form, id: c.id } : c))
      );
    } else {
      setCourses((prev) => [...prev, { ...form, id: Date.now() }]);
    }

    setSelected(null);
    setForm({ name: "", teacher: "", day: "monday", start: 8, end: 9 });
  };

  const editCourse = (c) => {
    setSelected(c);
    setForm(c);
  };

  const deleteCourse = (id) => {
    setCourses((prev) => prev.filter((c) => c.id !== id));
  };

  // =========================
  // DRAG & DROP
  // =========================
  const onDrop = (day, hour) => {
    if (!dragItem) return;

    const updated = {
      ...dragItem,
      day,
      start: hour,
      end: hour + (dragItem.end - dragItem.start),
    };

    if (hasConflict(updated, dragItem.id)) {
      alert("Conflict detected!");
      return;
    }

    setCourses((prev) =>
      prev.map((c) => (c.id === dragItem.id ? updated : c))
    );

    setDragItem(null);
  };

  // =========================
  // UI
  // =========================
  return (
    <div className="p-4 space-y-6 text-sm">

      {/* ================= FORM ================= */}
      <div className="border p-3 rounded">
        <h2 className="font-bold mb-2">
          {selected ? "Edit Course" : "Add Course"}
        </h2>

        <div className="grid grid-cols-5 gap-2">
          <input className="border p-1" placeholder="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <input className="border p-1" placeholder="Teacher"
            value={form.teacher}
            onChange={(e) => setForm({ ...form, teacher: e.target.value })}
          />

          <select className="border p-1"
            value={form.day}
            onChange={(e) => setForm({ ...form, day: e.target.value })}
          >
            {days.map((d) => <option key={d}>{d}</option>)}
          </select>

          <input type="number" className="border p-1"
            value={form.start}
            onChange={(e) => setForm({ ...form, start: +e.target.value })}
          />

          <input type="number" className="border p-1"
            value={form.end}
            onChange={(e) => setForm({ ...form, end: +e.target.value })}
          />
        </div>

        <button
          onClick={saveCourse}
          className="mt-2 px-3 py-1 bg-blue-600 text-white rounded"
        >
          Save
        </button>
      </div>

      {/* ================= WEEKLY SCHEDULE ================= */}
      <div className="border rounded overflow-auto">
        <div className="grid grid-cols-6 text-xs font-bold bg-gray-100">
          <div className="p-1 border-r">Time</div>
          {days.map((d) => (
            <div key={d} className="p-1 border-r text-center capitalize">
              {d}
            </div>
          ))}
        </div>

        {hours.map((h) => (
          <div key={h} className="grid grid-cols-6 text-xs border-t">
            <div className="p-1 border-r">{h}:00</div>

            {days.map((day) => {
              const course = courses.find(
                (c) => c.day === day && h >= c.start && h < c.end
              );

              return (
                <div
                  key={day}
                  className="border-r h-10 relative"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => onDrop(day, h)}
                >
                  {course && (
                    <div
                      draggable
                      onDragStart={() => setDragItem(course)}
                      onClick={() => editCourse(course)}
                      className="absolute inset-0 bg-blue-500/20 border text-[10px] p-1 cursor-move"
                    >
                      <div className="font-bold truncate">{course.name}</div>
                      <div className="truncate">{course.teacher}</div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCourse(course.id);
                        }}
                        className="text-red-500 text-[9px]"
                      >
                        delete
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* ================= GITHUB HEATMAP ================= */}
      <div>
        <h2 className="font-bold mb-2">GitHub Activity</h2>

        <div className="grid grid-cols-20 gap-1 overflow-auto">
          {heatmap.map((v, i) => (
            <div
              key={i}
              className={`w-3 h-3 ${
                v === 0
                  ? "bg-gray-200"
                  : v === 1
                  ? "bg-green-100"
                  : v === 2
                  ? "bg-green-300"
                  : v <= 4
                  ? "bg-green-500"
                  : "bg-green-800"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}