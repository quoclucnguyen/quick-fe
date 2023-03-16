import { Form, Input, Button, Select, Switch } from "antd";
import {
  FormBuilderLayout,
  FormBuilderPropertyInterface,
  PropertyType,
} from "./interface";

const FormBuilder = (props: {
  properties: FormBuilderPropertyInterface[];
  layout?: "vertical";
  isHaveSubmitBtn?: boolean;
  form?: any;
  btnSubmitText?: string;
  onFinishHandle?: (values: any) => void;
}) => {
  const {
    properties,
    layout,
    isHaveSubmitBtn,
    form,
    btnSubmitText,
    onFinishHandle,
  } = props;
  return (
    <Form
      name={"ff"}
      layout={layout ?? "vertical"}
      onFinish={(values) => {
        console.log(values);
      }}
      form={form}

    >
      {properties.map((property) => {
        return (
          <Form.Item
            label={property.label}
            name={property.name}
            // rules={[{ required: property.required }]}
            key={property.name}
            // initialValue={property.initValue}
          >
            <InputBuilder property={property} />
          </Form.Item>
        );
      })}
      {isHaveSubmitBtn && (
        <Form.Item>
          <Button type="primary" htmlType="submit">
            {btnSubmitText ?? "Submit"}
          </Button>
        </Form.Item>
      )}
    </Form>
  );
};

const InputBuilder = (props: { property: FormBuilderPropertyInterface }) => {
  const { property } = props;
  switch (property.type) {
    case PropertyType.text:
      return <Input type="text" />;
    case PropertyType.password:
      return <Input.Password />;
    case PropertyType.number:
      return <Input type="number" />;
    case PropertyType.select:
      return (
        <Select
          defaultValue={property.initValue}
          options={property.selectOptions}
        />
      );
    case PropertyType.boolean:
      return <Switch defaultChecked={property.initValue ? true : false} />;
    default:
      return <Input type="text" />;
  }
};

export default FormBuilder;
