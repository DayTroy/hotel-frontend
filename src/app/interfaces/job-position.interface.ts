import { Department } from "./department.interface";

export interface JobPosition {
  jobPositionId: string;
  jobTitle: string;
  jobSalary: number;
  department: Department;
}
