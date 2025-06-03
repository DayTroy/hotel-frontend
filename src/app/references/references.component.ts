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
import {
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
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
    RoomsComponent
  ],
  templateUrl: './references.component.html',
  styleUrl: './references.component.scss',
})
export class ReferencesComponent {
  @ViewChild('roomCategoryDialog') roomCategoryDialog!: TemplateRef<any>;
  @ViewChild('roomDialog') roomDialog!: TemplateRef<any>;
  @ViewChild('roomCategoriesComponent')
  roomCategoriesComponent!: RoomCategoriesComponent;
  @ViewChild('roomsComponent')
  roomsComponent!: RoomsComponent;


  protected readonly references = [
    'Гостиничные номера',
    'Типы гостиничных номеров',
    'Сотрудники',
    'Отделы',
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
          roomsComponent.addRoom(
            roomsComponent.roomDialog
          );
        }
        break;
    }
  }
}
