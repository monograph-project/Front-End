import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createDepartment } from '../../services/apiRoute';
import Button from '../../components/Button';
import Field from '../../components/Field';

export default function AddDepartmentForm({ onClose, onSuccess }) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      head: '',
      status: 'active',
    }
  });

  const mutation = useMutation({
    mutationFn: createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      onClose();
      onSuccess?.();
    },
  });

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="relative w-[550px] max-h-[90vh] h-auto bg-white dark:bg-dark-card p-6 rounded-lg shadow-xl flex flex-col">
        <div className="flex items-center justify-between mb-6 pb-2">
          <h2 className="text-lg font-bold text-primary dark:text-dark-primary">Add Department</h2>
          <button
            type="button"
            onClick={onClose}
            className="h-10 w-10 p-2.5 rounded-xl flex items-center justify-center transition-all hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <svg className="size-5 text-gray-700 dark:text-gray-200 stroke-current" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1 -mr-1">
          <Field
            label="Department Name *"
            register={register("name", { required: "Department name is required" })}
            error={errors.name?.message}
          />
          <Field
            label="Department Head Email *"
            type="email"
            register={register("head", { 
              required: "Head email is required",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Invalid email address"
              }
            })}
            error={errors.head?.message}
          />
          <Field
            label="Status"
            register={register("status")}
            error={errors.status?.message}
          >
            <select className="w-full px-3 py-2.5 border border-default dark:border-dark-default rounded-lg bg-card dark:bg-dark-card focus:border-accent dark:focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20 transition-all text-sm text-primary dark:text-dark-primary">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </Field>
        </div>

        <div className="flex gap-3 pt-4 mt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={mutation.isPending} className="flex-1 text-sm h-9">
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending} className="flex-1 text-sm h-9">
            {mutation.isPending ? 'Creating...' : 'Create Department'}
          </Button>
        </div>

        {mutation.isError && (
          <p className="text-red-500 text-xs mt-2 text-center">{mutation.error.message}</p>
        )}
      </div>
    </form>
  );
}
