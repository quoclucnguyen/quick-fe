// protected region Add additional imports here on begin
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import MainLayout from "./layouts/main-layout";
import LoginLayout from "./layouts/login-layout";
import { getUserLogin, removeUserLogin } from "./helper";
import axios, { AxiosError, AxiosInstance } from "axios";
import { Modal } from "antd";
import localforage from "localforage";

const ErrorPage = React.lazy(() => import("./ErrorPage"));
const OutletPage = React.lazy(() => import("./routes/outlet/OutletPage"));
const CustomerPage = React.lazy(() => import("./routes/customer/CustomerPage"));
const UserPage = React.lazy(() => import("./routes/user/user-page"));
const LoginPage = React.lazy(() => import("./routes/login/login-page"));
const DashboardPage = React.lazy(
  () => import("./routes/dashboard/dashboard-page")
);
// protected region Add additional imports here end
const BookPage = React.lazy(() => import("./routes/book/BookPage"));
const AuthorPage = React.lazy(() => import("./routes/author/AuthorPage"));
const CompanyPage = React.lazy(() => import("./routes/company/CompanyPage"));

// protected region Add other code in here on begin
export interface UserLogin {
  id: number;
  username: string;
  name: string;
  role: "SA" | "ADMIN" | "USER";
  token?: string;
  iat?: number;
  exp?: number;
  accessToken?: string;
}

export interface AuthContextType {
  user: UserLogin | null | undefined;
  signin: (user: UserLogin, callback?: VoidFunction) => void;
  signout: (callback: VoidFunction) => void;
}

const authProvider = {
  isAuthenticated: false,
  signin(callback: VoidFunction) {
    authProvider.isAuthenticated = true;
    callback();
  },
  signout(callback: VoidFunction) {
    authProvider.isAuthenticated = false;
    removeUserLogin();
    callback();
  },
};

function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserLogin | null | undefined>(undefined);

  const signin = useCallback((newUser: UserLogin, callback?: VoidFunction) => {
    return authProvider.signin(() => {
      localforage
        .setItem(`${import.meta.env.VITE_APP_NAME}_user`, newUser)
        .then(() => {
          setUser(newUser);
          navigate("/");
          if (callback) {
            callback();
          }
        });
    });
  }, []);

  const signout = useCallback((callback: VoidFunction) => {
    return authProvider.signout(() => {
      setUser(null);
      callback();
    });
  }, []);

  useEffect(() => {
    const getUserLoginFromLocal = async () => {
      const storedUser = await getUserLogin();
      setUser(storedUser);
    };
    getUserLoginFromLocal();
  }, []);

  const authContextValue = { user, signin, signout };
  if (user !== undefined) {
    return (
      <AuthContext.Provider value={authContextValue}>
        {children}
      </AuthContext.Provider>
    );
  }
  return <></>;
}

export function useAuth() {
  return useContext(AuthContext);
}

const AuthContext = createContext<AuthContextType>(null!);

function RequireAuth({ children }: { children: JSX.Element }) {
  let auth = useAuth();
  let location = useLocation();

  if (!auth.user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
export interface AlertType {
  type: "success" | "error" | "warning" | "info";
  title?: string;
  message?: string;
}
export interface AppContextInterface {
  axiosInsance: AxiosInstance | null;
  showAlert: (alert: AlertType) => void;
  axiosGet<E, P>(url: string, params: P): Promise<E | E[]>;
  axiosPost<E, P>(url: string, body: P): Promise<E | E[]>;
  axiosPatch<E, P>(url: string, body: P): Promise<E | E[] | void>;
  axiosDelete<E>(url: string): Promise<E | E[] | void>;
}

const AppContext = createContext<AppContextInterface>(null!);
export const useApp = () => {
  return useContext(AppContext);
};

const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [modal, contextHolder] = Modal.useModal();
  const auth = useAuth();
  const userLogin = auth.user;
  const axiosInsance = useMemo(
    () =>
      axios.create({
        baseURL: import.meta.env.VITE_API_URL,
        headers: { Authorization: `Bearer ${userLogin?.token}` },
      }),
    [userLogin]
  );
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

  const handleAxiosError = useCallback(
    (error: AxiosError) => {
      interface ErrorResponse {
        message: string;
      }
      const data = error?.response?.data as ErrorResponse;
      switch (error?.response?.status) {
        case 400:
          modal.error({
            title: error.code,
            content: data?.message,
          });
          break;
        case 401:
          const handleSignout = () => {
            auth.signout(() => { });
          };
          modal.error({
            title: error.code,
            content: data?.message,
            onOk: handleSignout,
          });
          break;
        case 404:
          modal.error({
            title: error.code,
            content: data?.message,
          });
          break;
        case 500:
          modal.error({
            title: error.code,
            content: data?.message,
          });
          break;
        default:
      }
      throw error;
    },
    [auth, modal]
  );

  const axiosGet = useCallback(
    function <E, P>(url: string, params: P): Promise<E> {
      return axiosInsance
        .get<E>(url, { params: params })
        .then((result) => {
          return result.data;
        })
        .catch(handleAxiosError);
    },
    [axiosInsance]
  );

  const axiosPost = useCallback(
    function <E, P>(url: string, body: P): Promise<E> {
      return axiosInsance
        .post<E>(url, body)
        .then((result) => {
          return result.data;
        })
        .catch(handleAxiosError);
    },
    [axiosInsance]
  );

  const axiosPatch = useCallback(
    function <E, P>(url: string, body: P): Promise<E> {
      return axiosInsance
        .patch<E>(url, body)
        .then((result) => {
          return result.data;
        })
        .catch(handleAxiosError);
    },
    [axiosInsance]
  );

  const axiosDelete = useCallback(
    function <E>(url: string): Promise<E> {
      return axiosInsance
        .delete<E>(url)
        .then((result) => {
          return result.data;
        })
        .catch(handleAxiosError);
    },
    [axiosInsance]
  );

  const appContextValue: AppContextInterface = useMemo(
    () => ({
      showAlert,
      axiosInsance,
      axiosGet,
      axiosPost,
      axiosPatch,
      axiosDelete,
    }),
    [showAlert, axiosInsance, axiosGet, axiosPost, axiosPatch, axiosDelete]
  );
  return (
    <AppContext.Provider value={appContextValue}>
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
          <React.Suspense>
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
// protected region Add other code in here end

<Route
  path={"book"}
  element={
    <RequireAuth>
      <BookPage />
    </RequireAuth>
  }
/>
<Route
  path={"author"}
  element={
    <RequireAuth>
      <AuthorPage />
    </RequireAuth>
  }
/>
<Route
  path={"company"}
  element={
    <RequireAuth>
      <CompanyPage />
    </RequireAuth>
  }
/>

// protected region Add end code in here on begin
              </Route>
            </Routes>
          </React.Suspense>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
// protected region Add end code in here end