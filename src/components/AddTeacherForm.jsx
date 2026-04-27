import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import Field from './Field';
import Button from './Button';
import { User, GraduationCap, ShieldCheck, ChevronRight, ChevronLeft, X } from 'lucide-react';

function AddTeacherForm({ teachers, setTeachers, onClose }) {
  const { register, handleSubmit, formState: { errors }, reset, trigger, watch, setError, clearErrors } = useForm({
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      department: '',
      joined: new Date().toISOString().split('T')[0],
      status: 'pending',
      password: '',
      confirmPassword: '',
    }
  });

  const [currentStep, setCurrentStep] = useState(1);

  const watchAll = watch();

  const steps = [
    { id: 1, label: 'Personal', icon: User },
    { id: 2, label: 'Professional', icon: GraduationCap },
    { id: 3, label: 'Security', icon: ShieldCheck },
  ];

  const onSubmit = (data) => {
    const { confirmPassword: _confirmPassword, ...rest } = data;
    const newId = teachers.length > 0 ? Math.max(...teachers.map(t => t.id)) + 1 : 1;
    const newTeacher = { ...rest, id: newId, status: 'pending', joined: new Date().toISOString().split('T')[0] };
    setTeachers([...teachers, newTeacher]);
    reset();
    setCurrentStep(1);
    onClose();
  };

  useEffect(() => {
    reset();
    setCurrentStep(1);
  }, [reset]);

  const handleNext = async () => {
    let valid = false;
    if (currentStep === 1) {
      valid = await trigger(['firstName', 'lastName', 'email']);
    } else if (currentStep === 2) {
      valid = await trigger(['department']);
    } else if (currentStep === 3) {
      valid = await trigger(['password', 'confirmPassword']);
      const pwd = watch('password');
      const cpwd = watch('confirmPassword');
      if (pwd !== cpwd) {
        setError('confirmPassword', { type: 'manual', message: 'Passwords do not match' });
        valid = false;
      } else {
        clearErrors('confirmPassword');
      }
    }

    if (valid && currentStep < 3) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="relative w-full max-w-2xl md:w-[640px] max-h-[90vh] h-auto bg-white dark:bg-dark-card p-6 rounded-lg shadow-xl flex flex-col">
        {/* Header with Close Button */}
        <div className="flex items-center justify-between mb-2 pb-2">
          <h2 className="text-lg font-bold text-primary dark:text-dark-primary">
            Add New Teacher
          </h2>
         
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = step.id < currentStep;
            
            return (
              <div key={step.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`
                      flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300
                      ${
                        isActive
                          ? 'border-accent bg-accent/10 text-accent dark:text-accent'
                          : isCompleted
                          ? 'border-success bg-success/10 text-success dark:text-success'
                          : 'border-gray-300 dark:border-gray-500 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-200'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <span
                    className={`
                      mt-1.5 text-[10px] font-semibold transition-colors duration-300 text-center
                      ${
                        isActive
                          ? 'text-accent dark:text-accent'
                          : isCompleted
                          ? 'text-success dark:text-success'
                          : 'text-gray-500 dark:text-gray-200'
                      }
                    `}
                  >
                    {step.label}
                  </span>
                  <span className="text-[9px] text-gray-400 dark:text-gray-400">
                    {step.id}/3
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`
                      w-full h-0.5 mx-2 transition-colors duration-300 self-start mt-5
                      ${
                        isCompleted
                          ? 'bg-success dark:bg-success'
                          : 'bg-gray-200 dark:bg-gray-600'
                      }
                    `}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 -mr-1 min-h-[200px]">
          {currentStep === 1 && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="First Name *"
                  register={register('firstName', { required: 'First name is required' })}
                  error={errors.firstName?.message}
                />
                <Field
                  label="Last Name *"
                  register={register('lastName', { required: 'Last name is required' })}
                  error={errors.lastName?.message}
                />
              </div>
              <Field
                label="Email *"
                type="email"
                register={register('email', { required: 'Email is required' })}
                error={errors.email?.message}
              />
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-3">
              <Field
                label="Department *"
                register={register('department', { required: 'Department is required' })}
                error={errors.department?.message}
              />
              <div className="grid grid-cols-2 gap-3">
                <Field
                  label="Joined Date"
                  type="date"
                  register={register('joined')}
                  error={errors.joined?.message}
                />
                <Field
                  label="Status"
                  register={register('status')}
                  error={errors.status?.message}
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <Field
                label="Password *"
                type="password"
                register={register('password', {
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Minimum 6 characters'
                }})}
                error={errors.password?.message}
              />
              <Field
                label="Confirm Password *"
                type="password"
                register={register('confirmPassword', {
                  required: 'Confirm password is required'
                })}
                error={errors.confirmPassword?.message}
              />

              {/* Summary Section */}
              <div className="bg-shell dark:bg-dark-shell rounded-lg p-4 border border-default dark:border-dark-default">
                <h3 className="text-xs font-bold text-primary dark:text-dark-primary mb-3 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-accent dark:text-accent" />
                  Teacher Summary
                </h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-muted dark:text-dark-muted">First Name:</span>
                    <p className="font-medium text-primary dark:text-dark-primary">
                      {watchAll.firstName || '—'}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted dark:text-dark-muted">Last Name:</span>
                    <p className="font-medium text-primary dark:text-dark-primary">
                      {watchAll.lastName || '—'}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted dark:text-dark-muted">Email:</span>
                    <p className="font-medium text-primary dark:text-dark-primary">
                      {watchAll.email || '—'}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted dark:text-dark-muted">Department:</span>
                    <p className="font-medium text-primary dark:text-dark-primary">
                      {watchAll.department || '—'}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted dark:text-dark-muted">Joined Date:</span>
                    <p className="font-medium text-primary dark:text-dark-primary">
                      {watchAll.joined || '—'}
                    </p>
                  </div>
                  <div>
                    <span className="text-muted dark:text-dark-muted">Status:</span>
                    <p className="font-medium text-primary dark:text-dark-primary">
                      {watchAll.status || '—'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-3 pt-4 mt-2">
          {currentStep > 1 && (
            <button
              type="button"
              onClick={handlePrev}
              className="flex-1 text-sm h-9 px-4 rounded-md font-semibold border border-default dark:border-dark-default text-primary dark:text-dark-primary bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Previous
            </button>
          )}
          
          {currentStep < 3 && (
            <button
              type="button"
              onClick={handleNext}
              className="w-32 text-sm h-9 px-4 rounded-md font-semibold bg-primary text-white hover:opacity-90 transition-opacity"
            >
              Next
            </button>
          )}
          
          {currentStep === 3 && (
            <button
              type="submit"
              className="flex-1 text-sm h-9 px-4 rounded-md font-semibold bg-success text-white hover:opacity-90 transition-opacity"
            >
              Add Teacher
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

export default AddTeacherForm;