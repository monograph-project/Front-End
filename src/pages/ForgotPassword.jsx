import { useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import Icon from "../components/Icon";
import IC from "../components/IC";
import Field from "../components/Field";
import Button from "../components/Button";
import { useForgotPassword } from "../services/useApi";

export default function ForgotPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [done, setDone] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: "onSubmit", defaultValues: { email: "" } });

  const { mutateAsync, isPending } = useForgotPassword({
    toastSuccess: "forgotPassword.toast.success",
  });

  const submit = async (data) => {
    const email = String(data.email ?? "")
      .trim()
      .toLowerCase();
    await mutateAsync(email);
    setDone(true);
  };

  return (
    <div className="flex min-h-screen flex-col bg-shell px-4 py-10 dark:bg-dark-app">
      <button
        type="button"
        onClick={() => navigate("/login")}
        className="fixed top-4 left-4 z-50 cursor-pointer rounded-lg border-none bg-transparent text-xs font-semibold text-secondary underline-offset-4 hover:underline dark:text-dark-secondary"
      >
        {t("login.backToSignIn")}
      </button>
      <button
        type="button"
        onClick={() => navigate("/")}
        className="fixed top-4 right-4 z-50 cursor-pointer rounded-lg border-none bg-transparent text-xs font-semibold text-secondary underline-offset-4 hover:underline rtl:left-4 rtl:right-auto dark:text-dark-secondary"
      >
        {t("login.publicStories")}
      </button>

      <div className="mx-auto mt-14 w-full max-w-md rounded-2xl border border-light-divider bg-(--color-light-card-bg) p-4 shadow-md md:p-5 dark:border-dark-divider dark:bg-(--color-dark-card-bg)">
        {!done ? (
          <>
            <h1 className="text-xl font-semibold text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
              {t("forgotPassword.title")}
            </h1>
            <p className="mt-2 text-[13px] text-secondary dark:text-dark-secondary">
              {t("forgotPassword.subtext")}
            </p>

            <form
              className="mt-4 flex flex-col gap-3"
              onSubmit={handleSubmit(submit)}
            >
              <Field
                type="email"
                label={t("login.emailAddress")}
                placeholder="you@school.edu"
                register={register("email", {
                  required: t("forgotPassword.validation.emailRequired"),
                })}
                error={errors?.email?.message}
                autoComplete="email"
              />
              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={isPending}
                className="h-9 w-full justify-center rounded-xl text-xs!"
              >
                {isPending ? (
                  <>
                    <span className="inline-block size-3.5 animate-spin rounded-full border-2 border-white/70 border-t-white" />
                    {t("forgotPassword.sending")}
                  </>
                ) : (
                  t("login.sendResetLink")
                )}
              </Button>
            </form>
          </>
        ) : (
          <div className="flex flex-col gap-3 text-center">
            <div className="mx-auto flex size-10 items-center justify-center rounded-full border border-success/40 bg-success/10 dark:bg-success/15">
              <Icon d={IC.check} className="size-4 text-success" />
            </div>
            <h2 className="text-lg font-semibold text-(--color-light-text-primary) dark:text-(--color-dark-text-primary)">
              {t("login.resetSent")}
            </h2>
            <p className="text-[13px] text-muted dark:text-dark-muted">
              {t("login.checkInbox")}
            </p>
            <Button
              type="button"
              variant="secondary"
              fullWidth
              className="h-9 rounded-xl justify-center!"
              onClick={() => navigate("/login")}
            >
              {t("login.backToSignIn")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
