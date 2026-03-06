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
