import { Employee } from "./employee.interface";

export interface LoginResponse {
  token: string;
  employee: Employee;
}
