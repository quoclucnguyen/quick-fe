import axios from "axios";
import localForage from "localforage";
import { UserLogin } from "./App";
import Excel from "exceljs";

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

export interface AbstractEntity {
  id: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: number;
}

export interface ProvinceInterface extends AbstractEntity {
  name: string;
}

export interface DistrictInterface extends AbstractEntity {
  name: string;
}

export const removeUserLogin = () => {
  localStorage.removeItem("userLogin");
};

export const loadData = async (url: string) => {
  const data = await loadFile(url);
  const workbook = new Excel.Workbook();
  return await workbook.xlsx.load(data);
};

export const loadFile = async (url: string) => {
  return axios
    .request({
      url: url,
      method: "GET",
      responseType: "arraybuffer",
    })
    .then((resp) => resp.data);
};
export const downloadFile = (wb: Excel.Workbook, fileName: string) => {
  wb.xlsx
    .writeBuffer()
    .then((buffer) => {
      let blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;",
      });
      let link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
    })
    .catch((error) => {
      throw error;
    });
};
