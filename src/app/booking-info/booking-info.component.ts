import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  TuiAlertService,
  TuiButton,
  TuiCalendar,
  TuiIcon,
  TuiLabel,
  TuiLink,
  TuiTextfield,
  TuiTextfieldDropdownDirective,
} from '@taiga-ui/core';
import {
  BehaviorSubject,
  catchError,
  finalize,
  Observable,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { RequestsApiService } from '../requests/request-api.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import {
  TuiButtonLoading,
  TuiSegmented,
  TuiTextarea,
  TuiTextareaLimit,
} from '@taiga-ui/kit';
import { TuiLet } from '@taiga-ui/cdk';

@Component({
  selector: 'app-booking-info',
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    TuiSegmented,
    TuiTextfield,
    TuiTextarea,
    TuiButton,
    TuiButtonLoading,
    TuiTextareaLimit,
    TuiCalendar,
    TuiLet,
    TuiLabel,
    TuiTextfieldDropdownDirective,
    TuiLink,
    RouterLink,
    ReactiveFormsModule,
    FormsModule,
  ],
  templateUrl: './booking-info.component.html',
  styleUrl: './booking-info.component.scss',
})
export class BookingInfoComponent {
  protected active = 0;
  protected readonly requestStatuses = [
    'Новое',
    'Подтверждено',
    'Заселен',
    'Выселен',
    'На уборке',
    'Отменено',
  ];
  protected readonly loading$ = new BehaviorSubject<boolean>(false);
  protected readonly error$ = new BehaviorSubject<string | null>(null);
  protected readonly booking$: Observable<any>;
  private readonly alerts = inject(TuiAlertService);

  protected form: FormGroup = new FormGroup({
    requestId: new FormControl(''),
    status: new FormControl(''),
    creationDate: new FormControl({ value: null, disabled: true }),
    description: new FormControl(''),
  });

  constructor(
    private _requestsApi: RequestsApiService,
    private route: ActivatedRoute
  ) {
    this.booking$ = this.route.params.pipe(
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
            console.error('Error loading request:', error);
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
              console.error('Error saving request:', error);
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
