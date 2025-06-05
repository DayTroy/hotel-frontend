import { Component, inject } from '@angular/core';
import {TUI_FALSE_HANDLER, TuiDay, TuiItem} from '@taiga-ui/cdk';
import {TuiTextfield, TuiButton, TuiLoader, TuiAlertService, TuiDialogService, TuiDialogContext, TuiIcon} from '@taiga-ui/core';
import {TuiInputDate, TuiInputNumber, TuiButtonLoading } from '@taiga-ui/kit';
import { ReactiveFormsModule, FormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { NgIf, AsyncPipe, NgFor } from '@angular/common';
import { startWith } from 'rxjs/operators';
import { timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { Subject, BehaviorSubject } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { TuiCurrencyPipe } from '@taiga-ui/addon-commerce';
import { RoomsApiService } from '../references/rooms/rooms-api.service';
import { BookingsForms } from '../bookings/bookings-forms.service';
import { PolymorpheusContent } from '@taiga-ui/polymorpheus';
import {TuiAccordion, TuiExpand} from '@taiga-ui/experimental';

interface Room {
  roomId: string;
  stage: string;
  roomCategory: {
    title: string;
    pricePerNight: number;
    capacity: number;
    description: string;
  };
}

@Component({
  selector: 'app-search-rooms',
  standalone: true,
  imports: [TuiTextfield, ReactiveFormsModule, FormsModule, TuiInputDate, TuiInputNumber, TuiButton, TuiLoader, TuiButtonLoading, NgIf, AsyncPipe, TuiCurrencyPipe, NgFor, TuiExpand, TuiIcon, TuiItem],
  templateUrl: './search-rooms.component.html',
  styleUrl: './search-rooms.component.scss'
})
export class SearchRoomsComponent {
  protected value: TuiDay | null = null;
  protected guests: number | null = null;
  protected isLoading: boolean = false;
  protected readonly availableRooms$ = new BehaviorSubject<Room[]>([]);
  protected readonly error$ = new BehaviorSubject<string | null>(null);
  protected guestForms: FormGroup[] = [];
  protected expandedStates: boolean[] = [];
  private readonly dialogs = inject(TuiDialogService);
  private readonly alerts = inject(TuiAlertService);
  private currentDialogObserver: any;

  protected searchRoomsForm: FormGroup = new FormGroup({
    guests: new FormControl(null, [Validators.required, Validators.min(1), Validators.max(12)]),
    checkInDate: new FormControl(null, [Validators.required]),
    checkOutDate: new FormControl(null, [Validators.required]),
  });

  protected bookingForm = this._bookingsForms.createBookingForm();
  protected readonly trigger$ = new Subject<void>();
  protected readonly loading$ = this.trigger$.pipe(
    switchMap(() => timer(2000).pipe(map(TUI_FALSE_HANDLER), startWith('Loading')))
  );
  protected expanded = false;

  constructor(private readonly _roomsApi: RoomsApiService, private readonly _bookingsForms: BookingsForms,) {}

  openBookingDialog(content: PolymorpheusContent<TuiDialogContext>) {
    this.bookingForm.patchValue({
      checkInDate: this.searchRoomsForm.get('checkInDate')?.value,
      checkOutDate: this.searchRoomsForm.get('checkOutDate')?.value,
      guests: this.searchRoomsForm.get('guests')?.value
    });
    
    this.guestForms = [this.createGuestForm()];
    this.expandedStates = [true];
    
    this.dialogs.open(content).subscribe((observer) => {
      this.currentDialogObserver = observer;
    });
  }

  private createGuestForm(): FormGroup {
    return new FormGroup({
      firstName: new FormControl('', [Validators.required]),
      lastName: new FormControl('', [Validators.required]),
      middleName: new FormControl('')
    });
  }

  submit(): void {
    if (this.searchRoomsForm.valid) {
      const formValue = this.searchRoomsForm.value;

      this.trigger$.next();
      this.isLoading = true;
      this.error$.next(null);

      const params = {
        checkInDate: formValue.checkInDate.toJSON(),
        checkOutDate: formValue.checkOutDate.toJSON(),
        guests: formValue.guests
      };

      this._roomsApi.searchAvailableRooms(params).subscribe({
        next: (rooms) => {
          this.availableRooms$.next(rooms);
          this.isLoading = false;
        },
        error: (error) => {
          this.error$.next('Произошла ошибка при поиске номеров');
          this.isLoading = false;
        }
      });
    }
  }

  addGuest(): void {
    if (this.guestForms.length < (this.bookingForm.get('guests')?.value || 0)) {
      this.guestForms.push(this.createGuestForm());
      this.expandedStates.push(true);
    }
  }

  toggleGuest(index: number): void {
    this.expandedStates[index] = !this.expandedStates[index];
  }
}
