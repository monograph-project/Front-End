import { createContext, useContext, useReducer, useEffect } from "react";

const AuthContext = createContext();

const initialState = {
  user: {
    fullName: "me",
    email: "me@gmail.com",
    password: "test1234",
    role: "teacher",
    id: "_5aOxF0cFF0",
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
      return initialState;
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const user = localStorage.getItem("user");
    const userId = localStorage.getItem("userId");
    if (user && userId) {
      try {
        dispatch({ type: "LOGIN", payload: JSON.parse(user) });
      } catch {
        localStorage.removeItem("user");
        localStorage.removeItem("userId");
      }
    }
  }, []);

  useEffect(() => {
    if (state.isAuthenticated) {
      localStorage.setItem("user", JSON.stringify(state.user));
    } else {
      localStorage.removeItem("user");
    }
  }, [state]);

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
