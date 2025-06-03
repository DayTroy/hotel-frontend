import {
  CommonModule,
  NgSwitch,
  NgSwitchCase,
  NgSwitchDefault,
} from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  TuiButton,
  TuiIcon,
  TuiTextfield,
  TuiAlertService,
  TuiDialogService,
  TuiDialogContext,
} from '@taiga-ui/core';
import {
  TuiDataListWrapper,
  TuiSelect,
  TuiChevron,
  TuiStatus,
  TUI_CONFIRM,
  TuiConfirmData,
  TuiTextareaLimit,
  TuiTextarea,
  TuiButtonLoading,
} from '@taiga-ui/kit';
import { TuiCurrencyPipe } from '@taiga-ui/addon-commerce';
import { TuiTable } from '@taiga-ui/addon-table';
import { ReferencesApiService } from './references-api.service';
import {
  BehaviorSubject,
  Observable,
  Subject,
  catchError,
  finalize,
  map,
  of,
  startWith,
  switchMap,
  timer,
} from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import type { PolymorpheusContent } from '@taiga-ui/polymorpheus';
import { TUI_FALSE_HANDLER } from '@taiga-ui/cdk';

interface RoomCategory {
  roomCategoryId: string;
  title: string;
  pricePerNight: number;
  capacity: number;
  description: string;
}

interface RoomCategoryForm {
  roomCategoryId: string;
  title: string;
  pricePerNight: number;
  capacity: number;
  description: string;
}

@Component({
  selector: 'app-references',
  standalone: true,
  imports: [
    TuiTextfield,
    TuiDataListWrapper,
    TuiSelect,
    CommonModule,
    FormsModule,
    TuiTable,
    TuiCurrencyPipe,
    TuiChevron,
    TuiIcon,
    TuiButton,
    TuiStatus,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    ReactiveFormsModule,
    TuiTextareaLimit,
    TuiTextarea,
    TuiButtonLoading,
  ],
  templateUrl: './references.component.html',
  styleUrl: './references.component.scss',
})
export class ReferencesComponent implements OnInit {
  protected readonly roomCategoryForm = new FormGroup<{
    roomCategoryId: FormControl<string>;
    title: FormControl<string>;
    pricePerNight: FormControl<number>;
    capacity: FormControl<number>;
    description: FormControl<string>;
  }>({
    roomCategoryId: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
    pricePerNight: new FormControl(0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0)],
    }),
    capacity: new FormControl(1, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1)],
    }),
    description: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(3),
        Validators.maxLength(100),
      ],
    }),
  });

  destroyRef = inject(DestroyRef);
  private readonly dialogs = inject(TuiDialogService);
  private readonly alerts = inject(TuiAlertService);
  private currentDialogObserver: any;

  protected readonly references = [
    'Гостиничные номера',
    'Типы гостиничных номеров',
    'Сотрудники',
    'Отделы',
    'Дополнительные услуги',
    'Гости',
  ] as const;

  protected selectedReference: string | null = 'Выберите справочник...';
  protected readonly loading$ = new BehaviorSubject<boolean>(false);
  protected readonly error$ = new BehaviorSubject<string | null>(null);
  protected readonly roomCategories$ = new BehaviorSubject<RoomCategory[]>([]);
  protected isEditMode = false;
  protected readonly trigger$ = new Subject<void>();
  protected readonly submitLoading$ = this.trigger$.pipe(
    switchMap(() =>
      timer(2000).pipe(map(TUI_FALSE_HANDLER), startWith('Loading'))
    )
  );

  protected readonly columns = [
    'roomCategoryId',
    'title',
    'pricePerNight',
    'capacity',
    'description',
    'actions',
  ];

  constructor(private readonly _referencesApi: ReferencesApiService) {}

  ngOnInit(): void {
    this.loadRoomCategories();
  }

  protected loadRoomCategories(): void {
    this.loading$.next(true);
    this.error$.next(null);

    this._referencesApi
      .getRoomCategories()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((error) => {
          this.error$.next('Ошибка при загрузке данных');
          console.error('Error loading room categories:', error);
          return of([]);
        }),
        finalize(() => this.loading$.next(false))
      )
      .subscribe((categories) => {
        this.roomCategories$.next(categories);
      });
  }

  protected confirmRoomCategoryRemove(categoryId: string): void {
    const data: TuiConfirmData = {
      content: 'Вы действительно хотите удалить категорию номера?',
      yes: 'Подтвердить',
      no: 'Отменить',
    };

    this.dialogs
      .open<boolean>(TUI_CONFIRM, {
        label: 'Удалить категорию',
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
          return this._referencesApi.deleteRoomCategory(categoryId).pipe(
            catchError((error) => {
              this.alerts.open('Ошибка при удалении категории', {
                appearance: 'negative',
              });
              console.error('Error deleting room category:', error);
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
          .open('Категория успешно удалена', { appearance: 'positive' })
          .subscribe();
        this.loadRoomCategories();
      });
  }

  protected editRoomCategory(
    content: PolymorpheusContent<TuiDialogContext>,
    category: RoomCategory
  ): void {
    this.isEditMode = true;
    this.roomCategoryForm.patchValue({
      roomCategoryId: category.roomCategoryId,
      title: category.title,
      pricePerNight: category.pricePerNight,
      capacity: category.capacity,
      description: category.description,
    });
    this.dialogs.open(content).subscribe((observer) => {
      this.currentDialogObserver = observer;
    });
  }

  protected addRoomCategory(
    content: PolymorpheusContent<TuiDialogContext>
  ): void {
    this.isEditMode = false;
    this.roomCategoryForm.reset();
    this.dialogs.open(content).subscribe((observer) => {
      this.currentDialogObserver = observer;
    });
  }

  protected submit(): void {
    if (this.roomCategoryForm.valid) {
      const formValue = this.roomCategoryForm.getRawValue();
      this.loading$.next(true);

      const request$ = this.isEditMode
        ? this._referencesApi.updateRoomCategory(
            formValue.roomCategoryId,
            formValue
          )
        : this._referencesApi.createRoomCategory(formValue);

      request$
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          catchError((error) => {
            this.alerts.open(
              `Ошибка при ${
                this.isEditMode ? 'обновлении' : 'создании'
              } категории`,
              { appearance: 'negative' }
            );
            console.error('Error saving room category:', error);
            return of(null);
          }),
          finalize(() => {
            this.loading$.next(false);
          })
        )
        .subscribe(() => {
          this.alerts
            .open(
              `Категория успешно ${this.isEditMode ? 'обновлена' : 'создана'}`,
              { appearance: 'positive' }
            )
            .subscribe();
          this.loadRoomCategories();
          this.currentDialogObserver?.complete();
          this.trigger$.next();
        });
    } else {
      Object.keys(this.roomCategoryForm.controls).forEach((key) => {
        const control = this.roomCategoryForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }
}
