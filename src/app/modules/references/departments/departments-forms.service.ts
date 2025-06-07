import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class DepartmentsForms {
  constructor(private readonly httpClient: HttpClient) {}

  createDepartmentForm(): any {
    return new FormGroup<{
      departmentId: FormControl<string>;
      departmentTitle: FormControl<string>;
      departmentCabinet: FormControl<string>;
      workingHoursStart: FormControl<string>;
      workingHoursEnd: FormControl<string>;
    }>({
        departmentId: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      departmentTitle: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      departmentCabinet: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      workingHoursStart: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      workingHoursEnd: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
    });
  }
}
