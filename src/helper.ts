import localForage from "localforage";
import { UserLogin } from "./App";

export const getUserLogin = () => {
  return localForage
    .getItem<UserLogin>(import.meta.env.VITE_APP_NAME + "_user")
    .then((result) => result);
};

export interface AppConfig {
  user: {
    role: string[];
  };
}
export const getAppConfig = () => {
  return localForage
    .getItem<AppConfig>(import.meta.env.VITE_APP_NAME + "_config")
    .then((result) => result);
};

export enum CURD {
  CREATE = "create",
  UPDATE = "update",
}
