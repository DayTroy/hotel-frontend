import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ILoginForm } from './models/LoginForm.interface';
import { IRegistrationForm } from './models/RegistrationForm.interface';

@Injectable({ providedIn: 'root' })
export class AuthFormService {
  constructor() {}

  createLoginForm(): FormGroup {
    const form = new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required),
    });
    return form;
  }

  createRegistrationForm(): FormGroup {
    const form = new FormGroup({
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      email: new FormControl('', Validators.email),
      password: new FormControl('', Validators.required),
      passwordConfirm: new FormControl('', Validators.required),
      phoneNumber: new FormControl('', Validators.required),
      personalDataAgreement: new FormControl(false, Validators.requiredTrue),
      registrationAgreement: new FormControl(false, Validators.requiredTrue),
    });
    return form;
  }
}
