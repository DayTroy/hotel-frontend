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
import { Room } from '../references/rooms/rooms.component';
import { Employee } from '../references/employees/employees.component';
import { EmployeesApiService } from '../references/employees/employees-api.service';
import { RoomsApiService } from '../references/rooms/rooms-api.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, catchError, finalize, of, map } from 'rxjs';
import { TuiComboBoxModule } from '@taiga-ui/legacy';
import { CleaningForms } from './cleanings-forms.service';
import { CleaningsApiService } from './cleanings-api.service';
import {TuiChip} from '@taiga-ui/kit';
import { AuthService } from '../../services/auth.service';

export interface CleaningTask {
  cleaningId: string;
  room: Room;
  employee: Employee;
  cleaningType: string;
  scheduledDate: string;
  description: string;
  status: string;
}

export interface CleaningTaskResponse {
  cleaningId: string;
  scheduledDate: string;
  status: string;
  description: string;
  cleaningType: string;
  room: {
    roomId: string;
    stage: number;
    status: string;
    roomCategoryId: string;
  };
  roomId: string;
  employee: {
    employeeId: string;
    lastName: string;
    firstName: string;
    middleName: string;
    birthdate: string;
    dateOfEmployment: string;
    phoneNumber: string;
    email: string;
    passportNumber: string;
    passportSeries: string;
    jobPositionId: string;
  };
  employeeId: string;
}

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
  protected readonly cleaningTasks$ = new BehaviorSubject<CleaningTaskResponse[]>([]);
  protected readonly rooms$ = new BehaviorSubject<Room[]>([]);
  protected readonly employees$ = new BehaviorSubject<Employee[]>([]);
  cleaningTypes = ['Регулярная', 'Генеральная', 'После ремонта'];
  protected currentUser$ = this.authService.currentUser$;

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
          console.error('Error loading rooms:', error);
          return of([]);
        }),
        finalize(() => this.loading$.next(false))
      )
      .subscribe((rooms) => {
        this.rooms$.next(rooms);
      });
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
      .subscribe((employees) => {
        this.employees$.next(employees);
      });
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
          console.error('Error creating cleaning task:', error);
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
        } else {
          const currentUserId = this.authService.currentUserSubject.value?.employeeId;
          const filteredTasks = tasks.filter(task => task.employee.employeeId === currentUserId);
          this.cleaningTasks$.next(filteredTasks);
        }
      },
      error: (error) => {
        console.error('Error loading cleaning tasks:', error);
      }
    });
  }

  protected getStatusAppearance(status: string): 'negative' | 'primary' | 'positive' {
    switch (status) {
      case 'Новый':
        return 'negative';
      case 'В работе':
        return 'primary';
      case 'Выполнено':
        return 'positive';
      default:
        return 'negative';
    }
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
}
