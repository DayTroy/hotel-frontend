import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class GuestsForms {
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
      birthdate: new FormControl(null, [Validators.required]),
      birthplace: new FormControl('', [Validators.required]),
    });
  }
}
