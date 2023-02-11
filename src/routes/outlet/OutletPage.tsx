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
  address: string | null;
  provinceId: number | null;
  take: number;
  skip: number;
}

export function OutletPage() {
  const app = useApp();

  const [filter, setFilter] = useState<Filter>({
    code: null,
    name: null,
    address: null,
    provinceId: null,
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
  const [modalTitle, setModalTitle] = useState<string>('');

  const [addOrUpdateOutletForm] = Form.useForm();


  const handleSearch = (values: { code?: string; name?: string; address?: string; provinceId?: number }) => {
    const filterSearch: Filter = {
      ...filter,
      ...values,
    }
    getData(filterSearch);
  };

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

  const handleBtnEditOutletClick = (record: OutletInterface) => {
    setFormAction(CURD.UPDATE);
    setIsModalAddOutletOpen(true);
    setModalTitle(`Cập nhật thông tin outlet: ${record.code} - ${record.name}`)
    addOrUpdateOutletForm.setFieldsValue(record);
    handleSelectProvinceChange(record.province?.id as number);
  };
  const handleBtnDeleteConfirm = (record: OutletInterface) => {
    app.axiosDelete(`/outlets/${record.id}`).then(result => {
      app.showAlert({
        type: 'success',
        message: 'Xóa thành công.'
      });
      getData(filter);
    })
  };

  const handleAddOutletFormSubmit = async () => {
    await addOrUpdateOutletForm.validateFields();
    switch (formAction) {
      case CURD.CREATE:
        app.axiosPost('/outlets', addOrUpdateOutletForm.getFieldsValue()).then(result => {
          app.showAlert({
            type: 'success',
            message: 'Thêm outlet thành công',
          })
          addOrUpdateOutletForm.resetFields();
          setIsModalAddOutletOpen(false);
          setModalTitle('');
          getData(filter);
        });
        break;
      case CURD.UPDATE:
        app.axiosPatch(`/outlets/${addOrUpdateOutletForm.getFieldValue('id')}`, addOrUpdateOutletForm.getFieldsValue()).then(result => {
          app.showAlert({
            type: 'success',
            message: 'Cập nhập thông tin outlet thành công',
          })
          addOrUpdateOutletForm.resetFields();
          setIsModalAddOutletOpen(false);
          setModalTitle('');
          getData(filter);
        })
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
          <Row>
            <Space>
              <Col>
                <Form.Item label={"Outlet_ID"} name={"code"}>
                  <Input />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item label={"Outlet"} name={"name"}>
                  <Input />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item label={"Địa chỉ"} name={"address"}>
                  <Input />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item
                  label={"Tỉnh/Thành phố"}
                  name={"provinceId"}
                  style={{ width: "170px" }}
                >
                  <Select
                    showSearch={true}
                    allowClear={true}
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
            </Space>
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
                setFormAction(CURD.CREATE);
                setModalTitle('Thêm outlet');
                addOrUpdateOutletForm.resetFields();
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
                      title={`Xóa outlet: ${record.code} - ${record.name}`}
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
        title={modalTitle}
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
          <Form.Item name={'id'} hidden={true}></Form.Item>
          <Form.Item
            label={"Outlet_ID"}
            name={"code"}
            rules={[{ required: true }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label={"Outlet"}
            name={"name"}
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
              showSearch={true}
              allowClear={true}
              filterOption={(input, option) =>
                (option!.label as unknown as string)
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={districts.map((district) => {
                return { label: district.name, value: district.id };
              })}
            />
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
