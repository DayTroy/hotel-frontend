import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Room } from '../references/rooms/rooms.component';
import { Employee } from '../references/employees/employees.component';

@Injectable({ providedIn: 'root' })
export class CleaningForms {
  constructor(private readonly httpClient: HttpClient) { }

  createCleaningTaskForm(): any {
    return new FormGroup<{
      cleaningTaskId: FormControl<string>;
      description: FormControl<string>;
      cleaningType: FormControl<string>;
      scheduledDate: FormControl<Date | null>;
      employee: FormControl<Employee>;
      room: FormControl<Room>;
    }>({
        cleaningTaskId: new FormControl('', {
        nonNullable: true,
      }),
      description: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      cleaningType: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      scheduledDate: new FormControl(null, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      employee: new FormControl({
        employeeId: '',
        firstName: '',
        lastName: '',
        middleName: '',
      } as Employee, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      room: new FormControl({
        roomId: '',
      } as Room, {
        nonNullable: true,
        validators: [Validators.required],
      }),
    });
  }
}
