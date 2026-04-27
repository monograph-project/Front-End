import React, { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { User, GraduationCap, CheckCircle } from 'lucide-react';
import { createStudent } from '../../services/apiRoute';
import Field from '../../components/Field';

const MotionDiv = motion.div;

const stepsConfig = [
  {
    id: 1,
    title: 'Personal Information',
    icon: User,
    fields: ['firstName', 'lastName', 'email'],
  },
  {
    id: 2,
    title: 'Academic Information',
    icon: GraduationCap,
    fields: ['code'],
  },
  {
    id: 3,
    title: 'Review & Confirmation',
    icon: CheckCircle,
    fields: [],
  },
];

const AddStudentForm = ({ onClose }) => {
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
    control,
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
    },
  });

  const watchedValues = useWatch({ control });

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

  const handleNext = async () => {
    const stepConfig = stepsConfig.find((s) => s.id === currentStep);
    const valid = await trigger(stepConfig.fields);
    if (valid) {
      setCurrentStep((prev) => Math.min(prev + 1, stepsConfig.length));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const stepVariants = {
    initial: { opacity: 0, x: 30 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -30 },
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-6">
      {stepsConfig.map((step, index) => {
        const isActive = step.id === currentStep;
        const isCompleted = step.id < currentStep;
        const Icon = step.icon;

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
                {step.title}
              </span>
              <span className="text-[9px] text-gray-400 dark:text-gray-400">
                {step.id}/3
              </span>
            </div>
            {index < stepsConfig.length - 1 && (
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
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <MotionDiv
            key="step1"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.25 }}
            className="space-y-3"
          >
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="First Name *"
                register={register('firstName', {
                  required: 'First name is required',
                })}
                error={errors.firstName?.message}
              />
              <Field
                label="Last Name *"
                register={register('lastName', {
                  required: 'Last name is required',
                })}
                error={errors.lastName?.message}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Email *"
                type="email"
                register={register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Invalid email address',
                  },
                })}
                error={errors.email?.message}
              />
              <Field
                label="Phone"
                register={register('phone')}
              />
            </div>
          </MotionDiv>
        );
      case 2:
        return (
          <MotionDiv
            key="step2"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.25 }}
            className="space-y-3"
          >
            <Field
              label="Student Code *"
              register={register('code', {
                required: 'Student code is required',
              })}
              error={errors.code?.message}
            />
            <Field
              label="Department"
              register={register('department')}
              error={errors.department?.message}
            />
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="Enrollment Date"
                type="date"
                register={register('enrollmentDate')}
              />
              <Field
                label="Status"
                register={register('status')}
                error={errors.status?.message}
              />
            </div>
          </MotionDiv>
        );
      case 3:
        return (
          <MotionDiv
            key="step3"
            variants={stepVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.25 }}
            className="space-y-4"
          >
            <div className="bg-shell dark:bg-dark-shell rounded-lg p-4 border border-default dark:border-dark-default">
              <h3 className="text-xs font-bold text-primary dark:text-dark-primary mb-3 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-accent dark:text-accent" />
                Personal Information
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted dark:text-dark-muted">First Name:</span>
                  <p className="font-medium text-primary dark:text-dark-primary">
                    {watchedValues.firstName || '—'}
                  </p>
                </div>
                <div>
                  <span className="text-muted dark:text-dark-muted">Last Name:</span>
                  <p className="font-medium text-primary dark:text-dark-primary">
                    {watchedValues.lastName || '—'}
                  </p>
                </div>
                <div>
                  <span className="text-muted dark:text-dark-muted">Email:</span>
                  <p className="font-medium text-primary dark:text-dark-primary">
                    {watchedValues.email || '—'}
                  </p>
                </div>
                <div>
                  <span className="text-muted dark:text-dark-muted">Phone:</span>
                  <p className="font-medium text-primary dark:text-dark-primary">
                    {watchedValues.phone || '—'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-shell dark:bg-dark-shell rounded-lg p-4 border border-default dark:border-dark-default">
              <h3 className="text-xs font-bold text-primary dark:text-dark-primary mb-3 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-accent dark:text-accent" />
                Academic Information
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted dark:text-dark-muted">Student Code:</span>
                  <p className="font-medium text-primary dark:text-dark-primary">
                    {watchedValues.code || '—'}
                  </p>
                </div>
                <div>
                  <span className="text-muted dark:text-dark-muted">Department:</span>
                  <p className="font-medium text-primary dark:text-dark-primary">
                    {watchedValues.department || '—'}
                  </p>
                </div>
                <div>
                  <span className="text-muted dark:text-dark-muted">Enrollment Date:</span>
                  <p className="font-medium text-primary dark:text-dark-primary">
                    {watchedValues.enrollmentDate || '—'}
                  </p>
                </div>
                <div>
                  <span className="text-muted dark:text-dark-muted">Status:</span>
                  <p className="font-medium text-primary dark:text-dark-primary">
                    {watchedValues.status || '—'}
                  </p>
                </div>
              </div>
            </div>
          </MotionDiv>
        );
      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="relative w-full max-w-2xl md:w-[640px] max-h-[90vh] h-auto bg-white dark:bg-dark-card p-6 rounded-lg shadow-xl flex flex-col">
        <div className="flex items-center justify-between mb-2 pb-2">
          <h2 className="text-lg font-bold text-primary dark:text-dark-primary">
            Add Student
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="h-10 w-10 p-2.5 rounded-xl flex items-center justify-center transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <svg
              className="size-5 text-gray-700 dark:text-gray-200 stroke-current"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {renderStepIndicator()}

        <div className="flex-1 overflow-y-auto space-y-3 pr-1 -mr-1 min-h-[200px]">
          <AnimatePresence mode="wait">
            {renderStepContent()}
          </AnimatePresence>
        </div>

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
          {currentStep < stepsConfig.length && (
  <button
    type="button"
    onClick={handleNext}
    className="w-32 text-sm h-9 px-4 rounded-md font-semibold bg-primary text-white hover:opacity-90 transition-opacity"
  >
    Next
  </button>
)}
          {currentStep === stepsConfig.length && (
            <button
              type="submit"
              disabled={mutation.isPending}
              className="flex-1 text-sm h-9 px-4 rounded-md font-semibold bg-success text-white hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? 'Adding...' : 'Confirm & Add Student'}
            </button>
          )}
        </div>

        {mutation.isError && (
          <p className="text-red-500 text-xs mt-2 text-center">
            {mutation.error.message}
          </p>
        )}
      </div>
    </form>
  );
};

export default AddStudentForm;
