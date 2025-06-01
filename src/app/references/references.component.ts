import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiButton, TuiIcon, TuiTextfield } from '@taiga-ui/core';
import { TuiDataListWrapper, TuiSelect, TuiChevron, TuiStatus } from '@taiga-ui/kit';
import {TuiCurrencyPipe} from '@taiga-ui/addon-commerce';
import { TuiTable } from '@taiga-ui/addon-table';
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
    TuiStatus
  ],
  templateUrl: './references.component.html',
  styleUrl: './references.component.scss'
})
export class ReferencesComponent {
  protected readonly references = [
    'Гостиничные номера',
    'Типы гостиничных номеров',
    'Сотрудники',
    'Отделы',
    'Дополнительные услуги',
    'Гости',
  ];
  protected value: string | null = 'Выберите справочник...';

  protected readonly data = [
    {
      name: 'Стандарт',
      pricePerNight: 1000,
    },
    {
      name: 'Люкс',
      pricePerNight: 2500,
    },
    {
      name: 'Премиум',
      pricePerNight: 4000,
    },
  ] as const;

  protected readonly columns = Object.keys(this.data[0]);
}
