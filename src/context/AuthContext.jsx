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
  const [state, dispatch] = useReducer(authReducer, seedUser);

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

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
