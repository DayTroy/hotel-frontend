import { Component, inject, OnInit } from '@angular/core';
import { TUI_FALSE_HANDLER, TuiDay, TuiItem } from '@taiga-ui/cdk';
import {
  TuiTextfield,
  TuiButton,
  TuiLoader,
  TuiAlertService,
  TuiDialogService,
  TuiDialogContext,
  TuiIcon,
  TuiTextfieldDropdownDirective,
} from '@taiga-ui/core';
import {
  TuiInputDate,
  TuiInputNumber,
  TuiButtonLoading,
  TuiSelect,
  TuiDataListWrapper,
  TuiChevron,
  TuiStringifyContentPipe,
  TuiFilterByInputPipe,
} from '@taiga-ui/kit';
import {
  ReactiveFormsModule,
  FormsModule,
  FormGroup,
  FormControl,
  Validators,
} from '@angular/forms';
import { NgIf, AsyncPipe, NgFor } from '@angular/common';
import { startWith } from 'rxjs/operators';
import { timer } from 'rxjs';
import { map } from 'rxjs/operators';
import { Subject, BehaviorSubject, of, combineLatest } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { tap } from 'rxjs/operators';
import { TuiCurrencyPipe } from '@taiga-ui/addon-commerce';
import { RoomsApiService } from '../references/rooms/rooms-api.service';
import { BookingsForms } from '../bookings/bookings-forms.service';
import { PolymorpheusContent } from '@taiga-ui/polymorpheus';
import { TuiAccordion, TuiExpand } from '@taiga-ui/experimental';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiComboBoxModule } from '@taiga-ui/legacy';
import { Observable } from 'rxjs';
import { AmenitiesApiService } from '../references/amenities/amenities-api.service';

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
  imports: [
    TuiTextfield,
    ReactiveFormsModule,
    FormsModule,
    TuiInputDate,
    TuiInputNumber,
    TuiButton,
    TuiLoader,
    TuiButtonLoading,
    NgIf,
    AsyncPipe,
    TuiCurrencyPipe,
    NgFor,
    TuiExpand,
    TuiIcon,
    TuiItem,
    TuiTextfieldDropdownDirective,
    TuiSelect,
    TuiDataListWrapper,
    TuiChevron,
    TuiTable,
    TuiComboBoxModule,
    TuiFilterByInputPipe,
    TuiStringifyContentPipe,
  ],
  templateUrl: './search-rooms.component.html',
  styleUrl: './search-rooms.component.scss',
})
export class SearchRoomsComponent implements OnInit {
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
  genders = ['Мужской', 'Женский'];
  citizenships = ['Россия', 'Другое'];

  protected searchRoomsForm: FormGroup = new FormGroup({
    guests: new FormControl(null, [
      Validators.required,
      Validators.min(1),
      Validators.max(12),
    ]),
    checkInDate: new FormControl(null, [Validators.required]),
    checkOutDate: new FormControl(null, [Validators.required]),
  });

  protected bookingForm = this._bookingsForms.createBookingForm();
  protected readonly trigger$ = new Subject<void>();
  protected readonly loading$ = this.trigger$.pipe(
    switchMap(() =>
      timer(2000).pipe(map(TUI_FALSE_HANDLER), startWith('Loading'))
    )
  );
  protected expanded = false;

  protected providedAmenityForms: FormGroup[] = [];

  protected readonly columns = [
    'amenity',
    'quantity',
    'date',
    'price',
    'total',
    'actions',
  ];

  readonly amenities$: Observable<
    { id: number; name: string; price: number }[]
  > = this._amenitiesApi.getAll();

  readonly stringify = (item: { amenityTitle: string }) => item.amenityTitle;

  private selectedRoomPricePerNight: number | null = null;

  constructor(
    private readonly _roomsApi: RoomsApiService,
    private readonly _bookingsForms: BookingsForms,
    private readonly _amenitiesApi: AmenitiesApiService
  ) {}

  ngOnInit(): void {
    this.initSubscriptions();
  }

  private subscribeToFormChanges(form: FormGroup): void {
    form
      .get('amenityQuantity')
      ?.valueChanges.pipe(
        map((quantity) => {
          const price = form.get('amenityPrice')?.value;
          if (quantity && price) {
            return quantity * Number(price);
          }
          return null;
        })
      )
      .subscribe((total) => {
        form.patchValue({ amenitiesTotalPrice: total }, { emitEvent: false });
      });
  }

  initSubscriptions(): void {
    this.providedAmenityForms.forEach((form) => {
      this.subscribeToFormChanges(form);
    });
  }

  openBookingDialog(
    content: PolymorpheusContent<TuiDialogContext>,
    room: Room
  ) {
    this.bookingForm.patchValue({
      checkInDate: this.searchRoomsForm.get('checkInDate')?.value,
      checkOutDate: this.searchRoomsForm.get('checkOutDate')?.value,
      guests: this.searchRoomsForm.get('guests')?.value,
      roomId: room.roomId,
    });

    this.selectedRoomPricePerNight = room.roomCategory.pricePerNight;

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
      middleName: new FormControl(''),
      email: new FormControl('', [Validators.required]),
      phoneNumber: new FormControl('', [Validators.required]),
      gender: new FormControl('', [Validators.required]),
      citizenship: new FormControl('', [Validators.required]),
      passportNumber: new FormControl('', [Validators.required]),
      passportSeries: new FormControl('', [Validators.required]),
      birthdate: new FormControl('', [Validators.required]),
      birthplace: new FormControl('', [Validators.required]),
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
        guests: formValue.guests,
      };

      this._roomsApi.searchAvailableRooms(params).subscribe({
        next: (rooms) => {
          this.availableRooms$.next(rooms);
          this.isLoading = false;
        },
        error: (error) => {
          this.error$.next('Произошла ошибка при поиске номеров');
          this.isLoading = false;
        },
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

  deleteGuest(index: number): void {
    if (this.guestForms.length > 1) {
      this.guestForms.splice(index, 1);
      this.expandedStates.splice(index, 1);
    }
  }

  private createProvidedAmenityForm(): FormGroup {
    const form = new FormGroup<{
      amenity: FormControl<any>;
      amenityQuantity: FormControl<number | null>;
      amenityPrice: FormControl<string | null>;
      amenitiesTotalPrice: FormControl<number | null>;
    }>({
      amenity: new FormControl(null, [Validators.required]),
      amenityQuantity: new FormControl(0, [
        Validators.required,
        Validators.min(1),
      ]),
      amenityPrice: new FormControl({ value: null, disabled: true }, [
        Validators.required,
        Validators.min(0),
      ]),
      amenitiesTotalPrice: new FormControl({ value: null, disabled: true }),
    });

    this.subscribeToFormChanges(form);
    return form;
  }

  addProvidedAmenity(): void {
    this.providedAmenityForms.push(this.createProvidedAmenityForm());
  }

  deleteProvidedAmenity(index: number): void {
    this.providedAmenityForms.splice(index, 1);
  }

  protected onAmenityChange(amenity: any | null, index: number): void {
    const amenityForm = this.providedAmenityForms[index];
    if (amenity) {
      amenityForm.patchValue({
        amenityPrice: amenity.amenityPrice,
      });
    }
  }

  calculateTotalPrice(): number {
    let totalAmenityPrice = 0;
    for (const amenityForm of this.providedAmenityForms) {
      const amenityTotalPrice = amenityForm.get('amenitiesTotalPrice')?.value;
      if (amenityTotalPrice !== null) {
        totalAmenityPrice += amenityTotalPrice;
      }
    }

    const checkInDate = this.bookingForm.get('checkInDate')
      ?.value as TuiDay | null;
    const checkOutDate = this.bookingForm.get('checkOutDate')
      ?.value as TuiDay | null;
    const guests = this.bookingForm.get('guests')?.value as number | null;

    let numberOfDays = 0;
    if (checkInDate && checkOutDate) {
      const checkInDateTime = new Date(
        checkInDate.year,
        checkInDate.month - 1,
        checkInDate.day
      ).getTime();
      const checkOutDateTime = new Date(
        checkOutDate.year,
        checkOutDate.month - 1,
        checkOutDate.day
      ).getTime();
      const timeDiff = checkOutDateTime - checkInDateTime;
      numberOfDays = timeDiff / (1000 * 60 * 60 * 24);
    }

    const roomPrice =
      (this.selectedRoomPricePerNight ?? 0) * numberOfDays * (guests ?? 0);

    return roomPrice + totalAmenityPrice;
  }
}
