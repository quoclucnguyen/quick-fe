// protected region Add additional imports here on begin
import React, { useEffect, useState } from "react";
import {
  DashboardOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  OrderedListOutlined,
  ShopOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
  RightSquareOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Button, Row, Col, Modal } from "antd";
import "./../assets/css/main-layout.css";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { removeUserLogin } from "../helper";
import { useAuth } from "../App";

const { Header, Sider, Content } = Layout;
// protected region Add additional imports here end

// protected region Add other code in here on begin
const MainLayout = () => {
  const [modal, contextHolder] = Modal.useModal();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(true);
  const navigate = useNavigate();
  const { pathname } = location;
  const setRouteActive = (value: string) => {
    navigate(value);
  };
  const user = useAuth().user;
  const handleLogoutBtnClick = () => {
    modal.confirm({
      title: "Bạn có chắc chắn muốn đăng xuất?",
      onOk: async () => {
        await removeUserLogin();
        navigate("/login");
      },
      okText: "Đăng xuất",
      cancelText: "Hủy",
    });
  };
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="logo" />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={[pathname]}
          onClick={({ key }) => setRouteActive(key)}
          items={[
            // {
            //   key: "/",
            //   icon: <DashboardOutlined />,
            //   label: "nav 1",
            // },
            {
              key: "/user",
              icon: <UserOutlined />,
              label: "User",
            },
            // protected region Add other code in here end

            {
              key: "/book",
              icon: <RightSquareOutlined />,
              label: "Books",
            },
            {
              key: "/author",
              icon: <RightSquareOutlined />,
              label: "Authors",
            },
            {
              key: "/company",
              icon: <RightSquareOutlined />,
              label: "Companies",
            },

// protected region Add end code in here on begin
          ]}
        />
      </Sider>
      <Layout className="site-layout">
        <Header className="site-layout-background" style={{ padding: 0 }}>
          <Row justify={"end"}>
            <Col>
              <Button
                type={"link"}
                style={{ color: "#000" }}
                onClick={handleLogoutBtnClick}
                icon={<LogoutOutlined />}
              >
                {user?.name} (Đăng xuất)
              </Button>
            </Col>
          </Row>
        </Header>
        <Content
          className="site-layout-background"
          style={{
            margin: "1rem",
            padding: "0rem",
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
      {contextHolder}
    </Layout>
  );
};

export default MainLayout;
// protected region Add end code in here end