// AddStudentForm.jsx
import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createStudent } from '../../services/apiRoute';
import Button from '../../components/Button';
import Field from '../../components/Field';


// Select replaced with CustomDropdownSelect using DropdownMenu


const AddStudentForm = ({ onClose }) => {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },

  } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      code: '',
      department: '',
      enrollmentDate: new Date().toISOString().split('T')[0],
      status: 'Active',
    }
  });

  const mutation = useMutation({
    mutationFn: createStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['students'] });
      onClose();
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="relative w-[550px] max-h-[90vh] h-auto bg-white dark:bg-dark-card p-6 rounded-lg shadow-xl flex flex-col">

        <div className="flex items-center justify-between mb-6 pb-2">
          <h2 className="text-lg font-bold text-primary dark:text-dark-primary">Add Student</h2>
          <button
            type="button"
            onClick={onClose}
            className="h-10 w-10 p-2.5 rounded-xl flex items-center justify-center transition-all"
          >
            <svg className="size-5 text-gray-700 dark:text-gray-200 stroke-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 -mr-1">
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="First Name *"
              register={register("firstName", { required: "First name is required" })}
              error={errors.firstName?.message}
            />
            <Field
              label="Last Name *"
              register={register("lastName", { required: "Last name is required" })}
              error={errors.lastName?.message}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Email *"
              type="email"
              register={register("email", { 
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: "Invalid email address"
                }
              })}
              error={errors.email?.message}
            />
            <Field
              label="Phone"
              register={register("phone")}
            />
          </div>
          
          <Field
            label="Student Code *"
            register={register("code", { required: "Student code is required" })}
            error={errors.code?.message}
          />
          
          <Field
            label="Department"
            register={register("department")}
            error={errors.department?.message}
          />
          
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Enrollment Date"
              type="date"
              register={register("enrollmentDate")}
            />
            <Field
              label="Status"
              register={register("status")}
              error={errors.status?.message}
            />
          </div>
        </div>
        
        <div className="flex gap-3 pt-4 mt-2">
          <Button type="submit" disabled={mutation.isPending} className="flex-1 text-sm h-9">
            {mutation.isPending ? 'Adding...' : 'Add Student'}
          </Button>
        </div>
        
        {mutation.isError && (
          <p className="text-red-500 text-xs mt-2 text-center">{mutation.error.message}</p>
        )}
      </div>
    </form>
  );
};

export default AddStudentForm;