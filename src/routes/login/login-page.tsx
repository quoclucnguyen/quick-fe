
import { Button, Form, Input, Modal, Row } from "antd";
import FormItem from "antd/lib/form/FormItem";
import { Content } from "antd/lib/layout/layout";
import axios from "axios";
import jwt_decode from "jwt-decode";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { UserLogin, useAuth } from "../../App";
import { getUserLogin } from "../../helper";

interface LoginResult {
  accessToken: string;
  username: string;
  name: string;
  role: string;
  id: number;
}

function LoginPage() {
  /**
   * Begin const
   */
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [modal, contextHolder] = Modal.useModal();
  const [userLogin, setUserLogin] = useState<UserLogin | null>(null);
  /**
   *
   * End const
   */

  /**
   * Begin process
   */
  const onFinish = async (values: any) => {
    axios
      .post<LoginResult>(import.meta.env.VITE_API_URL + "/auth/login", {
        ...values,
        deviceId: localStorage.getItem("tokenFcm") || "",
        type: "WEB",
      })
      .then((request) => {
        if (request.status === 201 && request?.data?.accessToken) {
          const decoded = jwt_decode<UserLogin>(request.data.accessToken);
          const userLogin: UserLogin = {
            username: decoded.username,
            name: decoded.name,
            token: request.data.accessToken,
            role: decoded.role,
            id: decoded.id,
          };
          auth.signin(userLogin, () => {
            navigate("/", { replace: true });
          });
        }
      })
      .catch((error) => {
        modal.error({
          title: "Đăng nhập thất bại",
          content: "Tài khoản hoặc mật khẩu không đúng",
        });
      });
  };
  /**
   * End process
   */

  const getUserLoginEffect = async () => {
    const userLogin = await getUserLogin();
    setUserLogin(userLogin);
  };
  useEffect(() => {
    getUserLoginEffect();
  }, []);

  useEffect(() => {
    if (userLogin) {
      auth.signin(userLogin, () => {
        navigate("/", { replace: true });
      });
    }
  }, [userLogin]);
  



  return (
    <div style={{ backgroundImage: `url('/bg-login.png')` }}>
      <Row
        align="middle"
        justify="center"
        className="login-row"
        style={{ minHeight: "100vh", margin: "0 auto" }}
      >
        <Content
          style={{
            backgroundColor: "rgba(255,255,255,0.07)",
            padding: "20px 24px",
            minWidth: "506px",
          }}
        >
          <div
            style={{
              textAlign: "center",
            }}
          >
            <h1 style={{ color: "#fff", fontWeight: "bold", fontSize: "50px" }}>
              FIELD CHECK
            </h1>
          </div>

          <Form onFinish={onFinish} layout="vertical" autoComplete={"off"}>
            <FormItem
              label={
                <label style={{ color: "#fff", fontSize: "15px" }}>
                  Tài khoản
                </label>
              }
              name="username"
              rules={[
                {
                  required: true,
                  message: "Nhập tài khoản",
                },
              ]}
            >
              <Input
                style={{
                  height: "40px",
                }}
                type="string"
                placeholder="Username"
              />
            </FormItem>
            <FormItem
              label={
                <label style={{ color: "#fff", fontSize: "15px" }}>
                  Mật khẩu
                </label>
              }
              name="password"
              rules={[{ required: true, message: "Nhập mật khẩu" }]}
            >
              <Input.Password
                style={{
                  height: "40px",
                }}
              />
            </FormItem>
            <FormItem
              name="remember"
              valuePropName="checked"
              initialValue={true}
            >
              <Button
                htmlType="submit"
                className="mt-3"
                block={true}
                style={{
                  backgroundColor: "#3EB42D",
                  color: "#fff",
                  border: "none",
                  height: "40px",
                  fontSize: "15px",
                }}
              >
                Đăng nhập
              </Button>
            </FormItem>
          </Form>
          {contextHolder}
        </Content>
      </Row>
    </div>
  );
}

export default LoginPage;
