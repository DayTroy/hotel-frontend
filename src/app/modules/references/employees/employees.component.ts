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
} from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  TUI_CONFIRM,
  TuiButtonLoading,
  TuiConfirmData,
  TuiDataListWrapper,
  TuiFilterByInputPipe,
  TuiInputDate,
  TuiInputNumber,
  TuiStatus,
  TuiStringifyContentPipe,
} from '@taiga-ui/kit';
import { PolymorpheusContent } from '@taiga-ui/polymorpheus';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TuiComboBoxModule } from '@taiga-ui/legacy';
import { EmployeesApiService } from './employees-api.service';
import { EmployeesForms } from './employees-forms.service';
import { JobPositionsApiService } from '../job-positions/job-positions-api.service';
import { JobPosition } from '../job-positions/job-positions.component';
import {MaskitoDirective} from '@maskito/angular';
import type {MaskitoOptions} from '@maskito/core';
import phoneMask from '../../../shared/masks/phoneMask';
import {passportSeriesMask, passportNumberMask} from '../../../shared/masks/passportMask';
import {nameMask} from '../../../shared/masks/nameMask';

export interface Employee {
  employeeId: string;
  firstName: string;
  lastName: string;
  middleName: string;
  phoneNumber: string;
  passportNumber: string;
  passportSeries: string;
  birthdate: Date;
  email: string;
  dateOfEmployment: Date;
  jobPosition: JobPosition;
}
@Component({
  selector: 'app-employees',
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
    TuiDataListWrapper,
    TuiComboBoxModule,
    TuiStringifyContentPipe,
    TuiFilterByInputPipe,
    TuiInputDate,
    TuiCalendar,
    TuiTextfieldDropdownDirective,
    MaskitoDirective
  ],
  templateUrl: './employees.component.html',
  styleUrl: './employees.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmployeesComponent implements OnInit {
  @ViewChild('employeeDialog') employeeDialog!: TemplateRef<any>;

  employeeForm = this._employeesForms.createEmployeeForm();
  readonly phoneOptions: MaskitoOptions = phoneMask;
  readonly passportSeriesOptions: MaskitoOptions = passportSeriesMask;
  readonly passportNumberOptions: MaskitoOptions = passportNumberMask;
  readonly nameOptions: MaskitoOptions = nameMask;
  protected currentEmployeeId: string | null = null;

  destroyRef = inject(DestroyRef);
  private readonly dialogs = inject(TuiDialogService);
  private readonly alerts = inject(TuiAlertService);
  private currentDialogObserver: any;

  protected selectedReference: string | null = 'Выберите справочник...';
  protected readonly loading$ = new BehaviorSubject<boolean>(false);
  protected readonly error$ = new BehaviorSubject<string | null>(null);
  protected readonly employees$ = new BehaviorSubject<Employee[]>([]);
  protected readonly jobPositions$ = new BehaviorSubject<JobPosition[]>([]);
  protected isEditMode = false;
  protected readonly trigger$ = new Subject<void>();
  protected readonly submitLoading$ = this.trigger$.pipe(
    switchMap(() =>
      timer(2000).pipe(map(TUI_FALSE_HANDLER), startWith('Loading'))
    )
  );

  protected readonly columns = [
    'firstName',
    'lastName',
    'phoneNumber',
    'jobTitle',
    'actions',
  ];

  constructor(
    private readonly _employeesApi: EmployeesApiService,
    private readonly _employeesForms: EmployeesForms,
    private readonly _jobPositionsApi: JobPositionsApiService
  ) {}

  ngOnInit(): void {
    this.loadEmployees();
    this.loadJobPositions();
  }

  protected loadEmployees(): void {
    this.loading$.next(true);
    this.error$.next(null);

    this._employeesApi
      .getAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((error) => {
          this.error$.next('Ошибка при загрузке данных сотрудников');
          return of([]);
        }),
        finalize(() => this.loading$.next(false))
      )
      .subscribe((employees) => {
        this.employees$.next(employees);
      });
  }

  protected loadJobPositions(): void {
    this.loading$.next(true);
    this.error$.next(null);

    this._jobPositionsApi
      .getAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((error) => {
          this.error$.next('Ошибка при загрузке данных');
          return of([]);
        }),
        finalize(() => this.loading$.next(false))
      )
      .subscribe((jobPositions) => {
        this.jobPositions$.next(jobPositions);
      });
  }

  protected confirmEmployeeRemove(employeeId: string): void {
    const data: TuiConfirmData = {
      content: 'Вы действительно хотите удалить сотрудника',
      yes: 'Подтвердить',
      no: 'Отменить',
    };

    this.dialogs
      .open<boolean>(TUI_CONFIRM, {
        label: 'Удалить сотрудника',
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
          return this._employeesApi.delete(employeeId).pipe(
            catchError((error) => {
              this.alerts.open('Ошибка при удалении сотрудника', {
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
        this.alerts
          .open('Сотрудник успешно создана', { appearance: 'positive' })
          .subscribe();
        this.loadEmployees();
      });
  }

  protected editEmployee(
    content: PolymorpheusContent<TuiDialogContext>,
    employee: Employee
  ): void {
    this.isEditMode = true;
    this.currentEmployeeId = employee.employeeId;

    this.employeeForm.patchValue({
      firstName: employee.firstName,
      lastName: employee.lastName,
      middleName: employee.middleName,
      birthdate: employee.birthdate,
      email: employee.email,
      dateOfEmployment: employee.dateOfEmployment,
      passportNumber: employee.passportNumber,
      passportSeries: employee.passportSeries,
      phoneNumber: employee.phoneNumber,
      jobPositionId: employee.jobPosition.jobPositionId,
    });
    this.dialogs.open(content).subscribe((observer) => {
      this.currentDialogObserver = observer;
    });
  }

  public addEmployee(content: PolymorpheusContent<TuiDialogContext>): void {
    this.isEditMode = false;
    this.employeeForm.reset();
    this.dialogs.open(content).subscribe((observer) => {
      this.currentDialogObserver = observer;
    });
  }

  protected submit(observer: any): void {
    if (this.employeeForm.valid) {
      const formValue = this.employeeForm.getRawValue();
      this.loading$.next(true);

      const request$ = this.isEditMode
        ? this._employeesApi.update(this.currentEmployeeId!, {
            firstName: formValue.firstName,
            lastName: formValue.lastName,
            middleName: formValue.middleName,
            birthdate: formValue.birthdate,
            email: formValue.email,
            dateOfEmployment: formValue.dateOfEmployment,
            passportNumber: formValue.passportNumber,
            passportSeries: formValue.passportSeries,
            phoneNumber: formValue.phoneNumber,
            jobPositionId: formValue.jobPosition.jobPositionId,
        })
        : this._employeesApi.create({
            firstName: formValue.firstName,
            lastName: formValue.lastName,
            middleName: formValue.middleName,
            birthdate: formValue.birthdate,
            email: formValue.email,
            dateOfEmployment: formValue.dateOfEmployment,
            passportNumber: formValue.passportNumber,
            passportSeries: formValue.passportSeries,
            phoneNumber: formValue.phoneNumber,
            jobPositionId: formValue.jobPosition.jobPositionId,
          });

      request$
        .pipe(
          tuiTakeUntilDestroyed(this.destroyRef),
          catchError((error) => {
            this.alerts.open(
              `Ошибка при ${
                this.isEditMode ? 'обновлении' : 'создании'
              } сотрудника`,
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
            .open(
              `Сотрудник успешно ${this.isEditMode ? 'обновлен' : 'создан'}`,
              { appearance: 'positive' }
            )
            .subscribe();
          observer.complete();
          this.loadEmployees();
          this.currentDialogObserver?.complete();
          this.dialogs;
          this.trigger$.next();
        });
    } else {
      Object.keys(this.employeeForm.controls).forEach((key) => {
        const control = this.employeeForm.get(key);
        if (control?.invalid) {
          control.markAsTouched();
        }
      });
    }
  }
  protected readonly stringify = (item: JobPosition | null | undefined) =>
    item && typeof item === 'object' ? item.jobTitle : item ? String(item) : '';
}
