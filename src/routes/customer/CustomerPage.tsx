import { SearchOutlined } from "@ant-design/icons";
import { Card } from "@nextui-org/react";
import {
  Button,
  Col,
  DatePicker,
  Form,
  Image,
  Input,
  Row,
  Select,
  Space,
  Table,
} from "antd";
import { useEffect, useState } from "react";
import { useApp } from "../../App";
import { ProvinceInterface } from "../../helper";
import { OutletInterface } from "../outlet/OutletPage";
import dayjs from "dayjs";

interface Filter {
  take: number;
  skip: number;
  startDate?: number;
  endDate?: number;
  date?: [dayjs.Dayjs, dayjs.Dayjs];
}

interface CustomerInterface {
  id: number;
  name: string;
  phone: string;
  otp: string;
  customerImages: {
    image: {
      id: number;
      path: string;
    };
  }[];
  outlet: OutletInterface;
  createdByUser: {
    id: number;
    name: string;
  };
  createdAt: string;
  createdAtTimestamp: number;
}

export default function CustomerPage() {
  const app = useApp();
  const { RangePicker } = DatePicker;

  const [filter, setFilter] = useState<Filter>({ skip: 0, take: 10 });
  const [provinces, setProvinces] = useState<ProvinceInterface[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);
  const [data, setData] = useState<CustomerInterface[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const handleSearch = (values: {
    code?: string;
    name?: string;
    phone?: string;
    otp?: string;
    provinceId?: number;
    date?: [dayjs.Dayjs, dayjs.Dayjs];
  }) => {
    const filterSearch: Filter = {
      ...filter,
      ...values,
      take: 10,
      skip: 0,
    };
    if (values.date) {
      const [startDate, endDate] = values.date;
      filterSearch.startDate = startDate.unix();
      filterSearch.endDate = endDate.unix();
      delete filterSearch.date;
    }

    setFilter(filterSearch);
    getData(filterSearch);
  };
  const getData = (filter: Filter) => {
    app
      .axiosGet<{ entities: CustomerInterface[]; count: number }, Filter>(
        "/customers",
        filter
      )
      .then((result) => {
        if (!Array.isArray(result) && result !== undefined) {
          const { entities, count } = result;
          setData(entities);
          setTotal(count);
        }
        setIsLoadingData(false);
      });
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
                <Form.Item label={"Họ và tên"} name={"name"}>
                  <Input />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item label={"Số điện thoại"} name={"phone"}>
                  <Input />
                </Form.Item>
              </Col>
              <Col>
                <Form.Item label={"OTP"} name={"otp"}>
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
                <Form.Item name={"date"} label={"Ngày"}>
                  <RangePicker />
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
              title: "Họ và tên",
              key: "name",
              dataIndex: "name",
            },
            {
              title: "Số điện thoại",
              key: "phone",
              dataIndex: "phone",
            },
            {
              title: "OTP",
              key: "otp",
              dataIndex: "otp",
            },
            {
              title: "Hình ảnh",
              render: (_, record) => {
                return (
                  <Space>
                    {record.customerImages.map((customerImage) => (
                      <Image
                        key={customerImage.image.id}
                        src={customerImage?.image?.path}
                        width={100}
                      />
                    ))}
                  </Space>
                );
              },
            },
            {
              title: "Thời gian",
              key: "createdAt",
              dataIndex: "createdAt",
              render: (_, record) => {
                return dayjs(record?.createdAt).format("HH:mm:ss DD/MM/YYYY");
              },
            },
            {
              title: "Outlet_ID",
              key: "code",
              dataIndex: "code",
              render: (_, record) => {
                return record?.outlet?.code;
              },
            },
            {
              title: "Outlet",
              key: "name",
              dataIndex: "name",
              render: (_, record) => {
                return record?.outlet?.name;
              },
            },
            {
              title: "Địa chỉ",
              key: "address",
              dataIndex: "address",
              render: (_, record) => {
                return record?.outlet?.address;
              },
            },
            {
              title: "Quận/Huyện",
              key: "district",
              dataIndex: "district",
              render: (_, record) => {
                return record?.outlet?.district?.name;
              },
            },
            {
              title: "Tỉnh/Thành phố",
              key: "province",
              dataIndex: "province",
              render: (_, record) => {
                return record?.outlet?.province?.name;
              },
            },
            {
              title: "Người tạo",
              key: "createdByUser",
              dataIndex: "createdByUser",
              render: (_, record) => {
                return record?.createdByUser?.name;
              },
            },
          ]}
        />
      </Card>
    </>
  );
}
