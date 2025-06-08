import { AuthFormService } from './auth-forms.service';
import { AsyncPipe } from '@angular/common';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  TuiAppearance,
  TuiButton,
  TuiTextfield,
  TuiTitle,
  TuiAlertService,
} from '@taiga-ui/core';
import { TuiCardLarge, TuiForm, TuiHeader } from '@taiga-ui/layout';
import { map, startWith, Subject, switchMap, timer } from 'rxjs';
import type { MaskitoOptions } from '@maskito/core';
import { TUI_FALSE_HANDLER } from '@taiga-ui/cdk';
import { TuiButtonLoading } from '@taiga-ui/kit';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

import mask from './mask';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    TuiAppearance,
    TuiButton,
    TuiCardLarge,
    TuiForm,
    TuiHeader,
    TuiTextfield,
    TuiTitle,
    TuiButtonLoading
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit {

  protected form: FormGroup = new FormGroup({});
  protected readonly trigger$ = new Subject<void>();
  protected readonly loading$ = this.trigger$.pipe(
    switchMap(() => timer(2000).pipe(map(TUI_FALSE_HANDLER), startWith('Loading')))
  );

  readonly options: MaskitoOptions = mask;

  constructor(
    private readonly authForms: AuthFormService,
    private readonly authService: AuthService,
    private readonly alerts: TuiAlertService,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    this.form = this.authForms.createLoginForm();
  }

  submit(): void {
    if (this.form.invalid) {
      this.alerts
        .open('Пожалуйста, заполните все поля формы',
          {
            label: 'Ошибка',
            appearance: 'negative',
            autoClose: 3000,
          }
        )
        .subscribe();
      return;
    }

    this.trigger$.next();
    
    this.authService.login(this.form.value.email, this.form.value.password).subscribe({
      next: (response) => {
        this.alerts
          .open('Вход в систему выполнен успешно',
            {
              label: 'Авторизация пройдена',
              appearance: 'positive',
              autoClose: 3000,
            }
          )
          .subscribe();

        // Перенаправляем на dashboard, а RoleGuard сам определит нужный модуль
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.alerts
          .open('Неверное имя пользователя или пароль',
            {
              label: 'Ошибка',
              appearance: 'negative',
              autoClose: 3000,
            }
          )
          .subscribe();
        console.error('Login error:', error);
      }
    });
  }
}
