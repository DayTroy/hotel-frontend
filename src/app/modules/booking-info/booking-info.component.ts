import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  FormArray,
  AbstractControl,
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
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule, NgIf } from '@angular/common';
import {
  TuiButtonLoading,
  TuiDataListWrapper,
  TuiInputDate,
  TuiSegmented,
  TuiSelect,
  TuiTextarea,
  TuiTextareaLimit,
} from '@taiga-ui/kit';
import { TuiLet } from '@taiga-ui/cdk';
import { BookingsApiService } from '../bookings/bookings-api.service';
import { TuiExpand } from '@taiga-ui/experimental';
import { GuestsForms } from '../references/guests/guests-forms.service';
import { TuiCurrencyPipe } from '@taiga-ui/addon-commerce';

@Component({
  selector: 'app-booking-info',
  standalone: true,
  imports: [
    CommonModule,
    NgIf,
    TuiSegmented,
    TuiTextfield,
    TuiButton,
    TuiButtonLoading,
    TuiCalendar,
    TuiLet,
    TuiLabel,
    TuiLink,
    RouterLink,
    ReactiveFormsModule,
    FormsModule,
    TuiIcon,
    TuiExpand,
    TuiDataListWrapper,
    TuiSelect,
    TuiTextfieldDropdownDirective,
    TuiInputDate,
    TuiCurrencyPipe
  ],
  templateUrl: './booking-info.component.html',
  styleUrl: './booking-info.component.scss',
})
export class BookingInfoComponent {
  protected activeBookingStatus = 0;
  protected activeBookingContentType = 0;
  protected readonly bookingStatuses = [
    'Новое',
    'Подтверждено',
    'Заселен',
    'Выселен',
    'На уборке',
    'Отменено',
  ];
  genders = ['Мужской', 'Женский'];
  citizenships = ['Россия', 'Другое'];
  protected expandedStates: boolean[] = [];
  protected readonly bookingMainContentTypes = ['Гости', 'Услуги']
  protected readonly loading$ = new BehaviorSubject<boolean>(false);
  protected readonly error$ = new BehaviorSubject<string | null>(null);
  protected readonly booking$: Observable<any>;
  private readonly alerts = inject(TuiAlertService);

  protected form: FormGroup = new FormGroup({
    bookingId: new FormControl(''),
    status: new FormControl(''),
    checkInDate: new FormControl({ value: null, disabled: true }),
    checkOutDate: new FormControl({ value: null, disabled: true }),
    roomId: new FormControl({ value: null, disabled: true }),
    guests: new FormArray([]),
  });

  constructor(
    private _bookingsApi: BookingsApiService,
    private _guestsForms: GuestsForms,
    private route: ActivatedRoute
  ) {
    this.booking$ = this.route.params.pipe(
      switchMap((params) => {
        this.loading$.next(true);
        this.error$.next(null);
        return this._bookingsApi.findBooking(params['id']).pipe(
          tap((value) => {
            this.form.patchValue(value);
            const statusIndex = this.bookingStatuses.findIndex(
              (status) => status === value.status
            );
            if (statusIndex !== -1) {
              this.activeBookingStatus = statusIndex;
            }

            // Populate guests FormArray
            if (value.bookingGuests && Array.isArray(value.bookingGuests)) {
              const guestFormArray = this.form.get('guests') as FormArray;
              guestFormArray.clear(); // Clear existing guest forms
              value.bookingGuests.forEach((bookingGuest: any) => {
                const guestFormGroup = this._guestsForms.createGuestForm();
                guestFormGroup.patchValue(bookingGuest.guest);
                guestFormArray.push(guestFormGroup);
                this.expandedStates.push(false);
              });
            }
          }),
          catchError((error) => {
            this.error$.next('Ошибка при загрузке данных');
            console.error('Error loading booking:', error);
            return of(null);
          }),
          finalize(() => this.loading$.next(false))
        );
      })
    );
  }

  get guestForms(): FormArray {
    return this.form.get('guests') as FormArray;
  }

  setBookingStatus(): void {
    const newStatus = this.bookingStatuses[this.activeBookingStatus];
    this.form.patchValue({ status: newStatus });
  }

  setBookingMainContentType(): void {
    const newMainContentType = this.bookingMainContentTypes[this.activeBookingContentType];
  }

  toggleGuest(index: number): void {
    this.expandedStates[index] = !this.expandedStates[index];
  }

  asFormGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }

  submit(): void {
    if (this.form.valid) {
      this.loading$.next(true);
      this.route.params.subscribe((params) => {
        this._bookingsApi
          .update(params['id'], this.form.value)
          .pipe(
            catchError((error) => {
              this.error$.next('Ошибка при сохранении данных');
              console.error('Error saving booking:', error);
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
