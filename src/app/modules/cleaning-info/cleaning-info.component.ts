import { AsyncPipe, NgFor, NgIf } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TuiLet } from '@taiga-ui/cdk';
import {
  TuiAlertService,
  TuiButton,
  TuiCalendar,
  TuiLabel,
  TuiLink,
  TuiTextfield,
  TuiTextfieldDropdownDirective,
} from '@taiga-ui/core';
import {
  TuiButtonLoading,
  TuiChevron,
  TuiDataListWrapper,
  TuiFilterByInputPipe,
  TuiInputDate,
  TuiSegmented,
  TuiSelect,
  TuiStringifyContentPipe,
  TuiTextarea,
  TuiTextareaLimit,
} from '@taiga-ui/kit';
import {
  BehaviorSubject,
  Observable,
  catchError,
  finalize,
  map,
  of,
  switchMap,
  tap,
} from 'rxjs';
import { CleaningsApiService } from '../cleanings/cleanings-api.service';
import { CleaningForms } from '../cleanings/cleanings-forms.service';
import { TuiComboBoxModule } from '@taiga-ui/legacy';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RoomsApiService } from '../references/rooms/rooms-api.service';
import { EmployeesApiService } from '../references/employees/employees-api.service';
import { AuthService } from '../../services/auth.service';
import { Employee } from '../../interfaces/employee.interface';
import { Room } from '../../interfaces/room.interface';
import { CLEANING_TASK_STATUSES, CLEANING_TYPES } from '../../global.config';

@Component({
  selector: 'app-request-info',
  standalone: true,
  imports: [
    TuiSegmented,
    TuiInputDate,
    NgFor,
    NgIf,
    TuiLink,
    RouterLink,
    TuiLabel,
    TuiTextfield,
    TuiTextfieldDropdownDirective,
    TuiCalendar,
    FormsModule,
    ReactiveFormsModule,
    TuiTextarea,
    TuiTextareaLimit,
    TuiButton,
    TuiButtonLoading,
    AsyncPipe,
    TuiLet,
    TuiComboBoxModule,
    TuiDataListWrapper,
    TuiStringifyContentPipe,
    TuiFilterByInputPipe,
    TuiSelect,
    TuiTextfieldDropdownDirective,
    TuiChevron,
  ],
  templateUrl: './cleaning-info.component.html',
  styleUrl: './cleaning-info.component.scss',
})
export class CleaningInfoComponent implements OnInit {
  protected active = 0;
  protected readonly loading$ = new BehaviorSubject<boolean>(false);
  protected readonly error$ = new BehaviorSubject<string | null>(null);
  protected readonly rooms$ = new BehaviorSubject<Room[]>([]);
  protected readonly employees$ = new BehaviorSubject<Employee[]>([]);
  protected readonly cleaningTaskStatuses = CLEANING_TASK_STATUSES;
  protected readonly cleaningTypes = CLEANING_TYPES;
  protected cleaningTaskForm = this._cleaningsForms.createCleaningTaskForm();
  destroyRef = inject(DestroyRef);
  cleaningTask$: Observable<any>;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly _cleaningsApi: CleaningsApiService,
    private readonly _roomsApi: RoomsApiService,
    private readonly _employeesApi: EmployeesApiService,
    private readonly _cleaningsForms: CleaningForms,
    private readonly alerts: TuiAlertService,
    private readonly authService: AuthService
  ) {
    this.cleaningTask$ = this.route.params.pipe(
      switchMap((params) => {
        this.loading$.next(true);
        this.error$.next(null);
        return this._cleaningsApi.findCleaning(params['id']).pipe(
          tap((value) => {
            this.cleaningTaskForm.patchValue(value);
            const statusIndex = this.cleaningTaskStatuses.findIndex(
              (status) => status === value.status
            );
            if (statusIndex !== -1) {
              this.active = statusIndex;
            }
          }),
          catchError((error) => {
            this.error$.next('Ошибка при загрузке данных');
            return of(null);
          }),
          finalize(() => this.loading$.next(false))
        );
      })
    );
  }

  ngOnInit() {
    if (this.isMaid()) {
      this.cleaningTaskForm.get('room')?.disable();
      this.cleaningTaskForm.get('employee')?.disable();
      this.cleaningTaskForm.get('scheduledDate')?.disable();
      this.cleaningTaskForm.get('cleaningType')?.disable();
      this.cleaningTaskForm.get('description')?.disable();
    }
    this.loadRooms();
    this.loadEmployees();
  }

  setCleaningTaskStatus(): void {
    const newStatus = this.cleaningTaskStatuses[this.active];
    this.cleaningTaskForm.patchValue({ status: newStatus });
  }

  submit(): void {
    if (this.cleaningTaskForm.valid) {
      this.loading$.next(true);
      this.route.params.subscribe((params) => {
        this._cleaningsApi
          .editCleaning(params['id'], {
            ...this.cleaningTaskForm.value,
          })
          .pipe(
            catchError((error) => {
              this.error$.next('Ошибка при сохранении данных');
              return of(null);
            }),
            finalize(() => {
              this.alerts
                .open('Задание на уборку успешно обновлено', {
                  appearance: 'positive',
                })
                .subscribe();
              this.loading$.next(false);
            })
          )
          .subscribe();
      });
    }
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
          return of([]);
        }),
        finalize(() => this.loading$.next(false))
      )
      .subscribe((rooms) => this.rooms$.next(rooms));
  }

  protected loadEmployees(): void {
    this.loading$.next(true);
    this.error$.next(null);

    this._employeesApi
      .getAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map((employees) =>
          employees.filter(
            (employee: Employee) =>
              employee.jobPosition.jobTitle === 'Горничная'
          )
        ),
        catchError((error) => {
          this.error$.next('Ошибка при загрузке данных сотрудников');
          return of([]);
        }),
        finalize(() => this.loading$.next(false))
      )
      .subscribe((employees) => this.employees$.next(employees));
  }

  protected isMaid(): boolean {
    return (
      this.authService.currentUserSubject.value?.jobPosition.jobTitle ===
      'Горничная'
    );
  }

  protected readonly stringifyRoom = (item: Room | null | undefined) =>
    item && typeof item === 'object' ? item.roomId : item ? String(item) : '';

  protected readonly stringifyEmployee = (item: Employee | null | undefined) =>
    item && typeof item === 'object'
      ? `${item.firstName} ${item.lastName} ${item?.middleName || ''}`.trim()
      : item
      ? String(item)
      : '';
}
