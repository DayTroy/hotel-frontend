import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TuiLet } from '@taiga-ui/cdk';
import {
  TuiAlertService,
  TuiButton,
  TuiCalendar,
  TuiLabel,
  TuiLink,
  TuiTextfield,
  TuiTextfieldDropdownDirective,
} from '@taiga-ui/core';
import {
  TuiButtonLoading,
  TuiInputDate,
  TuiSegmented,
  TuiTextarea,
  TuiTextareaLimit,
} from '@taiga-ui/kit';
import {
  BehaviorSubject,
  Observable,
  catchError,
  finalize,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { RequestsApiService } from '../requests/request-api.service';
import { REQUEST_STATUSES } from '../../global.config';

@Component({
  selector: 'app-request-info',
  standalone: true,
  imports: [
    TuiSegmented,
    TuiInputDate,
    NgFor,
    NgIf,
    TuiLink,
    RouterLink,
    TuiLabel,
    TuiTextfield,
    TuiTextfieldDropdownDirective,
    TuiCalendar,
    FormsModule,
    ReactiveFormsModule,
    TuiTextarea,
    TuiTextareaLimit,
    TuiButton,
    TuiButtonLoading,
    AsyncPipe,
    TuiLet,
  ],
  templateUrl: './request-info.component.html',
  styleUrl: './request-info.component.scss',
})
export class RequestInfoComponent implements OnInit {
  protected active = 0;
  protected readonly requestStatuses = REQUEST_STATUSES;
  protected readonly loading$ = new BehaviorSubject<boolean>(false);
  protected readonly error$ = new BehaviorSubject<string | null>(null);
  protected request$ = new Observable<any>();

  protected form: FormGroup = new FormGroup({
    requestId: new FormControl(''),
    status: new FormControl(''),
    creationDate: new FormControl({ value: null, disabled: true }),
    phoneNumber: new FormControl({ value: null, disabled: true }),
    description: new FormControl(''),
  });

  constructor(
    private _requestsApi: RequestsApiService,
    private alerts: TuiAlertService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.request$ = this.route.params.pipe(
      switchMap((params) => {
        this.loading$.next(true);
        this.error$.next(null);
        return this._requestsApi.findRequest(params['id']).pipe(
          tap((value) => {
            this.form.patchValue(value);
            const statusIndex = this.requestStatuses.findIndex(
              (status) => status === value.status
            );
            if (statusIndex !== -1) {
              this.active = statusIndex;
            }
          }),
          catchError((error) => {
            this.error$.next('Ошибка при загрузке данных');
            return of(null);
          }),
          finalize(() => this.loading$.next(false))
        );
      })
    );
  }

  setRequestStatus(): void {
    const newStatus = this.requestStatuses[this.active];
    this.form.patchValue({ status: newStatus });
  }

  submit(): void {
    if (this.form.valid) {
      this.loading$.next(true);
      this.route.params.subscribe((params) => {
        this._requestsApi
          .editRequest(params['id'], this.form.value)
          .pipe(
            catchError((error) => {
              this.error$.next('Ошибка при сохранении данных');
              return of(null);
            }),
            finalize(() => {
              this.alerts
                .open('Заявка успешна обновлена', { appearance: 'positive' })
                .subscribe();
              this.loading$.next(false);
            })
          )
          .subscribe();
      });
    }
  }
}
