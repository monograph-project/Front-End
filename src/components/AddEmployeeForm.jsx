import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import Field from './Field';
import Button from './Button';
import GlobalModal from './GlobalModal';
import Icon from './Icon';
import IC from './IC';

function AddEmployeeForm({ employees, setEmployees, onClose }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = (data) => {
    const newId = employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1;
    const newEmployee = { ...data, id: newId, status: 'pending', joined: new Date().toISOString().split('T')[0] };
    setEmployees([...employees, newEmployee]);
    reset();
    onClose();
  };

  useEffect(() => {
    reset();
  }, []);

  return (
    <GlobalModal open={true} setOpen={onClose} className="w-[550px] max-h-[90vh] h-auto bg-shell dark:bg-dark-card p-6 rounded-lg shadow-xl flex flex-col">
      <div className="flex items-center justify-between mb-6 pb-2">
        <h2 className="text-lg font-bold text-primary dark:text-dark-primary">Add New Employee</h2>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 flex-1 overflow-y-auto pr-1 -mr-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field
            label="First Name"
            {...register('firstName', { required: 'First name is required' })}
            error={errors.firstName?.message}
            required
          />
          <Field
            label="Last Name"
            {...register('lastName', { required: 'Last name is required' })}
            error={errors.lastName?.message}
            required
          />
        </div>
        <Field
          label="Email"
          type="email"
          {...register('email', { required: 'Email is required' })}
          error={errors.email?.message}
          required
        />
        <Field
          label="Department"
          {...register('department', { required: 'Department is required' })}
          error={errors.department?.message}
          required
        />
        <Field
          label="Password"
          type="password"
          {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 chars' } })}
          error={errors.password?.message}
          required
        />
        <div className="flex gap-3 pt-4 mt-2">
          <Button type="submit" className="flex-1 text-sm h-9">Add</Button>
        </div>
      </form>
    </GlobalModal>
  );
}

export default AddEmployeeForm;

