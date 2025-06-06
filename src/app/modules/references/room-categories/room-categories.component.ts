import { ChangeDetectionStrategy, Component, DestroyRef, inject, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { TuiAlertService, TuiButton, TuiDialogContext, TuiDialogService, TuiTextfield } from '@taiga-ui/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { TuiTable } from '@taiga-ui/addon-table';
import { TUI_FALSE_HANDLER, tuiTakeUntilDestroyed } from '@taiga-ui/cdk';
import { timer, catchError, map, startWith, Subject, switchMap, BehaviorSubject, finalize, of } from 'rxjs';
import { RoomCategoriesForms } from './room-categories-forms.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TUI_CONFIRM, TuiButtonLoading, TuiConfirmData, TuiInputNumber, TuiStatus, TuiTextarea, TuiTextareaLimit } from '@taiga-ui/kit';
import { PolymorpheusContent } from '@taiga-ui/polymorpheus';
import { TuiCurrencyPipe } from '@taiga-ui/addon-commerce';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RoomCategoriesApiService  } from './room-categories-api.service';

export interface RoomCategory {
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
    selector: 'app-room-categories',
    standalone: true,
    imports: [NgIf, TuiTable, AsyncPipe, NgFor, TuiCurrencyPipe, TuiButton, TuiStatus, TuiTextfield, FormsModule, ReactiveFormsModule, TuiInputNumber, TuiTextarea, TuiTextareaLimit, TuiButtonLoading],
    templateUrl: './room-categories.component.html',
    styleUrl: './room-categories.component.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomCategoriesComponent implements OnInit {
    @ViewChild('roomCategoryDialog') roomCategoryDialog!: TemplateRef<any>;
  
    roomCategoryForm = this._roomCategoriesForms.createRoomCategoryForm();
  
    destroyRef = inject(DestroyRef);
    private readonly dialogs = inject(TuiDialogService);
    private readonly alerts = inject(TuiAlertService);
    private currentDialogObserver: any;
  
  
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
  
    constructor(private readonly _roomCategoriesApi: RoomCategoriesApiService, private readonly _roomCategoriesForms: RoomCategoriesForms) {}
  
    ngOnInit(): void {
      this.loadRoomCategories();
    }
  
    protected loadRoomCategories(): void {
      this.loading$.next(true);
      this.error$.next(null);
  
      this._roomCategoriesApi
        .getAll()
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
            return this._roomCategoriesApi.delete(categoryId).pipe(
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
  
    public addRoomCategory(
      content: PolymorpheusContent<TuiDialogContext>
    ): void {
      this.isEditMode = false;
      this.roomCategoryForm.reset();
      this.dialogs.open(content).subscribe((observer) => {
        this.currentDialogObserver = observer;
      });
    }
  
    protected submit(observer: any): void {
      if (this.roomCategoryForm.valid) {
        const formValue = this.roomCategoryForm.getRawValue();
        this.loading$.next(true);
  
        const request$ = this.isEditMode
          ? this._roomCategoriesApi.update(
              formValue.roomCategoryId,
              formValue
            )
          : this._roomCategoriesApi.create(formValue);
  
        request$
          .pipe(
            tuiTakeUntilDestroyed(this.destroyRef),
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
            observer.complete();
            this.loadRoomCategories();
            this.currentDialogObserver?.complete();
            this.dialogs
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
