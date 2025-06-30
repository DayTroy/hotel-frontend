import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { TuiTable } from '@taiga-ui/addon-table';
import {
  TuiAlertService,
  TuiButton,
  TuiDialogService,
  TuiTextfield,
} from '@taiga-ui/core';
import { TUI_CONFIRM, TuiConfirmData, TuiStatus } from '@taiga-ui/kit';
import { BookingsApiService } from './bookings-api.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  BehaviorSubject,
  catchError,
  finalize,
  of,
  switchMap,
  tap,
} from 'rxjs';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [
    TuiTextfield,
    FormsModule,
    TuiTable,
    TuiStatus,
    NgFor,
    TuiButton,
    RouterLink,
    NgIf,
    AsyncPipe,
  ],
  templateUrl: './bookings.component.html',
  styleUrl: './bookings.component.scss',
})
export class BookingsComponent implements OnInit {
  destroyRef = inject(DestroyRef);
  protected value = '';
  protected data: Request[] = [];
  protected error: string | null = null;
  protected readonly columns = [
    'bookingId',
    'roomId',
    'status',
    'checkInDate',
    'checkOutDate',
    'actions',
  ];
  loading$$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  protected readonly notFound$$ = new BehaviorSubject<boolean>(false);
  searchValue: string = '';
  private allBookings$$ = new BehaviorSubject<any[]>([]);
  bookings$$ = this.allBookings$$.asObservable();
  private readonly dialogs = inject(TuiDialogService);
  private readonly alerts = inject(TuiAlertService);

  constructor(private readonly _bookingsApiService: BookingsApiService) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  protected loadBookings(): void {
    this.error = null;

    this._bookingsApiService
      .getAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((error) => {
          this.error = 'Ошибка при загрузке данных';
          return [];
        }),
        finalize(() => this.loading$$.next(false))
      )
      .subscribe((bookings) => {
        this.allBookings$$.next(bookings);
        this.bookings$$ = this.allBookings$$.asObservable();
      });
  }

  confirmBookingRemove(bookingId: string): void {
    const data: TuiConfirmData = {
      content:
        'Вы действительно хотете удалить бронь? После удаления выбранной брони, она станет недоступной для просмотра',
      yes: 'Подтвердить',
      no: 'Отменить',
    };

    this.dialogs
      .open<boolean>(TUI_CONFIRM, {
        label: 'Удалить бронь',
        size: 'l',
        data,
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((confirmed) => {
          if (!confirmed) {
            return of(null);
          }

          this.loading$$.next(true);
          return this._bookingsApiService.delete(bookingId).pipe(
            tap(() =>
              this.alerts
                .open('Бронь успешна удалена', { appearance: 'positive' })
                .subscribe()
            ),
            catchError((error) => {
              this.alerts.open('Ошибка при удалении брони', {
                appearance: 'negative',
              });
              return of(null);
            }),
            finalize(() => this.loading$$.next(false))
          );
        })
      )
      .subscribe(() => this.loadBookings());
  }

  onSearch(value: string) {
    if (!value) {
      this.bookings$$ = this.allBookings$$.asObservable();
      this.notFound$$.next(false);
      return;
    }

    const filteredBookings = this.allBookings$$.value.filter((booking) =>
      booking.bookingId.toString().toLowerCase().includes(value.toLowerCase())
    );
    this.bookings$$ = new BehaviorSubject(filteredBookings).asObservable();
    this.notFound$$.next(filteredBookings.length === 0);
  }
}
