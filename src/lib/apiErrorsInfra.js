/**
 * Shared API / toast strings merged into i18n `translation` for en, ps, prs.
 * Operation-specific keys live in `apiErrors.*.generated.json` (from apiRoute throw sites).
 */
export default {
  en: {
    "apiErrors.generic": "Something went wrong. Please try again.",
    "apiErrors.requestFailed": "Request failed.",
    "apiErrors.network": "Check your internet connection and try again.",
    "apiErrors.timeout": "The request took too long. Try again.",
    "apiErrors.http.400": "Invalid request.",
    "apiErrors.http.401": "Sign in again or your session has expired.",
    "apiErrors.http.403": "You don't have permission for this action.",
    "apiErrors.http.404": "We couldn't find that resource.",
    "apiErrors.http.409": "This data changed. Refresh and try again.",
    "apiErrors.http.422": "Some fields need to be corrected.",
    "apiErrors.http.429": "Too many attempts. Please wait a moment.",
    "apiErrors.http.500": "Server error. Please try again later.",
    "apiErrors.http.502": "Service is temporarily unavailable.",
    "apiErrors.http.503": "Service unavailable. Try again later.",
    "apiErrors.validation.emailUsernamePasswordRequired":
      "Email/username and password are required.",
    "apiErrors.validation.fullNameEmailPasswordRequired":
      "Full name, email, and password are required.",
    "apiErrors.validation.refreshTokenRequired": "Refresh token is required.",
    "apiErrors.validation.emailRequired": "Email is required.",
    "apiErrors.validation.invalidResetTokenOrPasswordMismatch":
      "Invalid reset link or passwords do not match.",
    "apiErrors.validation.verificationTokenRequired":
      "Verification token is required.",
    "apiErrors.validation.invalidPasswords": "Passwords are not valid.",
    "apiErrors.failed_to_load_session": "Could not load your session.",
    "apiErrors.failed_to_load_stats": "Could not load statistics.",
    "apiErrors.failed_to_load_file": "Could not load the file.",
    "apiSuccess.completed": "Completed successfully.",
  },
  ps: {
    "apiErrors.generic": "ستونزه رامنځته شوه. بیا هڅه وکړئ.",
    "apiErrors.requestFailed": "غوښتنه ناکامه وه.",
    "apiErrors.network": "خپل انټرنټ وګورئ او بیا هڅه وکړئ.",
    "apiErrors.timeout": "غوښتنه ډېره اوږده وه. بیا هڅه وکړئ.",
    "apiErrors.http.400": "ناسمه غوښتنه.",
    "apiErrors.http.401": "بیا ننوځئ یا ستاسو ناسته پای ته رسېدلې.",
    "apiErrors.http.403": "تاسو دې کړنې اجازه نلرئ.",
    "apiErrors.http.404": "په لټه کې هغه شتون و نه موندل شو.",
    "apiErrors.http.409": "ډیټا بدل شوې. تازه کړئ او بیا هڅه وکړئ.",
    "apiErrors.http.422": "ځینې ساحې باید سمې شي.",
    "apiErrors.http.429": "ډېرې هڅې. لنډ وخت وروسته بیا هڅه وکړئ.",
    "apiErrors.http.500": "سرور ستونزه. وروسته بیا هڅه وکړئ.",
    "apiErrors.http.502": "خدمت په لنډمهال کې شتون نلري.",
    "apiErrors.http.503": "خدمت شتون نلري. وروسته بیا هڅه وکړئ.",
    "apiErrors.validation.emailUsernamePasswordRequired":
      "برېښناليک/کارن نوم او پټنوم پکار دي.",
    "apiErrors.validation.fullNameEmailPasswordRequired":
      "بشپړ نوم، برېښناليک او پټنوم پکار دي.",
    "apiErrors.validation.refreshTokenRequired": "تازه توکن پکار دی.",
    "apiErrors.validation.emailRequired": "برېښناليک پکار دی.",
    "apiErrors.validation.invalidResetTokenOrPasswordMismatch":
      "موازي لینک ناسم دی یا پټنومونه سره اوښتي نه.",
    "apiErrors.validation.verificationTokenRequired":
      "د تایید توکن پکار دی.",
    "apiErrors.validation.invalidPasswords": "پټنومونه سم نه دي.",
    "apiErrors.failed_to_load_session": "نشو کړای چې ستاسو ناسته ولېږدوي.",
    "apiErrors.failed_to_load_stats": "احصایې نشي پورته کیدی.",
    "apiErrors.failed_to_load_file": "فایل نشو پورته کیدی.",
    "apiSuccess.completed": "په بریالیتوب سره بشپړ شو.",
  },
  prs: {
    "apiErrors.generic": "مشکلی رخ داد. دوباره تلاش کنید.",
    "apiErrors.requestFailed": "درخواست ناموفق بود.",
    "apiErrors.network": "ارتباط اینترنت را بررسی و دوباره تلاش کنید.",
    "apiErrors.timeout": "درخواست طولانی شد. دوباره تلاش کنید.",
    "apiErrors.http.400": "درخواست نامعتبر است.",
    "apiErrors.http.401": "دوباره وارد شوید یا نشست منقضی شده است.",
    "apiErrors.http.403": "مجوز این کار را ندارید.",
    "apiErrors.http.404": "مورد یافت نشد.",
    "apiErrors.http.409": "داده‌ها تغییر کردند. بارگذاری مجدد و تلاش دوباره.",
    "apiErrors.http.422": "برخی فیلدها باید اصلاح شوند.",
    "apiErrors.http.429": "تلاش‌های زیاد. کمی صبر کنید.",
    "apiErrors.http.500": "خطای سرور. بعداً دوباره تلاش کنید.",
    "apiErrors.http.502": "سرویس موقتاً در دسترس نیست.",
    "apiErrors.http.503": "سرویس در دسترس نیست. بعداً تلاش کنید.",
    "apiErrors.validation.emailUsernamePasswordRequired":
      "ایمیل/نام کاربری و رمز عبور لازم است.",
    "apiErrors.validation.fullNameEmailPasswordRequired":
      "نام کامل، ایمیل و رمز عبور لازم است.",
    "apiErrors.validation.refreshTokenRequired": "توکن تازه‌سازی لازم است.",
    "apiErrors.validation.emailRequired": "ایمیل لازم است.",
    "apiErrors.validation.invalidResetTokenOrPasswordMismatch":
      "لینک بازنشانی نامعتبر است یا رمزها مطابقت ندارند.",
    "apiErrors.validation.verificationTokenRequired":
      "توکن تأیید لازم است.",
    "apiErrors.validation.invalidPasswords": "رمزها معتبر نیستند.",
    "apiErrors.failed_to_load_session": "بارگذاری نشست ممکن نشد.",
    "apiErrors.failed_to_load_stats": "بارگذاری آمار ممکن نشد.",
    "apiErrors.failed_to_load_file": "بارگذاری پرونده ممکن نشد.",
    "apiSuccess.completed": "با موفقیت انجام شد.",
  },
};
