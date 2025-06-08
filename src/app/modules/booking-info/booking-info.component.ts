import { Component, inject, OnInit } from '@angular/core';
import { TUI_FALSE_HANDLER, TuiDay, TuiLet } from '@taiga-ui/cdk';
import {
  TuiTextfield,
  TuiButton,
  TuiLoader,
  TuiAlertService,
  TuiDialogService,
  TuiDialogContext,
  TuiIcon,
  TuiTextfieldDropdownDirective,
  TuiFormatNumberPipe,
  TuiCalendar,
  TuiLink,
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
  TuiSegmented,
} from '@taiga-ui/kit';
import {
  ReactiveFormsModule,
  FormsModule,
  FormGroup,
  FormControl,
  FormArray,
  AbstractControl,
  FormBuilder,
} from '@angular/forms';
import { NgIf, AsyncPipe, NgFor, NgSwitch, NgSwitchCase, formatDate } from '@angular/common';
import { startWith } from 'rxjs/operators';
import { timer, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Subject, BehaviorSubject, of } from 'rxjs';
import { switchMap, catchError, finalize, tap } from 'rxjs/operators';
import { TuiCurrencyPipe } from '@taiga-ui/addon-commerce';
import { TuiTable } from '@taiga-ui/addon-table';
import { TuiComboBoxModule } from '@taiga-ui/legacy';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { BookingsApiService } from '../bookings/bookings-api.service';
import { GuestsForms } from '../references/guests/guests-forms.service';
import { AmenitiesApiService } from '../references/amenities/amenities-api.service';
import { AmenitiesForms } from '../references/amenities/amenities-forms.service';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { TuiExpand } from '@taiga-ui/experimental';
import { BookingsForms } from '../bookings/bookings-forms.service';
import {MaskitoDirective} from '@maskito/angular';
import type {MaskitoOptions} from '@maskito/core';
import phoneMask from '../../shared/masks/phoneMask';
import { passportNumberMask, passportSeriesMask } from '../../shared/masks/passportMask';
import { nameMask } from '../../shared/masks/nameMask';
interface Amenity {
  amenityId: string;
  amenityTitle: string;
  amenityPrice: number;
}

interface Booking {
  bookingId: string;
  checkInDate: Date;
  checkOutDate: Date;
  roomId: string;
  status: string;
  guests: any[];
  providedAmenities: any[];
  totalPrice: number;
}

@Component({
  selector: 'app-booking-info',
  standalone: true,
  imports: [
    TuiTextfield,
    ReactiveFormsModule,
    FormsModule,
    TuiInputNumber,
    TuiButton,
    TuiLoader,
    TuiButtonLoading,
    NgIf,
    AsyncPipe,
    TuiCurrencyPipe,
    NgFor,
    TuiIcon,
    TuiTextfieldDropdownDirective,
    TuiSelect,
    TuiDataListWrapper,
    TuiChevron,
    TuiTable,
    TuiComboBoxModule,
    TuiFilterByInputPipe,
    TuiStringifyContentPipe,
    TuiFormatNumberPipe,
    TuiCalendar,
    TuiExpand,
    NgSwitch,
    TuiSegmented,
    TuiLet,
    NgSwitchCase,
    TuiLink,
    RouterLink,
    TuiInputDate,
    MaskitoDirective
  ],
  templateUrl: './booking-info.component.html',
  styleUrl: './booking-info.component.scss',
})
export class BookingInfoComponent implements OnInit {
  protected readonly alerts = inject(TuiAlertService);
  protected readonly dialogs = inject(TuiDialogService);
  protected readonly route = inject(ActivatedRoute);
  protected readonly router = inject(Router);
  protected readonly _bookingsApi = inject(BookingsApiService);
  protected readonly _bookingsForms = inject(BookingsForms);
  protected readonly _guestsForms = inject(GuestsForms);
  protected readonly _amenitiesApi = inject(AmenitiesApiService);
  protected readonly _amenitiesForms = inject(AmenitiesForms);
  protected readonly fb = inject(FormBuilder);

  protected readonly booking$ = new BehaviorSubject<Booking | null>(null);
  protected readonly error$ = new BehaviorSubject<string | null>(null);
  protected readonly loading$ = new BehaviorSubject<boolean>(false);

  readonly phoneOptions: MaskitoOptions = phoneMask;
  readonly passportSeriesOptions: MaskitoOptions = passportSeriesMask;
  readonly passportNumberOptions: MaskitoOptions = passportNumberMask;
  readonly nameOptions: MaskitoOptions = nameMask;

  protected readonly bookingStatuses = [
    'Новое',
    'Подтверждено',
    'Заселен',
    'Выселен',
    'Отменен',
  ];
  genders = ['Мужской', 'Женский'];
  citizenships = ['Россия', 'Другое'];
  protected expandedStates: boolean[] = [];
  protected readonly bookingMainContentTypes = ['Гости', 'Услуги'];
  protected activeBookingStatus = 0;
  protected activeBookingContentType = 0;

  protected bookingForm = this.fb.group({
    checkInDate: [null],
    checkOutDate: [null],
    roomId: [null],
    guests: this.fb.array([]),
    providedAmenities: this.fb.array([])
  });

  protected get guestForms(): FormArray {
    return this.bookingForm.get('guests') as FormArray;
  }

  protected readonly providedAmenityForms: FormGroup[] = [];

  protected get providedAmenitiesArray(): FormArray {
    return this.bookingForm.get('providedAmenities') as FormArray;
  }

  protected readonly columns = [
    'amenity',
    'quantity',
    'date',
    'price',
    'total',
    'actions',
  ];

  readonly amenities$: Observable<Amenity[]> = this._amenitiesApi.getAll();

  readonly stringify = (item: Amenity) => item.amenityTitle;

  protected addGuest(): void {
    const guestForm = this._guestsForms.createGuestForm();
    this.guestForms.push(guestForm);
    this.expandedStates.push(true);
  }

  protected deleteGuest(index: number): void {
    if (this.guestForms.length > 1) {
      this.guestForms.removeAt(index);
      this.expandedStates.splice(index, 1);
    }
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const bookingId = params['id'];
      if (bookingId) {
        this._bookingsApi.findBooking(bookingId).subscribe({
          next: (booking) => {
            this.booking$.next(booking);
            
            this.bookingForm.patchValue({
              checkInDate: booking.checkInDate,
              checkOutDate: booking.checkOutDate,
              roomId: booking.roomId
            });

            const statusIndex = this.bookingStatuses.indexOf(booking.status);
            if (statusIndex !== -1) {
              this.activeBookingStatus = statusIndex;
            }

            // Очищаем существующие формы гостей
            while (this.guestForms.length) {
              this.guestForms.removeAt(0);
            }
            this.expandedStates = [];

            // Инициализируем формы для каждого гостя
            if (booking.bookingGuests && booking.bookingGuests.length > 0) {
              booking.bookingGuests.forEach((guest: any) => {
                const guestForm = this._guestsForms.createGuestForm();
                guestForm.patchValue(guest.guest);
                this.guestForms.push(guestForm);
                this.expandedStates.push(true);
              });
            }

            // Очищаем существующие формы услуг
            while (this.providedAmenitiesArray.length) {
              this.providedAmenitiesArray.removeAt(0);
            }
            this.providedAmenityForms.length = 0;

            // Инициализируем формы для услуг
            if (booking.providedAmenities && booking.providedAmenities.length > 0) {
              booking.providedAmenities.forEach((amenity: any) => {
                const amenityForm = this._amenitiesForms.createProvidedAmenityForm();
                this._amenitiesApi.getAll().subscribe(amenities => {
                  const foundAmenity = amenities.find((a: Amenity) => a.amenityId === amenity.amenityId);
                  if (foundAmenity) {
                    amenityForm.patchValue({
                      amenity: foundAmenity,
                      amenityQuantity: amenity.quantity,
                      amenityPrice: foundAmenity.amenityPrice,
                      amenitiesTotalPrice: amenity.totalPrice
                    });
                  }
                });
                this.subscribeToFormChanges(amenityForm);
                this.providedAmenityForms.push(amenityForm);
                this.providedAmenitiesArray.push(amenityForm);
              });
            }
          },
          error: (error) => {
            this.error$.next('Ошибка при загрузке бронирования');
          },
        });
      }
    });
  }

  protected setBookingStatus(): void {
    const booking = this.booking$.value;
    if (booking) {
      this._bookingsApi
        .update(booking.bookingId, { status: this.bookingStatuses[this.activeBookingStatus] })
        .subscribe({
          next: () => {
            this.alerts.open('Статус бронирования обновлен').subscribe();
          },
          error: (error) => {
            this.error$.next('Ошибка при обновлении статуса');
          },
        });
    }
  }

  protected setBookingMainContentType(): void {
    this.activeBookingContentType = this.activeBookingContentType;
  }

  protected asFormGroup(control: AbstractControl): FormGroup {
    return control as FormGroup;
  }

  protected toggleGuest(index: number): void {
    this.expandedStates[index] = !this.expandedStates[index];
  }

  protected addProvidedAmenity(): void {
    const amenityForm = this._amenitiesForms.createProvidedAmenityForm();
    this.providedAmenityForms.push(amenityForm);
    this.providedAmenitiesArray.push(amenityForm);
    this.subscribeToFormChanges(amenityForm);
  }

  protected deleteProvidedAmenity(index: number): void {
    this.providedAmenityForms.splice(index, 1);
    this.providedAmenitiesArray.removeAt(index);
  }

  protected onAmenityChange(amenity: Amenity | null, index: number): void {
    if (!amenity) return;
    
    const amenityForm = this.providedAmenityForms[index];
    const currentQuantity = amenityForm.get('amenityQuantity')?.value || 0;
    
    // Отключаем подписку на изменения временно
    const subscription = this.subscribeToFormChanges(amenityForm);
    if (subscription) {
      subscription.unsubscribe();
    }
    
    // Устанавливаем новые значения
    amenityForm.patchValue({
      amenity: amenity,
      amenityPrice: amenity.amenityPrice,
      amenitiesTotalPrice: currentQuantity * amenity.amenityPrice
    }, { emitEvent: false });
    
    // Восстанавливаем подписку
    this.subscribeToFormChanges(amenityForm);
  }

  protected subscribeToFormChanges(form: FormGroup) {
    const quantityControl = form.get('amenityQuantity');
    if (!quantityControl) return;
    
    return quantityControl.valueChanges.pipe(
      map((quantity) => {
        const price = form.get('amenityPrice')?.value;
        if (quantity && price) {
          return quantity * Number(price);
        }
        return 0;
      })
    ).subscribe((total) => {
      form.patchValue({ amenitiesTotalPrice: total }, { emitEvent: false });
    });
  }

  exportRegistrationCard(guestForm: any) {
    const booking = this.bookingForm.getRawValue();
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
      checkInDate: booking.checkInDate,
      checkOutDate:booking.checkOutDate,
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

    html2canvas(element, { scale: 3 })
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

  exportAgreement(guestForm: any) {
    const booking = this.bookingForm.getRawValue();
    if (!booking) {
      this.alerts
        .open('Ошибка: Данные бронирования не загружены.', {
          appearance: 'error',
        })
        .subscribe();
      return;
    }

    const guestData = guestForm.value;

    const checkInDateObj = booking.checkInDate;
    const checkOutDateObj = booking.checkOutDate;

    const data = {
      contractNumber: 'AGR-4151378',
      contractDate: '22 ноября 2025 г.',
      hotelName: 'Азимут Хотелс',
      hotelAddress: 'Адрес 129110, г. Москва, пр-кт Олимпийский, д. 18/1',
      hotelPhone: '+7 (925) 685-42-31',
      hotelArrival: 'Наземный',
      hotelDirector: 'Иванов И.И.',
      guestName: `${guestData.lastName || ''} ${guestData.firstName || ''} ${guestData.middleName || ''}`.trim(),
      guestPassport: `${guestData.passportSeries || ''} ${guestData.passportNumber || ''}`.trim(),
      guestPassportIssueDate: '17 января 2018 г.',
      guestPassportIssuedBy: 'УФМС РФ',
      roomNumber: booking?.roomId || '',
      checkInDate: checkInDateObj ? formatDate(checkInDateObj, 'dd.MM.yyyy', 'en-US') : '',
      checkOutDate: checkOutDateObj ? formatDate(checkOutDateObj, 'dd.MM.yyyy', 'en-US') : '',
    };

    const contentPage1 = `
    <div style="font-family: Arial, sans-serif; font-size: 10px; line-height: 1.5; padding: 40px;">
      <div style="text-align: right; margin-bottom: 20px;">
        <p style="font-size: 10px;">Договор № ${data.contractNumber}</p>
        <p style="font-size: 10px;">оказания гостиничных услуг</p>
      </div>

      <p style="font-size: 10px;">г. Москва "${data.contractDate}"</p>

      <p style="margin-top: 20px; font-size: 10px;">
        ООО "${data.hotelName}" (наименование или Ф.И.О.) в лице заместителя директора (должность, Ф.И.О.),
        действующего на основании Доверенности №1 (документ, подтверждающий полномочия),
        от 01.03.2016 г., именуемым в дальнейшем "Исполнитель", с одной стороны и
        ${data.guestName}, паспорт: серия ${data.guestPassport}, выдан "${data.guestPassportIssueDate}" г.
        ${data.guestPassportIssuedBy}, код подразделения 772-002, именуемым в дальнейшем "Потребитель", заключили
        настоящий Договор о нижеследующем:
      </p>

      <h3 style="text-align: center; margin-top: 30px; font-size: 12px;">1. Предмет Договора</h3>
      <p style="font-size: 10px;">1.1. По настоящему Договору Исполнитель обязуется оказывать Потребителю за плату гостиничные услуги в том числе:</p>
      <p style="font-size: 10px;">- предоставить _________ комнатный номер (вариант: место в номере) для временного проживания общей площадью ______ кв. м в гостинице _______ (вид, категория, адрес гостиницы); в
      номере: ванная комната, оборудованная ванной _______ (вариант: ванной / душевой кабиной),
      раковиной, полотенцесушителем, _________; _______ туалет общей площадью _______ кв. м,
      оборудованный _______, ________ балкон/лоджия общей площадью _______ кв. м; мебель:
      2 стула и 1 стол (указать количество и вид мебели, находящейся в номере); телефон, фен, телевизор, кондиционер ;
      - обслуживание в номере: уборка _______ раз в _______ день ______;
      </p>

      <p style="font-size: 10px;">1.2. Без дополнительной платы Исполнитель предоставляет Потребителю следующие виды услуг:</p>
      <ul>
        <li style="font-size: 10px;">- вызов скорой помощи;</li>
        <li style="font-size: 10px;">- пользование медицинской аптечкой;</li>
        <li style="font-size: 10px;">- доставка в номер корреспонденции, адресованной Потребителю, по ее получении;</li>
        <li style="font-size: 10px;">- побудка к определенному времени;</li>
        <li style="font-size: 10px;">- предоставление кипятка;</li>
      </ul>

      <p style="font-size: 10px;">1.3. Порядок проживания в гостинице устанавливается Исполнителем.</p>
      <p style="font-size: 10px;">1.4. В организациях общественного питания, связи и бытового обслуживания, размещенных в гостинице, Потребитель обслуживается вне очереди.</p>

      <h3 style="text-align: center; margin-top: 30px; font-size: 12px;">2. Обязательства Сторон</h3>
      <p style="font-size: 10px;">2.1. Исполнитель обязан:</p>
      <p style="font-size: 10px;">2.1.1. Своевременно предоставить Потребителю необходимую и достоверную информацию об услугах, обеспечивающую возможность их правильного выбора.</p>
      <p style="font-size: 10px;">Информация оформляется таким образом, чтобы можно было свободно ознакомиться с ней неограниченному кругу лиц в течение всего рабочего времени гостиницы, и размещается в помещении гостиницы, предназначенном для оформления временного проживания Потребителей.</p>
      <p style="font-size: 10px;">Исполнитель также вправе довести до сведения Потребителя информацию посредством ее размещения на сайте гостиницы в информационно-телекоммуникационной сети Интернет.</p>
      <p style="font-size: 10px;">2.1.2. Обеспечить Потребителю предоставление услуг, соответствующие требованиям законами и иными нормативными правовыми актами Российской Федерации.</p>
      <p style="font-size: 10px;">2.1.3. Довести до сведения Потребителя перечень услуг, которые входят в цену требуемой услуги.</p>
      <p style="font-size: 10px;">2.1.4. Исполнитель должен устранять недостатки оказанной услуги в течение ___________ с момента
      предъявления Потребителем соответствующего требования.</p>
      <p style="font-size: 10px;">2.1.5. Исполнитель не вправе без согласия Потребителя оказывать дополнительные услуги за плату.
      Потребитель вправе отказаться от оплаты таких услуг, а если они оплачены - потребовать от
      Исполнителя возврата уплаченной суммы.</p>
      <p style="font-size: 10px;">2.1.6. Исполнитель должен обеспечить круглосуточное оформление потребителей, прибывающих в
      гостиницу и убывающих из нее.</p>
      <p style="font-size: 10px;">2.1.7. Исполнитель обязан:</p>
      <ul>
        <li style="font-size: 10px;">- Сформировать необходимые условия для комфортного пребывания гостя.</li>
        <li style="font-size: 10px;">- Ознакомить постояльцев с правилами пожарной безопасности и внутренним распорядком.</li>
      </ul>
    </div>
    `;

    const contentPage2 = `
    <div style="font-family: Arial, sans-serif; font-size: 10px; line-height: 1.5; padding: 40px;">
      <h3 style="text-align: center; margin-top: 30px; font-size: 12px;">3. Стоимость услуг и порядок расчетов</h3>
      <p style="font-size: 10px;">3.1. Стоимость услуг рассчитывается согласно действующему на момент заключения настоящего Договора Прейскуранту цен на проживание, а также Прейскуранту цен на дополнительные услуги.</p>
      <p style="font-size: 10px;">3.2. Заезд в гостиницу и выезд из гостиницы Потребителя осуществляются с учетом времени заезда и времени выезда (расчетного часа).</p>
      <p style="font-size: 10px;">Разница между временем выезда Потребителя из номера и заезда Потребителя в номер не может составлять более 3 часов.</p>
      <p style="font-size: 10px;">Плата за проживание в гостинице взимается в следующем порядке _________.</p>
      <p style="font-size: 10px;">3.3. В цену номера (места в номере) входит _______ количество проживаемых гостей.</p>
      <p style="font-size: 10px;">3.4. Потребитель обязан оплатить оказанные Исполнителем в полном объеме услуги после
      принятия их Потребителем. С согласия Потребителя услуги могут быть оплачены им при заключении
      Договора в полном объеме или путем выплаты аванса.</p>
      <p style="font-size: 10px;">3.5. Форма оплаты: ____________ онлайн и оффлайн.</p>

      <h3 style="text-align: center; margin-top: 30px; font-size: 12px;">4. Порядок предоставления услуг</h3>
      <p style="font-size: 10px;">4.1. Качество предоставляемых услуг должно соответствовать условиям настоящего Договора и требованиям, обычно предъявляемым к этим услугам.</p>
      <p style="font-size: 10px;">Если нормативными правовыми актами предусмотрены обязательные требования к услугам, качество предоставляемых услуг должно соответствовать этим требованиям.</p>
      <p style="font-size: 10px;">Материально-техническое обеспечение гостиницы, перечень и качество предоставляемых услуг должны соответствовать требованиям присвоенной ей категории.</p>

      <h3 style="text-align: center; margin-top: 30px; font-size: 12px;">5. Ответственность Сторон</h3>
      <p style="font-size: 10px;">5.1. За нарушение сроков оказания услуг либо отдельных требований Потребителя Исполнитель уплачивает Потребителю за каждый час (день, если срок определен в днях) просрочки неустойку (пени) в размере 15 % от суточной цены номера (места в номере) или цены отдельной услуги, если ее можно определить.</p>
      <p style="font-size: 10px;">5.2. За нарушение сроков начала оказания услуг по Договору на бронирование мест в гостинице Исполнитель уплачивает Потребителю за каждый день просрочки неустойку (пени) в размере 13 % от суточной цены забронированных мест.</p>
      <p style="font-size: 10px;">5.3. Если Исполнитель нарушил сроки начала оказания услуг по настоящему Договору на бронирование мест в гостинице, Потребитель по своему выбору вправе:</p>
      <ul>
        <li style="font-size: 10px;">- назначить Исполнителю новый срок;</li>
        <li style="font-size: 10px;">- потребовать уменьшения цены за оказанные услуги;</li>
        <li style="font-size: 10px;">- расторгнуть настоящий Договор.</li>
      </ul>
    </div>
    `;

    const contentPage3 = `
    <div style="font-family: Arial, sans-serif; font-size: 10px; line-height: 1.5; padding: 40px;">
      <p style="font-size: 10px;">5.4. Исполнитель, в соответствии с законодательством Российской Федерации, несет ответственность за вред, причиненный жизни, здоровью или имуществу Потребителя вследствие недостатков при оказании услуг, а также компенсирует моральный вред, причиненный нарушением прав Потребителя.</p>
      <p style="font-size: 10px;">5.5. Потребитель, в соответствии с законодательством Российской Федерации, возмещает ущерб в случае утраты или повреждения имущества гостиницы, а также несет ответственность за иные нарушения.</p>
      <p style="font-size: 10px;">5.6. Исполнитель отвечает за сохранность вещей Потребителя в соответствии с законодательством Российской Федерации.</p>

      <h3 style="text-align: center; margin-top: 30px; font-size: 12px;">6. Заключительные положения</h3>
      <p style="font-size: 10px;">6.1. Настоящий Договор вступает в силу с момента его подписания обеими Сторонами и действует до полного исполнения ими принятых обязательств.</p>
      <p style="font-size: 10px;">6.2. Настоящий Договор составлен в двух экземплярах, имеющих равную юридическую силу, по одному для каждой из Сторон.</p>
      <p style="font-size: 10px;">6.3. Во всем, что не предусмотрено настоящим Договором, Стороны руководствуются действующим законодательством Российской Федерации.</p>

      <h3 style="text-align: center; margin-top: 30px; font-size: 12px;">7. Адреса, реквизиты и подписи Сторон</h3>

      <div style="display: flex; justify-content: space-between; margin-top: 50px;">
        <div style="width: 48%;">
          <p style="font-size: 10px;"><strong>Исполнитель:</strong></p>
          <p style="font-size: 10px;">ООО "Азимут Хотелс Компани"</p>
          <p style="font-size: 10px;">Юридический/почтовый адрес:</p>
          <p style="font-size: 10px;">129110, г. Москва,</p>
          <p style="font-size: 10px;">пр-кт Олимпийский, д. 18/1</p>
          <p style="font-size: 10px;">ИНН/КПП 7726548255</p>
          <p style="font-size: 10px;">ОГРН 770201001</p>
          <p style="font-size: 10px;">ОКПО 5067748497660</p>
          <p style="font-size: 10px;">Расчетный счет ___________________</p>
          <p style="font-size: 10px;">в _____________________ банке</p>
          <p style="font-size: 10px;">К/с ___________________</p>
          <p style="font-size: 10px;">БИК ___________________</p>
          <p style="font-size: 10px;">Телефон: +7 (800) 100-56-68</p>
          <p style="font-size: 10px;">Факс: ____________---</p>
          <p style="font-size: 10px;">Адрес электронной почты: ___________</p>
          <p style="margin-top: 30px; font-size: 10px;">Исполнитель: _________________ (подпись/Ф.И.О.)</p>
        </div>
        <div style="width: 48%;">
          <p style="font-size: 10px;"><strong>Потребитель:</strong></p>
          <p style="font-size: 10px;">Фамилия, имя, отчество ${data.guestName}</p>
          <p style="font-size: 10px;">Паспорт: серия ${data.guestPassport}</p>
          <p style="font-size: 10px;">${data.guestPassportIssuedBy}</p>
          <p style="font-size: 10px;">"${data.guestPassportIssueDate}" г.</p>
          <p style="font-size: 10px;">Адрес места регистрации:</p>
          <p style="font-size: 10px;">г. Москва, ул. 5-я Новослободская д. 31</p>
          <p style="margin-top: 30px; font-size: 10px;">Потребитель: _________________ (подпись/Ф.И.О.)</p>
        </div>
      </div>
    </div>
    `;

    const pagesContent = [
      contentPage1,
      contentPage2,
      contentPage3
    ];

    const pdf = new jsPDF();

    for (let i = 0; i < pagesContent.length; i++) {
      const content = pagesContent[i];
      const element = document.createElement('div');
      element.innerHTML = content;
      element.style.position = 'absolute';
      element.style.left = '-9999px';
      document.body.appendChild(element);

      html2canvas(element, { scale: 3 })
        .then((canvas) => {
          const imgData = canvas.toDataURL('image/png');
          const imgWidth = 500;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          if (i > 0) {
            pdf.addPage();
          }
          pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

          if (i === pagesContent.length - 1) {
            pdf.save(`Договор_${data.guestName}.pdf`);
            document.body.removeChild(element);
          } else {
            document.body.removeChild(element);
          }
        })
        .catch((error) => {
          console.error('Error generating PDF page:', error);
          this.alerts
            .open('Ошибка при генерации PDF страницы.', { appearance: 'error' })
            .subscribe();
          document.body.removeChild(element);
        });
    }
  }

  protected submit(): void {
    if (this.bookingForm.valid) {
      this.loading$.next(true);
      this.error$.next(null);

      const booking = this.booking$.value;
      if (booking) {
        const bookingFormValue = {
          checkInDate: this.bookingForm.get('checkInDate')?.value,
          checkOutDate: this.bookingForm.get('checkOutDate')?.value,
          roomId: this.bookingForm.get('roomId')?.value,
          status: this.bookingStatuses[this.activeBookingStatus],
          guests: this.guestForms.value,
          providedAmenities: this.providedAmenityForms.map(form => ({
            amenityId: form.get('amenity')?.value?.amenityId,
            quantity: form.get('amenityQuantity')?.value || 0,
            totalPrice: form.get('amenitiesTotalPrice')?.value || 0
          })).filter(amenity => amenity.amenityId)
        };

        console.log('Sending booking data:', bookingFormValue);

        this._bookingsApi.update(booking.bookingId, bookingFormValue).subscribe({
          next: () => {
            this.loading$.next(false);
            this.alerts.open('Бронирование обновлено').subscribe();
          },
          error: (error) => {
            this.loading$.next(false);
            this.error$.next('Ошибка при обновлении бронирования');
          },
        });
      }
    }
  }
}
