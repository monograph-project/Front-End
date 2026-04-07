import { Theme, ThemePanel } from "@radix-ui/themes/dist/cjs/index.js";
import "@radix-ui/themes/styles.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import "./index.css";
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 30,
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Theme accentColor="crimson" grayColor="sand" radius="large" scaling="95%">
      <ThemePanel />
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
        </AuthProvider>
        <ReactQueryDevtools />
      </QueryClientProvider>
    </Theme>
  </StrictMode>,
);
