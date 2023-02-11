import React, { createContext, useContext, useEffect, useState } from "react";
import {
  BrowserRouter,
  createBrowserRouter,
  Navigate,
  Route,
  RouterProvider,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import MainLayout from "./layouts/main-layout";
import LoginLayout from "./layouts/login-layout";
import LoginPage from "./routes/login/login-page";
import DashboardPage from "./routes/dashboard/dashboard-page";
import { getUserLogin } from "./helper";
import axios, { AxiosError, AxiosInstance } from "axios";
import { Modal } from "antd";
import localForage from "localforage";
import UserPage from "./routes/user/user-page";
import ErrorPage from "./ErrorPage";
import { OutletPage } from "./routes/outlet/OutletPage";
import { CustomerPage } from "./routes/customer/CustomerPage";

export interface UserLogin {
  id: number;
  username: string;
  name: string;
  role: "SA" | "ADMIN" | "USER";
  token?: string;
  iat: number;
  exp: number;
  accessToken?: string;
}

export interface AuthContextType {
  user: UserLogin | null;
  signin: (user: UserLogin) => void;
  signout: (callback: VoidFunction) => void;
}

export const authProvider = {
  isAuthenticated: false,
  signin(callback: VoidFunction) {
    authProvider.isAuthenticated = true;
    callback();
  },
  signout(callback: VoidFunction) {
    authProvider.isAuthenticated = false;
    callback();
  },
};
const AuthContext = createContext<AuthContextType>(null!);

export const useAuth = () => {
  return useContext(AuthContext);
};
const userLogin = await getUserLogin();
function AuthProvider({ children }: { children: React.ReactNode }) {
  let [user, setUser] = React.useState<UserLogin | null>(userLogin);
  const navigate = useNavigate();
  let signin = (newUser: UserLogin) => {
    return authProvider.signin(() => {
      localForage
        .setItem(import.meta.env.VITE_APP_NAME + "_user", newUser)
        .then(() => {
          setUser(newUser);
          location.href = "/";
        });
    });
  };

  let signout = (callback: VoidFunction) => {
    return authProvider.signout(() => {
      setUser(null);
      callback();
    });
  };
  let value = { user, signin, signout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function RequireAuth({ children }: { children: JSX.Element }) {
  let auth = useAuth();
  let location = useLocation();

  if (!auth.user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return children;
}
// [BEGIN] [App Conext]
export interface AlertType {
  type: "success" | "error" | "warning" | "info";
  title?: string;
  message?: string;
}

export interface AppContexType {
  axiosInsance: AxiosInstance | null;
  showAlert: (alert: AlertType) => void;
  axiosGet<E, P>(url: string, params: P): Promise<E | E[] | void>;
  axiosPost<E, P>(url: string, body: P): Promise<E | E[] | void>;
  axiosPatch<E, P>(url: string, body: P): Promise<E | E[] | void>;
  axiosDelete<E>(url: string): Promise<E | E[] | void>;
}

const AppContext = createContext<AppContexType>(null!);
export const useApp = () => {
  return useContext(AppContext);
};
const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [modal, contextHolder] = Modal.useModal();
  const auth = useAuth();
  const axiosInsance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    headers: { Authorization: `Bearer ${userLogin?.accessToken}` },
  });
  const showAlert = (alert: AlertType) => {
    const config = {
      title: alert.title,
      content: alert.message,
    };
    switch (alert.type) {
      case "info":
        modal.info(config);
        break;
      case "error":
        modal.error(config);
        break;
      case "success":
        modal.success(config);
        break;
      default:
    }
  };

  const catchAxiosError = (error: AxiosError) => {
    const data = error.response?.data as unknown as any;
    switch (error?.response?.status) {
      case 401:
        modal.error({
          title: error.code,
          content: data?.message,
          onOk: () => {
            auth.signout(() => { });
          },
        });
        break;
      case 400:
        modal.error({
          title: error.code,
          content: data?.message,
        });
        throw error;
      case 500:
        modal.error({
          title: error.code,
          content: data?.message,
        });
        throw error;

        break;
      default:
    }
  };

  function axiosGet<E, P>(url: string, params: P) {
    return axiosInsance
      .get<E>(url, { params: params })
      .then((result) => {
        return result.data;
      })
      .catch(catchAxiosError);
  }
  function axiosPost<E, P>(url: string, body: P) {
    return axiosInsance
      .post<E>(url, body)
      .then((result) => {
        return result.data;
      })
      .catch(catchAxiosError);
  }
  function axiosPatch<E, P>(url: string, body: P) {
    return axiosInsance
      .patch<E>(url, body)
      .then((result) => {
        return result.data;
      })
      .catch(catchAxiosError);
  }
  function axiosDelete<E>(url: string) {
    return axiosInsance
      .delete<E>(url)
      .then((result) => {
        return result.data;
      })
      .catch(catchAxiosError);
  }
  const value = {
    showAlert,
    axiosInsance,
    axiosGet,
    axiosPost,
    axiosPatch,
    axiosDelete,
  };
  return (
    <AppContext.Provider value={value}>
      {children}
      {contextHolder}
    </AppContext.Provider>
  );
};
// [END][App Context]

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <Routes>
            <Route element={<LoginLayout />} path={"/login"}>
              <Route index element={<LoginPage />} />
            </Route>
            <Route
              element={<MainLayout />}
              path={"/"}
              errorElement={<ErrorPage />}
            >
              <Route
                index
                element={
                  <RequireAuth>
                    <DashboardPage />
                  </RequireAuth>
                }
              />
              <Route
                path={"user"}
                element={
                  <RequireAuth>
                    <UserPage />
                  </RequireAuth>
                }
              />
              <Route
                path={"outlet"}
                element={
                  <RequireAuth>
                    <OutletPage />
                  </RequireAuth>
                }
              />
              <Route
                path={"customer"}
                element={
                  <RequireAuth>
                    <CustomerPage />
                  </RequireAuth>
                }
              />
            </Route>
          </Routes>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
