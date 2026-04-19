import React, { useState, useEffect } from "react";

export default function ProjectAssignments() {
  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    title: "",
    description: "",
    course: "",
    dueDate: "",
    dueTime: "",
    availableFromEnabled: false,
    availableFrom: "",
    files: [],
    points: "",
    submissionType: "both",
    allowLate: false,
    groupAssignment: false,
  });

  const [errors, setErrors] = useState({});
  const [published, setPublished] = useState(false);

  // ✅ Load draft
  useEffect(() => {
    const saved = localStorage.getItem("assignmentDraft");
    if (saved) setForm(JSON.parse(saved));
  }, []);

  // ✅ Auto-save
  useEffect(() => {
    localStorage.setItem("assignmentDraft", JSON.stringify(form));
  }, [form]);

  // ✅ Validation
  const validate = () => {
    let err = {};
    if (!form.title) err.title = "Title required";
    if (!form.course) err.course = "Course required";
    if (!form.dueDate) err.dueDate = "Due date required";
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const next = () => {
    if (!validate()) return;
    setStep((s) => s + 1);
  };

  const prev = () => setStep((s) => s - 1);

  // ✅ File upload with size limit
  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    const valid = files.filter((f) => f.size < 10 * 1024 * 1024);
    setForm({ ...form, files: [...form.files, ...valid] });
  };

  const removeFile = (index) => {
    setForm({
      ...form,
      files: form.files.filter((_, i) => i !== index),
    });
  };

  if (published) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-50">
        <h1 className="text-3xl font-bold text-green-600">
          ✅ Assignment Published Successfully
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg p-8 space-y-6">

        {/* Stepper */}
        <div className="flex justify-between text-sm font-semibold">
          {["Info", "Schedule", "Files", "Settings", "Review"].map((s, i) => (
            <div key={i} className={step === i + 1 ? "text-blue-600" : "text-gray-400"}>
              {s}
            </div>
          ))}
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="space-y-4">
            <input
              placeholder="Assignment Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full p-3 border rounded-xl"
            />
            {errors.title && <p className="text-red-500">{errors.title}</p>}

            <textarea
              placeholder="Description..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full p-3 border rounded-xl h-32"
            />

            <select
              value={form.course}
              onChange={(e) => setForm({ ...form, course: e.target.value })}
              className="w-full p-3 border rounded-xl"
            >
              <option value="">Select Course</option>
              <option>Math</option>
              <option>Programming</option>
            </select>
            {errors.course && <p className="text-red-500">{errors.course}</p>}
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="space-y-4">
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              className="w-full p-3 border rounded-xl"
            />
            {errors.dueDate && <p className="text-red-500">{errors.dueDate}</p>}

            <input
              type="time"
              value={form.dueTime}
              onChange={(e) => setForm({ ...form, dueTime: e.target.value })}
              className="w-full p-3 border rounded-xl"
            />

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.availableFromEnabled}
                onChange={(e) =>
                  setForm({ ...form, availableFromEnabled: e.target.checked })
                }
              />
              Enable Available Date
            </label>

            {form.availableFromEnabled && (
              <input
                type="date"
                value={form.availableFrom}
                onChange={(e) =>
                  setForm({ ...form, availableFrom: e.target.value })
                }
                className="w-full p-3 border rounded-xl"
              />
            )}
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="space-y-4">
            <input type="file" multiple onChange={handleFiles} />

            {form.files.length > 0 && (
              <div className="space-y-2">
                {form.files.map((file, i) => (
                  <div key={i} className="flex justify-between bg-gray-100 p-2 rounded">
                    <span>{file.name}</span>
                    <button onClick={() => removeFile(i)} className="text-red-500">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 4 */}
        {step === 4 && (
          <div className="space-y-4">
            <input
              type="number"
              placeholder="Points"
              value={form.points}
              onChange={(e) => setForm({ ...form, points: e.target.value })}
              className="w-full p-3 border rounded-xl"
            />

            <select
              value={form.submissionType}
              onChange={(e) =>
                setForm({ ...form, submissionType: e.target.value })
              }
              className="w-full p-3 border rounded-xl"
            >
              <option value="file">File</option>
              <option value="text">Text</option>
              <option value="both">Both</option>
            </select>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.allowLate}
                onChange={(e) =>
                  setForm({ ...form, allowLate: e.target.checked })
                }
              />
              Allow Late Submission
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.groupAssignment}
                onChange={(e) =>
                  setForm({ ...form, groupAssignment: e.target.checked })
                }
              />
              Group Assignment
            </label>
          </div>
        )}

        {/* STEP 5 */}
        {step === 5 && (
          <div className="space-y-2 text-sm">
            <p><b>Title:</b> {form.title}</p>
            <p><b>Course:</b> {form.course}</p>
            <p><b>Due:</b> {form.dueDate} {form.dueTime}</p>
            <p><b>Files:</b> {form.files.length}</p>
            <p><b>Points:</b> {form.points}</p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex justify-between pt-4">
          {step > 1 && (
            <button onClick={prev} className="px-4 py-2 bg-gray-200 rounded-xl">
              Back
            </button>
          )}

          {step < 5 ? (
            <button
              onClick={next}
              className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-xl"
            >
              Next
            </button>
          ) : (
            <button
              onClick={() => setPublished(true)}
              className="ml-auto px-4 py-2 bg-green-600 text-white rounded-xl"
            >
              Publish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}