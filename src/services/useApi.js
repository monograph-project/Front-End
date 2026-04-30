import { useMutation, useQuery } from "@tanstack/react-query";
import {
  login,
  signup,
  googleAuth,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  changePassword,
  getStudents,
} from "./apiRoute";

export const useLogin = () => {
  return useMutation({
    mutationFn: login,
    mutationKey: ["login"],
  });
};

export const useSignup = () => {
  return useMutation({
    mutationFn: signup,
    mutationKey: ["signup"],
  });
};

export const useGoogleAuth = () => {
  return useMutation({
    mutationFn: googleAuth,
    mutationKey: ["googleAuth"],
  });
};

export const useRefreshToken = () => {
  return useMutation({
    mutationFn: refreshToken,
    mutationKey: ["refreshToken"],
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: logout,
    mutationKey: ["logout"],
  });
};

/* Additional auth hooks */
export const useForgotPassword = () =>
  useMutation({ mutationFn: forgotPassword, mutationKey: ["forgotPassword"] });
export const useResetPassword = () =>
  useMutation({ mutationFn: resetPassword, mutationKey: ["resetPassword"] });
export const useVerifyEmail = () =>
  useMutation({ mutationFn: verifyEmail, mutationKey: ["verifyEmail"] });
export const useResendVerificationEmail = () =>
  useMutation({
    mutationFn: resendVerificationEmail,
    mutationKey: ["resendVerificationEmail"],
  });

export const useStudents = () => {
  return useQuery({
    queryKey: ["students"],
    queryFn: getStudents,
  });
};
export const useChangePassword = () =>
  useMutation({ mutationFn: changePassword, mutationKey: ["changePassword"] });
