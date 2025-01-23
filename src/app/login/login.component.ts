import { AsyncPipe, NgIf } from '@angular/common';
import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  TuiAppearance,
  TuiButton,
  TuiError,
  TuiIcon,
  TuiNotification,
  TuiTextfield,
  TuiTitle,
  TuiLink
} from '@taiga-ui/core';
import {TuiFieldErrorPipe, TuiSegmented, TuiSwitch, TuiTooltip} from '@taiga-ui/kit';
import {TuiCardLarge, TuiForm, TuiHeader} from '@taiga-ui/layout';
import { tap } from 'rxjs';


import {MaskitoDirective} from '@maskito/angular';
import type {MaskitoOptions} from '@maskito/core';
 
import mask from './mask';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    AsyncPipe,
    NgIf,
    ReactiveFormsModule,
    TuiAppearance,
    TuiButton,
    TuiCardLarge,
    TuiError,
    TuiFieldErrorPipe,
    TuiForm,
    TuiHeader,
    TuiIcon,
    TuiNotification,
    TuiSegmented,
    TuiSwitch,
    TuiTextfield,
    TuiTitle,
    TuiTooltip,
    TuiLink,
    MaskitoDirective
],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginComponent implements OnInit{
  authorizationType = 'login';
  readonly options: MaskitoOptions = mask;
  protected readonly form = new FormGroup({
    firstName: new FormControl('', Validators.required),
    lastName: new FormControl('', Validators.required),
    email: new FormControl(''),
    subscribe: new FormControl(false)
  });


  ngOnInit(): void {
    this.initSubscriptions();
    console.log(this.authorizationType)
  }

  setAuthorizationType(authorizationType: string) {
    this.authorizationType = authorizationType;
  }

  initSubscriptions () {
    this.form.valueChanges.pipe(tap(value => console.log(value))).subscribe()
  }
}
