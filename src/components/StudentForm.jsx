import { useEffect, useMemo, useReducer, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
} from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import { AiOutlineUser } from "react-icons/ai";
import { BiArrowBack } from "react-icons/bi";
import { HiArrowSmLeft, HiArrowSmRight } from "react-icons/hi";
import { useTranslation } from "react-i18next";
import Button from "./Button";
import GlobalModal from "./GlobalModal";
import Field from "./Field";
import ProgressIndicator from "./PrograssIndicator";
import Select from "./Select";
import TextArea from "./TextArea";
import FileInput from "./FileInput";
import {
  createStudent,
  getDepartments,
  updateStudent,
} from "../services/apiRoute";

const MotionDiv = motion.div;

const steps = ["personal", "relatives", "biometrics"];

function reducer(state, action) {
  switch (action.type) {
    case "NEXT":
      return {
        ...state,
        step: Math.min(state.step + 1, steps.length - 1),
        maxReached: Math.max(
          state.maxReached,
          Math.min(state.step + 1, steps.length - 1),
        ),
      };
    case "BACK":
      return { ...state, step: Math.max(state.step - 1, 0) };
    case "GOTO":
      if (action.payload <= state.maxReached) {
        return { ...state, step: action.payload };
      }
      return state;
    case "RESET":
      return { step: 0, maxReached: 0 };
    default:
      return state;
  }
}

function buildDefaultValues(student) {
  return {
    firstName: student?.firstName || "",
    lastName: student?.lastName || "",
    fatherName: student?.fatherName || "",
    grandFatherName: student?.grandFatherName || "",
    email: student?.email || "",
    phone: student?.phone || "",
    gender: student?.gender || "Male",
    dateOfBirth: student?.dateOfBirth || "",
    enrollmentDate: student?.enrollmentDate || "",
    department: student?.department || "",
    semester: student?.semester || "",
    code: student?.code || "",
    kankorId: student?.kankorId || "",
    baseNumber: student?.baseNumber || "",
    originInfo: student?.originInfo || "",
    stayingInfo: student?.stayingInfo || "",
    relativeInfo: {
      relativeType: student?.relativeInfo?.relativeType || "",
      name: student?.relativeInfo?.name || "",
      fatherName: student?.relativeInfo?.fatherName || "",
      job: student?.relativeInfo?.job || "",
      mobile: student?.relativeInfo?.mobile || "",
      address: student?.relativeInfo?.address || "",
    },
    documents: student?.documents || [],
    biometric: {
      fingerprintId: student?.biometric?.fingerprintId || "",
      registeredAt: student?.biometric?.registeredAt || "",
      status: Boolean(student?.biometric?.status),
    },
  };
}

function buildPayload(values) {
  return {
    ...values,
    documents: Array.isArray(values.documents) ? values.documents : [],
  };
}

const StudentForm = ({
  student,
  isLoading: studentIsLoading = false,
  onClose,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = Boolean(student);
  const methods = useForm({
    mode: "onChange",
    defaultValues: buildDefaultValues(student),
  });

  const { data: departmentsData, isLoading: departmentsLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: getDepartments,
  });

  const createStudentMutation = useMutation({
    mutationFn: createStudent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      window.GooeyToaster?.success?.(t("studentForm.toast.createSuccess"));
      if (onClose) {
        onClose();
        return;
      }
      navigate("/admin/student");
    },
    onError: (error) => {
      window.GooeyToaster?.error?.(
        error.message || t("studentForm.toast.createError"),
      );
    },
  });

  const updateStudentMutation = useMutation({
    mutationFn: ({ id, studentData }) => updateStudent(id, studentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      window.GooeyToaster?.success?.(t("studentForm.toast.updateSuccess"));
      if (onClose) {
        onClose();
        return;
      }
      navigate("/admin/student");
    },
    onError: (error) => {
      window.GooeyToaster?.error?.(
        error.message || t("studentForm.toast.updateError"),
      );
    },
  });

  useEffect(() => {
    methods.reset(buildDefaultValues(student));
  }, [methods, student]);

  const departmentOptions = useMemo(
    () =>
      (departmentsData || []).map((department) => ({
        value: department.name || department.id,
        label: department.name || department.id,
      })),
    [departmentsData],
  );
  const semesterOptions = useMemo(
    () => [
      { label: t("studentForm.options.semester1"), value: "1" },
      { label: t("studentForm.options.semester2"), value: "2" },
      { label: t("studentForm.options.semester3"), value: "3" },
      { label: t("studentForm.options.semester4"), value: "4" },
      { label: t("studentForm.options.semester5"), value: "5" },
      { label: t("studentForm.options.semester6"), value: "6" },
      { label: t("studentForm.options.semester7"), value: "7" },
      { label: t("studentForm.options.semester8"), value: "8" },
    ],
    [t],
  );
  const provinceOptions = useMemo(
    () =>
      [
        "kabul",
        "herat",
        "balkh",
        "kandahar",
        "nangarhar",
        "kunduz",
        "parwan",
        "baghlan",
        "badakhshan",
        "bamyan",
      ].map((province) => ({
        label: t(`studentForm.options.provinces.${province}`),
        value: t(`studentForm.options.provinces.${province}`),
      })),
    [t],
  );
  const progressSteps = useMemo(
    () => [
      { position: 0, label: t("studentForm.steps.personal") },
      { position: 1, label: t("studentForm.steps.relatives") },
      { position: 2, label: t("studentForm.steps.biometrics") },
    ],
    [t],
  );

  const [state, dispatch] = useReducer(reducer, { step: 0, maxReached: 0 });
  const currentStep = steps[state.step];
  const isSubmitting =
    createStudentMutation.isPending || updateStudentMutation.isPending;

  const onSubmit = (values) => {
    if (state.step !== steps.length - 1) return;

    const payload = buildPayload(values);

    if (isEdit) {
      updateStudentMutation.mutate({
        id: student.id || student._id,
        studentData: payload,
      });
      return;
    }

    createStudentMutation.mutate(payload);
  };

  const nextStep = async () => {
    let fieldsToValidate = [];

    if (currentStep === "personal") {
      fieldsToValidate = [
        "firstName",
        "lastName",
        "email",
        "department",
        "gender",
        "enrollmentDate",
      ];
    } else if (currentStep === "relatives") {
      fieldsToValidate = [
        "relativeInfo.relativeType",
        "relativeInfo.name",
        "relativeInfo.mobile",
      ];
    }

    const isValid = await methods.trigger(fieldsToValidate);
    if (isValid) dispatch({ type: "NEXT" });
  };

  const goToStep = (index) => {
    dispatch({ type: "GOTO", payload: index });
  };

  const handleDismiss = () => {
    if (onClose) {
      onClose();
      return;
    }

    navigate("/admin/student");
  };

  if (studentIsLoading || departmentsLoading) {
    return (
      <div className="w-full min-h-[420px] flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-2 border-default border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="w-[96%] font-persian mx-auto mt-4 min-h-full   border-default dark:border-dark-default bg-app dark:bg-dark-app rounded-md flex flex-col">
      <div className="flex-1 w-full px-4 py-4 relative border-b border-default dark:border-dark-default">
        <h3 className="text-sm font-persian font-semibold text-right dark:text-dark-primary text-primary">
          {isEdit
            ? t("studentForm.header.editTitle")
            : t("studentForm.header.createTitle")}
        </h3>
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute left-4 top-1/2 -translate-y-1/2 border border-default dark:border-dark-default p-1 rounded-md"
        >
          <BiArrowBack className="text-[24px] dark:text-dark-secondary  cursor-pointer  text-secondary " />
        </button>
      </div>

      <ProgressIndicator
        currentStep={state.step}
        maxReached={state.maxReached}
        goToStep={goToStep}
        steps={progressSteps}
      />

      <FormProvider {...methods}>
        <form
          noValidate
          onSubmit={methods.handleSubmit(onSubmit)}
          onKeyDown={(event) => {
            if (event.key === "Enter") event.preventDefault();
          }}
          className="relative flex-1"
        >
          <div className="overflow-hidden">
            <AnimatePresence mode="wait">
              <MotionDiv
                key={currentStep}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.25 }}
                className="w-full grid grid-cols-2 gap-x-3 gap-y-4 p-6"
              >
                {currentStep === "personal" && (
                  <PersonalInfo
                    departmentOptions={departmentOptions}
                    provinceOptions={provinceOptions}
                    semesterOptions={semesterOptions}
                  />
                )}
                {currentStep === "relatives" && <RelativesInfo />}
                {currentStep === "biometrics" && <Biometrics />}
              </MotionDiv>
            </AnimatePresence>
          </div>

          <div className="flex justify-end gap-x-4 px-6 pb-6 items-center">
            {state.step > 0 ? (
              <Button
                icon={<HiArrowSmRight />}
                type="button"
                onClick={() => dispatch({ type: "BACK" })}
                disabled={isSubmitting}
              >
                {t("studentForm.actions.back")}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleDismiss}
                disabled={isSubmitting}
              >
                {t("studentForm.actions.cancel")}
              </Button>
            )}

            {state.step < steps.length - 1 && (
              <Button
                icon={<HiArrowSmLeft />}
                type="button"
                onClick={nextStep}
                disabled={isSubmitting}
              >
                {t("studentForm.actions.next")}
              </Button>
            )}

            {state.step === steps.length - 1 && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting
                  ? t("studentForm.actions.submitting")
                  : isEdit
                    ? t("studentForm.actions.save")
                    : t("studentForm.actions.create")}
              </Button>
            )}
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

const PersonalInfo = ({
  provinceOptions,
  departmentOptions,
  semesterOptions,
}) => {
  const { t } = useTranslation();
  const {
    register,
    formState: { errors },
    control,
  } = useFormContext();

  return (
    <div className="grid grid-cols-2 col-span-2 gap-x-3 gap-y-4">
      <Field
        required
        register={register("firstName", {
          required: t("studentForm.validation.firstNameRequired"),
        })}
        label={t("studentForm.fields.firstName.label")}
        id="firstName"
        placeholder={t("studentForm.fields.firstName.placeholder")}
        error={errors?.firstName?.message}
      />
      <Field
        required
        register={register("lastName", {
          required: t("studentForm.validation.lastNameRequired"),
        })}
        label={t("studentForm.fields.lastName.label")}
        id="lastName"
        placeholder={t("studentForm.fields.lastName.placeholder")}
        error={errors?.lastName?.message}
      />
      <Field
        register={register("fatherName")}
        label={t("studentForm.fields.fatherName.label")}
        id="fatherName"
        placeholder={t("studentForm.fields.fatherName.placeholder")}
      />
      <Field
        register={register("grandFatherName")}
        label={t("studentForm.fields.grandFatherName.label")}
        id="grandFatherName"
        placeholder={t("studentForm.fields.grandFatherName.placeholder")}
      />
      <Field
        required
        register={register("email", {
          required: t("studentForm.validation.emailRequired"),
          pattern: {
            value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
            message: t("studentForm.validation.emailInvalid"),
          },
        })}
        label={t("studentForm.fields.email.label")}
        id="email"
        placeholder={t("studentForm.fields.email.placeholder")}
        error={errors?.email?.message}
      />
      <Field
        register={register("phone")}
        label={t("studentForm.fields.phone.label")}
        id="phone"
        placeholder={t("studentForm.fields.phone.placeholder")}
      />
      <Controller
        name="department"
        control={control}
        rules={{ required: t("studentForm.validation.departmentRequired") }}
        render={({ field }) => (
          <Select
            options={departmentOptions}
            label={t("studentForm.fields.department.label")}
            placeholder={t("studentForm.fields.department.placeholder")}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
      <Controller
        name="semester"
        control={control}
        render={({ field }) => (
          <Select
            options={semesterOptions}
            label={t("studentForm.fields.semester.label")}
            placeholder={t("studentForm.fields.semester.placeholder")}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
      <Controller
        name="gender"
        control={control}
        rules={{ required: t("studentForm.validation.genderRequired") }}
        render={({ field }) => (
          <Select
            label={t("studentForm.fields.gender.label")}
            placeholder={t("studentForm.fields.gender.placeholder")}
            options={[
              { label: t("studentForm.options.genderMale"), value: "Male" },
              { label: t("studentForm.options.genderFemale"), value: "Female" },
              { label: t("studentForm.options.genderOther"), value: "Other" },
            ]}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
      <Controller
        name="originInfo"
        control={control}
        render={({ field }) => (
          <Select
            options={provinceOptions}
            label={t("studentForm.fields.originInfo.label")}
            placeholder={t("studentForm.fields.originInfo.placeholder")}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
      <Field
        register={register("dateOfBirth")}
        label={t("studentForm.fields.dateOfBirth.label")}
        id="dateOfBirth"
        type="date"
      />
      <Field
        required
        register={register("enrollmentDate", {
          required: t("studentForm.validation.enrollmentDateRequired"),
        })}
        label={t("studentForm.fields.enrollmentDate.label")}
        id="enrollmentDate"
        type="date"
        error={errors?.enrollmentDate?.message}
      />
      <Field
        register={register("code")}
        label={t("studentForm.fields.code.label")}
        id="code"
        placeholder={t("studentForm.fields.code.placeholder")}
      />
      <Field
        register={register("kankorId")}
        label={t("studentForm.fields.kankorId.label")}
        id="kankorId"
        placeholder={t("studentForm.fields.kankorId.placeholder")}
      />
      <Field
        register={register("baseNumber")}
        label={t("studentForm.fields.baseNumber.label")}
        id="baseNumber"
        placeholder={t("studentForm.fields.baseNumber.placeholder")}
      />
      <div className="col-span-2">
        <TextArea
          register={register("stayingInfo")}
          label={t("studentForm.fields.stayingInfo.label")}
          id="stayingInfo"
          row={3}
          placeholder={t("studentForm.fields.stayingInfo.placeholder")}
        />
      </div>
    </div>
  );
};

const RelativesInfo = () => {
  const { t } = useTranslation();
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext();

  const relativeOptions = [
    {
      label: t("studentForm.options.relativeFather"),
      value: "father",
      icon: <AiOutlineUser className="text-[14px]" />,
    },
    {
      label: t("studentForm.options.relativeMother"),
      value: "mother",
      icon: <AiOutlineUser className="text-[14px]" />,
    },
    {
      label: t("studentForm.options.relativeSister"),
      value: "sister",
      icon: <AiOutlineUser className="text-[14px]" />,
    },
    {
      label: t("studentForm.options.relativeBrother"),
      value: "brother",
      icon: <AiOutlineUser className="text-[14px]" />,
    },
    {
      label: t("studentForm.options.relativeUncle"),
      value: "uncle",
      icon: <AiOutlineUser className="text-[14px]" />,
    },
    {
      label: t("studentForm.options.relativeGrandfather"),
      value: "grandfather",
      icon: <AiOutlineUser className="text-[14px]" />,
    },
  ];

  return (
    <>
      <Controller
        name="relativeInfo.relativeType"
        control={control}
        rules={{ required: t("studentForm.validation.relativeTypeRequired") }}
        render={({ field }) => (
          <Select
            options={relativeOptions}
            label={t("studentForm.fields.relativeType.label")}
            placeholder={t("studentForm.fields.relativeType.placeholder")}
            value={field.value}
            onChange={field.onChange}
          />
        )}
      />
      <Field
        register={register("relativeInfo.name", {
          required: t("studentForm.validation.relativeNameRequired"),
        })}
        label={t("studentForm.fields.relativeName.label")}
        id="relativeName"
        placeholder={t("studentForm.fields.relativeName.placeholder")}
        error={errors?.relativeInfo?.name?.message}
      />
      <Field
        register={register("relativeInfo.fatherName")}
        label={t("studentForm.fields.relativeFatherName.label")}
        id="relativeFatherName"
        placeholder={t("studentForm.fields.relativeFatherName.placeholder")}
      />
      <Field
        register={register("relativeInfo.job")}
        label={t("studentForm.fields.relativeJob.label")}
        id="relativeJob"
        placeholder={t("studentForm.fields.relativeJob.placeholder")}
      />
      <Field
        register={register("relativeInfo.mobile", {
          required: t("studentForm.validation.relativeMobileRequired"),
          pattern: {
            value: /^[0-9]{10,13}$/,
            message: t("studentForm.validation.relativeMobileInvalid"),
          },
        })}
        label={t("studentForm.fields.relativeMobile.label")}
        id="relativeMobile"
        placeholder={t("studentForm.fields.relativeMobile.placeholder")}
        error={errors?.relativeInfo?.mobile?.message}
      />
      <Field
        register={register("relativeInfo.address")}
        label={t("studentForm.fields.relativeAddress.label")}
        id="relativeAddress"
        placeholder={t("studentForm.fields.relativeAddress.placeholder")}
      />
    </>
  );
};

const Biometrics = () => {
  const { t } = useTranslation();
  const { setValue, register, watch } = useFormContext();
  const [fingerprintModalOpen, setFingerprintModalOpen] = useState(false);
  const documents = watch("documents");
  const fingerprintScanned = watch("biometric.status");

  const handleFingerprintScan = () => {
    const now = new Date().toISOString();
    setValue("biometric.fingerprintId", "fingerprint-scanned", {
      shouldDirty: true,
    });
    setValue("biometric.registeredAt", now, { shouldDirty: true });
    setValue("biometric.status", true, { shouldDirty: true });
    setFingerprintModalOpen(false);
  };

  return (
    <>
      <div className="col-span-2 grid grid-cols-2 gap-4">
        <div className="grid col-span-2">
          <FileInput
            id="documents"
            label={t("studentForm.fields.documents.label")}
            register={register("documents")}
            multiple
            onChange={(event) => {
              const files = Array.from(event.target.files || []).map(
                (file) => ({
                  name: file.name,
                  size: file.size,
                  type: file.type,
                }),
              );
              setValue("documents", files, { shouldDirty: true });
            }}
          />
          {Array.isArray(documents) && documents.length > 0 && (
            <p className="mt-2 text-xs text-muted dark:text-dark-muted">
              {t("studentForm.fields.documents.selected", {
                count: documents.length,
              })}
            </p>
          )}
        </div>

        <div className="col-span-1">
          <label className="text-xs font-semibold text-gray-500 dark:text-white">
            {t("studentForm.fields.fingerprint.label")}
          </label>
          <Button
            type="button"
            onClick={() => setFingerprintModalOpen(true)}
            className="mt-2"
          >
            {fingerprintScanned
              ? t("studentForm.fields.fingerprint.rescan")
              : t("studentForm.fields.fingerprint.add")}
          </Button>
          {fingerprintScanned && (
            <p className="mt-2 text-xs text-success">
              {t("studentForm.fields.fingerprint.done")}
            </p>
          )}
        </div>
      </div>

      <GlobalModal
        open={fingerprintModalOpen}
        setOpen={setFingerprintModalOpen}
      >
        <div className="bg-white dark:bg-dark-card p-6 rounded-lg shadow-lg max-w-md mx-auto">
          <h3 className="text-lg font-semibold mb-4 text-center text-primary dark:text-dark-primary">
            {t("studentForm.modal.fingerprintTitle")}
          </h3>
          <p className="text-center mb-4 text-muted dark:text-dark-muted">
            {t("studentForm.modal.fingerprintDescription")}
          </p>
          <div className="flex justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="44"
              height="44"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18.9 7a8 8 0 0 1 1.1 5v1a6 6 0 0 0 .8 3" />
              <path d="M8 11a4 4 0 0 1 8 0v1a10 10 0 0 0 2 6" />
              <path d="M12 11v2a14 14 0 0 0 2.5 8" />
              <path d="M8 15a18 18 0 0 0 1.8 6" />
              <path d="M4.9 19a22 22 0 0 1 -.9 -7v-1a8 8 0 0 1 12 -6.95" />
            </svg>
          </div>
          <div className="flex justify-center">
            <Button onClick={handleFingerprintScan} type="button">
              {t("studentForm.modal.fingerprintComplete")}
            </Button>
          </div>
        </div>
      </GlobalModal>
    </>
  );
};

export default StudentForm;
