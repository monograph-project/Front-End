import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { postLoginPath } from "../lib/roles";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/themContext";
import { gooeyToast } from "goey-toast";
import { useLogin } from "../services/useApi";
import IC from "../components/IC";
import Icon from "../components/Icon";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Field from "../components/Field";
import Checkbox from "../components/Checkbox";
import GoogleSignInButton from "../components/GoogleSignInButton";
import { hasGoogleOAuthClientId } from "../lib/googleOAuth";

function Spinner() {
  return (
    <svg
      className="animate-spin size-3.5 shrink-0"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    >
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </svg>
  );
}

export default function Login() {
  const { theme, toggleTheme } = useTheme();
  const [remember, setRemember] = useState(false);
  const { t } = useTranslation();
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    mode: "onSubmit",
  });
  const [view, setView] = useState("login");
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState("");

  const { login, user, isAuthenticated } = useAuth();
  const { mutate: apiLogin, isPending: loading } = useLogin({
    toastSuccess: t("login.toast.signInSuccess"),
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(postLoginPath(user), { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const submit = (data) => {
    setServerError("");
    apiLogin(data, {
      onSuccess: (sessionUser) => {
        login(sessionUser);
        const dest = postLoginPath(sessionUser);
        setDone(true);
        setTimeout(() => navigate(dest, { replace: true }), 1500);
      },
    });
  };

  const switchView = (v) => {
    // setView(v);
    // setErrors({});
    // setDone(false);
  };

  const MAIL_ICON =
    "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6";
  const CHECK_ICON = "M20 6L9 17l-5-5";
  const ARROW_ICON = "M5 12h14M12 5l7 7-7 7";

  const HEADING = {
    login: t("login.heading"),
    forgot: t("login.forgotHeading"),
  };
  const SUBTEXT = {
    login: t("login.subtext"),
    forgot: t("login.forgotSubtext"),
  };

  return (
    <>
      <div className="min-h-screen bg-shell dark:bg-dark-app flex items-center justify-center p-4">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="fixed top-4 left-4 z-50 text-xs font-semibold text-secondary dark:text-dark-secondary underline-offset-4 hover:underline bg-transparent border-none cursor-pointer"
        >
          {t("login.publicStories")}
        </button>
        {/* theme toggle */}
        <button
          onClick={toggleTheme}
          className="fixed top-4 right-4 z-50 w-8 h-8 flex items-center justify-center rounded-lg border border-default dark:border-dark-default bg-bg-shell dark:bg-dark-shell text-secondary dark:text-dark-secondary hover:bg-input dark:hover:bg-dark-input transition-colors cursor-pointer"
        >
          <Icon
            d={theme === "light" ? IC.moon : IC.sun}
            className="size-3.5 stroke-[1.5]"
          />
        </button>

        {/* card */}
        <div className="anim-up w-full max-w-112.5 flex overflow-hidden rounded-2xl border border-default dark:border-dark-default bg-bg-shell dark:bg-dark-shell">
          {/* right */}
          <div className="flex-1 flex flex-col justify-center px-7 py-8  dark:border-dark-default">
            {/* ── success state ── */}
            {done ? (
              <div className="anim-pop flex flex-col items-center text-center gap-3 py-4">
                <div className="w-10 h-10 rounded-full bg-input dark:bg-dark-input border border-default dark:border-dark-default flex items-center justify-center">
                  <Icon
                    d={CHECK_ICON}
                    className="size-4 stroke-primary dark:stroke-dark-primary stroke-[2.5]"
                  />
                </div>
                <div>
                  <p className="text-sm font-semibold text-primary dark:text-dark-primary mb-1">
                    {view === "forgot"
                      ? t("login.resetSent")
                      : t("login.signedIn")}
                  </p>
                  <p className="text-xs text-muted dark:text-dark-muted">
                    {view === "forgot"
                      ? t("login.checkInbox")
                      : t("login.redirecting")}
                  </p>
                </div>
                <button
                  onClick={() => setDone(false)}
                  className="text-[11px] text-secondary dark:text-dark-secondary underline underline-offset-2 bg-transparent border-none cursor-pointer"
                >
                  ← Back
                </button>
              </div>
            ) : (
              /* ── form state ── */
              <div className="anim-up" key={view}>
                {/* heading */}
                <div className="mb-5">
                  <h1 className="text-sm font-bold text-primary dark:text-dark-primary tracking-tight mb-1">
                    {HEADING[view]}
                  </h1>
                  <p className="text-xs text-muted dark:text-dark-muted">
                    {SUBTEXT[view]}
                  </p>
                </div>

                {/* Google OAuth → backend POST /api/v1/auth/google */}
                {view !== "forgot" && hasGoogleOAuthClientId() && (
                  <>
                    <div className="mb-4 space-y-2">
                      <GoogleSignInButton
                          intent="signin"
                          disabled={loading}
                          onAuthSuccess={(sessionUser) => {
                            gooeyToast.success(t("login.toast.signInSuccess"));
                            login(sessionUser);
                            setDone(true);
                            const dest = postLoginPath(sessionUser);
                            setTimeout(
                              () => navigate(dest, { replace: true }),
                              900,
                            );
                          }}
                          onAuthFailure={(msg) => {
                            const fallback = t("login.toast.signInFailed");
                            const title = msg?.trim?.() ? msg.trim() : fallback;
                            gooeyToast.error(title);
                            setServerError(title);
                          }}
                        />
                    </div>
                    <div className="mb-4 flex items-center gap-3">
                      <div className="h-px flex-1 bg-default dark:bg-dark-default" />
                      <span className="text-[10px] font-medium whitespace-nowrap text-muted dark:text-dark-muted">
                        {t("login.orContinueWithEmail")}
                      </span>
                      <div className="h-px flex-1 bg-default dark:bg-dark-default" />
                    </div>
                  </>
                )}

                {serverError && view === "login" && (
                  <p
                    className="mb-3 rounded-lg border border-error/40 bg-error/10 px-3 py-2 text-[11px] font-medium text-error dark:text-error"
                    role="alert"
                  >
                    {serverError}
                  </p>
                )}

                {/* fields */}
                <form
                  onSubmit={handleSubmit(submit)}
                  noValidate
                  className="flex flex-col gap-3"
                >
                  <Field
                    label={t("login.emailAddress")}
                    type="email"
                    placeholder="you@school.edu"
                    register={register("email", {
                      required: "email required",
                    })}
                    error={errors.email?.message}
                    autoComplete="email"
                    iconD={MAIL_ICON}
                  />

                  {view !== "forgot" && (
                    <Field
                      label={t("login.password")}
                      type="password"
                      placeholder="••••••••"
                      register={register("password", {
                        required: "password required",
                      })}
                      error={errors?.password?.message}
                      autoComplete={
                        view === "login"
                          ? "current-password"
                          : "current-password"
                      }
                    />
                  )}

                  {/* remember + forgot */}
                  {view === "login" && (
                    <div className="flex items-center justify-between">
                      <Checkbox
                        checked={remember}
                        onChange={(e) => setRemember(e.target.checked)}
                        id="Remember"
                        label={t("login.rememberMe")}
                      />
                      <button
                        type="button"
                        onClick={() => navigate("/forgot-password")}
                        className="text-[11px] font-semibold text-secondary dark:text-dark-secondary hover:text-primary dark:hover:text-dark-primary underline underline-offset-2 transition-colors bg-transparent border-none cursor-pointer"
                      >
                        {t("login.forgotPassword")}
                      </button>
                    </div>
                  )}

                  {/* submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-0.5 h-8 w-full rounded-lg flex items-center justify-center gap-2 bg-light-btn-primary-bg text-white  text-bg-shell dark:text-dark-shell text-xs font-bold border-none cursor-pointer hover:opacity-90 active:scale-[.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Spinner />
                    ) : (
                      <>
                        {view === "login" && t("login.signIn")}
                        {view === "forgot" && t("login.sendResetLink")}
                        <Icon d={ARROW_ICON} className="size-3 stroke-[2.5]" />
                      </>
                    )}
                  </button>
                </form>

                {/* switch view */}
                <p className="mt-4 text-center text-[11px] text-muted dark:text-dark-muted">
                  {view === "login" && (
                    <>
                      {t("login.noAccount")}{" "}
                      <button
                        onClick={() => navigate("/signup")}
                        className="font-semibold text-secondary dark:text-dark-secondary hover:text-primary dark:hover:text-dark-primary underline underline-offset-2  border-none cursor-pointer text-[11px]"
                      >
                        {t("login.signupFree")}
                      </button>
                    </>
                  )}
                  {view === "forgot" && (
                    <>
                      {t("login.remembered")}{" "}
                      <button
                        onClick={() => switchView("login")}
                        className="font-semibold text-secondary dark:text-dark-secondary hover:text-primary dark:hover:text-dark-primary underline underline-offset-2 bg-transparent border-none cursor-pointer text-[11px]"
                      >
                        {t("login.backToSignIn")}
                      </button>
                    </>
                  )}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
