import {
  CommonModule,
  NgSwitch,
  NgSwitchCase,
  NgSwitchDefault,
} from '@angular/common';
import {
  Component,
  DestroyRef,
  inject,
  ViewChild,
  TemplateRef,
} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  TuiButton,
  TuiIcon,
  TuiTextfield,
  TuiAlertService,
  TuiDialogService,
} from '@taiga-ui/core';
import {
  TuiDataListWrapper,
  TuiSelect,
  TuiChevron,
  TuiTextareaLimit,
  TuiTextarea,
  TuiButtonLoading,
  TuiInputNumber,
} from '@taiga-ui/kit';
import { TuiCurrencyPipe } from '@taiga-ui/addon-commerce';
import { TuiTable } from '@taiga-ui/addon-table';
import {
  BehaviorSubject,
  Subject,
  map,
  startWith,
  switchMap,
  timer,
} from 'rxjs';

import { TUI_FALSE_HANDLER } from '@taiga-ui/cdk';
import { RoomCategoriesComponent } from './room-categories/room-categories.component';
import { RoomsComponent } from './rooms/rooms.component';
import { AmenitiesComponent } from './amenities/amenities.component';
import { DepartmentsComponent } from './departments/departments.component';
import { JobPositionsComponent } from './job-positions/job-positions.component';
import { EmployeesComponent } from './employees/employees.component';
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
    TuiChevron,
    TuiIcon,
    TuiButton,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    ReactiveFormsModule,
    TuiInputNumber,
    RoomCategoriesComponent,
    RoomsComponent,
    AmenitiesComponent,
    DepartmentsComponent,
    JobPositionsComponent,
    EmployeesComponent,
  ],
  templateUrl: './references.component.html',
  styleUrl: './references.component.scss',
})
export class ReferencesComponent {
  @ViewChild('roomCategoryDialog') roomCategoryDialog!: TemplateRef<any>;
  @ViewChild('roomDialog') roomDialog!: TemplateRef<any>;
  @ViewChild('amenityDialog') amenityDialog!: TemplateRef<any>;
  @ViewChild('departmentDialog') departmentDialog!: TemplateRef<any>;
  @ViewChild('jobPositionDialog') jobPositionDialog!: TemplateRef<any>;
  @ViewChild('employeeDialog') employeeDialog!: TemplateRef<any>;

  @ViewChild('roomCategoriesComponent')
  roomCategoriesComponent!: RoomCategoriesComponent;
  @ViewChild('roomsComponent')
  roomsComponent!: RoomsComponent;
  @ViewChild('amenitiesComponent')
  amenitiesComponent!: AmenitiesComponent;
  @ViewChild('departmentsComponent')
  departmentsComponent!: DepartmentsComponent;
  @ViewChild('jobPositionsComponent')
  jobPositionsComponent!: JobPositionsComponent;
  @ViewChild('employeesComponent')
  employeesComponent!: EmployeesComponent;

  protected readonly references = [
    'Гостиничные номера',
    'Типы гостиничных номеров',
    'Сотрудники',
    'Отделы',
    'Должности',
    'Дополнительные услуги',
    'Гости',
  ] as const;

  protected selectedReference: string | null = 'Выберите справочник...';

  createReferenceItem(selectedReference: any): void {
    switch (selectedReference) {
      case 'Типы гостиничных номеров':
        const roomCategoriesComponent = this.roomCategoriesComponent;
        if (roomCategoriesComponent) {
          roomCategoriesComponent.addRoomCategory(
            roomCategoriesComponent.roomCategoryDialog
          );
        }
        break;

      case 'Гостиничные номера':
        const roomsComponent = this.roomsComponent;
        if (roomsComponent) {
          roomsComponent.addRoom(roomsComponent.roomDialog);
        }
        break;

      case 'Дополнительные услуги':
        const amenitiesComponent = this.amenitiesComponent;
        if (amenitiesComponent) {
          amenitiesComponent.addAmenity(amenitiesComponent.amenityDialog);
        }
        break;

      case 'Отделы':
        const departmentsComponent = this.departmentsComponent;
        if (departmentsComponent) {
          departmentsComponent.addDepartment(
            departmentsComponent.departmentDialog
          );
        }
        break;

      case 'Должности':
        const jobPositionsComponent = this.jobPositionsComponent;
        if (jobPositionsComponent) {
          jobPositionsComponent.addJobPosition(
            jobPositionsComponent.jobPositionDialog
          );
        }
        break;

      case 'Сотрудники':
        const employeesComponent = this.employeesComponent;
        if (employeesComponent) {
          employeesComponent.addEmployee(employeesComponent.employeeDialog);
        }
        break;
    }
  }
}
