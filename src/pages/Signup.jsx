import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";
import { postLoginPath } from "../lib/roles";
import { useTheme } from "../context/themContext";
import { useSignup } from "../services/useApi";
import IC from "../components/IC";
import Icon from "../components/Icon";
import Field from "../components/Field";
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

export default function Signup() {
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState("");
  const { mutate: signupMutate, isPending: signingUp } = useSignup();
  const { login, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const MAIL_ICON =
    "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6";
  const USER_ICON =
    "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z";
  const ARROW_ICON = "M5 12h14M12 5l7 7-7 7";
  const CHECK_ICON = "M20 6L9 17l-5-5";

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(postLoginPath(user), { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const submit = (data) => {
    setServerError("");
    signupMutate(data, {
      onSuccess: (createdUser) => {
        login(createdUser);
        setDone(true);
        const dest = postLoginPath(createdUser);
        setTimeout(() => navigate(dest, { replace: true }), 1500);
      },
      onError: (err) => {
        setServerError(err.message || "Could not create account.");
      },
    });
  };

  return (
    <div className="bg-shell dark:bg-dark-app flex min-h-screen items-center justify-center p-4">
      <button
        type="button"
        onClick={() => navigate("/")}
        className="fixed top-4 left-4 z-50 cursor-pointer border-none bg-transparent text-xs font-semibold text-secondary underline-offset-4 hover:underline dark:text-dark-secondary"
      >
        {t("login.publicStories")}
      </button>
      <button
        type="button"
        onClick={toggleTheme}
        className="border-default bg-bg-shell text-secondary hover:bg-input dark:border-dark-default dark:bg-dark-shell dark:text-dark-secondary dark:hover:bg-dark-input fixed top-4 right-4 z-50 flex size-8 cursor-pointer items-center justify-center rounded-lg border transition-colors"
      >
        <Icon
          d={theme === "light" ? IC.moon : IC.sun}
          className="size-3.5 stroke-[1.5]"
        />
      </button>

      <div className="anim-up bg-bg-shell border-default dark:border-dark-default dark:bg-dark-shell w-full max-w-112.5 overflow-hidden rounded-2xl border">
        <div className="flex flex-1 flex-col justify-center px-7 py-8 dark:border-dark-default">
          {done ? (
            <div className="anim-pop flex flex-col items-center gap-3 py-4 text-center">
              <div className="border-default bg-input dark:border-dark-default dark:bg-dark-input flex size-10 items-center justify-center rounded-full border">
                <Icon
                  d={CHECK_ICON}
                  className="stroke-primary dark:stroke-dark-primary size-4 stroke-[2.5]"
                />
              </div>
              <div>
                <p className="text-primary dark:text-dark-primary mb-1 text-sm font-semibold">
                  {t("signup.accountCreated")}
                </p>
                <p className="text-muted dark:text-dark-muted text-xs">
                  {t("signup.redirecting")}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDone(false)}
                className="text-secondary dark:text-dark-secondary cursor-pointer border-none bg-transparent text-[11px] underline underline-offset-2"
              >
                ← Back
              </button>
            </div>
          ) : (
            <div className="anim-up">
              <div className="mb-5">
                <h1 className="text-primary dark:text-dark-primary mb-1 text-sm font-bold tracking-tight">
                  {t("signup.heading")}
                </h1>
                <p className="text-muted dark:text-dark-muted text-xs">
                  {t("signup.subtext")}
                </p>
              </div>

              {hasGoogleOAuthClientId() && (
                <>
                  <div className="mb-4 space-y-2">
                      <GoogleSignInButton
                        intent="signup"
                        disabled={signingUp}
                        onAuthSuccess={(sessionUser) => {
                          login(sessionUser);
                          setDone(true);
                          const dest = postLoginPath(sessionUser);
                          setTimeout(
                            () => navigate(dest, { replace: true }),
                            900,
                          );
                        }}
                        onAuthFailure={(msg) => setServerError(msg)}
                      />
                  </div>
                  <div className="mb-4 flex items-center gap-3">
                    <div className="h-px flex-1 bg-default dark:bg-dark-default" />
                    <span className="text-muted dark:text-dark-muted whitespace-nowrap text-[10px] font-medium">
                      {t("signup.orContinueWithEmail")}
                    </span>
                    <div className="h-px flex-1 bg-default dark:bg-dark-default" />
                  </div>
                </>
              )}

              {serverError && (
                <p
                  className="border-error/40 bg-error/10 text-error dark:text-error mb-3 rounded-lg border px-3 py-2 text-[11px] font-medium"
                  role="alert"
                >
                  {serverError}
                </p>
              )}

              <form
                onSubmit={handleSubmit(submit)}
                noValidate
                className="flex flex-col gap-3"
              >
                <Field
                  register={register("fullName", {
                    required: "Full name is required",
                  })}
                  label={t("signup.fullName")}
                  placeholder="Amirbaqian"
                  error={errors.fullName?.message}
                  autoComplete="name"
                  iconD={USER_ICON}
                />

                <Field
                  label={t("login.emailAddress")}
                  type="email"
                  register={register("email", {
                    required: "Email is required",
                  })}
                  placeholder="you@school.edu"
                  error={errors.email?.message}
                  autoComplete="email"
                  iconD={MAIL_ICON}
                />

                <Field
                  label={t("login.password")}
                  type="password"
                  placeholder="••••••••"
                  register={register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "At least 6 characters",
                    },
                  })}
                  error={errors.password?.message}
                  autoComplete="new-password"
                />

                <button
                  type="submit"
                  disabled={signingUp}
                  className="bg-primary text-bg-shell dark:bg-dark-primary dark:text-dark-shell mt-0.5 flex h-8 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border-none text-xs font-bold transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {signingUp ? (
                    <Spinner />
                  ) : (
                    <>
                      {t("signup.createAccount")}
                      <Icon d={ARROW_ICON} className="size-3 stroke-[2.5]" />
                    </>
                  )}
                </button>
              </form>

              <p className="text-muted dark:text-dark-muted mt-4 text-center text-[11px]">
                {t("signup.haveAccount")}{" "}
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="text-secondary dark:text-dark-secondary hover:text-primary dark:hover:text-dark-primary cursor-pointer border-none bg-transparent text-[11px] font-semibold underline underline-offset-2"
                >
                  {t("signup.signIn")}
                </button>
              </p>

              <p className="text-muted dark:text-dark-muted mt-2.5 text-center text-[10px] leading-relaxed">
                {t("signup.termsPrivacy")}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
