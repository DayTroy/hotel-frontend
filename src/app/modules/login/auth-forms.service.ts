import { Injectable } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class AuthFormService {
  constructor() {}

  createLoginForm(): FormGroup {
    return new FormGroup({
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', Validators.required),
    });
  }
}
