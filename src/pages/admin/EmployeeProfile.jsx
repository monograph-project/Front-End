import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Avatar from '../../components/Avatar';
import Icon from '../../components/Icon';
import IC from '../../components/IC';
import Button from '../../components/Button';

const mockEmployees = [
  {
    id: 1,
    firstName: "Robert",
    lastName: "Miller",
    email: "robert.miller@company.com",
    department: "HR",
    status: "active",
    joined: "2023-07-01",
  },
  {
    id: 2,
    firstName: "Lisa",
    lastName: "Davis",
    email: "lisa.davis@company.com",
    department: "Finance",
    status: "active",
    joined: "2023-07-15",
  },
  {
    id: 3,
    firstName: "James",
    lastName: "Wilson",
    email: "james.wilson@company.com",
    department: "IT",
    status: "pending",
    joined: "2023-08-01",
  },
  {
    id: 4,
    firstName: "Mary",
    lastName: "Taylor",
    email: "mary.taylor@company.com",
    department: "Administration",
    status: "suspended",
    joined: "2023-06-20",
  },
  {
    id: 5,
    firstName: "Richard",
    lastName: "Moore",
    email: "richard.moore@company.com",
    department: "HR",
    status: "rejected",
    joined: "2023-08-10",
  },
];

export default function EmployeeProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const employee = mockEmployees.find((emp) => emp.id === Number(id));

  if (!employee) {
    return (
      <div className="flex-1 p-8 text-center">
        <div className="text-6xl mb-4 text-muted">👤</div>
        <h2 className="text-2xl font-bold text-primary mb-2">Employee not found</h2>
        <Button onClick={() => navigate('/admin/employee')}>Go Back</Button>
      </div>
    );
  }

  const statusColors = {
    active: "bg-success text-success-light",
    pending: "bg-warning text-warning-light",
    suspended: "bg-error text-error-light",
    rejected: "bg-muted text-muted",
  };

  const fullName = `${employee.firstName || ''} ${employee.lastName || ''}`.trim();

  return (
    <div className="flex-1 p-4 md:p-8 bg-shell dark:bg-dark-card-bg">
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
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[employee.status?.toLowerCase()] || 'bg-muted text-muted'}`}
                >
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
        </div>

        {/* Employee Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                <Icon d={IC.info} className="w-5 h-5" />
                Employee Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm p-6 bg-card-2 dark:bg-dark-card-2 rounded-lg border border-default dark:border-dark-default">
                <div className="flex items-center gap-3">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path d="M1 2C0.447715 2 0 2.44772 0 3V12C0 12.5523 0.447715 13 1 13H14C14.5523 13 15 12.5523 15 12V3C15 2.44772 14.5523 2 14 2H1ZM1 3L14 3V3.92494C13.9174 3.92486 13.8338 3.94751 13.7589 3.99505L7.5 7.96703L1.24112 3.99505C1.16621 3.94751 1.0826 3.92486 1 3.92494V3ZM1 4.90797V12H14V4.90797L7.74112 8.87995C7.59394 8.97335 7.40606 8.97335 7.25888 8.87995L1 4.90797Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                  </svg>
                  <div>
                    <span className="text-xs text-muted dark:text-dark-muted uppercase tracking-wide font-medium block mb-1">Email</span>
                    <span className="font-medium text-primary dark:text-dark-primary">{employee.email || 'N/A'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Icon d={IC.company} className="w-4 h-4 text-muted dark:text-dark-muted stroke-[1.75]" />
                  <div>
                    <span className="text-xs text-muted dark:text-dark-muted uppercase tracking-wide font-medium block mb-1">Department</span>
                    <span className="font-medium text-primary dark:text-dark-primary">{employee.department || 'N/A'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Icon d={IC.calendar} className="w-4 h-4 text-muted dark:text-dark-muted stroke-[1.75]" />
                  <div>
                    <span className="text-xs text-muted dark:text-dark-muted uppercase tracking-wide font-medium block mb-1">Joined Date</span>
                    <span className="font-medium text-primary dark:text-dark-primary">{employee.joined || 'N/A'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Icon d={IC.idcard} className="w-4 h-4 text-muted dark:text-dark-muted stroke-[1.75]" />
                  <div>
                    <span className="text-xs text-muted dark:text-dark-muted uppercase tracking-wide font-medium block mb-1">Employee ID</span>
                    <span className="font-medium text-primary dark:text-dark-primary">{employee.id || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
              <Icon d={IC.academic} className="w-5 h-5" />
              Employment Info
            </h3>
            <div className="space-y-3 p-6 rounded-md border border-default dark:border-dark-default">
              <div className="flex items-center gap-3">
                <Icon d={IC.company} className="w-4 h-4 text-muted dark:text-dark-muted stroke-[1.75]" />
                <div className="flex-1">
                  <span className="text-xs text-muted dark:text-dark-muted uppercase tracking-wide font-medium block mb-1">Department</span>
                  <span className="font-bold text-primary dark:text-dark-primary">{employee.department || 'N/A'}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Icon d={IC.calendar} className="w-4 h-4 text-muted dark:text-dark-muted stroke-[1.75]" />
                <div className="flex-1">
                  <span className="text-xs text-muted dark:text-dark-muted uppercase tracking-wide font-medium block mb-1">Joined Date</span>
                  <span className="font-medium text-primary dark:text-dark-primary">{employee.joined || 'N/A'}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Icon d={IC.info} className="w-4 h-4 text-muted dark:text-dark-muted stroke-[1.75]" />
                <div className="flex-1">
                  <span className="text-xs text-muted dark:text-dark-muted uppercase tracking-wide font-medium block mb-1">Status</span>
                  <span className="font-medium text-primary dark:text-dark-primary">{employee.status || 'N/A'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

