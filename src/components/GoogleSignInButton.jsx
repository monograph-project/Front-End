import { GoogleLogin } from "@react-oauth/google";
import { useGoogleAuth } from "../services/useApi";
import { hasGoogleOAuthClientId } from "../lib/googleOAuth";

/**
 * Uses Google Identity Services (JWT id_token) and `POST /api/v1/auth/google`.
 *
 * Parent should call `login(response.user)` and navigate on success.
 */
export default function GoogleSignInButton({
  intent = "signin",
  disabled = false,
  onAuthSuccess,
  onAuthFailure,
}) {
  const { mutate, isPending } = useGoogleAuth({
    showSuccessToast: false,
    showErrorToast: false,
  });

  if (!hasGoogleOAuthClientId()) {
    return null;
  }

  const busy = disabled || isPending;

  const handleSuccess = (credentialResponse) => {
    const token = credentialResponse?.credential;
    if (!token) {
      onAuthFailure?.("Google did not return a credential.");
      return;
    }

    mutate(
      { id_token: token },
      {
        onSuccess: (data) => onAuthSuccess?.(data),
        onError: (err) =>
          onAuthFailure?.(err.message || "Google sign-in failed."),
      },
    );
  };

  const handleError = () => {
    onAuthFailure?.(
      intent === "signup"
        ? "Google sign-up was cancelled or failed."
        : "Google sign-in was cancelled or failed.",
    );
  };

  return (
    <div
      className={`flex w-full justify-center ${busy ? "pointer-events-none opacity-60" : ""}`}
      aria-busy={busy}
      data-google-auth={intent}
    >
      <div className="w-full [&>div]:w-full [&>div]:flex [&>div]:justify-center">
        <GoogleLogin
          context={intent === "signup" ? "signup" : "signin"}
          text={intent === "signup" ? "signup_with" : "signin_with"}
          theme="outline"
          size="large"
          shape="rectangular"
          width={320}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </div>
    </div>
  );
}
