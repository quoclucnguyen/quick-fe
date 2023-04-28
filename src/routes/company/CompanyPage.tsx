import {
  DeleteFilled,
  EditOutlined,
  SearchOutlined,
  ExportOutlined,
  DownloadOutlined,
  InboxOutlined,
  PlusCircleTwoTone,
  FileExcelTwoTone,
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
  Space,
  Table,
  Upload,
  message,
} from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useApp } from "../../App";
import { CURD } from "../../helper";
import type { UploadProps } from "antd";
import { RcFile } from "antd/lib/upload";
import { CompanyInterface, Filter } from "./interface";
import {
  formatFileToDownload,
  handleExcelTemplateClick,
  loadExcelData,
} from "./excel";

export default function CompanyPage() {
  const app = useApp();
  const { Dragger } = Upload;

 const [filter, setFilter] = useState<Filter>({
    name: null,
    code: null,
    take: 10,
    skip: 0,
  });
  const [isLoadingData, setLoading] = useState<boolean>();
  const [data, setData] = useState<CompanyInterface[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [isModalAddCompanyOpen, setIsModalAddCompanyOpen] = useState<boolean>(false);
  const [formAction, setFormAction] = useState<CURD | null>(null);
  const [modalTitle, setModalTitle] = useState<string>("");
  const [addOrUpdateCompanyForm] = Form.useForm();
  const [searchForm] = Form.useForm();
  const [isModalImportOpen, setIsModalImportOpen] = useState<boolean>(false);
  const [fileList, setFileList] = useState<RcFile[]>([]);

  const uploadFileProps: UploadProps = useMemo(
    () => ({
      name: "file",
      multiple: false,
      fileList: fileList,
      accept:
        "xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      beforeUpload(file: RcFile) {
        setFileList([...fileList, file]);
        const reader = new FileReader();
        reader.readAsArrayBuffer(file);
        reader.onload = async () => {
          const dataMap = await loadExcelData(reader);
          try {
            await app.axiosPost<any, any>("/companies/import", { data: dataMap });
            message.success("Import success");
            setIsModalImportOpen(false);
            fetchData(filter);
          } catch {
            message.error("Import failed");
          }
        };
      },
    }),
    [fileList]
  );

  const handleSearch = (searchValues: {
    name?: string;
    code?: string;
    address?: string;
  }) => {
    const searchFilter: Filter = {
      ...filter,
      ...searchValues,
      take: pageSize,
      skip: 0,
    };
    setCurrentPage(1);
    setFilter(searchFilter);
    fetchData(searchFilter);
  };

  const fetchData = useCallback(async (filter: Filter) => {
    setLoading(true);
    const response = await app.axiosGet<
      { entities: CompanyInterface[]; count: number },
      Filter
    >("/companies", filter);
    if (Array.isArray(response)) {
      return;
    }
    const { entities, count } = response || {};
    setData(entities || []);
    setTotal(count || 0);
    setLoading(false);
  }, []);

  const handleBtnEditCompanyClick = (record: CompanyInterface) => {
    setFormAction(CURD.UPDATE);
    setIsModalAddCompanyOpen(true);
    setModalTitle(`Company edit: ${record.code} - ${record.name}`);
    addOrUpdateCompanyForm.setFieldsValue(record);
  };
  const handleDeleteCompany = async (company: CompanyInterface) => {
    try {
      await app.axiosDelete(`/companies/${company.id}`);
      app.showAlert({
        type: "success",
        message: "Company deleted successfully.",
      });
      fetchData(filter);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddOrUpdateCompanySubmit = async () => {
    try {
      await addOrUpdateCompanyForm.validateFields();
      const companyData = addOrUpdateCompanyForm.getFieldsValue();
      const companyId = addOrUpdateCompanyForm.getFieldValue("id");

      switch (formAction) {
        case CURD.CREATE:
          await app.axiosPost(`/companies`, companyData);
          app.showAlert({ type: "success", message: "Add company success" });
          break;
        case CURD.UPDATE:
          await app.axiosPatch(`/companies/${companyId}`, companyData);
          app.showAlert({
            type: "success",
            message: "Update company success",
          });
          break;
        default:
          return;
      }
    } catch (error) {
      console.error(error);
    } finally {
      addOrUpdateCompanyForm.resetFields();
      setIsModalAddCompanyOpen(false);
      setModalTitle("");
      fetchData(filter);
    }
  };

  const handleExcelButtonClick = async () => {
    setLoading(true);
    const searchValue = searchForm.getFieldsValue();
    const companyList = await app.axiosGet<
      { entities: CompanyInterface[]; count: number },
      Filter
    >("/companies", {
      ...searchValue,
      take: 0,
      skip: 0,
    });
    if (companyList && !Array.isArray(companyList)) {
      const { entities } = companyList;
      const data = entities.map((company: CompanyInterface) => [
        company.name,
        company.code,
      ]);
      await formatFileToDownload(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData(filter);
  }, []);

  return (
    <>
      <Card css={{ padding: "0.5rem 1rem" }}>
        <Form
          layout={"vertical"}
          onFinish={handleSearch}
          initialValues={filter}
          form={searchForm}
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
                    title={"Export excel?"}
                    onConfirm={handleExcelButtonClick}
                    okButtonProps={{ loading: isLoadingData }}
                  >
                    <Button
                      icon={<ExportOutlined />}
                      loading={isLoadingData}
                    ></Button>
                  </Popconfirm>
                </Form.Item>
              </Col>
            </Space>
          </Row>
        </Form>
      </Card>

      <Card css={{ padding: "0.5rem 1rem", marginTop: "0.5rem" }}>
        <Row justify={"end"} style={{ marginBottom: "0.5rem" }}>
          <Space>
            <Col>
              <Button
                icon={<PlusCircleTwoTone twoToneColor="#52c41a" />}
                onClick={async () => {
                  setIsModalAddCompanyOpen(true);
                  setFormAction(CURD.CREATE);
                  setModalTitle("Add company");
                  addOrUpdateCompanyForm.resetFields();
                }}
              />
            </Col>
            <Col>
              <Button
                icon={<FileExcelTwoTone twoToneColor="#52c41a" />}
                onClick={() => {
                  setIsModalImportOpen(true);
                  setFileList([]);
                }}
              />
            </Col>
          </Space>
        </Row>
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
              fetchData(value);
            },
          }}
          columns={[
            {
              title: "#",
              align: "center",
              width: "15px",
              render: (_item, _record, index) => {
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
              render: (_, record) => {
                return (
                  <Space>
                    <Button
                      type="link"
                      icon={<EditOutlined />}
                      onClick={() => {
                        handleBtnEditCompanyClick(record);
                      }}
                    />
                    <Popconfirm
                      title={`Delete company: ${record.code} - ${record.name}`}
                      onConfirm={() => {
                        handleDeleteCompany(record);
                      }}
                      okText="Delete"
                    >
                      <Button type="link" icon={<DeleteFilled />} danger />
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
        open={isModalAddCompanyOpen}
        onCancel={() => {
          setIsModalAddCompanyOpen(false);
        }}
        footer={false}
      >
        <Form
          layout={"vertical"}
          onFinish={handleAddOrUpdateCompanySubmit}
          form={addOrUpdateCompanyForm}
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
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Save
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal import via excel */}
      <Modal
        title={"Import company"}
        open={isModalImportOpen}
        onCancel={() => {
          setIsModalImportOpen(false);
        }}
        footer={false}
      >
        <p>
          Template{" "}
          <Button
            onClick={handleExcelTemplateClick}
            type={"link"}
            icon={<DownloadOutlined />}
          >
            here{" "}
          </Button>
        </p>
        <br />
        <Dragger {...uploadFileProps}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Select or drag to import</p>
        </Dragger>
      </Modal>
    </>
  );
}





