import {
  CheckCircleFilled,
  DeleteFilled,
  EditOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  ExportOutlined,
  ImportOutlined,
  DownloadOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { Card } from "@nextui-org/react";
import {
  Button,
  Col,
  Form,
  Input,
  Modal,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Upload,
  message,
} from "antd";
import { useEffect, useState } from "react";
import { useApp } from "../../App";
import { CURD, DistrictInterface, ProvinceInterface, downloadFile, numToCol } from "../../helper";
import Excel from 'exceljs';
import type { UploadProps } from 'antd';
import {RcFile} from "antd/lib/upload";

export interface BookInterface {
  id: number;
  name: string;
  code: string;
  address: string;
}
interface Filter {
  take: number;
  skip: number;
  name: string | null;
  code: string | null;
  address: string | null;
}
export enum ExcelImportHeader {
  name = 'Tên',
  code = 'Code',
  address = 'Address',
}
export const HeaderToParam = {
  [ExcelImportHeader.name.toString()]: 'name',
  [ExcelImportHeader.code.toString()]: 'code',
  [ExcelImportHeader.address.toString()]: 'address',
}

export default function BookPage() {
  const app = useApp();
  const { Dragger } = Upload;

  const [filter, setFilter] = useState<Filter>({
    name: null,
    code: null,
    address: null,
    take: 10,
    skip: 0,
  });
  const [isLoadingData, setIsLoadingData] = useState<boolean>();
  const [data, setData] = useState<BookInterface[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [isModalAddBookOpen, setIsModalAddBookOpen] =
    useState<boolean>(false);
  const [modalAddOrUpdateBookTitle, setModalAddOrUpdateBookTitle] =
    useState<string>();
  const [formAction, setFormAction] = useState<CURD | null>(null);
  const [modalTitle, setModalTitle] = useState<string>("");
  const [addOrUpdateBookForm] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [isModalImportOpen, setIsModalImportOpen] = useState<boolean>(false);
  const [fileList, setFileList] = useState<RcFile[]>([]);
  
  const uploadFileProps: UploadProps = {
    name: 'file',
    multiple: false,
    fileList: fileList,
    accept: 'xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    beforeUpload(file: RcFile) {
      setFileList([...fileList, file]);
      const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = async (ev) => {
          const workbook = new Excel.Workbook();
          await workbook.xlsx.load(reader.result as unknown as any);
          const worksheet = workbook.getWorksheet('data');
          const data: any[] | undefined = [];
          let headers: any[] | undefined = [];
          worksheet.eachRow((row, rowNumber) => {
              if (rowNumber === 1) {
                  headers = row?.model?.cells?.map(cell => cell?.value?.toString().trim());
              } else {
                  data.push(row?.model?.cells?.map(cell => cell?.value?.toString().trim()));
              }
          })
          const dataMap = data.map((row: string[]) => {
              const obj = {} as any;
              headers?.forEach((header: string, index) => {
                  const key = HeaderToParam[header];
                  obj[key] = row[index];
              }) 
              return obj;
          });
          app.axiosPost<any, any>("/books/import", {data: dataMap}).then((result) => {
            message.success("Import thành công");
            setIsModalImportOpen(false);
            getData(filter);
          }).catch((err) => {
            message.error("Import thất bại");
          })
        }
      return false;
    },
  };

  const handleSearch = (values: {
  name?: string;
  code?: string;
  address?: string;
  }) => {
    const filterSearch: Filter = {
      ...filter,
      ...values,
      take: pageSize,
      skip: 0,
    };
    setCurrentPage(1);
    setFilter(filterSearch);
    getData(filterSearch);
  };

  const getData = async (filter: Filter) => {
    setIsLoadingData(true);
    const result = await app.axiosGet<
      { entities: BookInterface[]; count: number },
      Filter
    >("/books", filter);
    if (!Array.isArray(result) && result !== undefined) {
      const { entities, count } = result;
      setData(entities);
      setTotal(count);
    }
    setIsLoadingData(false);
  };

  const handleBtnEditBookClick = (record: BookInterface) => {
    setFormAction(CURD.UPDATE);
    setIsModalAddBookOpen(true);
    setModalTitle(`Cập nhật thông tin Book: ${record.code} - ${record.name}`);
    addOrUpdateBookForm.setFieldsValue(record);
  };
  const handleBtnDeleteConfirm = (record: BookInterface) => {
    app.axiosDelete(`/books/${record.id}`).then((result) => {
      app.showAlert({
        type: "success",
        message: "Xóa thành công.",
      });
      getData(filter);
    });
  };

  const handleAddBookFormSubmit = async () => {
    await addOrUpdateBookForm.validateFields();
    switch (formAction) {
      case CURD.CREATE:
        app
          .axiosPost(`/books`, addOrUpdateBookForm.getFieldsValue())
          .then((result) => {
            app.showAlert({
              type: "success",
              message: "Thêm Book thành công",
            });
            addOrUpdateBookForm.resetFields();
            setIsModalAddBookOpen(false);
            setModalTitle("");
            getData(filter);
          });
        break;
      case CURD.UPDATE:
        app
          .axiosPatch(
            `/books/${addOrUpdateBookForm.getFieldValue("id")}`,
            addOrUpdateBookForm.getFieldsValue()
          )
          .then((result) => {
            app.showAlert({
              type: "success",
              message: "Cập nhập thông tin Book thành công",
            });
            addOrUpdateBookForm.resetFields();
            setIsModalAddBookOpen(false);
            setModalTitle("");
            getData(filter);
          });
        break;
      default:
    }
  };

  const handleBtnExcelClick = async () => {
    setIsLoadingData(true);
    const value = searchForm.getFieldsValue();
    const result = await app.axiosGet<BookInterface[], Filter>(
        "/books",
      {
        ...value,
        take: 0,
        skip: 0,
      }
    );
    if (!Array.isArray(result) && result !== undefined) {
      const { entities, count } = result;
      const data = Array.from(entities, (entity: BookInterface) => {
        return Object.values({
            name: entity.name,
            code: entity.code,
            address: entity.address,
        });
      });
      const wb = new Excel.Workbook();
      const ws = wb.addWorksheet("data", {});
      const listProperties = [
            "Tên",
            "Code",
            "Address",
      ];
      listProperties.forEach((property, index) => {
        const cell = ws.getCell(`${numToCol(index + 1)}1`);
        cell.value = property;
        cell.style = {
          font: {
            size: 14,
          },
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
      listProperties.forEach((property, index) => {
        const cell = ws.getCell(`${numToCol(index + 1)}2`);
        cell.border = {
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
          top: { style: "thin" },
        };
      });
      const BEGIN_INDEX_OF_FILE = 2;
      ws.insertRows(BEGIN_INDEX_OF_FILE + 1, data, "i+");
      ws.spliceRows(BEGIN_INDEX_OF_FILE, 1);
      await downloadFile(wb, "DS_Book_" + new Date().getTime() + ".xlsx");
    }
    setIsLoadingData(false);
  }

  const handleExcelTemplateClick = async () =>{
    const wb = new Excel.Workbook();
    const ws = wb.addWorksheet("data", {});
    const listProperties = [
          "Tên",
          "Code",
          "Address",
    ];
    listProperties.forEach((property, index) => {
      const cell = ws.getCell(`${numToCol(index + 1)}1`);
      cell.value = property;
      cell.style = {
        font: {
          size: 14,
        },
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
    listProperties.forEach((property, index) => {
      const cell = ws.getCell(`${numToCol(index + 1)}2`);
      cell.border = {
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
        top: { style: "thin" },
      };
    });
    await downloadFile(wb, "IMPORT_Book_" + new Date().getTime() + ".xlsx");
  }

  

  useEffect(() => {
    getData(filter);
  }, []);

  return (
    <>
      <Card css={{ padding: "1rem 1rem 0rem 1rem" }}>
        <Form
          layout={"vertical"}
          onFinish={handleSearch}
          initialValues={filter}
          form = {searchForm}
        >
          <Row>
            <Space>
              <Col>
                <Form.Item label={"Tên"} name={"name"}>
                  <Input allowClear />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item label={"Code"} name={"code"}>
                  <Input allowClear />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item label={"Address"} name={"address"}>
                  <Input allowClear />
                </Form.Item>
              </Col>

              <Col>
                <Form.Item label={" "}>
                  <Button
                    htmlType={"submit"}
                    icon={<SearchOutlined />}
                    loading={isLoadingData}
                    title={"Tìm"}
                  />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item label={" "}>
                  <Popconfirm
                    title={'Xuất Excel theo tiêu chí đã chọn?'}
                    onConfirm={handleBtnExcelClick}
                    okText="Có"
                    cancelText="Không"
                    okButtonProps={{ loading: isLoadingData }}
                  >
                  <Button
                   icon={<ExportOutlined />}
                   loading={isLoadingData}
                   >
                    Xuất Excel
                   </Button>
                  </Popconfirm>
                </Form.Item>
              </Col>
            </Space>
          </Row>
        </Form>
      </Card>
      <br />
      <Card css={{ padding: "1rem 1rem 0rem 1rem" }}>
        <Row justify={"end"}>
          <Space>
            <Col>
              <Button
                icon={<PlusCircleOutlined />}
                onClick={async () => {
                  setIsModalAddBookOpen(true);
                  setFormAction(CURD.CREATE);
                  setModalTitle("Thêm Book");
                  addOrUpdateBookForm.resetFields();
                }}
              >
                Thêm Book
              </Button>
            </Col>
            <Col>
              <Button 
                icon={<ImportOutlined />}
                onClick={() => {setIsModalImportOpen(true); setFileList([]); }}
              >
                Import Book
              </Button>
            </Col>
          </Space>
        </Row>
        <br />
        <Table
          bordered
          rowKey={"id"}
          dataSource={data}
          loading={isLoadingData}
          pagination={{
            total: total,
            pageSize: pageSize,
            current: currentPage,
            onChange: (page, pageSize) => {
              setCurrentPage(page);
              setPageSize(pageSize);
              const value = {
                ...filter,
                take: pageSize,
                skip: (page - 1) * pageSize,
              };
              getData(value);
            },
          }}
          columns={[
            {
              title: "#",
              align: "center",
              width: "15px",
              render: (item, record, index) => {
                return (currentPage - 1) * pageSize + index + 1;
              },
            },
            {
              title: "Tên",
              key: "name",
              dataIndex: "name",
            },
            {
              title: "Code",
              key: "code",
              dataIndex: "code",
            },
            {
              title: "Address",
              key: "address",
              dataIndex: "address",
            },
            {
              render: (_, record) => {
                return (
                  <Space>
                    <Button
                      icon={<EditOutlined />}
                      onClick={() => {
                        handleBtnEditBookClick(record);
                      }}
                    />
                    <Popconfirm
                      title={`Xóa Book: ${record.code} - ${record.name}`}
                      onConfirm={() => {
                        handleBtnDeleteConfirm(record);
                      }}
                      okText="Xóa"
                      cancelText="Hủy"
                    >
                      <Button icon={<DeleteFilled />} danger />
                    </Popconfirm>
                  </Space>
                );
              },
            },
          ]}
        />
      </Card>

      {/* Modal add or update */}
      <Modal
        title={modalTitle}
        open={isModalAddBookOpen}
        onCancel={() => {
          setIsModalAddBookOpen(false);
        }}
        footer={false}
      >
        <Form
          layout={"vertical"}
          onFinish={handleAddBookFormSubmit}
          form={addOrUpdateBookForm}
        >
          <Form.Item name={"id"} hidden={true}></Form.Item>
          <Form.Item
            label={"Tên"}
            name={"name"}
            rules={[{ required: true }]}
          >
          <Input />
          </Form.Item>
          <Form.Item
            label={"Code"}
            name={"code"}
            rules={[{ required: true }]}
          >
          <Input />
          </Form.Item>
          <Form.Item
            label={"Address"}
            name={"address"}
            rules={[{ required: true }]}
          >
          <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Lưu
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal import via excel */}
      <Modal
        title={'Import Book'}
        open={isModalImportOpen}
        onCancel={() => {setIsModalImportOpen(false)}}
        footer={false}
      >
        <p>Tải template <Button onClick={handleExcelTemplateClick} type={'link'} icon={<DownloadOutlined />}>tại đây </Button></p>
        <br/>
        <Dragger {...uploadFileProps}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Chọn hoặc kéo file vào khu vực này để import</p>
        </Dragger>
      </Modal>
    </>
  );
}

