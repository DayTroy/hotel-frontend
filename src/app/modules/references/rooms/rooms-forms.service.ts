import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class RoomForms {
  constructor(private readonly httpClient: HttpClient) { }

  createRoomForm(): any {
    return new FormGroup<{
      roomId: FormControl<string>;
      stage: FormControl<number>;
      roomCategory: FormGroup<any>;
      pricePerNight: FormControl<number>;
      capacity: FormControl<number>;
    }>({
      roomId: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      stage: new FormControl(1, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(1)],
      }),
      roomCategory: new FormGroup({
        id: new FormControl('', {
          nonNullable: true,
        }),
        title: new FormControl('', {
          nonNullable: true,
        }),
      }),
      pricePerNight: new FormControl(
        { value: 0, disabled: true },
        {
          nonNullable: true,
        }
      ),
      capacity: new FormControl(
        { value: 0, disabled: true },
        {
          nonNullable: true,
        }
      ),
    });
  }
}
