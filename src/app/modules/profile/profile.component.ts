import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
    private readonly authService: AuthService,
    private readonly alerts: TuiAlertService
  ) {
    this.profileForm = new FormGroup({
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      email: new FormControl('', [Validators.required, Validators.email]),
      phoneNumber: new FormControl('', [Validators.required]),
      currentPassword: new FormControl(''),
      newPassword: new FormControl(''),
      confirmPassword: new FormControl('')
    });
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

    // TODO: Implement profile update
    console.log(this.profileForm.value);
  }
}
