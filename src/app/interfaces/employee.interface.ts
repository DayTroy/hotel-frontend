import { JobPosition } from "./job-position.interface";

export interface Employee {
  employeeId: string;
  firstName: string;
  lastName: string;
  middleName: string;
  phoneNumber: string;
  passportNumber: string;
  passportSeries: string;
  birthdate: Date;
  email: string;
  dateOfEmployment: Date;
  jobPosition: JobPosition;
}
