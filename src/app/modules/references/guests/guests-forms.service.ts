import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class GuestsForms {
  constructor(private readonly httpClient: HttpClient) {}

  createGuestForm(): FormGroup {
    return new FormGroup({
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      middleName: new FormControl(''),
      email: new FormControl('', [Validators.required]),
      phoneNumber: new FormControl('', [Validators.required]),
      gender: new FormControl('', [Validators.required]),
      citizenship: new FormControl('', [Validators.required]),
      passportNumber: new FormControl('', [Validators.required]),
      passportSeries: new FormControl('', [Validators.required]),
      birthdate: new FormControl('', [Validators.required]),
      birthplace: new FormControl('', [Validators.required]),
    });
  }
}
