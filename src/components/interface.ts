export const enum PropertyType {
  "number" = "number",
  "text" = "text",
  "password" = "password",
  "boolean" = "boolean",
  "select" = "select",
}
export interface FormBuilderPropertyInterface {
  name: string;
  label: string;
  type: PropertyType;
  required?: boolean;
  initValue?: any;
  selectOptions?: { value: string; label: string }[];
}

export enum FormBuilderLayout {
  "vertical" = "vertical",
}
