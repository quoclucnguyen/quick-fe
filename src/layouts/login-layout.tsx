import {Button, Form, Input} from "antd";
import './../assets/css/login-layout.css';
import {Card} from "@nextui-org/react";
import {GoogleOutlined} from "@ant-design/icons";
import {Outlet} from "react-router-dom";

export default function LoginLayout() {
    return <div className={'login-container'}>
        <div className={'login-container-inner'}>
            <Outlet/>
        </div>
    </div>
}