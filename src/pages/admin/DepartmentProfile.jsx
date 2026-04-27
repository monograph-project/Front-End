import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { getDepartmentById } from '../../services/apiRoute';
import Avatar from '../../components/Avatar';
import Icon from '../../components/Icon';
import IC from '../../components/IC';
import Button from '../../components/Button';
import {
  DropdownContent,
  DropdownMenuRoot,
  DropdownItem,
  DropdownTrigger,
} from '../../components/DropdownMenu';
import { GooeyToaster } from 'goey-toast';

export default function DepartmentProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: department, isLoading } = useQuery({
    queryKey: ['department', id],
    queryFn: () => getDepartmentById(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
      </div>
    );
  }

  if (!department) {
    return (
      <div className="flex-1 p-8 text-center">
        <div className="text-6xl mb-4 text-muted">🏛️</div>
        <h2 className="text-2xl font-bold text-primary mb-2">Department not found</h2>
            <Button onClick={() => navigate('/admin/department')}>Go Back</Button>
      </div>
    );
  }

  const statusColors = {
    active: "bg-success text-success-light",
    pending: "bg-warning text-warning-light",
    suspended: "bg-error text-error-light",
    inactive: "bg-muted text-muted",
  };

  const handleAction = (action) => {
    GooeyToaster.success(`Action "${action}" executed`);
  };

  return (
    <div className="flex-1 p-4 md:p-8 bg-shell dark:bg-dark-shell">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-default dark:border-dark-default pb-3 gap-6 mb-8">
          <button
            onClick={() => navigate('/admin/department')}
            className="p-1 -ml-1 text-muted hover:text-primary hover:bg-accent/10 rounded-md transition-all flex items-center"
          >
            <Icon d={IC.chevLeft} className="w-5 h-5" />
          </button>
          <div className="flex items-start gap-4 flex-1">
            <Avatar
              src="" 
              name={department.name}
              size="lg"
              className="ring-4 ring-accent/20 dark:ring-accent-dark/30 shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-3xl font-bold text-primary dark:text-dark-primary truncate">{department.name}</h1>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[department.status] || 'bg-muted text-muted'}`}
                >
                  {department.status?.toUpperCase()}
                </span>
              </div>
              <p className="text-lg text-secondary dark:text-dark-secondary mb-1">
                Department ID: {department.id}
              </p>
              <p className="text-sm text-muted dark:text-dark-muted">
                Head: {department.head}
              </p>
            </div>
          </div>

          <DropdownMenuRoot>
            <DropdownTrigger>Actions</DropdownTrigger>
            <DropdownContent align="end">
              <DropdownItem onClick={() => handleAction('assign-head')}>Assign Head</DropdownItem>
              <DropdownItem onClick={() => handleAction('activate')}>Activate</DropdownItem>
              <DropdownItem onClick={() => handleAction('deactivate')}>Deactivate</DropdownItem>
              <DropdownItem variant="danger" onClick={() => handleAction('delete')}>Delete Department</DropdownItem>
            </DropdownContent>
          </DropdownMenuRoot>
        </div>

        {/* Department Info Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
                <Icon d={IC.info} className="w-5 h-5" />
                Department Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm p-6 bg-card-2 dark:bg-dark-card-2 rounded-lg border border-default dark:border-dark-default">
                <div className="flex items-center gap-3">
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path d="M1 2C0.447715 2 0 2.44772 0 3V12C0 12.5523 0.447715 13 1 13H14C14.5523 13 15 12.5523 15 12V3C15 2.44772 14.5523 2 14 2H1ZM1 3L14 3V3.92494C13.9174 3.92486 13.8338 3.94751 13.7589 3.99505L7.5 7.96703L1.24112 3.99505C1.16621 3.94751 1.0826 3.92486 1 3.92494V3ZM1 4.90797V12H14V4.90797L7.74112 8.87995C7.59394 8.97335 7.40606 8.97335 7.25888 8.87995L1 4.90797Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
                  </svg>
                  <div>
                    <span className="text-xs text-muted dark:text-dark-muted uppercase tracking-wide font-medium block mb-1">Head Email</span>
                    <span className="font-medium text-primary dark:text-dark-primary">{department.head || 'N/A'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Icon d={IC.calendar} className="w-4 h-4 text-muted dark:text-dark-muted stroke-[1.75]" />
                  <div>
                    <span className="text-xs text-muted dark:text-dark-muted uppercase tracking-wide font-medium block mb-1">Created</span>
                    <span className="font-medium text-primary dark:text-dark-primary">{new Date(department.created).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-xl mb-4 flex items-center gap-2">
              <Icon d={IC.users} className="w-5 h-5" />
              Department Stats
            </h3>
            <div className="grid grid-cols-2 gap-4 p-6 rounded-md border border-default dark:border-dark-default">
              <div className="text-center p-4 rounded-lg bg-accent/5 dark:bg-accent-dark/10 border border-accent/20">
                <div className="text-2xl font-bold text-accent mb-1">12</div>
                <div className="text-xs text-muted uppercase tracking-wider">Total Students</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-success/5 dark:bg-dark-success/10 border border-success/20">
                <div className="text-2xl font-bold text-success mb-1">8</div>
                <div className="text-xs text-muted uppercase tracking-wider">Active Courses</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-primary/5 dark:bg-dark-primary/10 border border-primary/20">
                <div className="text-2xl font-bold text-primary mb-1">5</div>
                <div className="text-xs text-muted uppercase tracking-wider">Teachers</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-warning/5 dark:bg-dark-warning/10 border border-warning/20">
                <div className="text-2xl font-bold text-warning mb-1">2</div>
                <div className="text-xs text-muted uppercase tracking-wider">Pending Requests</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
