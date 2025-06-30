# Azimut Hotels

Данный репозиторий содержит в себе реализацию клиентской части веб-приложения для оказания гостиничных услуг в ООО "Азимут Хотелс Компани". Проект построен на Angular 17 и использует UI-библиотеку Taiga UI.

<p align="center">
  <a href="https://azimuthotels.com" target="blank"><img src="https://azimuthotels.com/images/upload/2-azimut%20(1).svg" width="120" alt="Azimut Hotels Logo" /></a>
  <a href="http://nestjs.com/" target="blank"><img src="https://upload.wikimedia.org/wikipedia/commons/c/cf/Angular_full_color_logo.svg" width="120" alt="Nest Logo" /></a>
</p>

Для работоспособности веб-приложения требуется локально развернуть backend-сервер. Ознакомьтесь с [репозиторием серверной части](https://github.com/DayTroy/hotel-backend) и следуйте его инструкциям по запуску.

## Возможности

- Управление бронированиями и гостями
- Учёт и назначение уборок номеров
- Просмотр и анализ статистики по услугам и уборкам
- Работа с заявками клиентов
- Ролевая модель (портье, горничная и др.)
- Современный интерфейс на базе Taiga UI

## Локальный запуск приложения

Склонируйте репозиторий

```bash
  git clone https://github.com/DayTroy/hotel-frontend
```

Перейдите в папку, где будет храниться склонированный локальный репозиторий
```bash
  cd my-project
```

Установите зависимости
```bash
  npm install
```

Запустите локальный сервер и откройте в браузере по адресу: [http://localhost:4200](http://localhost:4200).
```bash
  ng serve
```
Сборка проекта
```bash
  ng build
```
Готовые файлы будут в папке `dist/`.
## Документация

- [Документация Angular](https://angular.dev/)
- [Документация Taiga UI](https://taiga-ui.dev/)
- [Документация RxJS](https://www.learnrxjs.io/)
