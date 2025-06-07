import { Injectable } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { JobPosition } from "../job-positions/job-positions.component";

@Injectable({ providedIn: 'root' })
export class EmployeesForms {
  createEmployeeForm(): any {
    return new FormGroup<{
      firstName: FormControl<string>;
      lastName: FormControl<string>;
      middleName: FormControl<string>;
      phoneNumber: FormControl<string>;
      passportNumber: FormControl<string>;
      passportSeries: FormControl<string>;
      birthdate: FormControl<string>;
      email: FormControl<string>;
      dateOfEmployment: FormControl<string>;
      jobPosition: FormControl<JobPosition>;
    }>({
      firstName: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      lastName: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      middleName: new FormControl('', { nonNullable: true }),
      phoneNumber: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      passportNumber: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      passportSeries: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      birthdate: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      dateOfEmployment: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      jobPosition: new FormControl({
        jobPositionId: '',
        jobTitle: '',
        jobSalary: '',
      } as JobPosition, {
        nonNullable: true,
        validators: [Validators.required],
      }),
    });
  }
}
