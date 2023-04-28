export interface BookInterface {
  id: number;
  name: string;
  code: string;
  address: string;
}
export interface Filter {
  take: number;
  skip: number;
  name: string | null;
  code: string | null;
  address: string | null;
}
