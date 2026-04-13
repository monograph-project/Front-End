import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { postLoginPath } from "../lib/roles";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/themContext";
import IC from "../components/IC";
import Icon from "../components/Icon";
import { useForm } from "react-hook-form";
import Field from "../components/Field";
import { useSignup } from "../services/useApi";
import Select from "../components/Select";

function GoogleLogo() {
  return (
    <svg
      width="28px"
      height="28px"
      viewBox="0 0 32 32"
      data-name="Layer 1"
      id="Layer_1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M23.75,16A7.7446,7.7446,0,0,1,8.7177,18.6259L4.2849,22.1721A13.244,13.244,0,0,0,29.25,16"
        fill="#00ac47"
      />
      <path
        d="M23.75,16a7.7387,7.7387,0,0,1-3.2516,6.2987l4.3824,3.5059A13.2042,13.2042,0,0,0,29.25,16"
        fill="#4285f4"
      />
      <path
        d="M8.25,16a7.698,7.698,0,0,1,.4677-2.6259L4.2849,9.8279a13.177,13.177,0,0,0,0,12.3442l4.4328-3.5462A7.698,7.698,0,0,1,8.25,16Z"
        fill="#ffba00"
      />
      <polygon
        fill="#2ab2db"
        points="8.718 13.374 8.718 13.374 8.718 13.374 8.718 13.374"
      />
      <path
        d="M16,8.25a7.699,7.699,0,0,1,4.558,1.4958l4.06-3.7893A13.2152,13.2152,0,0,0,4.2849,9.8279l4.4328,3.5462A7.756,7.756,0,0,1,16,8.25Z"
        fill="#ea4435"
      />
      <polygon
        fill="#2ab2db"
        points="8.718 18.626 8.718 18.626 8.718 18.626 8.718 18.626"
      />
      <path
        d="M29.25,15v1L27,19.5H16.5V14H28.25A1,1,0,0,1,29.25,15Z"
        fill="#4285f4"
      />
    </svg>
  );
}

// ─── Microsoft SVG logo ───────────────────────────────────────────────────────
function Github() {
  return (
    <svg
      width="28px"
      height="28px"
      viewBox="-1.65 0 259.3 259.3"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      preserveAspectRatio="xMidYMid"
    >
      <g>
        <path
          fill="#9EDCF2"
          d="M200.9,199.8c0,13.9-32.2,25.1-71.9,25.1c-39.7,0-71.9-11.3-71.9-25.1c0-13.9,32.2-25.1,71.9-25.1C168.7,174.7,200.9,185.9,200.9,199.8L200.9,199.8z M200.9,199.8"
        />
        <g>
          <defs>
            <path
              id="SVGID_1_"
              d="M98.1,244.8c1.6,7.5,5.5,11.9,9.4,14.5l41.1,0c5-3.4,10.1-9.8,10.1-21.8v-31c0,0,0.6-7.7,7.7-10.2c0,0,4.1-2.9-0.3-4.5c0,0-19.5-1.6-19.5,14.4v23.6c0,0,0.8,8.7-3.8,12.3v-29.2c0,0,0.3-9.3,5.1-12.8c0,0,3.2-5.7-3.8-4.2c0,0-13.4,1.9-14,17.6l-0.3,30h-3.2l-0.3-30c-0.6-15.6-14-17.6-14-17.6c-7-1.6-3.8,4.2-3.8,4.2c4.8,3.5,5.1,12.8,5.1,12.8v29.5c-4.6-3.3-3.8-12.6-3.8-12.6v-23.6c0-16-19.5-14.4-19.5-14.4c-4.5,1.6-0.3,4.5-0.3,4.5c7,2.6,7.7,10.2,7.7,10.2v21.7L98.1,244.8z"
            />
          </defs>
          <clipPath id="SVGID_2_">
            <use xlink:href="#SVGID_1_" overflow="visible" />
          </clipPath>
          <path
            clip-path="url(#SVGID_2_)"
            fill="#7DBCE7"
            d="M200.9,199.8c0,13.9-32.2,25.1-71.9,25.1c-39.7,0-71.9-11.3-71.9-25.1c0-13.9,32.2-25.1,71.9-25.1C168.7,174.7,200.9,185.9,200.9,199.8L200.9,199.8z M200.9,199.8"
          />
        </g>
        <path
          fill="#9EDCF2"
          d="M46.9,125.9l-2.1,7.2c0,0-0.5,2.6,1.9,3.1c2.6-0.1,2.4-2.5,2.2-3.2L46.9,125.9L46.9,125.9z M46.9,125.9"
        />
        <path
          fill="#010101"
          d="M255.8,95.6l0.2-0.9c-21.1-4.2-42.7-4.3-55.8-3.7c2.1-7.7,2.8-16.7,2.8-26.6c0-14.3-5.4-25.7-14-34.3c1.5-4.9,3.5-15.8-2-29.7c0,0-9.8-3.1-32.1,11.8c-8.7-2.2-18-3.3-27.3-3.3c-10.2,0-20.5,1.3-30.2,3.9C74.4-2.9,64.3,0.3,64.3,0.3c-6.6,16.5-2.5,28.8-1.3,31.8c-7.8,8.4-12.5,19.1-12.5,32.2c0,9.9,1.1,18.8,3.9,26.5c-13.2-0.5-34-0.3-54.4,3.8l0.2,0.9c20.4-4.1,41.4-4.2,54.5-3.7c0.6,1.6,1.3,3.2,2,4.7c-13,0.4-35.1,2.1-56.3,8.1l0.3,0.9c21.4-6,43.7-7.6,56.6-8c7.8,14.4,23,23.8,50.2,26.7c-3.9,2.6-7.8,7-9.4,14.5c-5.3,2.5-21.9,8.7-31.9-8.5c0,0-5.6-10.2-16.3-11c0,0-10.4-0.2-0.7,6.5c0,0,6.9,3.3,11.7,15.6c0,0,6.3,21,36.4,14.2V177c0,0-0.6,7.7-7.7,10.2c0,0-4.2,2.9,0.3,4.5c0,0,19.5,1.6,19.5-14.4v-23.6c0,0-0.8-9.4,3.8-12.6v38.8c0,0-0.3,9.3-5.1,12.8c0,0-3.2,5.7,3.8,4.2c0,0,13.4-1.9,14-17.6l0.3-39.3h3.2l0.3,39.3c0.6,15.6,14,17.6,14,17.6c7,1.6,3.8-4.2,3.8-4.2c-4.8-3.5-5.1-12.8-5.1-12.8v-38.5c4.6,3.6,3.8,12.3,3.8,12.3v23.6c0,16,19.5,14.4,19.5,14.4c4.5-1.6,0.3-4.5,0.3-4.5c-7-2.6-7.7-10.2-7.7-10.2v-31c0-12.1-5.1-18.5-10.1-21.8c29-2.9,42.9-12.2,49.3-26.8c12.7,0.3,35.6,1.9,57.4,8.1l0.3-0.9c-21.7-6.1-44.4-7.7-57.3-8.1c0.6-1.5,1.1-3,1.6-4.6C212.9,91.4,234.6,91.4,255.8,95.6L255.8,95.6z M255.8,95.6"
        />
        <path
          fill="#F5CCB3"
          d="M174.6,63.7c6.2,5.7,9.9,12.5,9.9,19.8c0,34.4-25.6,35.3-57.2,35.3c-31.6,0-57.2-4.8-57.2-35.3c0-7.3,3.6-14.1,9.8-19.7c10.3-9.4,27.7-4.4,47.4-4.4C147,59.4,164.3,54.3,174.6,63.7L174.6,63.7z M174.6,63.7"
        />
        <path
          fill="#FFFFFF"
          d="M108.3,85.3c0,9.5-5.3,17.1-11.9,17.1c-6.6,0-11.9-7.7-11.9-17.1c0-9.5,5.3-17.1,11.9-17.1C103,68.1,108.3,75.8,108.3,85.3L108.3,85.3z M108.3,85.3"
        />
        <path
          fill="#AF5C51"
          d="M104.5,85.5c0,6.3-3.6,11.4-7.9,11.4c-4.4,0-7.9-5.1-7.9-11.4c0-6.3,3.6-11.4,7.9-11.4C100.9,74.1,104.5,79.2,104.5,85.5L104.5,85.5z M104.5,85.5"
        />
        <path
          fill="#FFFFFF"
          d="M172.2,85.3c0,9.5-5.3,17.1-11.9,17.1c-6.6,0-11.9-7.7-11.9-17.1c0-9.5,5.3-17.1,11.9-17.1C166.8,68.1,172.2,75.8,172.2,85.3L172.2,85.3z M172.2,85.3"
        />
        <path
          fill="#AF5C51"
          d="M168.3,85.5c0,6.3-3.6,11.4-7.9,11.4c-4.4,0-7.9-5.1-7.9-11.4c0-6.3,3.6-11.4,7.9-11.4C164.8,74.1,168.3,79.2,168.3,85.5L168.3,85.5z M168.3,85.5"
        />
        <path
          fill="#AF5C51"
          d="M130.5,100.5c0,1.6-1.3,3-3,3c-1.6,0-3-1.3-3-3s1.3-3,3-3C129.1,97.5,130.5,98.8,130.5,100.5L130.5,100.5z M130.5,100.5"
        />
        <path
          fill="#AF5C51"
          d="M120.6,108c-0.2-0.5,0.1-1,0.6-1.2c0.5-0.2,1,0.1,1.2,0.6c0.8,2.2,2.8,3.6,5.1,3.6c2.3,0,4.3-1.5,5.1-3.6c0.2-0.5,0.7-0.8,1.2-0.6c0.5,0.2,0.8,0.7,0.6,1.2c-1,2.9-3.8,4.9-6.9,4.9C124.4,112.9,121.6,110.9,120.6,108L120.6,108z M120.6,108"
        />
        <path
          fill="#C4E5D9"
          d="M54.5,121.6c0,0.8-0.9,1.4-2.1,1.4c-1.1,0-2.1-0.6-2.1-1.4c0-0.8,0.9-1.4,2.1-1.4C53.6,120.2,54.5,120.8,54.5,121.6L54.5,121.6z M54.5,121.6"
        />
        <path
          fill="#C4E5D9"
          d="M60.3,124.8c0,0.8-0.9,1.4-2.1,1.4c-1.1,0-2.1-0.6-2.1-1.4c0-0.8,0.9-1.4,2.1-1.4C59.4,123.4,60.3,124,60.3,124.8L60.3,124.8z M60.3,124.8"
        />
        <path
          fill="#C4E5D9"
          d="M63.8,129c0,0.8-0.9,1.4-2.1,1.4c-1.1,0-2.1-0.6-2.1-1.4c0-0.8,0.9-1.4,2.1-1.4C62.9,127.5,63.8,128.2,63.8,129L63.8,129z M63.8,129"
        />
        <path
          fill="#C4E5D9"
          d="M67,133.8c0,0.8-0.9,1.4-2.1,1.4c-1.1,0-2.1-0.6-2.1-1.4c0-0.8,0.9-1.4,2.1-1.4C66.1,132.3,67,133,67,133.8L67,133.8z M67,133.8"
        />
        <path
          fill="#C4E5D9"
          d="M70.5,138.2c0,0.8-0.9,1.4-2.1,1.4c-1.1,0-2.1-0.6-2.1-1.4c0-0.8,0.9-1.4,2.1-1.4C69.6,136.8,70.5,137.4,70.5,138.2L70.5,138.2z M70.5,138.2"
        />
        <path
          fill="#C4E5D9"
          d="M75.3,142.1c0,0.8-0.9,1.4-2.1,1.4c-1.1,0-2.1-0.6-2.1-1.4c0-0.8,0.9-1.4,2.1-1.4C74.4,140.6,75.3,141.3,75.3,142.1L75.3,142.1z M75.3,142.1"
        />
        <path
          fill="#C4E5D9"
          d="M82,144.6c0,0.8-0.9,1.4-2.1,1.4c-1.1,0-2.1-0.6-2.1-1.4c0-0.8,0.9-1.4,2.1-1.4C81.1,143.2,82,143.8,82,144.6L82,144.6z M82,144.6"
        />
        <path
          fill="#C4E5D9"
          d="M88.7,144.6c0,0.8-0.9,1.4-2.1,1.4c-1.1,0-2.1-0.6-2.1-1.4c0-0.8,0.9-1.4,2.1-1.4C87.8,143.2,88.7,143.8,88.7,144.6L88.7,144.6z M88.7,144.6"
        />
        <path
          fill="#C4E5D9"
          d="M95.5,143.5c0,0.8-0.9,1.4-2.1,1.4c-1.1,0-2.1-0.6-2.1-1.4c0-0.8,0.9-1.4,2.1-1.4C94.5,142.1,95.5,142.7,95.5,143.5L95.5,143.5z M95.5,143.5"
        />
      </g>
    </svg>
  );
}
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
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const options = [
    { value: "apple", label: "Apple" },
    { value: "banana", label: "Banana" },
    { value: "grapes", label: "Grapes" },
  ];
  const [role, setRole] = useState("student");
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState("");
  const { mutate: signupMutate, isPending: signingUp } = useSignup();
  const { login } = useAuth();
  const navigate = useNavigate();

  const ROLE_OPTIONS = ["student", "teacher", "staff", "dean", "admin", "user"];

  const submit = (data) => {
    setServerError("");
    const dataWithRole = { ...data, role };
    signupMutate(dataWithRole, {
      onSuccess: (createdUser) => {
        login(createdUser);
        setDone(true);
        const dest = postLoginPath(createdUser);
        setTimeout(() => navigate(dest, { replace: true }), 1400000);
      },
      onError: (err) => {
        setServerError(err.message || "Could not create account.");
      },
    });
  };

  const HEADING = "Create your account";
  const SUBTEXT = "Start your 14-day free trial";

  const MAIL_ICON =
    "M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2zM22 6l-10 7L2 6";
  const USER_ICON =
    "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z";
  const ARROW_ICON = "M5 12h14M12 5l7 7-7 7";
  const CHECK_ICON = "M20 6L9 17l-5-5";

  return (
    <>
      <div className="min-h-screen bg-shell dark:bg-dark-app flex items-center justify-center p-4">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="fixed top-4 left-4 z-50 text-xs font-semibold text-secondary dark:text-dark-secondary underline-offset-4 hover:underline bg-transparent border-none cursor-pointer"
        >
          ← Public stories
        </button>
        <button
          type="button"
          onClick={toggleTheme}
          className="fixed top-4 right-4 z-50 w-8 h-8 flex items-center justify-center rounded-lg border border-default dark:border-dark-default bg-bg-shell dark:bg-dark-shell text-secondary dark:text-dark-secondary hover:bg-input dark:hover:bg-dark-input transition-colors cursor-pointer"
        >
          <Icon
            d={theme === "light" ? IC.moon : IC.sun}
            className="size-3.5 stroke-[1.5]"
          />
        </button>

        <div className="anim-up w-full max-w-112.5 flex overflow-hidden rounded-2xl border border-default dark:border-dark-default bg-bg-shell dark:bg-dark-shell">
          <div className="flex-1 flex flex-col justify-center px-7 py-8  dark:border-dark-default">
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
                    Account created!
                  </p>
                  <p className="text-xs text-muted dark:text-dark-muted">
                    Redirecting to your dashboard…
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
              <div className="anim-up">
                <div className="mb-5">
                  <h1 className="text-sm font-bold text-primary dark:text-dark-primary tracking-tight mb-1">
                    Create your account
                  </h1>
                </div>

                <div className="flex gap-2 mb-4">
                  <button
                    type="button"
                    className="flex-1 h-8 flex items-center justify-center gap-2 rounded-lg border border-default dark:border-dark-default bg-input dark:bg-dark-input text-primary dark:text-dark-primary text-xs font-semibold hover:bg-bg-shell dark:hover:bg-dark-shell transition-colors cursor-pointer"
                  >
                    <GoogleLogo />
                    <span>Google</span>
                  </button>
                  <button
                    type="button"
                    className="flex-1 h-8 flex items-center justify-center gap-2 rounded-lg border border-default dark:border-dark-default bg-input dark:bg-dark-input text-primary dark:text-dark-primary text-xs font-semibold hover:bg-bg-shell dark:hover:bg-dark-shell transition-colors cursor-pointer"
                  >
                    <Github />
                    <span>Microsoft</span>
                  </button>
                </div>

                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-default dark:bg-dark-default" />
                  <span className="text-[10px] text-muted dark:text-dark-muted font-medium whitespace-nowrap">
                    or continue with email
                  </span>
                  <div className="flex-1 h-px bg-default dark:bg-dark-default" />
                </div>

                {serverError && (
                  <p
                    className="mb-3 rounded-lg border border-error/40 bg-error/10 px-3 py-2 text-[11px] font-medium text-error dark:text-error"
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
                    label="Full name"
                    placeholder="Amirbaqian"
                    error={errors.fullName?.message}
                    autoComplete="name"
                    iconD={USER_ICON}
                  />

                  <Field
                    label="Email address"
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
                    label="Password"
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

                  <div className="flex flex-col gap-1">
                    <Select options={options} placeholder="Select fruit" />
                  </div>

                  <button
                    type="submit"
                    disabled={signingUp}
                    className="mt-0.5 h-8 w-full rounded-lg flex items-center justify-center gap-2 bg-primary text-white dark:bg-dark-primary text-bg-shell dark:text-dark-shell text-xs font-bold border-none cursor-pointer hover:opacity-90 active:scale-[.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {signingUp ? (
                      <Spinner />
                    ) : (
                      <>
                        Create account
                        <Icon d={ARROW_ICON} className="size-3 stroke-[2.5]" />
                      </>
                    )}
                  </button>
                </form>

                <p className="mt-4 text-center text-[11px] text-muted dark:text-dark-muted">
                  Already have an account?{" "}
                  <button
                    onClick={() => navigate("/login")}
                    className="font-semibold text-secondary dark:text-dark-secondary hover:text-primary dark:hover:text-dark-primary underline underline-offset-2 bg-transparent border-none cursor-pointer text-[11px]"
                  >
                    Sign in
                  </button>
                </p>

                <p className="mt-2.5 text-[10px] text-muted dark:text-dark-muted text-center leading-relaxed">
                  By signing up you agree to our{" "}
                  <span className="text-secondary dark:text-dark-secondary font-medium cursor-pointer hover:underline underline-offset-2">
                    Terms
                  </span>{" "}
                  and{" "}
                  <span className="text-secondary dark:text-dark-secondary font-medium cursor-pointer hover:underline underline-offset-2">
                    Privacy Policy
                  </span>
                  .
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
