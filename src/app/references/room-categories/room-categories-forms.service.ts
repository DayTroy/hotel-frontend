import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { FormControl, FormGroup, Validators } from "@angular/forms";

@Injectable({ providedIn: "root" })
export class RoomCategoriesForms {
  constructor(
    private readonly httpClient: HttpClient 
  ) {}

  createRoomCategoryForm(): any {
    return new FormGroup<{
        roomCategoryId: FormControl<string>;
        title: FormControl<string>;
        pricePerNight: FormControl<number>;
        capacity: FormControl<number>;
        description: FormControl<string>;
      }>({
        roomCategoryId: new FormControl('', {
          nonNullable: true,
          validators: [Validators.required],
        }),
        title: new FormControl('', {
          nonNullable: true,
          validators: [Validators.required],
        }),
        pricePerNight: new FormControl(0, {
          nonNullable: true,
          validators: [Validators.required, Validators.min(0)],
        }),
        capacity: new FormControl(1, {
          nonNullable: true,
          validators: [Validators.required, Validators.min(1)],
        }),
        description: new FormControl('', {
          nonNullable: true,
          validators: [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(100),
          ],
        }),
      });
  }

  protected readonly roomCategoryForm = new FormGroup<{
    roomCategoryId: FormControl<string>;
    title: FormControl<string>;
    pricePerNight: FormControl<number>;
    capacity: FormControl<number>;
    description: FormControl<string>;
  }>({
    roomCategoryId: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    pricePerNight: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0)],
    }),
    capacity: new FormControl(1, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1)],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100),
      ],
    }),
  });
}