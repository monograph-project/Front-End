import { createContext, useContext, useReducer, useEffect } from "react";

const AuthContext = createContext();

const seedUser = {
  user: {
    fullName: "me",
    email: "me@gmail.com",
    password: "test1234",
    role: "admin",
    id: "_5aOxF0cFF0",
  },
  isAuthenticated: true,
};

const loggedOutState = {
  user: null,
  isAuthenticated: false,
};

function getInitialAuthState() {
  const raw = localStorage.getItem("user");
  const userId = localStorage.getItem("userId");

  if (!raw || !userId) {
    return seedUser;
  }

  try {
    const user = JSON.parse(raw);

    if (!user || typeof user !== "object" || !user.role) {
      throw new Error("Stored user is invalid.");
    }

    return {
      user,
      isAuthenticated: true,
    };
  } catch {
    localStorage.removeItem("user");
    localStorage.removeItem("userId");
    return seedUser;
  }
}

function authReducer(state, action) {
  switch (action.type) {
    case "LOGIN":
      return {
        user: action.payload,
        isAuthenticated: true,
      };
    case "LOGOUT":
      return loggedOutState;
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, undefined, getInitialAuthState);

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
