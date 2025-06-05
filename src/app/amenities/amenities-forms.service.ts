import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { FormControl, FormGroup, Validators } from "@angular/forms";

@Injectable({ providedIn: "root" })
export class AmenitiesForms {
  constructor(
    private readonly httpClient: HttpClient 
  ) {}

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
        })
      });
  }
}