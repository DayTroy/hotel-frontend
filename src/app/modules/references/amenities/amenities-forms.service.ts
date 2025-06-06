import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class AmenitiesForms {
  constructor(private readonly httpClient: HttpClient) {}

  createAmenityForm(): any {
    return new FormGroup<{
      amenityId: FormControl<string>;
      amenityTitle: FormControl<string>;
      amenityPrice: FormControl<number>;
    }>({
      amenityId: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      amenityTitle: new FormControl('', {
        nonNullable: true,
        validators: [Validators.required],
      }),
      amenityPrice: new FormControl(0, {
        nonNullable: true,
        validators: [Validators.required, Validators.min(0)],
      }),
    });
  }

  createProvidedAmenityForm(): any {
    return new FormGroup<{
      amenity: FormControl<any>;
      amenityQuantity: FormControl<number | null>;
      amenityPrice: FormControl<string | null>;
      amenitiesTotalPrice: FormControl<number | null>;
    }>({
      amenity: new FormControl(null, [Validators.required]),
      amenityQuantity: new FormControl(0, [
        Validators.required,
        Validators.min(1),
      ]),
      amenityPrice: new FormControl({ value: null, disabled: true }, [
        Validators.required,
        Validators.min(0),
      ]),
      amenitiesTotalPrice: new FormControl({ value: null, disabled: true }),
    });
  }
}
