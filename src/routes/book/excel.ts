import Excel from "exceljs";
import { downloadFile, numToCol } from "../../helper";

export enum ExcelImportHeader {
  name = 'Tên',
  code = 'Code',
  address = 'Address',
}
export const HEADER_TO_PARAM = {
  [ExcelImportHeader.name.toString()]: 'name',
  [ExcelImportHeader.code.toString()]: 'code',
  [ExcelImportHeader.address.toString()]: 'address',
};

/**
 * Generates and downloads an Excel file template with specified headers.
 */
export const handleExcelTemplateClick = async () => {
  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet("data", {});
  const HEADER = Object.values(ExcelImportHeader);
  HEADER.forEach((header, index) => {
    const cell = worksheet.getCell(`${numToCol(index + 1)}1`);
    cell.value = header;
    cell.style = {
      font: { size: 14 },
      border: {
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
        top: { style: "thin" },
      },
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "99ccff" },
      },
    };
  });
  HEADER.forEach((_, index) => {
    const cell = worksheet.getCell(`${numToCol(index + 1)}2`);
    cell.border = {
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
      top: { style: "thin" },
    };
  });
  await downloadFile(workbook, `IMPORT_Book_${new Date().getTime()}.xlsx`);
};

export const formatFileToDownload = async (data: string[][]) => {
  const workbook = new Excel.Workbook();
  const worksheet = workbook.addWorksheet("data", {});
  const HEADER = [
    "Tên",
    "Code",
    "Address",
  ];
  const formatHeader = (cell: Excel.Cell) => {
    cell.style = {
      font: { size: 14 },
      border: {
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
        top: { style: "thin" },
      },
      fill: {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "99ccff" },
      },
    };
  };

  HEADER.forEach((header, index) => {
    const cell = worksheet.getCell(`${numToCol(index + 1)}1`);
    cell.value = header;
    formatHeader(cell);
  });

  const formatCell = (cell: Excel.Cell) => {
    cell.border = {
      bottom: { style: "thin" },
      left: { style: "thin" },
      right: { style: "thin" },
      top: { style: "thin" },
    };
  };

  HEADER.forEach((_, index) => {
    const cell = worksheet.getCell(`${numToCol(index + 1)}2`);
    formatCell(cell);
  });
  const BEGIN_INDEX_OF_FILE = 2;
  worksheet.insertRows(BEGIN_INDEX_OF_FILE + 1, data, "i+");
  worksheet.spliceRows(BEGIN_INDEX_OF_FILE, 1);
  await downloadFile(workbook, `DS_Book_${new Date().getTime()}.xlsx`);
};

/**
 * Loads data from an Excel file and returns it as an array of objects.
 * @param reader - The FileReader object used to read the Excel file.
 * @returns An array of objects representing the data in the Excel file.
 */
export const loadExcelData = async (reader: FileReader): Promise<any[]> => {
  const workbook = new Excel.Workbook();
  await workbook.xlsx.load(reader.result as unknown as any);

  const worksheet = workbook.getWorksheet(`data`);
  let headers: any[] | undefined = [];
  const data: any[] = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      headers = row?.model?.cells?.map((cell) =>
        cell?.value?.toString().trim()
      );
    } else {
      data.push(
        row?.model?.cells?.map((cell) => cell?.value?.toString().trim())
      );
    }
  });
  const dataRows = data.map((row: string[]) => {
    const obj: any = {};
    headers?.forEach((header: string, index) => {
      const key = HEADER_TO_PARAM[header];
      obj[key] = row[index];
    });
    return obj;
  });
  return dataRows;
};
