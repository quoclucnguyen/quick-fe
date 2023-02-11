import React, { useState } from "react";
import {
  DashboardOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UploadOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from "@ant-design/icons";
import { Layout, Menu, Button } from "antd";
import "./../assets/css/main-layout.css";
import { Outlet, useNavigate } from "react-router-dom";

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(true);
  const navigate = useNavigate();
  const { pathname } = location;
  const setRouteActive = (value: string) => {
    navigate(value);
  };
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
            {
              key: "/",
              icon: <DashboardOutlined />,
              label: "nav 1",
            },
            {
              key: "/user",
              icon: <UserOutlined />,
              label: "User",
            },
            {
              key: "/outlet",
              icon: <UserOutlined />,
              label: "Outlet",
            },
            {
              key: "/customer",
              icon: <UserOutlined />,
              label: "Customer",
            },
          ]}
        />
      </Sider>
      <Layout className="site-layout">
        <Header
          className="site-layout-background"
          style={{ padding: 0 }}
        ></Header>
        <Content
          className="site-layout-background"
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
