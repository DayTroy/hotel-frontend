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
  TuiFormatNumberPipe,
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
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

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
    TuiCurrencyPipe,
    TuiFormatNumberPipe
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
  protected readonly bookingMainContentTypes = ['Гости', 'Услуги'];
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
    const newMainContentType =
      this.bookingMainContentTypes[this.activeBookingContentType];
  }

  toggleGuest(index: number): void {
    this.expandedStates[index] = !this.expandedStates[index];
  }

  asFormGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }

  exportRegistrationCard(guestForm: any) {
    const booking = this.form.getRawValue();
    if (!booking) {
      this.alerts
        .open('Ошибка: Данные бронирования не загружены.', {
          appearance: 'error',
        })
        .subscribe();
      return;
    }

    const guestData = guestForm.value;

    const data = {
      hotelName: 'Азимут Хотелс',
      hotelAddress: 'Адрес 129110, г. Москва, пр-кт Олимпийский, д. 18/1',
      hotelPhone: '+7 (925) 685-42-31',
      hotelArrival: 'Наземный',
      guestName: `${guestData.lastName || ''} ${guestData.firstName || ''} ${
        guestData.middleName || ''
      }`.trim(),
      roomNumber: booking?.roomId || '',
      checkInDate: this.formatDate(booking.checkInDate),
      checkOutDate: this.formatDate(booking.checkOutDate),
    };

    const content = `
    <div style="font-family: Arial, sans-serif; padding: 20px; font-size: 10px;">
      <div style="text-align: right; line-height: 1.2;">
        <div>Утверждена</div>
        <div>Приказом Министерства финансов</div>
        <div>Российской Федерации</div>
        <div>от 13 декабря 1993 г. N 121</div>
        <div style="margin-top: 10px;">Форма N 4-Г</div>
      </div>

      <div style="margin-top: 20px;">
        <p style="margin: 2px 0;"><strong>Гостиница:</strong> ${data.hotelName}</p>
        <p style="margin: 2px 0;"><strong>Адрес:</strong> ${data.hotelAddress}</p>
        <p style="margin: 2px 0;"><strong>Телефон:</strong> ${data.hotelPhone}</p>
        <p style="margin: 2px 0;"><strong>Проезд:</strong> ${data.hotelArrival}</p>
      </div>

      <h1 style="text-align: center; margin-top: 30px; font-size: 14px;">КАРТА ГОСТЯ N</h1>

      <div style="display: flex; justify-content: space-between; margin-top: 10px;">
        <div style="width: 45%;">
          <p style="margin: 2px 0;">ДНИ</p>
          <p style="margin: 2px 0;">1. &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 17</p>
          <p style="margin: 2px 0;">2. &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 18</p>
          <p style="margin: 2px 0;">3. &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 19</p>
          <p style="margin: 2px 0;">4. &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 20</p>
          <p style="margin: 2px 0;">5. &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 21</p>
          <p style="margin: 2px 0;">6. &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 22</p>
          <p style="margin: 2px 0;">7. &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 23</p>
          <p style="margin: 2px 0;">8. &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 24</p>
          <p style="margin: 2px 0;">9. &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 25</p>
          <p style="margin: 2px 0;">10. &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 26</p>
          <p style="margin: 2px 0;">11. &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 27</p>
          <p style="margin: 2px 0;">12. &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 28</p>
          <p style="margin: 2px 0;">13. &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 29</p>
          <p style="margin: 2px 0;">14. &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 30</p>
          <p style="margin: 2px 0;">15. &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; 31</p>
          <p style="margin: 2px 0;">16.</p>
        </div>
        <div style="width: 45%;">
          <p style="margin: 2px 0;">МЕСЯЦ</p>
          <p style="margin: 2px 0;">I</p>
          <p style="margin: 2px 0;">II</p>
          <p style="margin: 2px 0;">III</p>
          <p style="margin: 2px 0;">IV</p>
          <p style="margin: 2px 0;">V</p>
          <p style="margin: 2px 0;">VI</p>
          <p style="margin: 2px 0;">VII</p>
          <p style="margin: 2px 0;">VIII</p>
          <p style="margin: 2px 0;">IX</p>
          <p style="margin: 2px 0;">X</p>
          <p style="margin: 2px 0;">XI</p>
          <p style="margin: 2px 0;">XII</p>
        </div>
      </div>

      <div style="margin-top: 20px;">
        <p style="margin: 2px 0;"><strong>Фамилия, И.О.:</strong> ${data.guestName}</p>
        <p style="margin: 2px 0;"><strong>Номер:</strong> ${data.roomNumber}</p>
        <p style="margin: 2px 0;"><strong>Дата заезда:</strong> ${data.checkInDate}</p>
        <p style="margin: 2px 0;"><strong>Дата выезда:</strong> ${data.checkOutDate}</p>
        <p style="margin: 2px 0;"><strong>Ключ от номера выдается при предъявлении</strong></p>
        <p style="margin: 2px 0;"><strong>Карты гостя</strong></p>
        <p style="margin: 2px 0; margin-top: 10px;"><strong>Проживающий имеет право на внеочередное</strong></p>
        <p style="margin: 2px 0;"><strong>обслуживание в предприятиях общественного</strong></p>
        <p style="margin: 2px 0;"><strong>питания, бытового обслуживания и связи,</strong></p>
        <p style="margin: 2px 0;"><strong>расположенных в гостинице</strong></p>
      </div>

      <div style="margin-top: 50px; text-align: right;">
        <p>Портье <span style="text-decoration: underline;">Иванов И.И.</span></p>
        <p>(подпись)</p>
      </div>
    </div>
    `;

    const element = document.createElement('div');
    element.innerHTML = content;
    element.style.position = 'absolute';
    element.style.left = '-9999px';
    document.body.appendChild(element);

    html2canvas(element)
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF();
        const imgWidth = 210;
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
        pdf.save(`Регистрационная_карточка_${data.guestName}.pdf`);
        document.body.removeChild(element);
      })
      .catch((error) => {
        console.error('Error generating PDF:', error);
        this.alerts
          .open('Ошибка при генерации PDF.', { appearance: 'error' })
          .subscribe();
      });
  }

  private formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
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
