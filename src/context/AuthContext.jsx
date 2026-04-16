import { createContext, useContext, useReducer, useEffect } from "react";

const AuthContext = createContext();

const guestState = {
  user: {
      fullName: "ksjdf",
      email: "sfkjdf@gkjdf.com",
      password: "sdfjksfjsdfj",
      role: "student",
      id: "g5jJscIShtE"
    },
  isAuthenticated: true,
};

function authReducer(state, action) {
  switch (action.type) {
    case "LOGIN":
      return {
        user: action.payload,
        isAuthenticated: true,
      };
    case "LOGOUT":
      return guestState;
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, guestState);

  useEffect(() => {
    const raw = localStorage.getItem("user");
    const userId = localStorage.getItem("userId");
    if (raw && userId) {
      try {
        const user = JSON.parse(raw);
        dispatch({ type: "LOGIN", payload: user });
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("userId");
      }
    }
  }, []);

  useEffect(() => {
    if (state.isAuthenticated && state.user) {
      localStorage.setItem("user", JSON.stringify(state.user));
      if (state.user.id != null) {
        localStorage.setItem("userId", String(state.user.id));
      }
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("userId");
    }
  }, [state.isAuthenticated, state.user]);

  const login = (user) => {
    dispatch({
      type: "LOGIN",
      payload: user,
    });
  };

  const logout = () => {
    dispatch({ type: "LOGOUT" });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
