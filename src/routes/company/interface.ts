export interface CompanyInterface {
  id: number;
  name: string;
  code: string;
}
interface Filter {
  take: number;
  skip: number;
  name: string | null;
  code: string | null;
}
