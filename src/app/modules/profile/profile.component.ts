import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators, FormBuilder, AbstractControl, ValidationErrors } from '@angular/forms';
import { TuiAvatar, TuiInputPassword } from '@taiga-ui/kit';
import { BehaviorSubject } from 'rxjs';
import { CommonModule } from '@angular/common';
import { TuiButton, TuiLabel, TuiTextfield } from '@taiga-ui/core';
import { AuthService } from '../../services/auth.service';
import { Employee } from '../references/employees/employees.component';
import { TuiAlertService } from '@taiga-ui/core';
import {MaskitoDirective} from '@maskito/angular';
import type {MaskitoOptions} from '@maskito/core';
import phoneMask from '../../shared/masks/phoneMask';
import { nameMask } from '../../shared/masks/nameMask';
import { ValidatorFn } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    TuiAvatar, 
    ReactiveFormsModule, 
    CommonModule,
    TuiButton,
    TuiTextfield,
    TuiLabel,
    MaskitoDirective
  ],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent implements OnInit {
  protected avatar$ = new BehaviorSubject<string>("AI");
  protected currentUser$ = new BehaviorSubject<Employee | null>(null);
  protected profileForm: FormGroup;
  readonly phoneOptions: MaskitoOptions = phoneMask;
  readonly nameOptions: MaskitoOptions = nameMask;

  constructor(
    private fb: FormBuilder,
    private readonly authService: AuthService,
    private readonly alerts: TuiAlertService
  ) {
    this.profileForm = new FormGroup({
      firstName: new FormControl({value: '', disabled: true}),
      lastName: new FormControl({value: '', disabled: true}),
      email: new FormControl({value: '', disabled: true}),
      phoneNumber: new FormControl({value: '', disabled: true}),
      currentPassword: new FormControl('', [Validators.required]),
      newPassword: new FormControl('', [
        Validators.required,
        Validators.minLength(12)
      ]),
      confirmPassword: new FormControl('', [Validators.required])
    }, { validators: [this.passwordMatchValidator] });
  }

  ngOnInit(): void {
    this.loadUserProfile();
  }

  private loadUserProfile(): void {
    this.authService.getProfile().subscribe({
      next: (profile) => {
        this.currentUser$.next(profile);
        this.avatar$.next(`${profile.firstName[0]}${profile.lastName[0]}`);
        this.profileForm.patchValue({
          firstName: profile.firstName,
          lastName: profile.lastName,
          email: profile.email,
          phoneNumber: profile.phoneNumber
        });
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.alerts
          .open('Ошибка при загрузке профиля', {
            label: 'Ошибка',
            appearance: 'negative',
            autoClose: 3000,
          })
          .subscribe();
      }
    });
  }
  
  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.alerts
        .open('Пожалуйста, заполните все обязательные поля', {
          label: 'Ошибка',
          appearance: 'negative',
          autoClose: 3000,
        })
        .subscribe();
      return;
    }

    this.authService.updateProfile(this.profileForm.value).subscribe({
      next: () => {
        this.alerts
          .open('Профиль успешно обновлен', {
            label: 'Успех',
            appearance: 'positive',
            autoClose: 3000,
          })
          .subscribe();
        this.profileForm.patchValue({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
        this.profileForm.get('currentPassword')?.markAsUntouched();
        this.profileForm.get('newPassword')?.markAsUntouched();
        this.profileForm.get('confirmPassword')?.markAsUntouched();
      },
      error: (error) => {
        this.alerts
          .open(error.error.message, {
            label: 'Ошибка',
            appearance: 'negative',
            autoClose: 3000,
          })
          .subscribe();
      }
    });
  }

  passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const form = control as FormGroup;
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  };

  getPasswordErrorMessage(): string {
    const control = this.profileForm.get('newPassword');
    if (control?.hasError('required')) {
      return 'Пароль обязателен';
    }
    if (control?.hasError('minlength')) {
      return 'Пароль должен быть не менее 12 символов';
    }
    return '';
  }

  getConfirmPasswordErrorMessage(): string {
    const control = this.profileForm.get('confirmPassword');
    if (control?.hasError('required')) {
      return 'Подтверждение пароля обязательно';
    }
    if (control?.hasError('passwordMismatch')) {
      return 'Пароли не совпадают';
    }
    return '';
  }
}
