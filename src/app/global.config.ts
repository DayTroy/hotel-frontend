import { IAppModules } from './interfaces/search-result.interface';

export const APP_MODULES: IAppModules[] = [
  {
    name: 'Заявки',
    icon: 'send',
    description:
      'Просмотр списка из поступающих заявок клиентами c разных источников',
    url: 'requests',
  },
  {
    name: 'Бронирования',
    icon: 'book-open-check',
    description: 'Оформление новых и просмотр существующих броней на номер',
    url: 'bookings',
  },
  {
    name: 'Номера',
    icon: 'key-round',
    description: 'Поиск доступных гостиничных номеров для оформления брони',
    url: 'search-rooms',
  },
  {
    name: 'Уборка',
    icon: 'paintbrush',
    description: 'Модуль для просмотра заданий на уборке гостиничных номеров',
    url: 'cleanings',
  },
  {
    name: 'Аналитика',
    icon: 'chart-line',
    description: 'Формирование и выгрузка (экспорт) аналитических отчетов',
    url: 'analytics',
  },
  {
    name: 'Справочники',
    icon: 'book-marked',
    description: 'Управление справочниками для эффективной работсоспосбности',
    url: 'references',
  },
  {
    name: 'Профиль',
    icon: 'user-round',
    description: 'Личный аккаунт пользователя',
    url: 'profile',
  },
];

export const BOOKING_STATUSES = [
  'Новое',
  'Подтверждено',
  'Заселен',
  'Выселен',
  'Отменен',
];

export const GENDERS = ['Мужской', 'Женский'];

export const CITIZENSHIPS = ['Россия', 'Другое'];

export const BOOKING_INFO_TABS = ['Гости', 'Услуги'];

export const CLEANING_TASK_STATUSES = ['Новый', 'В работе', 'Выполнено'];

export const CLEANING_TYPES = ['Регулярная', 'Генеральная', 'После ремонта'];

export const REQUEST_STATUSES = ['Новая', 'Обработана', 'Отменена', 'Закрыта'];
