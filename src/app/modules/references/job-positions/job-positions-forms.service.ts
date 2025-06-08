import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Department } from '../../../interfaces/department.interface';

@Injectable({ providedIn: 'root' })
export class JobPositionsForms {
  constructor(private readonly httpClient: HttpClient) {}

  createJobPositionForm(): any {
    return new FormGroup<{
      departmentId: FormControl<string>;
      jobPositionId: FormControl<string>;
      jobTitle: FormControl<string>;
      jobSalary: FormControl<number>;
      department: FormControl<Department>;
    }>({
      departmentId: new FormControl('', {
        nonNullable: true,
      }),
      jobPositionId: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      jobTitle: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      jobSalary: new FormControl(0, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      department: new FormControl({
        departmentId: '',
        departmentTitle: '',
        departmentCabinet: '',
        workingHours: ''
      } as Department, {
        nonNullable: true,
        validators: [Validators.required],
      }),
    });
  }
}
