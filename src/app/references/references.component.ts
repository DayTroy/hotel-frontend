import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TuiTextfield } from '@taiga-ui/core';
import { TuiDataListWrapper, TuiSelect } from '@taiga-ui/kit';

@Component({
  selector: 'app-references',
  standalone: true,
  imports: [
    TuiTextfield,
    TuiDataListWrapper,
    TuiSelect,
    CommonModule,
    FormsModule
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
}
