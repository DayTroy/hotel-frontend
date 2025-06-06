import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { TuiAlertService, TuiButton, TuiDialogContext, TuiDialogService, TuiTextfield } from '@taiga-ui/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { TuiTable } from '@taiga-ui/addon-table';
import { TUI_FALSE_HANDLER, tuiTakeUntilDestroyed } from '@taiga-ui/cdk';
import { timer, catchError, map, startWith, Subject, switchMap, BehaviorSubject, finalize, of } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TUI_CONFIRM, TuiButtonLoading, TuiComboBox, TuiConfirmData, TuiDataListWrapper, TuiFilterByInputPipe, TuiInputNumber, TuiSelect, TuiStatus, TuiStringifyContentPipe, TuiTextarea, TuiTextareaLimit } from '@taiga-ui/kit';
import { PolymorpheusContent } from '@taiga-ui/polymorpheus';
import { TuiCurrencyPipe } from '@taiga-ui/addon-commerce';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RoomsApiService } from './rooms-api.service';
import { RoomForms } from './rooms-forms.service';
import { RoomCategory } from '../room-categories/room-categories.component';
import { RoomCategoriesApiService } from '../room-categories/room-categories-api.service';
import { TuiComboBoxModule } from '@taiga-ui/legacy';

export interface Room {
  roomId: string;
  status: string;
  stage: string;
  roomCategory: RoomCategory;
}

interface RoomForm {
  roomId: string;
  stage: number;
  roomCategory: {
    id: string;
    title: string;
  }
  pricePerNight: number;
  capacity: number;
}

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [
    NgIf,
    TuiTable,
    AsyncPipe,
    NgFor,
    TuiCurrencyPipe,
    TuiButton,
    TuiStatus,
    TuiTextfield,
    FormsModule,
    ReactiveFormsModule,
    TuiInputNumber,
    TuiButtonLoading,
    TuiDataListWrapper,
    TuiSelect,
    TuiComboBoxModule,
    TuiFilterByInputPipe,
    TuiStringifyContentPipe,
  ],
  templateUrl: './rooms.component.html',
  styleUrl: './rooms.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomsComponent implements OnInit {
  @ViewChild('roomDialog') roomDialog!: TemplateRef<any>;

  roomForm = this._roomsForms.createRoomForm();

  destroyRef = inject(DestroyRef);
  private readonly dialogs = inject(TuiDialogService);
  private readonly alerts = inject(TuiAlertService);
  private currentDialogObserver: any;

  protected selectedReference: string | null = 'Выберите справочник...';
  protected readonly loading$ = new BehaviorSubject<boolean>(false);
  protected readonly error$ = new BehaviorSubject<string | null>(null);
  protected readonly rooms$ = new BehaviorSubject<Room[]>([]);
  protected readonly roomCategories$ = new BehaviorSubject<RoomCategory[]>([]);
  protected isEditMode = false;
  protected readonly trigger$ = new Subject<void>();
  protected readonly submitLoading$ = this.trigger$.pipe(
    switchMap(() =>
      timer(2000).pipe(map(TUI_FALSE_HANDLER), startWith('Loading'))
    )
  );

  protected readonly columns = [
    //   'roomId',
    //   'title',
    //   'pricePerNight',
    //   'capacity',
    //   'description',
    //   'actions',
  ];

  constructor(
    private readonly _roomsApi: RoomsApiService,
    private readonly _roomsForms: RoomForms,
    private readonly _roomCategoriesApi: RoomCategoriesApiService
  ) {}

  ngOnInit(): void {
    this.loadRooms();
    this.loadRoomCategories();
  }

  protected loadRooms(): void {
    this.loading$.next(true);
    this.error$.next(null);

    this._roomsApi
      .getAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((error) => {
          this.error$.next('Ошибка при загрузке данных');
          console.error('Error loading rooms:', error);
          return of([]);
        }),
        finalize(() => this.loading$.next(false))
      )
      .subscribe((categories) => {
        this.rooms$.next(categories);
      });
  }

  protected confirmRoomRemove(roomId: string): void {
    const data: TuiConfirmData = {
      content: 'Вы действительно хотите удалить гостиничный номер?',
      yes: 'Подтвердить',
      no: 'Отменить',
    };

    this.dialogs
      .open<boolean>(TUI_CONFIRM, {
        label: 'Удалить гостиничный номер',
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
          return this._roomsApi.delete(roomId).pipe(
            catchError((error) => {
              this.alerts.open('Ошибка при удалении номера', {
                appearance: 'negative',
              });
              console.error('Error deleting room:', error);
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
          .open('Гостиничный номер успешно удален', { appearance: 'positive' })
          .subscribe();
        this.loadRooms();
      });
  }

  protected editRoom(
    content: PolymorpheusContent<TuiDialogContext>,
    room: Room
  ): void {
    this.isEditMode = true;
    this.roomForm.patchValue({
      roomId: room.roomId,
      stage: room.stage,
      pricePerNight: room.roomCategory.pricePerNight,
      capacity: room.roomCategory.capacity,
      roomCategory: {
        id: room.roomCategory.roomCategoryId,
        title: room.roomCategory.title,
      },
    });
    this.dialogs.open(content).subscribe((observer) => {
      this.currentDialogObserver = observer;
    });
  }

  public addRoom(content: PolymorpheusContent<TuiDialogContext>): void {
    this.isEditMode = false;
    this.roomForm.reset();
    this.dialogs.open(content).subscribe((observer) => {
      this.currentDialogObserver = observer;
    });
  }

  protected submit(): void {
    if (this.roomForm.valid) {
      const formValue = this.roomForm.getRawValue();
      this.loading$.next(true);

      const request$ = this.isEditMode
        ? this._roomsApi.update(
            formValue.roomId,
            {
              roomId: formValue.roomId,
              stage: formValue.stage,
              roomCategoryId: formValue.roomCategory.id
            }
          )
        : this._roomsApi.create({
            roomId: formValue.roomId,
            stage: formValue.stage,
            roomCategoryId: formValue.roomCategory.id
          });

      request$
        .pipe(
          tuiTakeUntilDestroyed(this.destroyRef),
          catchError((error) => {
            this.alerts.open(
              `Ошибка при ${
                this.isEditMode ? 'обновлении' : 'создании'
              } номера`,
              { appearance: 'negative' }
            );
            console.error('Error saving room:', error);
            return of(null);
          }),
          finalize(() => {
            this.loading$.next(false);
          })
        )
        .subscribe(() => {
          this.alerts
            .open(
              `Гостиничный номер успешно ${this.isEditMode ? 'обновлен' : 'создан'}`,
              { appearance: 'positive' }
            )
            .subscribe();
          this.loadRooms();
          this.currentDialogObserver?.complete();
          this.trigger$.next();
        });
    } else {
      Object.keys(this.roomForm.controls).forEach((key) => {
        const control = this.roomForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }

  private loadRoomCategories(): void {
    this._roomCategoriesApi
      .getAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((error) => {
          this.error$.next('Ошибка при загрузке категорий номеров');
          console.error('Error loading room categories:', error);
          return of([]);
        })
      )
      .subscribe((categories) => {
        this.roomCategories$.next(categories);
      });
  }

  protected readonly stringify = (item: RoomCategory | null | undefined) =>
    item && typeof item === 'object' ? item.title : item ? String(item) : '';

  protected onRoomCategoryChange(category: RoomCategory | null): void {
    if (category) {
      this.roomForm.patchValue({
        capacity: category.capacity,
        pricePerNight: category.pricePerNight,
        roomCategory: {
          id: category.roomCategoryId,
        }
      });
    }
  }
}
