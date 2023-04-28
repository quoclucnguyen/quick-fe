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
import { AuthorInterface, Filter } from "./interface";
import {
  formatFileToDownload,
  handleExcelTemplateClick,
  loadExcelData,
} from "./excel";

export default function AuthorPage() {
  const app = useApp();
  const { Dragger } = Upload;

 const [filter, setFilter] = useState<Filter>({
    name: null,
    code: null,
    address: null,
    ageNumber: null,
    countTime: null,
    take: 10,
    skip: 0,
  });
  const [isLoadingData, setLoading] = useState<boolean>();
  const [data, setData] = useState<AuthorInterface[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [isModalAddAuthorOpen, setIsModalAddAuthorOpen] = useState<boolean>(false);
  const [formAction, setFormAction] = useState<CURD | null>(null);
  const [modalTitle, setModalTitle] = useState<string>("");
  const [addOrUpdateAuthorForm] = Form.useForm();
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
            await app.axiosPost<any, any>("/authors/import", { data: dataMap });
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
      { entities: AuthorInterface[]; count: number },
      Filter
    >("/authors", filter);
    if (Array.isArray(response)) {
      return;
    }
    const { entities, count } = response || {};
    setData(entities || []);
    setTotal(count || 0);
    setLoading(false);
  }, []);

  const handleBtnEditAuthorClick = (record: AuthorInterface) => {
    setFormAction(CURD.UPDATE);
    setIsModalAddAuthorOpen(true);
    setModalTitle(`Author edit: ${record.code} - ${record.name}`);
    addOrUpdateAuthorForm.setFieldsValue(record);
  };
  const handleDeleteAuthor = async (author: AuthorInterface) => {
    try {
      await app.axiosDelete(`/authors/${author.id}`);
      app.showAlert({
        type: "success",
        message: "Author deleted successfully.",
      });
      fetchData(filter);
    } catch (error) {
      console.error(error);
    }
  };

  const handleAddOrUpdateAuthorSubmit = async () => {
    try {
      await addOrUpdateAuthorForm.validateFields();
      const authorData = addOrUpdateAuthorForm.getFieldsValue();
      const authorId = addOrUpdateAuthorForm.getFieldValue("id");

      switch (formAction) {
        case CURD.CREATE:
          await app.axiosPost(`/authors`, authorData);
          app.showAlert({ type: "success", message: "Add author success" });
          break;
        case CURD.UPDATE:
          await app.axiosPatch(`/authors/${authorId}`, authorData);
          app.showAlert({
            type: "success",
            message: "Update author success",
          });
          break;
        default:
          return;
      }
    } catch (error) {
      console.error(error);
    } finally {
      addOrUpdateAuthorForm.resetFields();
      setIsModalAddAuthorOpen(false);
      setModalTitle("");
      fetchData(filter);
    }
  };

  const handleExcelButtonClick = async () => {
    setLoading(true);
    const searchValue = searchForm.getFieldsValue();
    const authorList = await app.axiosGet<
      { entities: AuthorInterface[]; count: number },
      Filter
    >("/authors", {
      ...searchValue,
      take: 0,
      skip: 0,
    });
    if (authorList && !Array.isArray(authorList)) {
      const { entities } = authorList;
      const data = entities.map((author: AuthorInterface) => [
        author.name,
        author.code,
        author.address,
        author.ageNumber,
        author.count,
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
                <Form.Item label={"Address"} name={"address"}>
                  <Input allowClear />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item label={"Age Number"} name={"agenumber"}>
                  <Input allowClear />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item label={"Count Times"} name={"count"}>
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
                  setIsModalAddAuthorOpen(true);
                  setFormAction(CURD.CREATE);
                  setModalTitle("Add author");
                  addOrUpdateAuthorForm.resetFields();
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
              title: "Address",
              key: "address",
              dataIndex: "address",
            },
            {
              title: "Age Number",
              key: "ageNumber",
              dataIndex: "ageNumber",
            },
            {
              title: "Count Times",
              key: "countTime",
              dataIndex: "countTime",
            },
            {
              render: (_, record) => {
                return (
                  <Space>
                    <Button
                      type="link"
                      icon={<EditOutlined />}
                      onClick={() => {
                        handleBtnEditAuthorClick(record);
                      }}
                    />
                    <Popconfirm
                      title={`Delete author: ${record.code} - ${record.name}`}
                      onConfirm={() => {
                        handleDeleteAuthor(record);
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
        open={isModalAddAuthorOpen}
        onCancel={() => {
          setIsModalAddAuthorOpen(false);
        }}
        footer={false}
      >
        <Form
          layout={"vertical"}
          onFinish={handleAddOrUpdateAuthorSubmit}
          form={addOrUpdateAuthorForm}
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
          <Form.Item
            label={"Age Number"}
            name={"ageNumber"}
            rules={[{ required: true }]}
          >
          <Input  type= 'number'/>
          </Form.Item>
          <Form.Item
            label={"Count Times"}
            name={"countTime"}
            rules={[{ required: true }]}
          >
          <Input  type= 'number'/>
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
        title={"Import author"}
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





