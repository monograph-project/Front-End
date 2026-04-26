import React, { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createDepartment } from "../../services/apiRoute";
import Button from "../../components/Button";
import Field from "../../components/Field";
import { Building2, Mail, CheckCircle, X } from "lucide-react";

const stepsConfig = [
  {
    id: 1,
    title: "Department Info",
    icon: Building2,
    fields: ["name"],
  },
  {
    id: 2,
    title: "Head & Status",
    icon: Mail,
    fields: ["head", "status"],
  },
  {
    id: 3,
    title: "Review",
    icon: CheckCircle,
    fields: [],
  },
];

export default function AddDepartmentForm({ onClose, onSuccess }) {
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
      name: "",
      head: "",
      status: "active",
    },
  });

  const watchedValues = useWatch({ control });

  const mutation = useMutation({
    mutationFn: createDepartment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      resetForm();
      onClose();
      onSuccess?.();
    },
  });

  const resetForm = () => {
    setCurrentStep(1);
  };

  const onSubmit = (data) => {
    mutation.mutate(data);
  };

  const handleNext = async () => {
    const step = stepsConfig.find((s) => s.id === currentStep);
    const valid = await trigger(step.fields);

    if (valid) {
      setCurrentStep((prev) => Math.min(prev + 1, stepsConfig.length));
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="relative w-full max-w-2xl md:w-[640px] max-h-[90vh] h-auto bg-white dark:bg-dark-card p-6 rounded-lg shadow-xl flex flex-col">
        {/* Header with Close Button */}
        <div className="flex items-center justify-between mb-2 pb-2">
          <h2 className="text-lg font-bold text-primary dark:text-dark-primary">
            Add Department
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="h-10 w-10 p-2.5 rounded-xl flex items-center justify-center transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="size-5 text-gray-700 dark:text-gray-200 stroke-current" />
          </button>
        </div>

        {/* STEP INDICATOR */}
        <div className="flex items-center justify-between mb-6">
          {stepsConfig.map((step, index) => {
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

        {/* BODY */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 -mr-1 min-h-[200px]">
          {/* STEP 1 */}
          {currentStep === 1 && (
            <div className="space-y-3">
              <Field
                label="Department Name *"
                register={register("name", {
                  required: "Department name is required",
                })}
                error={errors.name?.message}
              />
            </div>
          )}

          {/* STEP 2 */}
          {currentStep === 2 && (
            <div className="space-y-3">
              <Field
                label="Department Head Email *"
                type="email"
                register={register("head", {
                  required: "Head email is required",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Invalid email address",
                  },
                })}
                error={errors.head?.message}
              />

              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-primary dark:text-dark-primary">
                  Status
                </label>
                <select
                  {...register("status")}
                  className="w-full px-3 py-2.5 border border-default dark:border-dark-default rounded-lg bg-white dark:bg-gray-800 text-primary dark:text-dark-primary focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 3 - REVIEW */}
          {currentStep === 3 && (
            <div className="bg-shell dark:bg-dark-shell rounded-lg p-4 border border-default dark:border-dark-default">
              <h3 className="text-xs font-bold text-primary dark:text-dark-primary mb-3 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-accent dark:text-accent" />
                Department Information
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted dark:text-dark-muted">Name:</span>
                  <p className="font-medium text-primary dark:text-dark-primary">
                    {watchedValues.name || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-muted dark:text-dark-muted">Head Email:</span>
                  <p className="font-medium text-primary dark:text-dark-primary">
                    {watchedValues.head || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-muted dark:text-dark-muted">Status:</span>
                  <p className="font-medium text-primary dark:text-dark-primary">
                    {watchedValues.status || "—"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FOOTER */}
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
              disabled={mutation.isPending}
              className="flex-1 text-sm h-9 px-4 rounded-md font-semibold bg-success text-white hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {mutation.isPending ? "Creating..." : "Create Department"}
            </button>
          )}
        </div>

        {/* ERROR */}
        {mutation.isError && (
          <p className="text-red-500 text-xs mt-2 text-center">
            {mutation.error.message}
          </p>
        )}
      </div>
    </form>
  );
}