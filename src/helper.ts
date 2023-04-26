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

export const removeUserLogin = async () => {
  await localForage.removeItem(`${import.meta.env.VITE_APP_NAME}_user`);
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
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;",
      });
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
    })
    .catch((error) => {
      throw error;
    });
};
export const numToCol = (num: number): string => {
  // initialize an empty string for the result
  let result = "";
  // while num is positive, repeat the following steps
  while (num > 0) {
    // get the remainder of num divided by 26
    let rem = num % 26;
    // if rem is zero, set it to 26 and subtract one from num
    if (rem == 0) {
      rem = 26;
      num--;
    }
    // convert rem to a letter using String.fromCharCode() and prepend it to the result
    result = String.fromCharCode(rem + 64) + result;
    // divide num by 26 and round down
    num = Math.floor(num / 26);
  }
  // return the result
  return result;
};
