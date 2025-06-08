import { Injectable } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { JobPosition } from "../../../interfaces/job-position.interface";

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
      birthdate: FormControl<Date | null>
      email: FormControl<string>;
      dateOfEmployment: FormControl<Date | null>;
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
        validators: [Validators.required, ],
      }),
      birthdate: new FormControl<Date | null>(null, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      email: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      dateOfEmployment: new FormControl<Date | null>(null, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      jobPosition: new FormControl({
        jobPositionId: '',
        jobTitle: '',
        jobSalary: 0,
      } as JobPosition, {
        nonNullable: true,
        validators: [Validators.required],
      }),
    });
  }
}
