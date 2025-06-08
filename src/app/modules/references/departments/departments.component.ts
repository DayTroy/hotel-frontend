import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  TuiAlertService,
  TuiButton,
  TuiCalendar,
  TuiDialogContext,
  TuiDialogService,
  TuiTextfield,
  TuiTextfieldDropdownDirective,
} from '@taiga-ui/core';
import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { TuiTable } from '@taiga-ui/addon-table';
import {
  TUI_FALSE_HANDLER,
  tuiTakeUntilDestroyed,
  TuiTime,
} from '@taiga-ui/cdk';
import {
  timer,
  catchError,
  map,
  startWith,
  Subject,
  switchMap,
  BehaviorSubject,
  finalize,
  of,
  tap,
} from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  TUI_CONFIRM,
  TuiButtonLoading,
  TuiConfirmData,
  TuiInputDate,
  TuiInputNumber,
  TuiStatus,
  TuiTextarea,
  TuiTextareaLimit,
} from '@taiga-ui/kit';
import { PolymorpheusContent } from '@taiga-ui/polymorpheus';
import { TuiCurrencyPipe } from '@taiga-ui/addon-commerce';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DepartmentsApiService } from './departments-api.service';
import { DepartmentsForms } from './departments-forms.service';
import {
  TuiInputTimeModule,
  TuiTextfieldControllerModule,
} from '@taiga-ui/legacy';
import { Department } from '../../../interfaces/department.interface';

@Component({
  selector: 'app-departments',
  standalone: true,
  imports: [
    NgIf,
    TuiTable,
    AsyncPipe,
    NgFor,
    TuiButton,
    TuiStatus,
    TuiTextfield,
    FormsModule,
    ReactiveFormsModule,
    TuiInputNumber,
    TuiButtonLoading,
    TuiInputDate,
    TuiInputTimeModule,
    TuiTextfieldControllerModule,
  ],
  templateUrl: './departments.component.html',
  styleUrl: './departments.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DepartmentsComponent implements OnInit {
  @ViewChild('departmentDialog') departmentDialog!: TemplateRef<any>;

  departmentForm = this._departmentsForms.createDepartmentForm();

  destroyRef = inject(DestroyRef);
  private readonly dialogs = inject(TuiDialogService);
  private readonly alerts = inject(TuiAlertService);
  private currentDialogObserver: any;

  protected selectedReference: string | null = 'Выберите справочник...';
  protected readonly loading$ = new BehaviorSubject<boolean>(false);
  protected readonly error$ = new BehaviorSubject<string | null>(null);
  protected readonly departments$ = new BehaviorSubject<Department[]>([]);
  protected isEditMode = false;
  protected readonly trigger$ = new Subject<void>();
  protected readonly submitLoading$ = this.trigger$.pipe(
    switchMap(() =>
      timer(2000).pipe(map(TUI_FALSE_HANDLER), startWith('Loading'))
    )
  );

  protected readonly columns = [
    'departmenTitle',
    'departmentCabinet',
    'workingHours',
    'actions',
  ];

  constructor(
    private readonly _departmentsApi: DepartmentsApiService,
    private readonly _departmentsForms: DepartmentsForms
  ) {}

  ngOnInit(): void {
    this.loadDepartments();
  }

  protected loadDepartments(): void {
    this.loading$.next(true);
    this.error$.next(null);

    this._departmentsApi
      .getAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((error) => {
          this.error$.next('Ошибка при загрузке данных');
          return of([]);
        }),
        finalize(() => this.loading$.next(false))
      )
      .subscribe((departments) => {
        this.departments$.next(departments);
      });
  }

  protected confirmDepartmentRemove(departmentId: string): void {
    const data: TuiConfirmData = {
      content: 'Вы действительно хотите удалить отдел',
      yes: 'Подтвердить',
      no: 'Отменить',
    };

    this.dialogs
      .open<boolean>(TUI_CONFIRM, {
        label: 'Удалить отдел',
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
          return this._departmentsApi.delete(departmentId).pipe(
            tap(() => {
              this.alerts
                .open('Отдел успешно создан', { appearance: 'positive' })
                .subscribe();
            }),
            catchError((error) => {
              this.alerts.open('Ошибка при удалении отдела', {
                appearance: 'negative',
              });
              return of(null);
            }),
            finalize(() => {
              this.loading$.next(false);
            })
          );
        })
      )
      .subscribe(() => {
        this.loadDepartments();
      });
  }

  protected editDepartment(
    content: PolymorpheusContent<TuiDialogContext>,
    department: Department
  ): void {
    this.isEditMode = true;

    let workingHoursStart = '';
    let workingHoursEnd = '';
    if (department.workingHours) {
      const times = department.workingHours.split(' - ');
      if (times.length === 2) {
        workingHoursStart = times[0];
        workingHoursEnd = times[1];
      }
    }

    this.departmentForm.patchValue({
      departmentId: department.departmentId,
      departmentTitle: department.departmentTitle,
      departmentCabinet: department.departmentCabinet,
      workingHoursStart: workingHoursStart,
      workingHoursEnd: workingHoursEnd,
    });
    this.dialogs.open(content).subscribe((observer) => {
      this.currentDialogObserver = observer;
    });
  }

  public addDepartment(content: PolymorpheusContent<TuiDialogContext>): void {
    this.isEditMode = false;
    this.departmentForm.reset();
    this.dialogs.open(content).subscribe((observer) => {
      this.currentDialogObserver = observer;
    });
  }

  protected submit(observer: any): void {
    if (this.departmentForm.valid) {
      const formValue = this.departmentForm.getRawValue();
      this.loading$.next(true);

      const request$ = this.isEditMode
        ? this._departmentsApi.update(formValue.departmentId, {
            departmentId: formValue.departmentId,
            departmentTitle: formValue.departmentTitle,
            departmentCabinet: formValue.departmentCabinet,
            workingHours: `${formValue.workingHoursStart} - ${formValue.workingHoursEnd}`,
          })
        : this._departmentsApi.create({
            departmentId: formValue.departmentId,
            departmentTitle: formValue.departmentTitle,
            departmentCabinet: formValue.departmentCabinet,
            workingHours: `${formValue.workingHoursStart} - ${formValue.workingHoursEnd}`,
          });

      request$
        .pipe(
          tuiTakeUntilDestroyed(this.destroyRef),
          catchError((error) => {
            this.alerts.open(
              `Ошибка при ${
                this.isEditMode ? 'обновлении' : 'создании'
              } отдела`,
              { appearance: 'negative' }
            );
            return of(null);
          }),
          finalize(() => {
            this.loading$.next(false);
          })
        )
        .subscribe(() => {
          this.alerts
            .open(`Отдел успешно ${this.isEditMode ? 'обновлен' : 'создан'}`, {
              appearance: 'positive',
            })
            .subscribe();
          observer.complete();
          this.loadDepartments();
          this.currentDialogObserver?.complete();
          this.dialogs;
          this.trigger$.next();
        });
    } else {
      Object.keys(this.departmentForm.controls).forEach((key) => {
        const control = this.departmentForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }
}
