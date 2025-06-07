import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { TuiAlertService, TuiButton, TuiDialogContext, TuiDialogService, TuiFormatNumberPipe, TuiTextfield } from '@taiga-ui/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { TuiTable } from '@taiga-ui/addon-table';
import { TUI_FALSE_HANDLER, tuiTakeUntilDestroyed } from '@taiga-ui/cdk';
import { timer, catchError, map, startWith, Subject, switchMap, BehaviorSubject, finalize, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TUI_CONFIRM, TuiButtonLoading, TuiConfirmData, TuiInputNumber, TuiStatus, TuiTextarea, TuiTextareaLimit } from '@taiga-ui/kit';
import { PolymorpheusContent } from '@taiga-ui/polymorpheus';
import { TuiCurrencyPipe } from '@taiga-ui/addon-commerce';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AmenitiesForms } from './amenities-forms.service';
import { AmenitiesApiService } from './amenities-api.service';

export interface Amenity {
    amenityId: string;
    amenityTitle: string;
    amenityPrice: string;
  }
  
  interface AmenityForm {
    amenityId: string;
    amenityTitle: string;
    amenityPrice: string;
  }

@Component({
    selector: 'app-amenities',
    standalone: true,
    imports: [NgIf, TuiTable, AsyncPipe, NgFor, TuiCurrencyPipe, TuiButton, TuiStatus, TuiTextfield, FormsModule, ReactiveFormsModule, TuiInputNumber, TuiTextarea, TuiTextareaLimit, TuiButtonLoading, TuiFormatNumberPipe],
    templateUrl: './amenities.component.html',
    styleUrl: './amenities.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AmenitiesComponent implements OnInit {
    @ViewChild('amenityDialog') amenityDialog!: TemplateRef<any>;
  
    amenityForm = this._amenitiesForms.createAmenityForm();
  
    destroyRef = inject(DestroyRef);
    private readonly dialogs = inject(TuiDialogService);
    private readonly alerts = inject(TuiAlertService);
    private currentDialogObserver: any;
  
  
    protected selectedReference: string | null = 'Выберите справочник...';
    protected readonly loading$ = new BehaviorSubject<boolean>(false);
    protected readonly error$ = new BehaviorSubject<string | null>(null);
    protected readonly amenities$ = new BehaviorSubject<Amenity[]>([]);
    protected isEditMode = false;
    protected readonly trigger$ = new Subject<void>();
    protected readonly submitLoading$ = this.trigger$.pipe(
      switchMap(() =>
        timer(2000).pipe(map(TUI_FALSE_HANDLER), startWith('Loading'))
      )
    );
  
    protected readonly columns = [
      'amenityid',
      'amenityTitle',
      'price',
      'actions',
    ];
  
    constructor(private readonly _amenitiesApi: AmenitiesApiService, private readonly _amenitiesForms: AmenitiesForms) {}
  
    ngOnInit(): void {
      this.loadAmenities();
    }
  
    protected loadAmenities(): void {
      this.loading$.next(true);
      this.error$.next(null);
  
      this._amenitiesApi
        .getAll()
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          catchError((error) => {
            this.error$.next('Ошибка при загрузке данных');
            console.error('Error loading amenities:', error);
            return of([]);
          }),
          finalize(() => this.loading$.next(false))
        )
        .subscribe((amenities) => {
          this.amenities$.next(amenities);
        });
    }
  
    protected confirmAmenityRemove(categoryId: string): void {
      const data: TuiConfirmData = {
        content: 'Вы действительно хотите удалить дополнительную услугу?',
        yes: 'Подтвердить',
        no: 'Отменить',
      };
  
      this.dialogs
        .open<boolean>(TUI_CONFIRM, {
          label: 'Удалить доп.услугу',
          size: 'l',
          data,
        })
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          switchMap((confirmed) => {
            if (!confirmed) {
              return of(null);
            }
  
            this.loading$.next(true);
            return this._amenitiesApi.delete(categoryId).pipe(
              catchError((error) => {
                this.alerts.open('Ошибка при удалении доп.услуги', {
                  appearance: 'negative',
                });
                console.error('Error deleting amenity:', error);
                return of(null);
              }),
              finalize(() => {
                this.loading$.next(false);
              })
            );
          })
        )
        .subscribe(() => {
          this.alerts
            .open('Дополнительная услуга успешно удалена', { appearance: 'positive' })
            .subscribe();
          this.loadAmenities();
        });
    }
  
    protected editAmenity(
      content: PolymorpheusContent<TuiDialogContext>,
      amenity: Amenity
    ): void {
      this.isEditMode = true;
      this.amenityForm.patchValue({
        amenityId: amenity.amenityId,
        amenityTitle: amenity.amenityTitle,
        amenityPrice: amenity.amenityPrice
      });
      this.dialogs.open(content).subscribe((observer) => {
        this.currentDialogObserver = observer;
      });
    }
  
    public addAmenity(
      content: PolymorpheusContent<TuiDialogContext>
    ): void {
      this.isEditMode = false;
      this.amenityForm.reset();
      this.dialogs.open(content).subscribe((observer) => {
        this.currentDialogObserver = observer;
      });
    }
  
    protected submit(observer: any): void {
      if (this.amenityForm.valid) {
        const formValue = this.amenityForm.getRawValue();
        this.loading$.next(true);
  
        const request$ = this.isEditMode
          ? this._amenitiesApi.update(
              formValue.amenityId,
              formValue
            )
          : this._amenitiesApi.create(formValue);
  
        request$
          .pipe(
            tuiTakeUntilDestroyed(this.destroyRef),
            catchError((error) => {
              this.alerts.open(
                `Ошибка при ${
                  this.isEditMode ? 'обновлении' : 'создании'
                } доп.услуги`,
                { appearance: 'negative' }
              );
              console.error('Error saving amenity:', error);
              return of(null);
            }),
            finalize(() => {
              this.loading$.next(false);
            })
          )
          .subscribe(() => {
            this.alerts
              .open(
                `Дополнительная услуга успешно ${this.isEditMode ? 'обновлена' : 'создана'}`,
                { appearance: 'positive' }
              )
              .subscribe();
              observer.complete();
            this.loadAmenities();
            this.currentDialogObserver?.complete();
            this.dialogs
            this.trigger$.next();
          });
      } else {
        Object.keys(this.amenityForm.controls).forEach((key) => {
          const control = this.amenityForm.get(key);
          if (control?.invalid) {
            control.markAsTouched();
          }
        });
      }
    }
}
