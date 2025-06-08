import { Component } from '@angular/core';
import { TuiButton, TuiIcon, TuiTitle } from '@taiga-ui/core';
import { TuiCard, TuiCardLarge, TuiHeader } from '@taiga-ui/layout';
import { RouterLink } from '@angular/router';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    TuiIcon,
    TuiCardLarge,
    TuiHeader,
    TuiButton,
    RouterLink,
    TuiTitle,
    TuiCard,
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  protected readonly modules = [
    {
      name: 'Заявки',
      icon: 'send',
      description: 'Просмотр списка из поступающих заявок клиентами c разных источников',
      url: 'requests'
    },
    {
      name: 'Бронирования',
      icon: 'book-open-check',
      description: 'Оформление новых и просмотр существующих броней на номер',
      url: 'bookings'
    },
    {
      name: 'Номера',
      icon: 'key-round',
      description: 'Поиск доступных гостиничных номеров для оформления брони',
      url: 'search-rooms'
    },
    {
      name: 'Уборка',
      icon: 'paintbrush',
      description: 'Модуль для просмотра заданий на уборке гостиничных номеров',
      url: 'cleanings'
    },
    {
      name: 'Аналитика',
      icon: 'chart-line',
      description: 'Формирование и выгрузка (экспорт) аналитических отчетов',
      url: 'analytics'
    },
    {
      name: 'Справочники',
      icon: 'book-marked',
      description: 'Управление справочниками для эффективной работсоспосбности',
      url: 'references'
    },
  ];
}
