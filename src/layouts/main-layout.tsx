import {
  LogoutOutlined,
  UserOutlined
} from "@ant-design/icons";
import {Button, Col, Layout, Menu, Modal, Row} from "antd";
import {useEffect, useState} from "react";
import {Outlet, useLocation, useNavigate} from "react-router-dom";
import {useAuth} from "../App";
import {removeUserLogin} from "../helper";
import "./../assets/css/main-layout.css";

const {Header, Sider, Content} = Layout;



const MainLayout = () => {
  const [modal, contextHolder] = Modal.useModal();
  const location = useLocation();
  const [collapsed, _setCollapsed] = useState(true);
  const navigate = useNavigate();
  const {pathname} = location;
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
    <Layout style={{minHeight: "100vh"}}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="logo" />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={[pathname]}
          onClick={({key}) => setRouteActive(key)}
          items={[
            {
              key: "/user",
              icon: <UserOutlined />,
              label: "User",
            }
          ]}
        />
      </Sider>
      <Layout className="site-layout">
        <Header className="site-layout-background" style={{padding: 0}}>
          <Row justify={"end"}>
            <Col>
              <Button
                type={"link"}
                style={{color: "#000"}}
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
