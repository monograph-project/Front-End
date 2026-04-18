import { useState } from "react";

export default function ProjectGroup() {
  const [showModal, setShowModal] = useState(false);

  const members = [
    { id: 1, name: "Ali", role: "Admin" },
    { id: 2, name: "Sara", role: "Member" },
    { id: 3, name: "Ahmad", role: "Member" },
  ];

  return (
    <div className="flex h-screen bg-gray-100">

      {/* 🔷 Sidebar */}
      <div className="w-64 bg-white border-r p-4">
        <h2 className="text-lg font-semibold mb-4">Groups</h2>

        <ul className="space-y-2">
          <li className="p-2 rounded hover:bg-gray-100 cursor-pointer">
            My Team
          </li>
          <li className="p-2 rounded hover:bg-gray-100 cursor-pointer">
            Dev Team
          </li>
          <li className="p-2 rounded hover:bg-gray-100 cursor-pointer">
            Design Team
          </li>
        </ul>

        <button className="mt-4 w-full bg-blue-500 text-white py-2 rounded">
          + New Group
        </button>
      </div>

      {/* 🔷 Main Content */}
      <div className="flex-1 p-6">

        {/* 🔹 Header */}
        <div className="bg-white p-4 rounded-lg shadow mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold">My Team</h1>
            <p className="text-gray-500 text-sm">
              This is a collaboration group
            </p>
          </div>

          <div className="space-x-2">
            <button
              onClick={() => setShowModal(true)}
              className="bg-blue-500 text-white px-4 py-2 rounded"
            >
              Invite
            </button>
            <button className="border px-4 py-2 rounded">
              Settings
            </button>
          </div>
        </div>

        {/* 🔹 Tabs */}
        <div className="flex space-x-6 border-b mb-4">
          <button className="pb-2 border-b-2 border-black font-medium">
            Members
          </button>
          <button className="pb-2 text-gray-500">Projects</button>
          <button className="pb-2 text-gray-500">Activity</button>
          <button className="pb-2 text-gray-500">Settings</button>
        </div>

        {/* 🔹 Members List */}
        <div className="bg-white rounded-lg shadow">
          {members.map((member) => (
            <div
              key={member.id}
              className="flex justify-between items-center p-4 border-b hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                <p>{member.name}</p>
              </div>

              <div className="text-sm text-gray-500">
                {member.role}
              </div>
            </div>
          ))}

          <div className="p-4">
            <button
              onClick={() => setShowModal(true)}
              className="text-blue-500"
            >
              + Add Member
            </button>
          </div>
        </div>
      </div>

      {/* 🔷 Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center">
          <div className="bg-white w-96 p-6 rounded-lg shadow-lg">

            <h2 className="text-lg font-semibold mb-4">
              Add Member
            </h2>

            <input
              type="text"
              placeholder="Search user..."
              className="w-full border p-2 rounded mb-4"
            />

            <select className="w-full border p-2 rounded mb-4">
              <option>Member</option>
              <option>Admin</option>
            </select>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded"
              >
                Cancel
              </button>

              <button className="px-4 py-2 bg-blue-500 text-white rounded">
                Add
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

