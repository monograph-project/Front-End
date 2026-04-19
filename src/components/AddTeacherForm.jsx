import { useForm } from 'react-hook-form';
import { useEffect } from 'react';
import Field from './Field';
import Button from './Button';
import Icon from './Icon';
import IC from './IC';
import GlobalModal from './GlobalModal';

function AddTeacherForm({ teachers, setTeachers, onClose }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = (data) => {
    const newId = teachers.length > 0 ? Math.max(...teachers.map(t => t.id)) + 1 : 1;
    const newTeacher = { ...data, id: newId, status: 'pending', joined: new Date().toISOString().split('T')[0] };
    setTeachers([...teachers, newTeacher]);
    reset();
    onClose();
  };

  useEffect(() => {
    reset();
  }, []);

  return (
    <GlobalModal open={true} setOpen={onClose} className="max-w-md w-full max-h-[90vh] overflow-y-auto bg-shell dark:bg-dark-shell rounded-xl p-6 shadow-2xl">
      <div className="flex items-center justify-between mb-6 pb-2">
        <h2 className="text-lg font-bold text-primary dark:text-dark-primary">Add New Teacher</h2>
      
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
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
        <div className="flex gap-2 pt-2">
          <Button type="submit" className="flex-1 w-full">Add Teacher</Button>
        </div>
      </form>
    </GlobalModal>
  );
}

export default AddTeacherForm;

