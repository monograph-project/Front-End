import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Avatar from "../../components/Avatar";
import Icon from "../../components/Icon";
import IC from "../../components/IC";
import Button from "../../components/Button";
import {
  DropdownContent,
  DropdownMenuRoot,
  DropdownItem,
  DropdownTrigger,
} from "../../components/DropdownMenu";
import { GooeyToaster } from "goey-toast";

// Mock teacher data - replace with API
const MOCK_TEACHERS = {
  1: {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@school.edu",
    phone: "+1-555-0101",
    department: "Mathematics",
    status: "active",
    joined: "2023-09-01",
    subjects: ["Algebra", "Calculus", "Geometry"],
    experience: 8,
    officeHours: "Mon-Wed 10AM-12PM, Fri 2PM-4PM",
    bio: "Experienced math instructor specializing in advanced calculus and geometry."
  },
  2: {
    id: 2,
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@school.edu",
    phone: "+1-555-0102",
    department: "Physics",
    status: "pending",
    joined: "2023-09-15",
    subjects: ["Mechanics", "Electromagnetism"],
    experience: 5,
    officeHours: "Tue-Thu 1PM-3PM",
    bio: "Physics educator with focus on experimental learning."
  },
  3: {
    id: 3,
    firstName: "Mike",
    lastName: "Johnson",
    email: "mike.johnson@school.edu",
    phone: "+1-555-0103",
    department: "Computer Science",
    status: "active",
    joined: "2023-08-20",
    subjects: ["Algorithms", "Data Structures", "Web Development"],
    experience: 10,
    officeHours: "Mon-Fri 9AM-11AM",
    bio: "Senior CS instructor with industry experience."
  },
  4: {
    id: 4,
    firstName: "Sarah",
    lastName: "Wilson",
    email: "sarah.wilson@school.edu",
    phone: "+1-555-0104",
    department: "Biology",
    status: "suspended",
    joined: "2023-10-01",
    subjects: ["Cell Biology", "Genetics"],
    experience: 6,
    officeHours: "Suspended",
    bio: "Biology specialist."
  },
  5: {
    id: 5,
    firstName: "David",
    lastName: "Brown",
    email: "david.brown@school.edu",
    phone: "+1-555-0105",
    department: "Chemistry",
    status: "rejected",
    joined: "2023-09-10",
    subjects: ["Organic Chemistry"],
    experience: 3,
    officeHours: "N/A",
    bio: "Chemistry teacher candidate."
  }
};

export default function TeacherProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [teacher, setTeacher] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const teacherData = MOCK_TEACHERS[parseInt(id)];
      setTeacher(teacherData);
      setLoading(false);
    }, 800);
  }, [id]);

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="flex-1 p-8 text-center">
        <div className="text-6xl mb-4 text-muted">👨‍🏫</div>
        <h2 className="text-2xl font-bold text-primary mb-2">Teacher not found</h2>
        <Button onClick={() => navigate('/admin/teacher')}>Go Back</Button>
      </div>
    );
  }

  const fullName = `${teacher.firstName} ${teacher.lastName}`;
  const isOwner = currentUser?.id === teacher.id;

  const statusColors = {
    active: "bg-success text-success-light dark:bg-dark-success dark:text-dark-success-light",
    pending: "bg-warning text-warning-light dark:bg-dark-warning dark:text-dark-warning-light",
    suspended: "bg-error text-error-light dark:bg-dark-error dark:text-dark-error-light",
    rejected: "bg-muted text-muted-foreground",
  };

  const handleAction = (action) => {
    switch (action) {
      case "activate":
      case "suspend":
        GooeyToaster.success(`Teacher ${action}d successfully`);
        break;
      case "delete":
        GooeyToaster.success("Teacher deleted successfully");
        navigate("/admin/teacher");
        break;
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 bg-shell dark:bg-dark-card-bg">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-default dark:border-dark-default pb-3 gap-6 mb-8">
          <button
            onClick={() => navigate('/admin/teacher')}
            className="p-1 -ml-1 text-muted hover:text-primary hover:bg-accent/10 rounded-md transition-all flex items-center"
          >
            <Icon d={IC.chevLeft} className="w-5 h-5" />
          </button>
          <div className="flex items-start gap-4 flex-1">
            <Avatar
              src=""
              name={fullName}
              size="lg"
              className="ring-4 ring-accent/20 dark:ring-accent-dark/30 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-primary dark:text-dark-primary truncate">{fullName}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[teacher.status]}`}>
                  {teacher.status?.toUpperCase()}
                </span>
              </div>
              <p className="text-lg text-secondary dark:text-dark-secondary mb-1">
                Teacher ID: {teacher.id}
              </p>
              <p className="text-sm text-muted dark:text-dark-muted">
                {teacher.department}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isOwner ? (
              <Button variant="secondary">Edit Profile</Button>
            ) : (
              <DropdownMenuRoot>
                <DropdownTrigger>Actions</DropdownTrigger>
                <DropdownContent align="end">
                  <DropdownItem onClick={() => handleAction("activate")}>Activate</DropdownItem>
                  <DropdownItem onClick={() => handleAction("suspend")}>Suspend</DropdownItem>
                  <DropdownItem variant="danger" onClick={() => handleAction("delete")}>Delete Teacher</DropdownItem>
                </DropdownContent>
              </DropdownMenuRoot>
            )}
          </div>
        </div>

        {/* Teacher Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
              <Icon d={IC.info} className="w-5 h-5" />
              Teacher Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm p-6 bg-card-2 dark:bg-dark-card-2 rounded-lg border border-default dark:border-dark-default">
              <div className="flex items-center gap-3">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 2C0.447715 2 0 2.44772 0 3V12C0 12.5523 0.447715 13 1 13H14C14.5523 13 15 12.5523 15 12V3C15 2.44772 14.5523 2 14 2H1ZM1 3L14 3V3.92494C13.9174 3.92486 13.8338 3.94751 13.7589 3.99505L7.5 7.96703L1.24112 3.99505C1.16621 3.94751 1.0826 3.92486 1 3.92494V3ZM1 4.90797V12H14V4.90797L7.74112 8.87995C7.59394 8.97335 7.40606 8.97335 7.25888 8.87995L1 4.90797Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
                <div>
                  <span className="text-xs text-muted dark:text-dark-muted uppercase tracking-wide font-medium block mb-1">Email</span>
                  <span className="font-medium text-primary dark:text-dark-primary">{teacher.email}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 2.5C4 2.22386 4.22386 2 4.5 2H10.5C10.7761 2 11 2.22386 11 2.5V12.5C11 12.7761 10.7761 13 10.5 13H4.5C4.22386 13 4 12.7761 4 12.5V2.5ZM4.5 1C3.67157 1 3 1.67157 3 2.5V12.5C3 13.3284 3.67157 14 4.5 14H10.5C11.3284 14 12 13.3284 12 12.5V2.5C12 1.67157 11.3284 1 10.5 1H4.5ZM6 11.65C5.8067 11.65 5.65 11.8067 5.65 12C5.65 12.1933 5.8067 12.35 6 12.35H9C9.1933 12.35 9.35 12.1933 9.35 12C9.35 11.8067 9.1933 11.65 9 11.65H6Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
                <div>
                  <span className="text-xs text-muted dark:text-dark-muted uppercase tracking-wide font-medium block mb-1">Phone</span>
                  <span className="font-medium text-primary dark:text-dark-primary">{teacher.phone}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 md:col-span-2">
                <Icon d={IC.calendar} className="w-4 h-4 text-muted dark:text-dark-muted stroke-[1.75]" />
                <div>
                  <span className="text-xs text-muted dark:text-dark-muted uppercase tracking-wide font-medium block mb-1">Joined</span>
                  <span className="font-medium text-primary dark:text-dark-primary">{new Date(teacher.joined).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 md:col-span-2">
                <Icon d={IC.bookOpen} className="w-4 h-4 text-muted dark:text-dark-muted stroke-[1.75]" />
                <div>
                  <span className="text-xs text-muted dark:text-dark-muted uppercase tracking-wide font-medium block mb-1">Bio</span>
                  <p className="font-medium text-primary dark:text-dark-primary">{teacher.bio}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
              <Icon d={IC.academic} className="w-5 h-5" />
              Teaching Info
            </h3>
            <div className="space-y-4 p-6 rounded-lg border border-default dark:border-dark-default">
              <div className="flex items-center gap-3">
                <Icon d={IC.book} className="w-4 h-4 text-muted dark:text-dark-muted stroke-[1.75]" />
                <div className="flex-1">
                  <span className="text-xs text-muted dark:text-dark-muted uppercase tracking-wide font-medium block mb-1">Subjects</span>
                  <div className="flex flex-wrap gap-1">
                    {teacher.subjects.map((subject, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-accent/10 text-accent text-xs rounded-full">
                        {subject}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Icon d={IC.activity} className="w-4 h-4 text-muted dark:text-dark-muted stroke-[1.75]" />
                <div className="flex-1">
                  <span className="text-xs text-muted dark:text-dark-muted uppercase tracking-wide font-medium block mb-1">Experience</span>
                  <span className="font-bold text-xl text-primary dark:text-dark-primary">{teacher.experience} years</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Icon d={IC.clock} className="w-4 h-4 text-muted dark:text-dark-muted stroke-[1.75]" />
                <div>
                  <span className="text-xs text-muted dark:text-dark-muted uppercase tracking-wide font-medium block mb-1">Office Hours</span>
                  <span className="font-medium text-primary dark:text-dark-primary">{teacher.officeHours}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

