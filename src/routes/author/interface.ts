export interface AuthorInterface {
  id: number;
  name: string;
  code: string;
  address: string;
  ageNumber: number;
  countTime: number;
}
export interface Filter {
  take: number;
  skip: number;
  name: string | null;
  code: string | null;
  address: string | null;
  ageNumber: number | null;
  countTime: number | null;
}
