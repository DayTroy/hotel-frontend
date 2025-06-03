import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TUI_FALSE_HANDLER, TuiLet } from '@taiga-ui/cdk';
import { TuiAlertService, TuiButton, TuiCalendar, TuiLabel, TuiLink, TuiTextfield, TuiTextfieldDropdownDirective, TuiTitle } from '@taiga-ui/core';
import { TuiButtonLoading, TuiInputDate, TuiSegmented, TuiTextarea, TuiTextareaLimit } from '@taiga-ui/kit';
import { BehaviorSubject, Observable, catchError, finalize, map, of, startWith, switchMap, tap } from 'rxjs';
import { RequestsApiService } from '../requests/request-api.service';

@Component({
  selector: 'app-request-info',
  standalone: true,
  imports: [TuiSegmented, TuiInputDate, NgFor, NgIf, TuiLink, RouterLink, TuiLabel, TuiTextfield, TuiTextfieldDropdownDirective, TuiCalendar, FormsModule, ReactiveFormsModule, TuiTextarea, TuiTextareaLimit, TuiButton, TuiButtonLoading, AsyncPipe, TuiLet],
  templateUrl: './request-info.component.html',
  styleUrl: './request-info.component.scss'
})
export class RequestInfoComponent implements OnInit {
  protected active = 0;
  protected readonly requestStatuses = ['Новая', 'Обработана', 'Отменена', 'Закрыта'];
  protected readonly loading$ = new BehaviorSubject<boolean>(false);
  protected readonly error$ = new BehaviorSubject<string | null>(null);
  protected readonly request$: Observable<any>;
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
    this.request$ = this.route.params.pipe(
      switchMap(params => {
        this.loading$.next(true);
        this.error$.next(null);
        return this._requestsApi.findRequest(params['id']).pipe(
          tap(value => {
            this.form.patchValue(value);
            const statusIndex = this.requestStatuses.findIndex(status => status === value.status);
            if (statusIndex !== -1) {
              this.active = statusIndex;
            }
          }),
          catchError(error => {
            this.error$.next('Ошибка при загрузке данных');
            console.error('Error loading request:', error);
            return of(null);
          }),
          finalize(() => this.loading$.next(false))
        );
      })
    );
  }

  ngOnInit() {
    // Initialization is handled in the constructor
  }

  setRequestStatus(): void {
    const newStatus = this.requestStatuses[this.active];
    this.form.patchValue({ status: newStatus });
  }

  submit(): void {
    if (this.form.valid) {
      this.loading$.next(true);
      this.route.params.subscribe(params => {
        this._requestsApi.editRequest(params['id'], this.form.value)
          .pipe(
            catchError(error => {
              this.error$.next('Ошибка при сохранении данных');
              console.error('Error saving request:', error);
              return of(null);
            }),
            finalize(() => {
              this.alerts.open('Заявка успешна обновлена', { appearance: 'positive' }).subscribe();
              this.loading$.next(false)
            })
          )
          .subscribe();
      });
    }
  }
}
