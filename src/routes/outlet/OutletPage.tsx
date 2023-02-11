import {
  CheckCircleFilled,
  DeleteFilled,
  EditOutlined,
  PlusCircleOutlined,
  SearchOutlined,
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
} from "antd";
import { useEffect, useState } from "react";
import { useApp } from "../../App";
import { CURD, DistrictInterface, ProvinceInterface } from "../../helper";

export interface OutletInterface {
  id: number;
  name: string;
  code: string;
  address?: string;
  province?: {
    id: number;
    name: string;
  };
  district?: {
    id: number;
    name: string;
  };
}
interface Filter {
  name: string | null;
  code: string | null;
  take: number;
  skip: number;
}
export function OutletPage() {
  const app = useApp();

  const [filter, setFilter] = useState<Filter>({
    code: null,
    name: null,
    take: 10,
    skip: 0,
  });
  const [isLoadingData, setIsLoadingData] = useState<boolean>();
  const [data, setData] = useState<OutletInterface[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [isModalAddOutletOpen, setIsModalAddOutletOpen] =
    useState<boolean>(false);
  const [modalAddOrUpdateOutletTitle, setModalAddOrUpdateOutletTitle] =
    useState<string>();
  const [formAction, setFormAction] = useState<CURD | null>(null);
  const [provinces, setProvinces] = useState<ProvinceInterface[]>([]);
  const [districts, setDistricts] = useState<DistrictInterface[]>([]);

  const [addOrUpdateOutletForm] = Form.useForm();

  const handleSearch = () => {};
  const getData = async (filter: Filter) => {
    setIsLoadingData(true);
    const result = await app.axiosGet<
      { entities: OutletInterface[]; count: number },
      Filter
    >("/outlets", filter);
    if (!Array.isArray(result) && result !== undefined) {
      const { entities, count } = result;
      setData(entities);
      setTotal(count);
    }
    setIsLoadingData(false);
  };
  const handleBtnEditOutletClick = ({}) => {};
  const handleBtnDeleteConfirm = ({}) => {};
  const handleAddOutletFormSubmit = async () => {
    await addOrUpdateOutletForm.validateFields();
    switch (formAction) {
      case CURD.CREATE:
        break;
      case CURD.UPDATE:
        break;
      default:
    }
  };
  const getProvince = async () => {
    const result = await app.axiosGet<ProvinceInterface[], {}>(
      "/location/province",
      {}
    );
    if (Array.isArray(result)) {
      setProvinces(result as ProvinceInterface[]);
    }
  };
  const handleSelectProvinceChange = async (value: number) => {
    const districts = await app.axiosGet<DistrictInterface[], {}>(
      "/location/district/" + value,
      {}
    );
    if (Array.isArray(districts)) {
      setDistricts(districts as DistrictInterface[]);
    }
  };
  const handleSelectProvinceSelect = () => {
    addOrUpdateOutletForm.setFieldsValue({
      districtId: undefined,
    });
  };

  useEffect(() => {
    getData(filter);
    getProvince();
  }, []);
  return (
    <>
      <Card css={{ padding: "1rem 1rem 0rem 1rem" }}>
        <Form
          layout={"vertical"}
          onFinish={handleSearch}
          initialValues={filter}
        >
          <Row gutter={[8, 8]}>
            <Col>
              <Form.Item label={"Name"} name={"name"}>
                <Input />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item label={"Outlet_ID"} name={"code"}>
                <Input />
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
      <Card css={{ padding: "1rem" }}>
        <Row justify={"end"}>
          <Col>
            <Button
              icon={<PlusCircleOutlined />}
              onClick={() => {
                setIsModalAddOutletOpen(true);
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
              title: "Outlet_ID",
              key: "code",
              dataIndex: "code",
            },
            {
              title: "Outlet",
              key: "name",
              dataIndex: "name",
            },
            {
              title: "Địa chỉ",
              key: "address",
              dataIndex: "address",
            },
            {
              title: "Quận/Huyện",
              key: "district",
              dataIndex: "district",
              render: (_, record) => {
                return record?.district?.name;
              },
            },
            {
              title: "Tỉnh/Thành phố",
              key: "province",
              dataIndex: "province",
              render: (_, record) => {
                return record?.province?.name;
              },
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
                        handleBtnEditOutletClick(record);
                      }}
                    />
                    <Popconfirm
                      title={`Xóa user: ${record.name}`}
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
      <Modal
        title="Thêm Outlet"
        open={isModalAddOutletOpen}
        onCancel={() => {
          setIsModalAddOutletOpen(false);
        }}
        footer={false}
      >
        <Form
          layout={"vertical"}
          onFinish={handleAddOutletFormSubmit}
          form={addOrUpdateOutletForm}
        >
          <Form.Item
            label={"Outlet_ID"}
            name={"code"}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={"Outlet"}
            name={"outlet"}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={"Địa chỉ"}
            name={"address"}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={"Tỉnh/Thành phố"}
            name={"provinceId"}
            rules={[{ required: true }]}
          >
            <Select
              showSearch={true}
              allowClear={true}
              onChange={handleSelectProvinceChange}
              onSelect={handleSelectProvinceSelect}
              filterOption={(input, option) =>
                (option!.label as unknown as string)
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={provinces.map((province) => {
                return { label: province.name, value: province.id };
              })}
            />
          </Form.Item>
          <Form.Item
            label={"Quận/Huyện"}
            name={"districtId"}
            rules={[{ required: true }]}
          >
            <Select
              options={districts.map((district) => {
                return { label: district.name, value: district.id };
              })}
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Tạo
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
