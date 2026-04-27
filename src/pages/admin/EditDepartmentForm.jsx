import React from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateDepartment } from '../../services/apiRoute';
import Button from '../../components/Button';
import Field from '../../components/Field';
import Select from '../../components/Select';

export default function EditDepartmentForm({ department, onClose, onSuccess }) {
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: department?.name || '',
      head: department?.head || '',
      status: department?.status || 'active',
    }
  });

  const mutation = useMutation({
    mutationFn: updateDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['departments'] });
      onClose();
    },
  });

  const onSubmit = (data) => {
    mutation.mutate({ id: department.id, ...data });
  };

  if (!department) return null;

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="relative w-[550px] max-h-[90vh] h-auto bg-white dark:bg-dark-card p-6 rounded-lg shadow-xl flex flex-col">
        <div className="flex items-center justify-between mb-6 pb-2">
          <h2 className="text-lg font-bold text-primary dark:text-dark-primary">Edit Department</h2>
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
          <Field
            label="Department Name *"
            register={register("name", { required: "Department name is required" })}
            error={errors.name?.message}
          />
          <Field
            label="Department Head Email *"
            type="email"
            register={register("head", { required: "Head email is required" })}
            error={errors.head?.message}
          />
          <Field
            label="Status"
            register={register("status")}
            error={errors.status?.message}
          >
            <Select
              options={[
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' },
                { value: 'pending', label: 'Pending' },
                { value: 'suspended', label: 'Suspended' },
              ]}
            />
          </Field>
        </div>

        <div className="flex gap-3 pt-4 mt-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isPending} className="flex-1 text-sm h-9">
            {mutation.isPending ? 'Updating...' : 'Update '}
          </Button>
        </div>

        {mutation.isError && (
          <p className="text-red-500 text-xs mt-2 text-center">{mutation.error.message}</p>
        )}
      </div>
    </form>
  );
}

