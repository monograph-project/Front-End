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

// Mock employee data - replace with API
const MOCK_EMPLOYEES = {
  1: {
    id: 1,
    firstName: "Robert",
    lastName: "Miller",
    email: "robert.miller@company.com",
    phone: "+1-555-0101",
    department: "HR",
    status: "active",
    joined: "2023-07-01",
    role: "HR Manager",
    experience: 8,
    officeHours: "Mon-Fri 9AM-5PM",
    bio: "Experienced HR manager specializing in talent acquisition and employee relations.",
    reportsTo: "CEO",
  },
  2: {
    id: 2,
    firstName: "Lisa",
    lastName: "Davis",
    email: "lisa.davis@company.com",
    phone: "+1-555-0102",
    department: "Finance",
    status: "active",
    joined: "2023-07-15",
    role: "Accountant",
    experience: 5,
    officeHours: "Mon-Wed 8AM-4PM, Thu 10AM-6PM",
    bio: "Finance professional with expertise in accounting and financial reporting.",
    reportsTo: "CFO",
  },
  3: {
    id: 3,
    firstName: "James",
    lastName: "Wilson",
    email: "james.wilson@company.com",
    phone: "+1-555-0103",
    department: "IT",
    status: "pending",
    joined: "2023-08-01",
    role: "Software Engineer",
    experience: 10,
    officeHours: "Pending",
    bio: "Senior software engineer with full-stack development experience.",
    reportsTo: "CTO",
  },
  4: {
    id: 4,
    firstName: "Mary",
    lastName: "Taylor",
    email: "mary.taylor@company.com",
    phone: "+1-555-0104",
    department: "Administration",
    status: "suspended",
    joined: "2023-06-20",
    role: "Office Manager",
    experience: 6,
    officeHours: "Suspended",
    bio: "Administrative professional managing office operations.",
    reportsTo: "CEO",
  },
  5: {
    id: 5,
    firstName: "Richard",
    lastName: "Moore",
    email: "richard.moore@company.com",
    phone: "+1-555-0105",
    department: "HR",
    status: "rejected",
    joined: "2023-08-10",
    role: "Recruiter",
    experience: 3,
    officeHours: "N/A",
    bio: "Recruitment specialist candidate.",
    reportsTo: "HR Manager",
  }
};

export default function EmployeeProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const employeeData = MOCK_EMPLOYEES[parseInt(id)];
      setEmployee(employeeData);
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

  if (!employee) {
    return (
      <div className="flex-1 p-8 text-center">
        <div className="text-6xl mb-4 text-muted">👨‍💼</div>
        <h2 className="text-2xl font-bold text-primary mb-2">Employee not found</h2>
        <Button onClick={() => navigate('/admin/employee')}>Go Back</Button>
      </div>
    );
  }

  const fullName = `${employee.firstName} ${employee.lastName}`;
  const isOwner = currentUser?.id === employee.id;

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
        GooeyToaster.success(`Employee ${action}d successfully`);
        break;
      case "delete":
        GooeyToaster.success("Employee deleted successfully");
        navigate("/admin/employee");
        break;
    }
  };

  return (
    <div className="flex-1 p-4 md:p-8 bg-shell dark:bg-dark-shell">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-default dark:border-dark-default pb-3 gap-6 mb-8">
          <button
            onClick={() => navigate('/admin/employee')}
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
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[employee.status]}`}>
                  {employee.status?.toUpperCase()}
                </span>
              </div>
              <p className="text-lg text-secondary dark:text-dark-secondary mb-1">
                Employee ID: {employee.id}
              </p>
              <p className="text-sm text-muted dark:text-dark-muted">
                {employee.department}
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
                  <DropdownItem variant="danger" onClick={() => handleAction("delete")}>Delete Employee</DropdownItem>
                </DropdownContent>
              </DropdownMenuRoot>
            )}
          </div>
        </div>

        {/* Employee Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div>
            <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
              <Icon d={IC.info} className="w-5 h-5" />
              Employee Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm p-6 bg-card-2 dark:bg-dark-card-2 rounded-lg border border-default dark:border-dark-default">
              <div className="flex items-center gap-3">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1 2C0.447715 2 0 2.44772 0 3V12C0 12.5523 0.447715 13 1 13H14C14.5523 13 15 12.5523 15 12V3C15 2.44772 14.5523 2 14 2H1ZM1 3L14 3V3.92494C13.9174 3.92486 13.8338 3.94751 13.7589 3.99505L7.5 7.96703L1.24112 3.99505C1.16621 3.94751 1.0826 3.92486 1 3.92494V3ZM1 4.90797V12H14V4.90797L7.74112 8.87995C7.59394 8.97335 7.40606 8.97335 7.25888 8.87995L1 4.90797Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
                <div>
                  <span className="text-xs text-muted dark:text-dark-muted uppercase tracking-wide font-medium block mb-1">Email</span>
                  <span className="font-medium text-primary dark:text-dark-primary">{employee.email}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 2.5C4 2.22386 4.22386 2 4.5 2H10.5C10.7761 2 11 2.22386 11 2.5V12.5C11 12.7761 10.7761 13 10.5 13H4.5C4.22386 13 4 12.7761 4 12.5V2.5ZM4.5 1C3.67157 1 3 1.67157 3 2.5V12.5C3 13.3284 3.67157 14 4.5 14H10.5C11.3284 14 12 13.3284 12 12.5V2.5C12 1.67157 11.3284 1 10.5 1H4.5ZM6 11.65C5.8067 11.65 5.65 11.8067 5.65 12C5.65 12.1933 5.8067 12.35 6 12.35H9C9.1933 12.35 9.35 12.1933 9.35 12C9.35 11.8067 9.1933 11.65 9 11.65H6Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                </svg>
                <div>
                  <span className="text-xs text-muted dark:text-dark-muted uppercase tracking-wide font-medium block mb-1">Phone</span>
                  <span className="font-medium text-primary dark:text-dark-primary">{employee.phone}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 md:col-span-2">
                <Icon d={IC.calendar} className="w-4 h-4 text-muted dark:text-dark-muted stroke-[1.75]" />
                <div>
                  <span className="text-xs text-muted dark:text-dark-muted uppercase tracking-wide font-medium block mb-1">Joined</span>
                  <span className="font-medium text-primary dark:text-dark-primary">{new Date(employee.joined).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 md:col-span-2">
                <Icon d={IC.user} className="w-4 h-4 text-muted dark:text-dark-muted stroke-[1.75]" />
                <div>
                  <span className="text-xs text-muted dark:text-dark-muted uppercase tracking-wide font-medium block mb-1">Bio</span>
                  <p className="font-medium text-primary dark:text-dark-primary">{employee.bio}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
              <Icon d={IC.briefcase} className="w-5 h-5" />
              Employment Info
            </h3>
            <div className="space-y-4 p-6 rounded-lg border border-default dark:border-dark-default">
              <div className="flex items-center gap-3">
                <Icon d={IC.briefcase} className="w-4 h-4 text-muted dark:text-dark-muted stroke-[1.75]" />
                <div className="flex-1">
                  <span className="text-xs text-muted dark:text-dark-muted uppercase tracking-wide font-medium block mb-1">Role</span>
                  <span className="font-bold text-xl text-primary dark:text-dark-primary">{employee.role}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Icon d={IC.activity} className="w-4 h-4 text-muted dark:text-dark-muted stroke-[1.75]" />
                <div className="flex-1">
                  <span className="text-xs text-muted dark:text-dark-muted uppercase tracking-wide font-medium block mb-1">Experience</span>
                  <span className="font-bold text-xl text-primary dark:text-dark-primary">{employee.experience} years</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Icon d={IC.clock} className="w-4 h-4 text-muted dark:text-dark-muted stroke-[1.75]" />
                <div>
                  <span className="text-xs text-muted dark:text-dark-muted uppercase tracking-wide font-medium block mb-1">Office Hours</span>
                  <span className="font-medium text-primary dark:text-dark-primary">{employee.officeHours}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Icon d={IC.userCheck} className="w-4 h-4 text-muted dark:text-dark-muted stroke-[1.75]" />
                <div>
                  <span className="text-xs text-muted dark:text-dark-muted uppercase tracking-wide font-medium block mb-1">Reports to</span>
                  <span className="font-medium text-primary dark:text-dark-primary">{employee.reportsTo}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
