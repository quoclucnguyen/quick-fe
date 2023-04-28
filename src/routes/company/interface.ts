export interface CompanyInterface {
  id: number;
  name: string;
  code: string;
}
export interface Filter {
  take: number;
  skip: number;
  name: string | null;
  code: string | null;
}
