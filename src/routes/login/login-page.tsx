import { Card } from "@nextui-org/react";
import { Button, Form, Input } from "antd";
import { GoogleOutlined } from "@ant-design/icons";
import { useApp, useAuth, UserLogin } from "../../App";
import { useNavigate } from "react-router-dom";
import localForage from "localforage";
import jwt_decode from "jwt-decode";
import { AxiosError } from "axios";

export default function LoginPage() {
  const appAuth = useAuth();
  const app = useApp();
  const handleFormFinish = (values: { username: string; password: string }) => {
    const axios = app.axiosInsance;
    axios
      ?.post<{ accessToken: string }>("/auth/login", {
        ...values,
        isAdminWeb: true,
      })
      .then((res) => {
        const user: UserLogin = jwt_decode(res.data.accessToken);
        user.accessToken = res.data.accessToken;
        appAuth.signin(user);
      })
      .catch((err: AxiosError) => {
        const data = err.response?.data as unknown as any;
        app.showAlert({
          type: "error",
          title: err.code,
          message: data ? data.message : err.message,
        });
      });
  };
  return (
    <Card css={{ padding: "1rem" }}>
      <h6>{import.meta.env.VITE_APP_NAME}</h6>
      <Form layout={"vertical"} onFinish={handleFormFinish}>
        <Form.Item
          name={"username"}
          label={"Username"}
          rules={[{ required: true }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name={"password"}
          label={"Password"}
          rules={[{ required: true }]}
        >
          <Input.Password />
        </Form.Item>
        <Form.Item>
          <Button htmlType={"submit"}>Login</Button>
        </Form.Item>
      </Form>
      <p></p>
    </Card>
  );
}
