import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/themContext";
import { useLogin } from "../services/useApi";
import IC from "../components/IC";
import Icon from "../components/Icon";
import { useForm } from "react-hook-form";
import Field from "../components/Field";
import Checkbox from "../components/Checkbox";
import HoverCardComponent from "../components/CardHover";

// ─── Google SVG logo ─────────────────────────────────────────────────────────
function GoogleLogo({ className = "text-accent dark:text-dark-accent" }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      className={`shrink-0 ${className}`}
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="currentColor"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="currentColor"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
        fill="currentColor"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="currentColor"
      />
    </svg>
  );
}

// ─── Microsoft SVG logo ───────────────────────────────────────────────────────
function MicrosoftLogo({ className = "text-accent dark:text-dark-accent" }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 23 23"
      className={`shrink-0 ${className}`}
    >
      <rect x="1" y="1" width="10" height="10" fill="currentColor" />
      <rect x="12" y="1" width="10" height="10" fill="currentColor" />
      <rect x="1" y="12" width="10" height="10" fill="currentColor" />
      <rect x="12" y="12" width="10" height="10" fill="currentColor" />
    </svg>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────
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
  const { handleSubmit, register, watch, formState: errors } = useForm();
  const [view, setView] = useState("login");
  const [done, setDone] = useState(false);

  const { login } = useAuth();
  const { mutate: apiLogin, isPending: loading } = useLogin();
  const navigate = useNavigate();
  const submit = (data) => {
    apiLogin(data, {
      onSuccess: (response) => {
        localStorage.setItem("userId", response.user.id);
        login(response);
        setDone(true);
        setTimeout(() => navigate("/dashboard", { replace: true }), 1500);
      },
    });
  };

  const switchView = (v) => {
    // setView(v);
    // setErrors({});
    // setDone(false);
  };

  const HEADING = {
    login: "Welcome back",
    forgot: "Reset your password",
  };
  const SUBTEXT = {
    login: "Sign in to your workspace",
    forgot: "We'll email you a reset link",
  };

  const MAIL_ICON =
    "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6";
  const CHECK_ICON = "M20 6L9 17l-5-5";
  const ARROW_ICON = "M5 12h14M12 5l7 7-7 7";

  return (
    <>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes popIn  { 0%{opacity:0;transform:scale(.9)} 60%{transform:scale(1.03)} 100%{opacity:1;transform:scale(1)} }
        .anim-up  { animation: fadeUp  .24s ease both }
        .anim-pop { animation: popIn   .36s cubic-bezier(.34,1.56,.64,1) both }
      `}</style>

      <div className="min-h-screen bg-bg-app dark:bg-dark-app flex items-center justify-center p-4">
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
        <div className="anim-up w-full max-w-112.5 flex overflow-hidden rounded-2xl border border-default dark:border-dark-default bg-bg-shell dark:bg-dark-shell shadow-sm">
          {/* right */}
          <div className="flex-1 flex flex-col justify-center px-7 py-8 border-l border-default dark:border-dark-default">
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
                    {view === "forgot" ? "Reset link sent!" : "Signed in!"}
                  </p>
                  <p className="text-xs text-muted dark:text-dark-muted">
                    {view === "forgot"
                      ? "Check your inbox."
                      : "Redirecting to your dashboard…"}
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

                {/* oauth */}
                {view !== "forgot" && (
                  <>
                    <div className="flex gap-2 mb-4">
                      <button
                        type="button"
                        className="flex-1 h-8 flex items-center justify-center gap-2 rounded-lg border border-default dark:border-dark-default bg-input dark:bg-dark-input text-primary dark:text-dark-primary text-xs font-semibold hover:bg-bg-shell dark:hover:bg-dark-shell transition-colors cursor-pointer"
                      >
                        <GoogleLogo /> Google
                      </button>
                      <button
                        type="button"
                        className="flex-1 h-8 flex items-center justify-center gap-2 rounded-lg border border-default dark:border-dark-default bg-input dark:bg-dark-input text-primary dark:text-dark-primary text-xs font-semibold hover:bg-bg-shell dark:hover:bg-dark-shell transition-colors cursor-pointer"
                      >
                        <MicrosoftLogo /> Microsoft
                      </button>
                    </div>

                    {/* divider */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex-1 h-px bg-default dark:bg-dark-default" />
                      <span className="text-[10px] text-muted dark:text-dark-muted font-medium whitespace-nowrap">
                        or continue with email
                      </span>
                      <div className="flex-1 h-px bg-default dark:bg-dark-default" />
                    </div>
                  </>
                )}

                {/* fields */}
                <form
                  onSubmit={handleSubmit(submit)}
                  noValidate
                  className="flex flex-col gap-3"
                >
                  <Field
                    label="Email address"
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
                      label="Password"
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
                        label="Remember me"
                        checked={remember}
                        id={"remember"}
                        onChange={(e) => {
                          setRemember(!e.target.checked);
                          console.log(remember);
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => switchView("forgot")}
                        className="text-[11px] font-semibold text-secondary dark:text-dark-secondary hover:text-primary dark:hover:text-dark-primary underline underline-offset-2 transition-colors bg-transparent border-none cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    </div>
                  )}

                  {/* submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="mt-0.5 h-8 w-full rounded-lg flex items-center justify-center gap-2 bg-primary text-white dark:bg-dark-primary text-bg-shell dark:text-dark-shell text-xs font-bold border-none cursor-pointer hover:opacity-90 active:scale-[.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Spinner />
                    ) : (
                      <>
                        {view === "login" && "Sign in"}
                        {view === "forgot" && "Send reset link"}
                        <Icon d={ARROW_ICON} className="size-3 stroke-[2.5]" />
                      </>
                    )}
                  </button>
                </form>

                {/* switch view */}
                <p className="mt-4 text-center text-[11px] text-muted dark:text-dark-muted">
                  {view === "login" && (
                    <>
                      Don't have an account?{" "}
                      <button
                        onClick={() => navigate("/signup")}
                        className="font-semibold text-secondary dark:text-dark-secondary hover:text-primary dark:hover:text-dark-primary underline underline-offset-2 bg-transparent border-none cursor-pointer text-[11px]"
                      >
                        Sign up free
                      </button>
                    </>
                  )}
                  {view === "forgot" && (
                    <>
                      Remembered it?{" "}
                      <button
                        onClick={() => switchView("login")}
                        className="font-semibold text-secondary dark:text-dark-secondary hover:text-primary dark:hover:text-dark-primary underline underline-offset-2 bg-transparent border-none cursor-pointer text-[11px]"
                      >
                        Back to sign in
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
