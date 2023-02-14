import {
  ExportOutlined,
  FileExcelFilled,
  FileExcelTwoTone,
  SearchOutlined,
} from "@ant-design/icons";
import { Card } from "@nextui-org/react";
import {
  Button,
  Col,
  DatePicker,
  Form,
  Image,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Table,
} from "antd";
import { useEffect, useState } from "react";
import { useApp } from "../../App";
import { downloadFile, loadData, ProvinceInterface } from "../../helper";
import { OutletInterface } from "../outlet/OutletPage";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import locale from "antd/es/date-picker/locale/vi_VN";

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
  const [isBtnExcelLoading, setIsBtnExcelLoading] = useState<boolean>(false);
  const [modal, contextHolder] = Modal.useModal();
  const [searchForm] = Form.useForm();

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
      take: pageSize,
      skip: 0,
    };

    if (values.date !== undefined && values.date !== null) {
      const [startDate, endDate] = values.date;
      filterSearch.startDate = startDate.unix();
      filterSearch.endDate = endDate.unix();
      delete filterSearch.date;
    } else {
      delete filterSearch.startDate;
      delete filterSearch.endDate;
    }
    setCurrentPage(1);
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

  const handleBtnExceClick = () => {
    setIsBtnExcelLoading(true);
    modal.confirm({
      title: "Xác nhận",
      content: "Bạn muốn xuất danh sách theo tiêu chí đã chọn?",
      okText: "Xác nhận",
      cancelText: "Hủy",
      onCancel: () => setIsBtnExcelLoading(false),
      onOk: async () => {
        const value = searchForm.getFieldsValue();
        const result = await app.axiosGet<CustomerInterface[], Filter>(
          "/customers",
          {
            ...value,
            take: 0,
            skip: 0,
          }
        );
        if (!Array.isArray(result) && result !== undefined) {
          const { entities, count } = result;
          const data = Array.from(entities, (customer: CustomerInterface) => {
            return Object.values({
              name: customer?.createdByUser?.name,
              code: customer?.outlet?.code,
              outletName: customer?.outlet?.name,
              address: customer?.outlet?.address,
              districtName: customer?.outlet?.district?.name,
              provinceName: customer?.outlet?.province?.name,
              time: dayjs(customer.createdAtTimestamp).format("DD/MM/YYYY"),
              sessionId:
                customer?.createdByUser?.name +
                "-" +
                customer?.outlet?.code +
                dayjs(customer.createdAtTimestamp).format("DDMMYYYY"),
              customerName: customer.name,
              phone: customer.phone,
              otp: customer.otp,
              images: customer?.customerImages
                .map((customerImage) => customerImage.image?.path)
                .join("\n"),
            });
          });
          let wb = await loadData(
            "/TEMP_EXPORT.xlsx?v=" + new Date().getTime()
          );
          let worksheet = wb.getWorksheet("data");
          const BEGIN_INDEX_OF_FILE = 2;
          worksheet.insertRows(BEGIN_INDEX_OF_FILE + 1, data, "i+");
          worksheet.spliceRows(BEGIN_INDEX_OF_FILE, 1);
          await downloadFile(wb, "DS_" + new Date().getTime() + ".xlsx");
        }

        setIsBtnExcelLoading(false);
      },
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
          form={searchForm}
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
                  <RangePicker format={"DD/MM/YYYY"} locale={locale} />
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
              <Col>
                <Form.Item label={" "}>
                  <Button
                    htmlType={"button"}
                    icon={<FileExcelTwoTone />}
                    loading={isBtnExcelLoading}
                    onClick={handleBtnExceClick}
                  >
                    Xuất Excel
                  </Button>
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
      {contextHolder}
    </>
  );
}
