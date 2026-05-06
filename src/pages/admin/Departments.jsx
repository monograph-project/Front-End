import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowUpDown,
  BadgeCheck,
  BookMarked,
  Building2,
  CalendarDays,
  Columns3,
  EyeOff,
  Filter,
  GraduationCap,
  Hash,
  Layers,
  Plus,
  UserRound,
  UsersRound,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { gooeyToast } from "goey-toast";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Button from "../../components/Button";
import Checkbox from "../../components/Checkbox";
import {
  DropdownContent,
  DropdownItem,
  DropdownMenuRoot,
  DropdownSeparator,
  DropdownTrigger,
} from "../../components/DropdownMenu";
import Field from "../../components/Field";
import GlobalModal from "../../components/GlobalModal";
import IC from "../../components/IC";
import Icon from "../../components/Icon";
import OperationsDropdown from "../../components/OperationsDropdown";
import Pagination from "../../components/Pagination";
import Select from "../../components/Select";
import SensitiveActionModal from "../../components/SensitiveActionModal";
import SettingsTabs from "../../components/SettingsTabs";
import StatusPill, { statusToPillVariant } from "../../components/StatusPill";
import Table from "../../components/Table";
import TableBody from "../../components/TableBody";
import TableColumn from "../../components/TableColumn";
import TableHeader from "../../components/TableHeader";
import TableRow from "../../components/TableRow";
import TableToolbar from "../../components/TableToolbar";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import {
  useCreateAcademicYear,
  useAcademicYears,
  useBatches,
  useCreateBatch,
  useCreateFaculty,
  useCreateSemester,
  useDeleteAcademicYear,
  useDeleteBatch,
  useDeleteDepartment,
  useDeleteFaculty,
  useDeleteFacultyGroup,
  useDeleteSemester,
  useDepartments,
  useFaculties,
  useFacultyGroups,
  useSemesters,
  useUpdateAcademicYear,
  useUpdateBatch,
  useUpdateFaculty,
  useUpdateSemester,
} from "../../services/useApi";
import AddDepartmentForm from "./AddDepartmentForm";
import EditDepartmentForm from "./EditDepartmentForm";

const EMPTY = [];
const STATUS_ALL = "all";
const SEMESTER_TYPE_OPTIONS = ["FALL", "SUMMER", "SPRING"];
/** Minimum calendar span between batch start / end dates (inclusive boundary check). */
const BATCH_MIN_SPAN_MONTHS = 4;

function parseDateInputOnly(isoDate) {
  if (!isoDate || typeof isoDate !== "string") return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate.trim());
  if (!m) return null;
  const y = Number(m[1]);
  const mo = Number(m[2]);
  const d = Number(m[3]);
  if (!Number.isFinite(y) || !Number.isFinite(mo) || !Number.isFinite(d))
    return null;
  const dt = new Date(y, mo - 1, d);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

function batchDatesInOrder(startStr, endStr) {
  const start = parseDateInputOnly(startStr);
  const end = parseDateInputOnly(endStr);
  if (!start || !end) return false;
  return end > start;
}

/** `endDate` must be strictly on/after calendar date `startDate + minMonths`. */
function batchSpansMinMonths(startStr, endStr, minMonths) {
  const start = parseDateInputOnly(startStr);
  const end = parseDateInputOnly(endStr);
  if (!start || !end || end <= start) return false;
  const minEnd = new Date(
    start.getFullYear(),
    start.getMonth() + minMonths,
    start.getDate(),
  );
  return end >= minEnd;
}

function formatRegistryDate(value, locale, fallback = "-") {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatDateRange(start, end, locale, fallback = "-") {
  const from = formatRegistryDate(start, locale, "");
  const to = formatRegistryDate(end, locale, "");
  if (!from && !to) return fallback;
  if (from && to) return `${from} - ${to}`;
  return from || to || fallback;
}

function normalizeId(value, fallback = "-") {
  if (value == null || value === "") return fallback;
  return String(value);
}

function inferTimelineStatus(start, end) {
  const now = new Date();
  const startDate = start ? new Date(start) : null;
  const endDate = end ? new Date(end) : null;

  if (endDate && !Number.isNaN(endDate.getTime()) && endDate < now) {
    return "inactive";
  }
  if (startDate && !Number.isNaN(startDate.getTime()) && startDate > now) {
    return "pending";
  }
  return "active";
}

function getAcademicYearLabel(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return (
    value.name ??
    value.label ??
    value.title ??
    (value.id != null ? String(value.id) : "")
  );
}

function getBatchStatus(record) {
  if (typeof record?.status === "string" && record.status.trim()) {
    return record.status.trim().toLowerCase();
  }
  return record?.isActive === false ? "inactive" : "active";
}

function getSemesterStatus(record) {
  if (typeof record?.status === "string" && record.status.trim()) {
    return record.status.trim().toLowerCase();
  }
  return inferTimelineStatus(record?.startDate, record?.endDate);
}

function getFacultyStatus(record) {
  if (typeof record?.status === "string" && record.status.trim()) {
    return record.status.trim().toLowerCase();
  }
  return "";
}

function getDepartmentMetaLine(record, t) {
  const parts = [record?.shortName, record?.facultyName].filter(Boolean);
  return parts.length
    ? parts.join(" • ")
    : t("adminDepartments.fallback.faculty");
}

function getFacultyMetaLine(record) {
  const parts = [
    record?.code ? `Code: ${record.code}` : "",
    record?.dean ?? record?.head ?? "",
  ].filter(Boolean);
  return parts.join(" • ");
}

function displayName(person, fallback = "-") {
  if (!person) return fallback;
  if (typeof person === "string") return person || fallback;
  const full = [person.firstName, person.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();
  return (
    full ||
    person.displayName ||
    person.userName ||
    person.username ||
    (person.id != null ? String(person.id) : fallback)
  );
}

function normalizeGroupId(group) {
  return String(group?.id ?? group?.groupId ?? group?.uuid ?? "");
}

function groupTitle(group) {
  return (
    group?.name ?? group?.title ?? (group?.id != null ? String(group.id) : "-")
  );
}

function groupMembersCount(group) {
  const members =
    group?.groupMembers ??
    group?.members ??
    group?.studentIds ??
    group?.groupMemberIds ??
    [];
  return Array.isArray(members) ? members.length : 0;
}

function getRegistryTabs(t) {
  return [
    {
      id: "departments",
      label: t("settings.academic.departments.title"),
      icon: GraduationCap,
    },
    {
      id: "academic-years",
      label: t("settings.academic.years.title"),
      icon: CalendarDays,
    },
    {
      id: "semesters",
      label: t("adminRegistry.tabs.semesters"),
      icon: CalendarDays,
    },
    {
      id: "batches",
      label: t("settings.academic.batches.title"),
      icon: BookMarked,
    },
    {
      id: "faculties",
      label: t("adminRegistry.tabs.faculties"),
      icon: Building2,
    },
    {
      id: "groups",
      label: t("adminProjects.tabs.groups"),
      icon: UsersRound,
    },
  ];
}

function getDefaultFormValues(tabId) {
  switch (tabId) {
    case "academic-years":
      return {
        name: "",
        startDate: "",
        endDate: "",
        calendarType: "SOLAR",
      };
    case "semesters":
      return {
        academicYear: "",
        type: "",
        name: "",
        startDate: "",
        endDate: "",
      };
    case "batches":
      return {
        academicYear: "",
        name: "",
        year: String(new Date().getFullYear()),
        type: "",
        startDate: "",
        endDate: "",
        description: "",
        isActive: true,
      };
    case "faculties":
      return {
        name: "",
        code: "",
        dean: "",
        description: "",
      };
    default:
      return {};
  }
}

function getEditFormValues(tabId, record) {
  if (!record) return getDefaultFormValues(tabId);
  switch (tabId) {
    case "academic-years":
      return {
        name: String(record?.name ?? record?.label ?? ""),
        startDate: String(record?.startDate ?? ""),
        endDate: String(record?.endDate ?? ""),
        calendarType: String(record?.calendarType ?? "SOLAR"),
      };
    case "semesters":
      return {
        academicYear: normalizeId(
          record?.academicYear?.id ?? record?.academicYear ?? "",
          "",
        ),
        type: String(record?.type ?? ""),
        name: String(record?.name ?? ""),
        startDate: String(record?.startDate ?? ""),
        endDate: String(record?.endDate ?? ""),
      };
    case "batches":
      return {
        academicYear: normalizeId(
          record?.academicYear?.id ?? record?.academicYear ?? "",
          "",
        ),
        name: String(record?.name ?? record?.title ?? ""),
        year: String(record?.year ?? ""),
        type: String(record?.type ?? ""),
        startDate: String(record?.startDate ?? ""),
        endDate: String(record?.endDate ?? ""),
        description: String(record?.description ?? ""),
        isActive: record?.isActive !== false,
      };
    case "faculties":
      return {
        name: String(record?.name ?? ""),
        code: String(record?.code ?? ""),
        dean: String(record?.dean ?? record?.head ?? ""),
        description: String(record?.description ?? ""),
      };
    default:
      return {};
  }
}

function buildPayload(tabId, values) {
  switch (tabId) {
    case "academic-years":
      return {
        name: values.name.trim(),
        startDate: values.startDate,
        endDate: values.endDate,
        calendarType: values.calendarType,
      };
    case "semesters": {
      const ayId = String(values.academicYear ?? "").trim();
      return {
        academicYearId: ayId,
        academicYear: ayId,
        type: String(values.type ?? "")
          .trim()
          .toUpperCase(),
        name: values.name.trim(),
        startDate: values.startDate,
        endDate: values.endDate,
      };
    }
    case "batches": {
      const ayId = String(values.academicYear ?? "").trim();
      return {
        academicYearId: ayId,
        academicYear: ayId,
        name: values.name.trim(),
        year: Number(values.year),
        type: values.type.trim(),
        startDate: values.startDate,
        endDate: values.endDate,
        description: values.description.trim() || undefined,
        isActive: Boolean(values.isActive),
      };
    }
    case "faculties":
      return {
        name: values.name.trim(),
        code: values.code.trim() || undefined,
        dean: values.dean.trim() || undefined,
        description: values.description.trim() || undefined,
      };
    default:
      return values;
  }
}

/** Field-level errors shown under inputs (semesters, batches, academic-year & faculty modals). */
function getRegistryFieldErrors(tabId, values, academicYears = [], t) {
  const tr = typeof t === "function" ? t : (key) => key;
  const req = () => tr("adminRegistry.validation.generic");

  /** @type {Record<string, string>} */
  const err = {};

  if (tabId === "academic-years") {
    if (!values.name?.trim()) err.name = req();
    if (!values.startDate) err.startDate = req();
    if (!values.endDate) err.endDate = req();
    if (!values.calendarType) err.calendarType = req();
    return err;
  }

  if (tabId === "semesters") {
    if (!values.name?.trim()) {
      err.name = tr("adminRegistry.validation.semesterNameRequired");
    }
    if (!values.academicYear) {
      err.academicYear = tr(
        "adminRegistry.validation.semesterAcademicYearRequired",
      );
    }
    if (
      !SEMESTER_TYPE_OPTIONS.includes(
        String(values.type ?? "")
          .trim()
          .toUpperCase(),
      )
    ) {
      err.type = tr("adminRegistry.validation.semesterTypeInvalid");
    }

    if (!values.startDate && !values.endDate) {
      const m = tr("adminRegistry.validation.semesterDatesRequired");
      err.startDate = m;
      err.endDate = m;
    } else {
      if (!values.startDate)
        err.startDate = tr("adminRegistry.validation.semesterDatesRequired");
      if (!values.endDate)
        err.endDate = tr("adminRegistry.validation.semesterDatesRequired");
    }

    if (values.startDate && values.endDate) {
      if (!batchDatesInOrder(values.startDate, values.endDate)) {
        err.endDate = tr("adminRegistry.validation.semesterDateOrder");
      } else {
        const academicYear = academicYears.find(
          (item) =>
            normalizeId(item?.id ?? item?.uuid, "") === values.academicYear,
        );
        if (
          academicYear?.startDate &&
          new Date(values.startDate) < new Date(academicYear.startDate)
        ) {
          err.startDate = tr(
            "adminRegistry.validation.semesterStartWithinYear",
          );
        }
        if (
          academicYear?.endDate &&
          new Date(values.endDate) > new Date(academicYear.endDate)
        ) {
          err.endDate = tr("adminRegistry.validation.semesterEndWithinYear");
        }
      }
    }
    return err;
  }

  if (tabId === "batches") {
    if (!values.name?.trim()) err.name = req();
    if (!values.type?.trim()) err.type = req();
    if (!values.academicYear) err.academicYear = req();

    if (!values.startDate && !values.endDate) {
      const m = req();
      err.startDate = m;
      err.endDate = m;
    } else {
      if (!values.startDate) err.startDate = req();
      if (!values.endDate) err.endDate = req();
    }

    if (!(Number(values.year) > 0)) err.year = req();

    if (values.startDate && values.endDate) {
      if (!batchDatesInOrder(values.startDate, values.endDate)) {
        err.endDate = tr("adminRegistry.validation.batchDateOrder");
      } else if (
        !batchSpansMinMonths(
          values.startDate,
          values.endDate,
          BATCH_MIN_SPAN_MONTHS,
        )
      ) {
        err.endDate = tr("adminRegistry.validation.batchMinSpanMonths", {
          months: BATCH_MIN_SPAN_MONTHS,
        });
      }
    }
    return err;
  }

  if (tabId === "faculties") {
    if (!values.name?.trim()) err.name = req();
    return err;
  }

  return err;
}

function RegistryFields({
  tabId,
  values,
  setValues,
  academicYearOptions,
  t,
  fieldErrors = {},
}) {
  const fe = fieldErrors;
  if (tabId === "academic-years") {
    return (
      <div className="grid gap-4">
        <Field
          register={{}}
          label={t("settings.academic.year.fieldName")}
          placeholder={t("settings.academic.year.placeholderName")}
          value={values.name}
          error={fe.name}
          onChange={(event) =>
            setValues((current) => ({ ...current, name: event.target.value }))
          }
        />
        <Field
          register={{}}
          type="date"
          label={t("settings.academic.year.fieldStart")}
          value={values.startDate}
          error={fe.startDate}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              startDate: event.target.value,
            }))
          }
        />
        <Field
          register={{}}
          type="date"
          label={t("settings.academic.year.fieldEnd")}
          value={values.endDate}
          error={fe.endDate}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              endDate: event.target.value,
            }))
          }
        />
        <Select
          label={t("settings.academic.year.fieldCalendar")}
          value={values.calendarType}
          error={fe.calendarType}
          onValueChange={(value) =>
            setValues((current) => ({ ...current, calendarType: value }))
          }
          placeholder={t("settings.academic.year.placeholderCalendar")}
          options={[
            {
              value: "SOLAR",
              label: t("settings.academic.year.calendarSolar"),
            },
            {
              value: "LUNAR",
              label: t("settings.academic.year.calendarLunar"),
            },
          ]}
        />
      </div>
    );
  }

  if (tabId === "semesters") {
    return (
      <div className="grid gap-4">
        <Select
          label={t("settings.academic.batch.fieldAcademicYear")}
          value={values.academicYear}
          error={fe.academicYear}
          onValueChange={(value) =>
            setValues((current) => ({ ...current, academicYear: value }))
          }
          options={academicYearOptions}
          placeholder={t("adminRegistry.form.semesterAcademicYearPlaceholder")}
        />
        <Field
          register={{}}
          label={t("adminRegistry.form.semesterName")}
          placeholder={t("adminRegistry.form.semesterNamePlaceholder")}
          value={values.name}
          error={fe.name}
          onChange={(event) =>
            setValues((current) => ({ ...current, name: event.target.value }))
          }
        />
        <Select
          label={t("adminRegistry.form.semesterType")}
          value={values.type}
          error={fe.type}
          onValueChange={(value) =>
            setValues((current) => ({ ...current, type: value }))
          }
          options={SEMESTER_TYPE_OPTIONS.map((value) => ({
            value,
            label: value.charAt(0) + value.slice(1).toLowerCase(),
          }))}
          placeholder={t("adminRegistry.form.semesterTypePlaceholder")}
        />
        <Field
          register={{}}
          type="date"
          label={t("settings.academic.batch.fieldStart")}
          value={values.startDate}
          error={fe.startDate}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              startDate: event.target.value,
            }))
          }
        />
        <Field
          register={{}}
          type="date"
          label={t("settings.academic.batch.fieldEnd")}
          value={values.endDate}
          error={fe.endDate}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              endDate: event.target.value,
            }))
          }
        />
      </div>
    );
  }

  if (tabId === "batches") {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <Select
            label={t("settings.academic.batch.fieldAcademicYear")}
            value={values.academicYear}
            error={fe.academicYear}
            onValueChange={(value) =>
              setValues((current) => ({ ...current, academicYear: value }))
            }
            options={academicYearOptions}
            placeholder={t("settings.academic.batch.placeholderAcademicYear")}
          />
        </div>
        <Field
          register={{}}
          label={t("settings.academic.batch.fieldName")}
          placeholder={t("settings.academic.batch.placeholderName")}
          value={values.name}
          error={fe.name}
          onChange={(event) =>
            setValues((current) => ({ ...current, name: event.target.value }))
          }
        />
        <Field
          register={{}}
          type="number"
          label={t("settings.academic.batch.fieldYear")}
          placeholder={t("settings.academic.batch.placeholderYear")}
          value={values.year}
          error={fe.year}
          onChange={(event) =>
            setValues((current) => ({ ...current, year: event.target.value }))
          }
        />
        <Field
          register={{}}
          label={t("settings.academic.batch.fieldType")}
          placeholder={t("settings.academic.batch.placeholderType")}
          value={values.type}
          error={fe.type}
          onChange={(event) =>
            setValues((current) => ({ ...current, type: event.target.value }))
          }
        />
        <Field
          register={{}}
          type="date"
          label={t("settings.academic.batch.fieldStart")}
          value={values.startDate}
          error={fe.startDate}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              startDate: event.target.value,
            }))
          }
        />
        <Field
          register={{}}
          type="date"
          label={t("settings.academic.batch.fieldEnd")}
          value={values.endDate}
          error={fe.endDate}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              endDate: event.target.value,
            }))
          }
        />
        <div className="md:col-span-2">
          <Field label={t("settings.academic.batch.fieldDesc")} register={{}}>
            <textarea
              placeholder={t("settings.academic.batch.placeholderDesc")}
              value={values.description}
              onChange={(event) =>
                setValues((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
              rows={4}
              className="w-full rounded-xl border border-(--color-light-input-border) bg-(--color-light-input-bg) px-3.5 py-2 text-xs text-(--color-light-text-primary) outline-none transition-colors focus:border-(--color-light-input-border-focus) focus:ring-2 focus:ring-blue-500/15 dark:border-dark-input-border dark:bg-(--color-dark-input-bg) dark:text-(--color-dark-text-primary) dark:focus:border-(--color-dark-input-border-focus) dark:focus:ring-blue-400/15"
            />
          </Field>
        </div>
        <div className="md:col-span-2">
          <Checkbox
            id="batch-active"
            checked={values.isActive}
            onChange={(event) =>
              setValues((current) => ({
                ...current,
                isActive: event.target.checked,
              }))
            }
            label={t("settings.academic.batch.fieldActive")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <Field
        register={{}}
        label={t("adminRegistry.form.facultyName")}
        placeholder={t("adminRegistry.form.facultyNamePlaceholder")}
        value={values.name}
        error={fe.name}
        onChange={(event) =>
          setValues((current) => ({ ...current, name: event.target.value }))
        }
      />
      <Field
        register={{}}
        label={t("adminRegistry.form.facultyCode")}
        placeholder={t("adminRegistry.form.facultyCodePlaceholder")}
        value={values.code}
        onChange={(event) =>
          setValues((current) => ({ ...current, code: event.target.value }))
        }
      />
      <Field
        register={{}}
        label={t("adminRegistry.form.facultyDean")}
        placeholder={t("adminRegistry.form.facultyDeanPlaceholder")}
        value={values.dean}
        onChange={(event) =>
          setValues((current) => ({ ...current, dean: event.target.value }))
        }
      />
      <Field
        register={{}}
        label={t("adminDepartments.form.fields.description")}
      >
        <textarea
          placeholder={t("adminRegistry.form.facultyDescriptionPlaceholder")}
          value={values.description}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              description: event.target.value,
            }))
          }
          rows={4}
          className="w-full rounded-xl border border-(--color-light-input-border) bg-(--color-light-input-bg) px-3.5 py-2 text-xs text-(--color-light-text-primary) outline-none transition-colors focus:border-(--color-light-input-border-focus) focus:ring-2 focus:ring-blue-500/15 dark:border-dark-input-border dark:bg-(--color-dark-input-bg) dark:text-(--color-dark-text-primary) dark:focus:border-(--color-dark-input-border-focus) dark:focus:ring-blue-400/15"
        />
      </Field>
    </div>
  );
}

export default function Departments() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { t, i18n } = useTranslation();

  const [activeTab, setActiveTab] = useState("departments");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState(STATUS_ALL);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [deleteRecord, setDeleteRecord] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);
  const debouncedSearch = useDebouncedValue(searchInput, 400);

  const [formValues, setFormValues] = useState(
    getDefaultFormValues("semesters"),
  );
  const [registryFieldErrors, setRegistryFieldErrors] = useState({});

  const registrySetValues = useCallback((updater) => {
    setRegistryFieldErrors({});
    setFormValues(updater);
  }, []);

  const {
    data: departments = EMPTY,
    isError,
    error,
  } = useDepartments({
    notifyOnError: true,
  });
  const { data: semesters = EMPTY } = useSemesters({}, { notifyOnError: true });
  const { data: batches = EMPTY } = useBatches({ notifyOnError: true });
  const { data: faculties = EMPTY } = useFaculties({ notifyOnError: true });
  const { data: groups = EMPTY } = useFacultyGroups(
    {},
    { notifyOnError: true },
  );
  const { data: academicYears = EMPTY } = useAcademicYears(
    {},
    { notifyOnError: false },
  );

  const createSemester = useCreateSemester();
  const updateSemester = useUpdateSemester();
  const deleteSemester = useDeleteSemester();

  const createAcademicYear = useCreateAcademicYear();
  const updateAcademicYear = useUpdateAcademicYear();
  const deleteAcademicYear = useDeleteAcademicYear();

  const createBatch = useCreateBatch();
  const updateBatch = useUpdateBatch();
  const deleteBatch = useDeleteBatch();

  const createFaculty = useCreateFaculty();
  const updateFaculty = useUpdateFaculty();
  const deleteFaculty = useDeleteFaculty();
  const deleteFacultyGroup = useDeleteFacultyGroup({
    showSuccessToast: false,
    showErrorToast: false,
  });

  const deleteDepartmentMutation = useDeleteDepartment({
    showSuccessToast: false,
    showErrorToast: false,
  });

  const tabs = useMemo(() => getRegistryTabs(t), [t]);
  const locale =
    i18n.language === "ps"
      ? "ps-AF"
      : i18n.language === "prs"
        ? "fa-AF"
        : "en-US";

  const academicYearOptions = useMemo(
    () =>
      (Array.isArray(academicYears) ? academicYears : []).map((year) => ({
        value: normalizeId(year?.id ?? year?.uuid, ""),
        label:
          year?.name ??
          year?.label ??
          (year?.id != null ? String(year.id) : ""),
      })),
    [academicYears],
  );

  useEffect(() => {
    setPage(1);
    setStatusFilter(STATUS_ALL);
    setSearchInput("");
  }, [activeTab]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, pageSize]);

  const activeData = useMemo(() => {
    if (activeTab === "departments") return departments;
    if (activeTab === "academic-years") return academicYears;
    if (activeTab === "semesters") return semesters;
    if (activeTab === "batches") return batches;
    if (activeTab === "groups") return groups;
    return faculties;
  }, [
    activeTab,
    academicYears,
    batches,
    departments,
    faculties,
    groups,
    semesters,
  ]);

  const filteredRows = useMemo(() => {
    const search = debouncedSearch.trim().toLowerCase();

    return activeData.filter((record) => {
      let status = "";
      let fields = [];

      if (activeTab === "departments") {
        status = String(record?.status ?? "").toLowerCase();
        fields = [
          record?.id,
          record?.code,
          record?.name,
          record?.shortName,
          record?.head,
          record?.facultyName,
          record?.field,
        ];
      } else if (activeTab === "academic-years") {
        status = inferTimelineStatus(record?.startDate, record?.endDate);
        fields = [
          record?.id,
          record?.name,
          record?.calendarType,
          record?.startDate,
          record?.endDate,
        ];
      } else if (activeTab === "semesters") {
        status = getSemesterStatus(record);
        fields = [
          record?.id,
          record?.name,
          record?.type,
          getAcademicYearLabel(record?.academicYear),
        ];
      } else if (activeTab === "batches") {
        status = getBatchStatus(record);
        fields = [
          record?.id,
          record?.name,
          record?.type,
          record?.year,
          getAcademicYearLabel(record?.academicYear),
        ];
      } else if (activeTab === "groups") {
        fields = [
          normalizeGroupId(record),
          groupTitle(record),
          displayName(record?.groupLeader, ""),
          groupMembersCount(record),
        ];
      } else {
        status = getFacultyStatus(record);
        fields = [
          record?.id,
          record?.name,
          record?.code,
          record?.dean,
          record?.description,
        ];
      }

      const matchesSearch =
        search === "" ||
        fields.some((field) =>
          String(field ?? "")
            .toLowerCase()
            .includes(search),
        );

      const matchesStatus =
        statusFilter === STATUS_ALL ||
        (status && status === statusFilter.toLowerCase());

      return matchesSearch && matchesStatus;
    });
  }, [activeData, activeTab, debouncedSearch, statusFilter]);

  const availableStatuses = useMemo(() => {
    const values = new Set();

    filteredRows.forEach((record) => {
      if (activeTab === "departments")
        values.add(String(record?.status ?? "").toLowerCase());
      if (activeTab === "academic-years") {
        values.add(inferTimelineStatus(record?.startDate, record?.endDate));
      }
      if (activeTab === "semesters") values.add(getSemesterStatus(record));
      if (activeTab === "batches") values.add(getBatchStatus(record));
      if (activeTab === "groups") return;
      if (activeTab === "faculties") {
        const status = getFacultyStatus(record);
        if (status) values.add(status);
      }
    });

    return Array.from(values).filter(Boolean);
  }, [activeTab, filteredRows]);

  const totalElements = filteredRows.length;
  const totalPages =
    totalElements > 0 ? Math.ceil(totalElements / pageSize) : 0;

  useEffect(() => {
    if (totalPages > 0 && page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);

  const statusOptions = useMemo(() => {
    if (!availableStatuses.length) return [];
    return [
      { value: STATUS_ALL, label: t("adminShared.filters.allStatus") },
      ...availableStatuses.map((status) => ({
        value: status,
        label: t(`adminShared.status.${status}`),
      })),
    ];
  }, [availableStatuses, t]);

  const toolbarTitle = useMemo(() => {
    if (activeTab === "departments") return t("adminDepartments.header.title");
    if (activeTab === "academic-years") {
      return t("settings.academic.years.title");
    }
    if (activeTab === "semesters") {
      return t("adminRegistry.titles.semesters");
    }
    if (activeTab === "batches") {
      return t("adminRegistry.titles.batches");
    }
    if (activeTab === "groups") {
      return t("adminProjects.registry.title");
    }
    return t("adminRegistry.titles.faculties");
  }, [activeTab, t]);

  const toolbarDescription = useMemo(() => {
    if (activeTab === "departments") {
      return t("adminDepartments.header.description", {
        count: departments.length,
      });
    }
    if (activeTab === "academic-years") {
      return t("adminRegistry.descriptions.academicYears", {
        count: academicYears.length,
      });
    }
    if (activeTab === "semesters") {
      return t("adminRegistry.descriptions.semesters", {
        count: semesters.length,
      });
    }
    if (activeTab === "batches") {
      return t("adminRegistry.descriptions.batches", {
        count: batches.length,
      });
    }
    if (activeTab === "groups") {
      return t("adminProjects.header.description", {
        count: groups.length,
      });
    }
    return t("adminRegistry.descriptions.faculties", {
      count: faculties.length,
    });
  }, [
    activeTab,
    academicYears.length,
    batches.length,
    departments.length,
    faculties.length,
    groups.length,
    semesters.length,
    t,
  ]);

  const headerData = useMemo(() => {
    if (activeTab === "departments") {
      return [
        { title: "" },
        {
          title: t("adminDepartments.table.id"),
          icon: <Hash className="size-3.5 shrink-0" strokeWidth={2} />,
        },
        {
          title: t("adminDepartments.table.department"),
          icon: <Building2 className="size-3.5 shrink-0" strokeWidth={2} />,
        },
        {
          title: t("adminDepartments.table.head"),
          icon: <UserRound className="size-3.5 shrink-0" strokeWidth={2} />,
        },
        {
          title: t("adminDepartments.table.status"),
          icon: <BadgeCheck className="size-3.5 shrink-0" strokeWidth={2} />,
        },
        {
          title: t("adminDepartments.table.created"),
          icon: <CalendarDays className="size-3.5 shrink-0" strokeWidth={2} />,
        },
        { title: t("adminDepartments.table.actions"), align: "center" },
      ];
    }

    if (activeTab === "academic-years") {
      return [
        { title: "" },
        { title: t("adminDepartments.table.id") },
        { title: t("settings.academic.year.fieldName") },
        { title: t("adminRegistry.table.range") },
        { title: t("settings.academic.year.fieldCalendar") },
        { title: t("adminDepartments.table.status") },
        { title: t("adminDepartments.table.actions"), align: "center" },
      ];
    }

    if (activeTab === "semesters") {
      return [
        { title: "" },
        { title: t("adminDepartments.table.id") },
        {
          title: t("adminRegistry.table.semester"),
        },
        {
          title: t("settings.academic.batch.fieldAcademicYear"),
        },
        {
          title: t("adminRegistry.table.range"),
        },
        { title: t("adminDepartments.table.status") },
        { title: t("adminDepartments.table.actions"), align: "center" },
      ];
    }

    if (activeTab === "batches") {
      return [
        { title: "" },
        { title: t("adminDepartments.table.id") },
        { title: t("settings.academic.batch.fieldName") },
        { title: t("settings.academic.batch.fieldAcademicYear") },
        { title: t("settings.academic.batch.fieldType") },
        { title: t("adminDepartments.table.status") },
        { title: t("adminDepartments.table.actions"), align: "center" },
      ];
    }

    if (activeTab === "groups") {
      return [
        { title: "" },
        { title: t("adminProjects.table.groupId") },
        { title: t("adminProjects.faculty.col.name") },
        { title: t("adminProjects.faculty.col.leader") },
        { title: t("adminProjects.faculty.col.members") },
        { title: t("adminDepartments.table.actions"), align: "center" },
      ];
    }

    return [
      { title: "" },
      { title: t("adminDepartments.table.id") },
      {
        title: t("adminRegistry.table.faculty"),
      },
      {
        title: t("adminDepartments.form.fields.description"),
      },
      { title: t("adminDepartments.table.actions"), align: "center" },
    ];
  }, [activeTab, t]);

  const activeMutationState = useMemo(() => {
    if (activeTab === "academic-years") {
      return {
        create: createAcademicYear,
        update: updateAcademicYear,
        delete: deleteAcademicYear,
        queryKey: ["academic-years"],
      };
    }
    if (activeTab === "semesters") {
      return {
        create: createSemester,
        update: updateSemester,
        delete: deleteSemester,
        queryKey: ["semesters"],
      };
    }
    if (activeTab === "batches") {
      return {
        create: createBatch,
        update: updateBatch,
        delete: deleteBatch,
        queryKey: ["batches"],
      };
    }
    if (activeTab === "faculties") {
      return {
        create: createFaculty,
        update: updateFaculty,
        delete: deleteFaculty,
        queryKey: ["faculties"],
      };
    }
    if (activeTab === "groups") {
      return {
        create: null,
        update: null,
        delete: deleteFacultyGroup,
        queryKey: ["faculty-groups"],
      };
    }
    return {
      create: null,
      update: null,
      delete: deleteDepartmentMutation,
      queryKey: ["departments"],
    };
  }, [
    activeTab,
    createAcademicYear,
    createBatch,
    createFaculty,
    createSemester,
    deleteAcademicYear,
    deleteBatch,
    deleteDepartmentMutation,
    deleteFaculty,
    deleteFacultyGroup,
    deleteSemester,
    updateAcademicYear,
    updateBatch,
    updateFaculty,
    updateSemester,
  ]);

  const exportToCSV = () => {
    const rows = filteredRows.map((record) => {
      if (activeTab === "departments") {
        return [
          normalizeId(record?.id ?? record?.code),
          record?.name ?? "",
          record?.head ?? "",
          record?.facultyName ?? "",
          record?.status ?? "",
        ];
      }
      if (activeTab === "academic-years") {
        return [
          normalizeId(record?.id),
          record?.name ?? "",
          record?.calendarType ?? "",
          formatDateRange(record?.startDate, record?.endDate, locale),
          inferTimelineStatus(record?.startDate, record?.endDate),
        ];
      }
      if (activeTab === "semesters") {
        return [
          normalizeId(record?.id),
          record?.name ?? "",
          record?.type ?? "",
          getAcademicYearLabel(record?.academicYear),
          getSemesterStatus(record),
        ];
      }
      if (activeTab === "batches") {
        return [
          normalizeId(record?.id),
          record?.name ?? "",
          record?.year ?? "",
          record?.type ?? "",
          getAcademicYearLabel(record?.academicYear),
          getBatchStatus(record),
        ];
      }
      if (activeTab === "groups") {
        return [
          normalizeGroupId(record),
          groupTitle(record),
          displayName(record?.groupLeader),
          groupMembersCount(record),
        ];
      }
      return [
        normalizeId(record?.id),
        record?.name ?? "",
        record?.code ?? "",
        record?.dean ?? record?.head ?? "",
      ];
    });

    const csvContent = rows
      .map((row) =>
        row
          .map((field) => `"${String(field ?? "").replaceAll('"', '""')}"`)
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${activeTab}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openCreateModal = () => {
    if (activeTab === "departments") {
      setShowAddModal(true);
      return;
    }
    if (activeTab === "groups") {
      navigate("/admin/projects/groups/register");
      return;
    }
    setRegistryFieldErrors({});
    setFormValues(getDefaultFormValues(activeTab));
    setShowAddModal(true);
  };

  const openEditModal = (record) => {
    if (activeTab === "groups") {
      navigate(
        `/admin/projects/groups/register/${encodeURIComponent(normalizeGroupId(record))}`,
      );
      return;
    }
    setRegistryFieldErrors({});
    setSelectedRecord(record);
    if (activeTab !== "departments") {
      setFormValues(getEditFormValues(activeTab, record));
    }
    setShowEditModal(true);
  };

  const closeFormModals = () => {
    setShowAddModal(false);
    setShowEditModal(false);
    setSelectedRecord(null);
    setRegistryFieldErrors({});
    setFormValues(getDefaultFormValues(activeTab));
  };

  const submitGenericForm = async (mode) => {
    const nextErrors = getRegistryFieldErrors(
      activeTab,
      formValues,
      academicYears,
      t,
    );
    if (Object.keys(nextErrors).length > 0) {
      setRegistryFieldErrors(nextErrors);
      return;
    }
    setRegistryFieldErrors({});

    const payload = buildPayload(activeTab, formValues);
    const mutation =
      mode === "create"
        ? activeMutationState.create
        : activeMutationState.update;
    if (!mutation) return;

    try {
      if (mode === "create") {
        await mutation.mutateAsync(payload);
      } else {
        const rid =
          selectedRecord?.id ??
          selectedRecord?.uuid ??
          selectedRecord?.batchId ??
          selectedRecord?.semesterId;
        await mutation.mutateAsync({
          id: rid,
          ...payload,
        });
      }
      await queryClient.invalidateQueries({
        queryKey: activeMutationState.queryKey,
      });
      if (activeTab === "semesters" || activeTab === "batches") {
        await queryClient.invalidateQueries({ queryKey: ["semesters"] });
        await queryClient.invalidateQueries({ queryKey: ["batches"] });
      }
      closeFormModals();
    } catch {
      // toast handled by mutation
    }
  };

  const confirmDelete = async () => {
    if (!deleteRecord || deleteSubmitting) return;
    setDeleteSubmitting(true);
    try {
      if (activeTab === "departments") {
        await deleteDepartmentMutation.mutateAsync(deleteRecord.id);
      } else if (activeTab === "groups") {
        await deleteFacultyGroup.mutateAsync(deleteRecord.id);
      } else {
        await activeMutationState.delete.mutateAsync(deleteRecord.id);
      }
      await queryClient.invalidateQueries({
        queryKey: activeMutationState.queryKey,
      });
      const successMessage =
        activeTab === "departments"
          ? t("adminDepartments.delete.success")
          : activeTab === "groups"
            ? t("adminProjects.delete.success")
            : t("adminRegistry.delete.success");
      gooeyToast.success(successMessage);
      setDeleteRecord(null);
    } catch (e) {
      gooeyToast.error(e?.message || t("adminRegistry.delete.error"));
    } finally {
      setDeleteSubmitting(false);
    }
  };

  if (isError) {
    return (
      <div className="flex flex-1 flex-col gap-3.5 overflow-y-auto bg-light-app-bg p-4 md:p-5 dark:bg-dark-card-bg">
        <div className="flex h-64 flex-col items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-light-error-bg dark:bg-dark-error-bg">
            <Icon
              d={IC.x}
              className="h-5 w-5 text-light-error-text dark:text-dark-error-text"
            />
          </div>
          <div className="text-center">
            <p className="font-medium text-primary dark:text-dark-primary">
              {t("apiErrors.failed_to_load_departments")}
            </p>
            <p className="mt-1 max-w-md text-sm text-muted dark:text-dark-muted">
              {error?.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto bg-white  p-4 md:p-5 min-h-screen dark:bg-dark-card-bg">
      <div className="flex flex-col items-start justify-between gap-4 lg:flex-row lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-(--color-light-card-border) bg-light-app-tertiary px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted dark:border-(--color-dark-card-border) dark:bg-dark-app-tertiary dark:text-dark-muted">
            <Layers className="size-4" strokeWidth={2} />
            {t("settings.tabs.academic")}
          </div>
          <h1 className="mt-3 text-2xl font-bold text-primary dark:text-dark-primary">
            {toolbarTitle}
          </h1>
          <p className="mt-1 text-muted dark:text-dark-muted">
            {toolbarDescription}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <OperationsDropdown
            items={[
              {
                key: "export",
                icon: <Icon d={IC.download} className="size-4" />,
                label: t("adminShared.actions.download"),
                onClick: exportToCSV,
              },
            ]}
          />
          <Button
            type="button"
            onClick={openCreateModal}
            icon={<Plus className="size-4 text-white" strokeWidth={2} />}
          >
            <span className="text-white">
              {activeTab === "departments"
                ? t("adminDepartments.actions.add")
                : activeTab === "groups"
                  ? t("adminProjects.registry.addGroup")
                  : t("adminRegistry.actions.add")}
            </span>
          </Button>
        </div>
      </div>

      <div className="w-full flex flex-col gap-y-1">
        <Table
          toolbar={
            <TableToolbar>
              <TableToolbar.Row
                justify="between"
                className="items-stretch gap-3 sm:items-center"
              >
                <SettingsTabs
                  tabs={tabs}
                  activeTab={activeTab}
                  onChange={setActiveTab}
                />
              </TableToolbar.Row>
              <TableToolbar.Row justify="start" className="gap-2">
                <div className="min-w-0 flex-1 sm:min-w-[12rem]">
                  <Field
                    id="registry-search"
                    placeholder={t("adminRegistry.search")}
                    value={searchInput}
                    onChange={(event) => setSearchInput(event.target.value)}
                    iconD={IC.search}
                  />
                </div>
                {statusOptions.length > 0 ? (
                  <div className="w-full shrink-0 sm:w-48">
                    <Select
                      options={statusOptions}
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    />
                  </div>
                ) : null}
                <TableToolbar.Section className="w-full shrink-0 justify-start sm:ml-auto sm:w-auto md:justify-end">
                  <TableToolbar.IconButton
                    type="button"
                    aria-label={t("adminDepartments.toolbar.filter")}
                    icon={
                      <Filter className="size-3.5 shrink-0" strokeWidth={2} />
                    }
                    onClick={() =>
                      gooeyToast.info(
                        t("adminDepartments.toolbar.filtersPending"),
                      )
                    }
                  >
                    {t("adminDepartments.toolbar.filter")}
                  </TableToolbar.IconButton>
                  <TableToolbar.IconButton
                    type="button"
                    aria-label={t("adminDepartments.toolbar.sort")}
                    icon={
                      <ArrowUpDown
                        className="size-3.5 shrink-0"
                        strokeWidth={2}
                      />
                    }
                    onClick={() =>
                      gooeyToast.info(t("adminDepartments.toolbar.sortPending"))
                    }
                  >
                    {t("adminDepartments.toolbar.sort")}
                  </TableToolbar.IconButton>
                  <TableToolbar.IconButton
                    type="button"
                    aria-label={t("adminDepartments.toolbar.columns")}
                    icon={
                      <Columns3 className="size-3.5 shrink-0" strokeWidth={2} />
                    }
                    onClick={() =>
                      gooeyToast.info(
                        t("adminDepartments.toolbar.columnsPending"),
                      )
                    }
                  >
                    {t("adminDepartments.toolbar.columns")}
                  </TableToolbar.IconButton>
                  <TableToolbar.IconButton
                    type="button"
                    aria-label={t("adminDepartments.toolbar.hide")}
                    icon={
                      <EyeOff className="size-3.5 shrink-0" strokeWidth={2} />
                    }
                    onClick={() =>
                      gooeyToast.info(
                        t("adminDepartments.toolbar.densityPending"),
                      )
                    }
                  >
                    {t("adminDepartments.toolbar.hide")}
                  </TableToolbar.IconButton>
                </TableToolbar.Section>
              </TableToolbar.Row>
            </TableToolbar>
          }
        >
          <TableHeader headerData={headerData} />
          <TableBody>
            {pageRows.map((record) => (
              <TableRow
                key={
                  activeTab === "groups"
                    ? `${activeTab}-${normalizeGroupId(record)}`
                    : `${activeTab}-${normalizeId(record?.id ?? record?.code)}`
                }
              >
                <TableColumn className="w-10">
                  <Checkbox />
                </TableColumn>

                {activeTab === "departments" ? (
                  <>
                    <TableColumn className="font-mono text-xs">
                      #{normalizeId(record?.code ?? record?.id)}
                    </TableColumn>
                    <TableColumn nowrap={false}>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-default bg-light-app-tertiary text-secondary dark:border-dark-default dark:bg-dark-app-tertiary dark:text-dark-secondary">
                          <Building2 className="size-4" strokeWidth={2} />
                        </div>
                        <div className="min-w-0">
                          <div className="line-clamp-1 text-sm font-medium text-primary dark:text-dark-primary">
                            {record?.name ||
                              t("adminDepartments.fallback.name")}
                          </div>
                          <div className="text-xs text-muted dark:text-dark-muted">
                            {getDepartmentMetaLine(record, t)}
                          </div>
                        </div>
                      </div>
                    </TableColumn>
                    <TableColumn nowrap={false}>
                      <span className="line-clamp-1 text-sm text-secondary dark:text-dark-secondary">
                        {record?.head || t("adminDepartments.fallback.head")}
                      </span>
                    </TableColumn>
                    <TableColumn>
                      <StatusPill variant={statusToPillVariant(record?.status)}>
                        {t(
                          `adminShared.status.${String(record?.status || "inactive").toLowerCase()}`,
                        )}
                      </StatusPill>
                    </TableColumn>
                    <TableColumn className="whitespace-nowrap text-xs">
                      {formatRegistryDate(
                        record?.created,
                        locale,
                        t("adminDepartments.fallback.date"),
                      )}
                    </TableColumn>
                  </>
                ) : null}

                {activeTab === "academic-years" ? (
                  <>
                    <TableColumn className="font-mono text-xs">
                      #{normalizeId(record?.id)}
                    </TableColumn>
                    <TableColumn nowrap={false}>
                      <div className="min-w-0">
                        <div className="line-clamp-1 text-sm font-medium text-primary dark:text-dark-primary">
                          {record?.name || "-"}
                        </div>
                      </div>
                    </TableColumn>
                    <TableColumn className="text-xs">
                      {formatDateRange(
                        record?.startDate,
                        record?.endDate,
                        locale,
                      )}
                    </TableColumn>
                    <TableColumn className="text-xs">
                      {record?.calendarType || "-"}
                    </TableColumn>
                    <TableColumn>
                      <StatusPill
                        variant={statusToPillVariant(
                          inferTimelineStatus(
                            record?.startDate,
                            record?.endDate,
                          ),
                        )}
                      >
                        {t(
                          `adminShared.status.${inferTimelineStatus(record?.startDate, record?.endDate)}`,
                        )}
                      </StatusPill>
                    </TableColumn>
                  </>
                ) : null}

                {activeTab === "semesters" ? (
                  <>
                    <TableColumn className="font-mono text-xs">
                      #{normalizeId(record?.id)}
                    </TableColumn>
                    <TableColumn nowrap={false}>
                      <div className="min-w-0">
                        <div className="line-clamp-1 text-sm font-medium text-primary dark:text-dark-primary">
                          {record?.name || "-"}
                        </div>
                        <div className="text-xs text-muted dark:text-dark-muted">
                          {record?.type || "-"}
                        </div>
                      </div>
                    </TableColumn>
                    <TableColumn nowrap={false}>
                      <span className="text-sm text-secondary dark:text-dark-secondary">
                        {getAcademicYearLabel(record?.academicYear) || "-"}
                      </span>
                    </TableColumn>
                    <TableColumn className="text-xs">
                      {formatDateRange(
                        record?.startDate,
                        record?.endDate,
                        locale,
                      )}
                    </TableColumn>
                    <TableColumn>
                      <StatusPill
                        variant={statusToPillVariant(getSemesterStatus(record))}
                      >
                        {t(`adminShared.status.${getSemesterStatus(record)}`)}
                      </StatusPill>
                    </TableColumn>
                  </>
                ) : null}

                {activeTab === "batches" ? (
                  <>
                    <TableColumn className="font-mono text-xs">
                      #{normalizeId(record?.id)}
                    </TableColumn>
                    <TableColumn nowrap={false}>
                      <div className="min-w-0">
                        <div className="line-clamp-1 text-sm font-medium text-primary dark:text-dark-primary">
                          {record?.name || "-"}
                        </div>
                        <div className="text-xs text-muted dark:text-dark-muted">
                          {record?.year || "-"}
                        </div>
                      </div>
                    </TableColumn>
                    <TableColumn nowrap={false}>
                      <span className="text-sm text-secondary dark:text-dark-secondary">
                        {getAcademicYearLabel(record?.academicYear) || "-"}
                      </span>
                    </TableColumn>
                    <TableColumn className="text-xs">
                      {record?.type || "-"}
                    </TableColumn>
                    <TableColumn>
                      <StatusPill
                        variant={statusToPillVariant(getBatchStatus(record))}
                      >
                        {t(`adminShared.status.${getBatchStatus(record)}`)}
                      </StatusPill>
                    </TableColumn>
                  </>
                ) : null}

                {activeTab === "groups" ? (
                  <>
                    <TableColumn className="font-mono text-xs">
                      #{normalizeGroupId(record)}
                    </TableColumn>
                    <TableColumn nowrap={false}>
                      <div className="min-w-0">
                        <div className="line-clamp-1 text-sm font-medium text-primary dark:text-dark-primary">
                          {groupTitle(record)}
                        </div>
                      </div>
                    </TableColumn>
                    <TableColumn nowrap={false}>
                      <span className="text-sm text-secondary dark:text-dark-secondary">
                        {displayName(record?.groupLeader)}
                      </span>
                    </TableColumn>
                    <TableColumn className="text-sm text-secondary dark:text-dark-secondary">
                      {t("adminProjects.registry.memberCount", {
                        count: groupMembersCount(record),
                      })}
                    </TableColumn>
                  </>
                ) : null}

                {activeTab === "faculties" ? (
                  <>
                    <TableColumn className="font-mono text-xs">
                      #{normalizeId(record?.code || record?.id)}
                    </TableColumn>
                    <TableColumn nowrap={false}>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-default bg-light-app-tertiary text-secondary dark:border-dark-default dark:bg-dark-app-tertiary dark:text-dark-secondary">
                          <Building2 className="size-4" strokeWidth={2} />
                        </div>
                        <div className="min-w-0">
                          <div className="line-clamp-1 text-sm font-medium text-primary dark:text-dark-primary">
                            {record?.name || "-"}
                          </div>
                          <div className="text-xs text-muted dark:text-dark-muted">
                            {getFacultyMetaLine(record) || "-"}
                          </div>
                        </div>
                      </div>
                    </TableColumn>
                    <TableColumn nowrap={false}>
                      <span className="line-clamp-2 text-sm text-secondary dark:text-dark-secondary">
                        {record?.description || record?.dean || "-"}
                      </span>
                    </TableColumn>
                  </>
                ) : null}

                <TableColumn className="text-center">
                  <DropdownMenuRoot>
                    <DropdownTrigger showArrow={false}>
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 15 15"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3.625 7.5C3.625 8.12132 3.12132 8.625 2.5 8.625C1.87868 8.625 1.375 8.12132 1.375 7.5C1.375 6.87868 1.87868 6.375 2.5 6.375C3.12132 6.375 3.625 6.87868 3.625 7.5ZM8.625 7.5C8.625 8.12132 8.12132 8.625 7.5 8.625C6.87868 8.625 6.375 8.12132 6.375 7.5C6.375 6.87868 6.87868 6.375 7.5 6.375C8.12132 6.375 8.625 6.87868 8.625 7.5ZM12.5 8.625C13.1213 8.625 13.625 8.12132 13.625 7.5C13.625 6.87868 13.1213 6.375 12.5 6.375C11.8787 6.375 11.375 6.87868 11.375 7.5C11.375 8.12132 11.8787 8.625 12.5 8.625Z"
                          fill="currentColor"
                          fillRule="evenodd"
                          clipRule="evenodd"
                        />
                      </svg>
                    </DropdownTrigger>
                    <DropdownContent align="end">
                      {activeTab === "departments" ? (
                        <DropdownItem
                          onClick={() =>
                            navigate(`/admin/department/${record.id}`)
                          }
                        >
                          <span>{t("adminShared.actions.viewProfile")}</span>
                        </DropdownItem>
                      ) : null}
                      <DropdownItem onClick={() => openEditModal(record)}>
                        <span>{t("adminShared.actions.editDetails")}</span>
                      </DropdownItem>
                      <DropdownSeparator />
                      <DropdownItem
                        variant="danger"
                        onClick={() =>
                          setDeleteRecord({
                            id:
                              activeTab === "groups"
                                ? normalizeGroupId(record)
                                : record?.id,
                            name:
                              (activeTab === "groups"
                                ? groupTitle(record)
                                : null) ??
                              record?.name ??
                              record?.title ??
                              record?.code ??
                              normalizeId(record?.id),
                            meta:
                              activeTab === "departments"
                                ? record?.head ||
                                  t("adminDepartments.fallback.head")
                                : activeTab === "academic-years"
                                  ? record?.calendarType || "-"
                                  : activeTab === "semesters"
                                    ? record?.type || "-"
                                    : activeTab === "batches"
                                      ? getAcademicYearLabel(
                                          record?.academicYear,
                                        ) || "-"
                                      : activeTab === "groups"
                                        ? displayName(record?.groupLeader)
                                        : record?.code || "-",
                          })
                        }
                      >
                        <span>{t("adminShared.actions.delete")}</span>
                      </DropdownItem>
                    </DropdownContent>
                  </DropdownMenuRoot>
                </TableColumn>
              </TableRow>
            ))}

            {pageRows.length === 0 ? (
              <TableRow className="table-advanced-tr--empty cursor-default">
                <TableColumn
                  colSpan={headerData.length}
                  nowrap={false}
                  className="py-12 text-center text-muted dark:text-dark-muted"
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      {activeTab === "groups" ? (
                        <UsersRound className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <Building2 className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                    <span className="font-medium">
                      {activeTab === "groups"
                        ? t("adminProjects.faculty.emptyGroups")
                        : t("adminRegistry.empty.title")}
                    </span>
                    <span className="text-xs opacity-75">
                      {activeTab === "groups"
                        ? t("adminProjects.registry.emptyHint")
                        : t("adminRegistry.empty.hint")}
                    </span>
                  </div>
                </TableColumn>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-4">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            totalItems={totalElements}
            pageSize={pageSize}
            onPageChange={(nextPage, nextSize) => {
              if (nextSize !== pageSize) {
                setPageSize(nextSize);
                setPage(1);
                return;
              }
              setPage(nextPage);
            }}
          />
        </div>
      </div>

      {activeTab === "departments" ? (
        <>
          <GlobalModal
            contentClassName="w-2xl"
            className="w-2xl"
            open={showAddModal}
            setOpen={(open) => {
              setShowAddModal(open);
            }}
            isClose
          >
            <AddDepartmentForm
              onClose={() => setShowAddModal(false)}
              onSuccess={() =>
                queryClient.invalidateQueries({ queryKey: ["departments"] })
              }
            />
          </GlobalModal>

          <GlobalModal
            open={showEditModal}
            setOpen={(open) => {
              setShowEditModal(open);
              if (!open) setSelectedRecord(null);
            }}
            isClose
          >
            {selectedRecord ? (
              <EditDepartmentForm
                key={selectedRecord.id}
                department={selectedRecord}
                onClose={() => {
                  setShowEditModal(false);
                  setSelectedRecord(null);
                }}
                onSuccess={() =>
                  queryClient.invalidateQueries({ queryKey: ["departments"] })
                }
              />
            ) : null}
          </GlobalModal>
        </>
      ) : activeTab === "groups" ? null : (
        <>
          <GlobalModal
            open={showAddModal}
            setOpen={(open) => {
              if (!open) {
                closeFormModals();
                return;
              }
              setShowAddModal(true);
            }}
            isClose
            title={t("adminRegistry.modal.createTitle")}
            subtitle={t("adminRegistry.modal.createSubtitle")}
            footer={
              <>
                <Button
                  type="button"
                  variant="tertiary"
                  onClick={closeFormModals}
                >
                  {t("adminDepartments.form.actions.cancel")}
                </Button>
                <Button
                  type="button"
                  loading={Boolean(activeMutationState.create?.isPending)}
                  onClick={() => void submitGenericForm("create")}
                  disabled={activeMutationState.create?.isPending}
                >
                  {t("adminRegistry.actions.create")}
                </Button>
              </>
            }
            className="max-w-2xl"
          >
            <RegistryFields
              tabId={activeTab}
              values={formValues}
              setValues={registrySetValues}
              academicYearOptions={academicYearOptions}
              fieldErrors={registryFieldErrors}
              t={t}
            />
          </GlobalModal>

          <GlobalModal
            open={showEditModal}
            setOpen={(open) => {
              if (!open) {
                closeFormModals();
                return;
              }
              setShowEditModal(true);
            }}
            isClose
            title={t("adminRegistry.modal.editTitle")}
            subtitle={t("adminRegistry.modal.editSubtitle")}
            footer={
              <>
                <Button
                  type="button"
                  variant="tertiary"
                  onClick={closeFormModals}
                >
                  {t("adminDepartments.form.actions.cancel")}
                </Button>
                <Button
                  type="button"
                  loading={Boolean(activeMutationState.update?.isPending)}
                  onClick={() => void submitGenericForm("edit")}
                  disabled={activeMutationState.update?.isPending}
                >
                  {t("adminRegistry.actions.save")}
                </Button>
              </>
            }
            className="max-w-2xl"
          >
            <RegistryFields
              tabId={activeTab}
              values={formValues}
              setValues={registrySetValues}
              academicYearOptions={academicYearOptions}
              fieldErrors={registryFieldErrors}
              t={t}
            />
          </GlobalModal>
        </>
      )}

      {deleteRecord ? (
        <SensitiveActionModal
          open={true}
          setOpen={(open) => {
            if (!open && !deleteSubmitting) setDeleteRecord(null);
          }}
          title={
            activeTab === "departments"
              ? t("adminDepartments.delete.title")
              : t("adminRegistry.delete.title")
          }
          subtitle={
            activeTab === "departments"
              ? `${t("adminDepartments.delete.descriptionPrefix")} "${deleteRecord.name}"${t("adminDepartments.delete.descriptionSuffix")}`
              : t("adminRegistry.delete.description", {
                  name: deleteRecord.name,
                })
          }
          summaryItems={[
            {
              label:
                activeTab === "departments"
                  ? t("adminDepartments.delete.headLabel")
                  : activeTab === "groups"
                    ? t("adminProjects.delete.meta")
                    : t("adminRegistry.delete.meta"),
              value: deleteRecord.meta || "-",
              mono: true,
            },
          ]}
          warning={
            activeTab === "groups"
              ? t("adminProjects.delete.warning")
              : t("adminDepartments.delete.warning")
          }
          cancelLabel={t("adminDepartments.delete.cancel")}
          confirmLabel={
            deleteSubmitting
              ? t("adminDepartments.delete.submitting")
              : activeTab === "departments"
                ? t("adminDepartments.delete.confirm")
                : t("adminShared.actions.delete")
          }
          onConfirm={confirmDelete}
          submitting={deleteSubmitting}
        />
      ) : null}
    </div>
  );
}
