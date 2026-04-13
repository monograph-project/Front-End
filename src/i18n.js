import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      // Dashboard
      "dashboard.title": "Dashboard",
      "dashboard.leads": "Leads",
      "dashboard.clv": "CLV",
      "dashboard.conversionRate": "Convertion Rate",
      "dashboard.revenue": "Revenue",
      "dashboard.vsLastWeek": "vs last week",
      "dashboard.vsLastMonth": "vs last month",

      // Sidebar
      "sidebar.brand": "Faculty Portal",
      "sidebar.brandSubtitle": "Faculty Management System",
      "sidebar.dashboard": "Dashboard",
      "sidebar.students": "Students",
      "sidebar.researchNotes": "Research Notes",
      "sidebar.academicCalendar": "Academic Calendar",
      "sidebar.academicReports": "Academic Reports",
      "sidebar.researchProjects": "Research Projects",
      "sidebar.favorites": "Quick Access",
      "sidebar.departments": "Departments",
      "sidebar.facultyMembers": "Faculty Members",
      "sidebar.meetings": "Meetings",
      "sidebar.projectsSection": "Research Projects",
      "sidebar.cloudStorage": "Cloud Storage",
      "sidebar.storageUsed": "1.8 GB of 2 GB used",
      "sidebar.upgradeStorage": "Upgrade Storage",
      "sidebar.storageLimit": "(up to 25GB)",
      "sidebar.settings": "Settings",
      "sidebar.helpCenter": "Help Center",
      "sidebar.userEmail": "williams@mesh.com",

      "sidebar.admin.dashboard": "Dashboard",
      "sidebar.admin.users": "Users",
      "sidebar.admin.departments": "Departments",
      "sidebar.admin.roles": "Roles & permissions",
      "sidebar.admin.reports": "Reports",
      "sidebar.admin.userStats": "Directory stats",
      "sidebar.admin.sessions": "Active sessions",
      "sidebar.admin.students": "students",
      "sidebar.admin.researchProjects": "research Project",

      "sidebar.teacher.dashboard": "Dashboard",
      "sidebar.teacher.groups": "My groups",
      "sidebar.teacher.students": "Students",
      "sidebar.teacher.projects": "Projects",
      "sidebar.teacher.gradebook": "Gradebook",
      "sidebar.teacher.lessons": "Lessons",
      "sidebar.teacher.calendar": "Calendar",
      "sidebar.teacher.reports": "Reports",
      "sidebar.teacher.recentStudents": "Recent students",
      "sidebar.teacher.pendingGrades": "Pending grades",

      "sidebar.student.dashboard": "Dashboard",
      "sidebar.student.projects": "Projects & repos",
      "sidebar.student.collaboration": "Collaboration",
      "sidebar.student.groups": "Groups",
      "sidebar.student.courses": "Courses",
      "sidebar.student.grades": "Grades",
      "sidebar.student.assignments": "Assignments",
      "sidebar.student.schedule": "Schedule",
      "sidebar.student.dueAssignments": "Due soon",
      "sidebar.student.classes": "Upcoming classes",

      "sidebar.staff.dashboard": "Dashboard",
      "sidebar.staff.tasks": "Tasks & intake",
      "sidebar.staff.notes": "Notes",
      "sidebar.staff.calendar": "Calendar",
      "sidebar.staff.projects": "Projects",
      "sidebar.staff.reports": "Reports",
      "sidebar.staff.openTasks": "Open tasks",

      "sidebar.dean.dashboard": "Dashboard",
      "sidebar.dean.students": "Students",
      "sidebar.dean.overview": "Programs",
      "sidebar.dean.projects": "Projects",
      "sidebar.dean.calendar": "Calendar",
      "sidebar.dean.reports": "Reports",
      "sidebar.dean.notes": "Notes",
      "sidebar.dean.programs": "Programs",
      "sidebar.dean.alerts": "Alerts",

      // Common
      "common.search": "Search",
      "common.settings": "Settings",
      "common.help": "Help Center",
      "common.save": "Save",
      "common.cancel": "Cancel",
      "common.close": "Close",
      "common.language": "Language",
    },
  },
  ps: {
    translation: {
      // Dashboard
      "dashboard.title": "ډاشبورد",
      "dashboard.leads": "لیدونه",
      "dashboard.clv": "د ژوند ارزښت",
      "dashboard.conversionRate": "د بدلون کچه",
      "dashboard.revenue": "عواید",
      "dashboard.vsLastWeek": "په تیره اونۍ کې",
      "dashboard.vsLastMonth": "په تیره میاشت کې",

      // Sidebar
      "sidebar.brand": "د پوهنځي پورتال",
      "sidebar.brandSubtitle": "د پوهنځي مديريت سيستم",
      "sidebar.dashboard": "ډاشبورد",
      "sidebar.students": "زده کوونکي",
      "sidebar.researchNotes": "د څیړنې یادداشتونه",
      "sidebar.academicCalendar": "د زده کړې تقویم",
      "sidebar.academicReports": "د زده کړې راپورونه",
      "sidebar.researchProjects": "د څیړنې پروژې",
      "sidebar.favorites": "چټک لاسرسی",
      "sidebar.departments": "پوهنځي",
      "sidebar.facultyMembers": "د پوهنځي غړي",
      "sidebar.meetings": "کنفرانسونه",
      "sidebar.projectsSection": "د څیړنې پروژې",
      "sidebar.cloudStorage": "کلود ذخیره",
      "sidebar.storageUsed": "د 2 GB څخه 1.8 GB کارول شوی",
      "sidebar.upgradeStorage": "ذخیره لوړول",
      "sidebar.storageLimit": "(تر 25 GB پورې)",
      "sidebar.settings": "تنظیمات",
      "sidebar.helpCenter": "د مرکې مرکز",
      "sidebar.userEmail": "ویلیمز@میش.com",

      "sidebar.admin.dashboard": "ډاشبورد",
      "sidebar.admin.users": "کاروونکي",
      "sidebar.admin.departments": "پوهنځي",
      "sidebar.admin.roles": "رولونه او اجازې",
      "sidebar.admin.reports": "رپورټونه",
      "sidebar.admin.userStats": "د ګرځنډیز احصائيې",
      "sidebar.admin.sessions": "فعال غونډې",
      "sidebar.admin.students": "محصلان",
      "sidebar.admin.researchProjects": "تحقیقی پروژه",

      "sidebar.teacher.dashboard": "ډاشبورد",
      "sidebar.teacher.groups": "زما ګروپونه",
      "sidebar.teacher.students": "زده کوونکي",
      "sidebar.teacher.projects": "پروژې",
      "sidebar.teacher.gradebook": "نموونې کتاب",
      "sidebar.teacher.lessons": "د درسونه",
      "sidebar.teacher.calendar": "تقویم",
      "sidebar.teacher.reports": "رپورټونه",
      "sidebar.teacher.recentStudents": "وروستی زده کوونکي",
      "sidebar.teacher.pendingGrades": "پاتې نموونې",

      "sidebar.student.dashboard": "ډاشبورد",
      "sidebar.student.projects": "پروژې او ریپو",
      "sidebar.student.collaboration": "همکاري",
      "sidebar.student.groups": "ګروپونه",
      "sidebar.student.courses": "دوسرې",
      "sidebar.student.grades": "نموونې",
      "sidebar.student.assignments": "وظایف",
      "sidebar.student.schedule": "مهال ویش",
      "sidebar.student.dueAssignments": "نږدې وظایف",
      "sidebar.student.classes": "راغلی درسونه",

      "sidebar.staff.dashboard": "ډاشبورد",
      "sidebar.staff.tasks": "وظایف او داخل",
      "sidebar.staff.notes": "یادښتونه",
      "sidebar.staff.calendar": "تقویم",
      "sidebar.staff.projects": "پروژې",
      "sidebar.staff.reports": "رپورټونه",
      "sidebar.staff.openTasks": "خلاص وظایف",

      "sidebar.dean.dashboard": "ډاشبورد",
      "sidebar.dean.students": "زده کوونکي",
      "sidebar.dean.overview": "برنامه",
      "sidebar.dean.projects": "پروژې",
      "sidebar.dean.calendar": "تقویم",
      "sidebar.dean.reports": "رپورټونه",
      "sidebar.dean.notes": "یادښتونه",
      "sidebar.dean.programs": "برنامه",
      "sidebar.dean.alerts": "خبرداري",

      // Common
      "common.search": "لټون",
      "common.settings": "تنظیمات",
      "common.help": "د مرکې مرکز",
      "common.save": "خوندی کول",
      "common.cancel": "لیرې کول",
      "common.close": "تړل",
      "common.language": "ژبه",
    },
  },
  prs: {
    translation: {
      // Dashboard
      "dashboard.title": "داشبورد",
      "dashboard.leads": "لیدها",
      "dashboard.clv": "ارزش عمر مشتری",
      "dashboard.conversionRate": "نرخ تبدیل",
      "dashboard.revenue": "درآمد",
      "dashboard.vsLastWeek": "در مقابل هفته گذشته",
      "dashboard.vsLastMonth": "در مقابل ماه گذشته",

      // Sidebar
      "sidebar.brand": "پورتال دانشکده",
      "sidebar.brandSubtitle": "سیستم مدیریت دانشکده",
      "sidebar.dashboard": "داشبورد",
      "sidebar.students": "دانشجویان",
      "sidebar.researchNotes": "یادداشت های تحقیقاتی",
      "sidebar.academicCalendar": "تقویم تحصیلی",
      "sidebar.academicReports": "گزارشات تحصیلی",
      "sidebar.researchProjects": "پروژه های تحقیقاتی",
      "sidebar.favorites": "دسترسی سریع",
      "sidebar.departments": "دپارتمان ها",
      "sidebar.facultyMembers": "اعضای هیئت علمی",
      "sidebar.meetings": "جلسات",
      "sidebar.projectsSection": "پروژه های تحقیقاتی",
      "sidebar.cloudStorage": "ذخیره ابری",
      "sidebar.storageUsed": "1.8 GB از 2 GB استفاده شده",
      "sidebar.upgradeStorage": "ارتقا ذخیره",
      "sidebar.storageLimit": "(تا 25 گیگابایت)",
      "sidebar.settings": "تنظیمات",
      "sidebar.helpCenter": "مرکز کمک",
      "sidebar.userEmail": "ویلیامز@میش.com",

      "sidebar.admin.dashboard": "داشبورد",
      "sidebar.admin.users": "کاربران",
      "sidebar.admin.departments": "دانشکده ها",
      "sidebar.admin.roles": "نقش ها و مجوزها",
      "sidebar.admin.reports": "گزارشات",
      "sidebar.admin.userStats": "آمار دایرکتوری",
      "sidebar.admin.sessions": "جلسات فعال",
      "sidebar.admin.students": "محصلان",
      "sidebar.admin.researchProjects": "تحقیقی پروژه",

      "sidebar.teacher.dashboard": "داشبورد",
      "sidebar.teacher.groups": "گروه های من",
      "sidebar.teacher.students": "دانشجویان",
      "sidebar.teacher.projects": "پروژه ها",
      "sidebar.teacher.gradebook": "دفتر نمرات",
      "sidebar.teacher.lessons": "درس ها",
      "sidebar.teacher.calendar": "تقویم",
      "sidebar.teacher.reports": "گزارشات",
      "sidebar.teacher.recentStudents": "دانشجویان اخیر",
      "sidebar.teacher.pendingGrades": "نمرات معوق",

      "sidebar.student.dashboard": "داشبورد",
      "sidebar.student.projects": "پروژه ها و مخازن",
      "sidebar.student.collaboration": "همکاری",
      "sidebar.student.groups": "گروه ها",
      "sidebar.student.courses": "دروس",
      "sidebar.student.grades": "نمرات",
      "sidebar.student.assignments": "تکالیف",
      "sidebar.student.schedule": "برنامه",
      "sidebar.student.dueAssignments": "تکالیف نزدیک",
      "sidebar.student.classes": "کلاس های آینده",

      "sidebar.staff.dashboard": "داشبورد",
      "sidebar.staff.tasks": "وظایف و ورودی",
      "sidebar.staff.notes": "یادداشت ها",
      "sidebar.staff.calendar": "تقویم",
      "sidebar.staff.projects": "پروژه ها",
      "sidebar.staff.reports": "گزارشات",
      "sidebar.staff.openTasks": "وظایف باز",

      "sidebar.dean.dashboard": "داشبورد",
      "sidebar.dean.students": "دانشجویان",
      "sidebar.dean.overview": "برنامه ها",
      "sidebar.dean.projects": "پروژه ها",
      "sidebar.dean.calendar": "تقویم",
      "sidebar.dean.reports": "گزارشات",
      "sidebar.dean.notes": "یادداشت ها",
      "sidebar.dean.programs": "برنامه ها",
      "sidebar.dean.alerts": "هشدارها",

      // Common
      "common.search": "جستجو",
      "common.settings": "تنظیمات",
      "common.help": "مرکز کمک",
      "common.save": "ذخیره",
      "common.cancel": "لغو",
      "common.close": "بستن",
      "common.language": "زبان",
    },
  },
};

// RTL languages
const RTL_LANGUAGES = ["ps", "prs"];

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

// Function to get direction based on language
export const getDirection = (lang) => {
  return RTL_LANGUAGES.includes(lang) ? "rtl" : "ltr";
};

// Function to set direction on document
export const setDocumentDirection = (lang) => {
  const direction = getDirection(lang);
  document.documentElement.dir = direction;
  document.documentElement.lang = lang;
};

// Set initial direction
setDocumentDirection(i18n.language);

export default i18n;
