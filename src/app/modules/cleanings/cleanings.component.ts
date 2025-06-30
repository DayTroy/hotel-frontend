import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import {
  TuiButton,
  TuiIcon,
  TuiTextfield,
  TuiDialogService,
  TuiDialogContext,
  TuiTextfieldDropdownDirective,
  TuiCalendar,
  TuiAlertService,
} from '@taiga-ui/core';
import { TuiAppearance } from '@taiga-ui/core';
import {
  TuiChevron,
  TuiDataListWrapper,
  TuiFilterByInputPipe,
  TuiInputDate,
  TuiSelect,
  TuiStringifyContentPipe,
  TuiTextarea,
  TuiTextareaLimit,
} from '@taiga-ui/kit';
import { TuiCardLarge, TuiHeader } from '@taiga-ui/layout';
import type { PolymorpheusContent } from '@taiga-ui/polymorpheus';
import { EmployeesApiService } from '../references/employees/employees-api.service';
import { RoomsApiService } from '../references/rooms/rooms-api.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, catchError, finalize, of, map } from 'rxjs';
import { TuiComboBoxModule } from '@taiga-ui/legacy';
import { CleaningForms } from './cleanings-forms.service';
import { CleaningsApiService } from './cleanings-api.service';
import {TuiChip} from '@taiga-ui/kit';
import { AuthService } from '../../services/auth.service';
import { Room } from '../../interfaces/room.interface';
import { Employee } from '../../interfaces/employee.interface';
import { CleaningTask } from '../../interfaces/cleaning.interface';
import { CLEANING_TYPES } from '../../global.config';
import { getCleaningStatusAppearance } from './utils/get-cleaning-status-appearance.function';

@Component({
  selector: 'app-cleanings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TuiIcon,
    TuiTextfield,
    TuiAppearance,
    TuiCardLarge,
    TuiButton,
    RouterLink,
    TuiHeader,
    TuiTextarea,
    TuiTextareaLimit,
    TuiComboBoxModule,
    TuiDataListWrapper,
    TuiStringifyContentPipe,
    TuiFilterByInputPipe,
    ReactiveFormsModule,
    FormsModule,
    TuiSelect,
    TuiChevron,
    TuiCalendar,
    TuiTextfieldDropdownDirective,
    TuiInputDate,
    TuiChip
  ],
  templateUrl: './cleanings.component.html',
  styleUrl: './cleanings.component.scss',
})
export class CleaningsComponent implements OnInit {
  value = null;
  private readonly dialogs = inject(TuiDialogService);
  private readonly alerts = inject(TuiAlertService);
  cleaningTaskForm = this._cleaningsForms.createCleaningTaskForm();
  destroyRef = inject(DestroyRef);
  protected readonly loading$ = new BehaviorSubject<boolean>(false);
  protected readonly error$ = new BehaviorSubject<string | null>(null);
  protected readonly cleaningTasks$ = new BehaviorSubject<any[]>([]);
  protected readonly allCleaningTasks$ = new BehaviorSubject<any[]>([]);
  protected readonly notFound$ = new BehaviorSubject<boolean>(false);
  protected readonly rooms$ = new BehaviorSubject<Room[]>([]);
  protected readonly employees$ = new BehaviorSubject<Employee[]>([]);
  protected readonly cleaningTypes = CLEANING_TYPES;
  protected currentUser$ = this.authService.currentUser$;
  protected readonly getCleaningStatusAppearance = getCleaningStatusAppearance;

  constructor(
    private readonly _employeesApi: EmployeesApiService,
    private readonly _roomsApi: RoomsApiService,
    private readonly _cleaningsForms: CleaningForms,
    private readonly _cleaningsApi: CleaningsApiService,
    public readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadRooms();
    this.loadEmployees();
    this.loadCleaningTasks();
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
        map(employees => employees.filter((employee: Employee) => employee.jobPosition.jobTitle === 'Горничная')),
        catchError((error) => {
          this.error$.next('Ошибка при загрузке данных сотрудников');
          return of([]);
        }),
        finalize(() => this.loading$.next(false))
      )
      .subscribe((employees) => this.employees$.next(employees));
  }

  protected readonly stringifyRoom = (item: Room | null | undefined) =>
    item && typeof item === 'object' ? item.roomId : item ? String(item) : '';

  protected readonly stringifyEmployee = (item: Employee | null | undefined) =>
    item && typeof item === 'object'
      ? `${item.firstName} ${item.lastName} ${item?.middleName || ''}`.trim()
      : item
      ? String(item)
      : '';

  openDialog(content: PolymorpheusContent<TuiDialogContext>): void {
    this.dialogs.open(content).subscribe();
  }

  submit(observer: any): void {
    if (this.cleaningTaskForm.invalid) {
      this.error$.next('Пожалуйста, заполните все обязательные поля');
      return;
    }

    this.loading$.next(true);
    this.error$.next(null);

    const formValue = this.cleaningTaskForm.value;
    const cleaningTask: CleaningTask = {
      cleaningId: '',
      room: formValue.room,
      employee: formValue.employee,
      cleaningType: formValue.cleaningType,
      scheduledDate: formValue.scheduledDate,
      description: formValue.description,
      status: 'Новый'
    };

    this._cleaningsApi.createCleaning(cleaningTask)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((error) => {
          this.error$.next('Ошибка при создании задания на уборку');
          return of(null);
        }),
        finalize(() => {
          this.alerts
            .open('Задание на уборку успешно создано', { appearance: 'positive' })
            .subscribe();
          this.loading$.next(false);
          if (!this.error$.value) {
            observer.complete();
            this.cleaningTaskForm.reset();
          }
        })
      )
      .subscribe((response) => {
        if (response) {
          this.loadCleaningTasks();
        }
      });
  }

  private loadCleaningTasks(): void {
    this._cleaningsApi.getAll().subscribe({
      next: (tasks) => {
        if (this.isAdmin()) {
          this.cleaningTasks$.next(tasks);
          this.allCleaningTasks$.next(tasks);
        } else {
          const currentUserId = this.authService.currentUserSubject.value?.employeeId;
          const filteredTasks = tasks.filter(task => task?.employee.employeeId === currentUserId);
          this.cleaningTasks$.next(filteredTasks);
          this.allCleaningTasks$.next(filteredTasks);
        }
      }
    });
  }

  protected getDescriptionText(): string {
    const currentUser = this.authService.currentUserSubject.value;
    if (currentUser?.jobPosition.jobTitle === 'Управляющий') {
      return 'Здесь вы можете просмотреть задания на уборку гостиничных номеров, назначенные на горничных.';
    }
    return 'Здесь вы можете просмотреть задания на уборку гостиничных номеров, назначенные на вас. После исполнения уборки, обязательно проставьте отметку о выполнении.';
  }

  protected isAdmin(): boolean {
    return this.authService.currentUserSubject.value?.jobPosition.jobTitle === 'Управляющий';
  }

  onSearch(value: string) {
    if (!value) {
      this.cleaningTasks$.next(this.allCleaningTasks$.value);
      this.notFound$.next(false);
      return;
    }
    
    const filteredCleaningTasks = this.allCleaningTasks$.value.filter(cleaningTask => 
      cleaningTask.cleaningId.toString().toLowerCase().includes(value.toLowerCase())
    );
    this.cleaningTasks$.next(filteredCleaningTasks);
    this.notFound$.next(filteredCleaningTasks.length === 0);
  }
}
