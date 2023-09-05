import {
  CheckCircleFilled,
  DeleteFilled,
  EditOutlined,
  PlusCircleOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import {
  Form,
  Input,
  Row,
  Col,
  Button,
  Table,
  Modal,
  Select,
  Switch,
  Space,
  Tag,
  Popconfirm,
  Card,
} from "antd";
import { useEffect, useState } from "react";
import { useApp } from "../../App";

interface User {
  id: number;
  username: string;
  isActive: boolean;
  name: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}
interface Filter {
  name: string | null;
  username: string | null;
  take: number;
  skip: number;
}
export default function UserPage() {
  const app = useApp();

  const [data, setData] = useState<User[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [filter, setFilter] = useState<Filter>({
    username: null,
    name: null,
    take: 10,
    skip: 0,
  });
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [isModalAddUserOpen, setIsModalAddUserOpen] = useState(false);
  const [createUserForm] = Form.useForm();
  const [updateUserForm] = Form.useForm();
  const [isModalUpdateUserOpen, setIsModalUpdateUserOpen] =
    useState<boolean>(false);
  const [edittingUser, setEdittingUser] = useState<User | null>(null);

  const handleSearch = (values: { username?: string; name?: string }) => {
    const value = {
      username: values.username ? values.username : null,
      name: values.name ? values.name : null,
      take: pageSize,
      skip: 0,
    };
    setCurrentPage(1);
    getData(value);
    setFilter(value);
  };

  const getData = async (filter: Filter) => {
    setIsLoadingData(true);
    const result = await app.axiosGet<
      { entities: User[]; count: number },
      Filter
    >("/users", filter);
    if (!Array.isArray(result) && result !== undefined) {
      const { entities, count } = result;
      setData(entities);
      setTotal(count);
    }
    setIsLoadingData(false);
  };
  useEffect(() => {
    getData(filter);
  }, []);

  const handleAddUserFormSubmit = async (values: {
    username: string;
    password: string;
    name: string;
    role: string;
  }) => {
    const result = await app.axiosPost("users", values);
    if (result) {
      app.showAlert({
        type: "success",
        title: "Thêm user thành công",
      });
      createUserForm.resetFields();
      const value = {
        username: null,
        name: null,
        take: 10,
        skip: 0,
      };
      getData(value);
      setFilter(value);
      setIsModalAddUserOpen(false);
    }
  };
  // const handleCreateTestUser = () => {
  //   faker.locale = "vi";
  //   createUserForm.setFieldsValue({
  //     username: faker.internet.userName("test"),
  //     name: faker.name.fullName({ firstName: "Test" }),
  //     password: "123456",
  //     role: "USER",
  //   });
  // };

  const handleBtnEditUserClick = (record: User) => {
    console.log(record);
    setEdittingUser(record);
    updateUserForm.setFieldsValue({
      id: record.id,
      name: record.name,
      username: record.username,
      isActive: record.isActive,
      role: record.role,
    });
    setIsModalUpdateUserOpen(true);
  };

  const handleEditUserFormFinish = async (values: {
    username: string;
    name: string;
    role: string;
    isActive: boolean;
    password: string;
    id: number;
  }) => {
    const result = await app.axiosPatch("/users", values);
    if (result) {
      app.showAlert({
        type: "success",
        title: "Update thông tin thành công",
      });
      updateUserForm.resetFields();
      setEdittingUser(null);
      setIsModalUpdateUserOpen(false);
      getData(filter);
    }
  };

  const handleDeleteConfirm = async (record: User) => {
    const result = await app.axiosPatch("/users", {
      id: record.id,
      isActive: false,
    });
    if (result) {
      app.showAlert({
        type: "success",
        title: "Xóa thành công",
      });
      getData(filter);
    }
  };

  return (
    <>
      <Card>
        <Form
          layout={"vertical"}
          onFinish={handleSearch}
          initialValues={filter}
        >
          <Row gutter={[8, 8]}>
            <Col>
              <Form.Item
                id={"formSearchUsername"}
                label={"Username"}
                name={"username"}
              >
                <Input id={"formSearchUsername"} />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item label={"Name"} name={"name"} id={"formSearchName"}>
                <Input id={"formSearchName"} />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item label={" "}>
                <Button
                  htmlType={"submit"}
                  icon={<SearchOutlined />}
                  loading={isLoadingData}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
      <br />
      <Card>
        <Row justify={"end"}>
          <Col>
            <Button
              icon={<PlusCircleOutlined />}
              onClick={() => {
                setIsModalAddUserOpen(true);
              }}
            >
              Thêm
            </Button>
          </Col>
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
              title: "Username",
              key: "username",
              dataIndex: "username",
            },
            {
              title: "Name",
              key: "name",
              dataIndex: "name",
            },
            {
              title: "Role",
              key: "role",
              dataIndex: "role",
            },
            {
              key: "isActive",
              dataIndex: "isActive",
              render: (value: boolean) => {
                if (value) {
                  return (
                    <Tag color="green" icon={<CheckCircleFilled />}>
                      Active
                    </Tag>
                  );
                }
                return (
                  <Tag color="red" icon={<DeleteFilled />}>
                    Delete
                  </Tag>
                );
              },
            },
            {
              render: (_, record) => {
                return (
                  <Space>
                    <Button
                      icon={<EditOutlined />}
                      onClick={() => {
                        handleBtnEditUserClick(record);
                      }}
                    />
                    <Popconfirm
                      title={`Xóa user: ${record.name}`}
                      onConfirm={() => {
                        handleDeleteConfirm(record);
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
      <Modal
        title="Thêm user"
        open={isModalAddUserOpen}
        onCancel={() => {
          setIsModalAddUserOpen(false);
        }}
        footer={false}
      >
        <Form
          layout={"vertical"}
          onFinish={handleAddUserFormSubmit}
          form={createUserForm}
        >
          <Form.Item
            label={"Username"}
            name={"username"}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={"Password"}
            name={"password"}
            rules={[{ required: true }]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item label={"Name"} name={"name"} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label={"Role"} name={"role"} rules={[{ required: true }]}>
            <Select
              options={[
                {
                  value: "USER",
                  label: "USER",
                },
                {
                  value: "ADMIN",
                  label: "ADMIN",
                },
              ]}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Tạo
            </Button>
          </Form.Item>
        </Form>
        <hr />
        <br />
        <Button
          onClick={() => {
            // handleCreateTestUser();
          }}
        >
          Test User
        </Button>
      </Modal>
      <Modal
        title={`Cập nhật thông tin user: ${edittingUser?.name} _ ID: ${edittingUser?.id}`}
        open={isModalUpdateUserOpen}
        onCancel={() => {
          setIsModalUpdateUserOpen(false);
          updateUserForm.resetFields();
          setEdittingUser(null);
        }}
        footer={false}
      >
        <Form
          onFinish={handleEditUserFormFinish}
          layout={"vertical"}
          name={"updateUser"}
          form={updateUserForm}
        >
          <Form.Item name={"id"} hidden={true}>
            <Input />
          </Form.Item>
          <Form.Item
            label={"Username"}
            name={"username"}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label={"Name"} name={"name"} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label={"Password"} name={"password"}>
            <Input.Password autoComplete="false" />
          </Form.Item>
          <Form.Item name={"role"} label={"Role"}>
            <Select
              options={[
                {
                  value: "USER",
                  label: "USER",
                },
                {
                  value: "ADMIN",
                  label: "ADMIN",
                },
                {
                  value: "SA",
                  label: "SA",
                },
              ]}
            />
          </Form.Item>
          <Form.Item label={"Active"} name={"isActive"} valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Lưu
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
