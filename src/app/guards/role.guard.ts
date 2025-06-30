import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take, filter, switchMap } from 'rxjs/operators';
import { TuiAlertService } from '@taiga-ui/core';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private alerts: TuiAlertService
  ) {}

  canActivate(route: ActivatedRouteSnapshot) {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return of(false);
    }

    // Если токен есть, но пользователь еще не загружен, загружаем его
    return this.authService.currentUser$.pipe(
      filter(user => user !== undefined),
      take(1),
      switchMap(user => {
        if (!user) {
          // Если пользователь не загружен, пробуем загрузить его
          return this.authService.getProfile().pipe(
            map(profile => {
              const jobTitle = profile.jobPosition.jobTitle;
              const path = route.routeConfig?.path;
              return this.checkAccess(jobTitle, path);
            })
          );
        }

        const jobTitle = user.jobPosition.jobTitle;
        const path = route.routeConfig?.path;
        return of(this.checkAccess(jobTitle, path));
      })
    );
  }

  private checkAccess(jobTitle: string, path: string | undefined): boolean {
    if (path === 'dashboard' || path === '') {
      switch (jobTitle) {
        case 'Менеджер':
          this.router.navigate(['/dashboard/requests']);
          return false;
        case 'Портье':
          this.router.navigate(['/dashboard/bookings']);
          return false;
        case 'Управляющий':
          this.router.navigate(['/dashboard/search-rooms']);
          return false;
        case 'Горничная':
          this.router.navigate(['/dashboard/cleanings']);
          return false;
        default:
          this.router.navigate(['/dashboard/profile']);
          return false;
      }
    }

    if (path === 'profile') {
      return true;
    }

    // Проверяем доступ в зависимости от должности
    let hasAccess = false;
    // Получаем базовый путь без параметров
    const basePath = path?.split('/')[0] || '';

    switch (jobTitle) {
      case 'Менеджер':
        hasAccess = ['requests', 'bookings', 'search-rooms', 'profile'].includes(basePath);
        break;
      case 'Портье':
        hasAccess = ['bookings', 'search-rooms', 'references', 'profile'].includes(basePath);
        break;
      case 'Управляющий':
        hasAccess = true;
        break;
      case 'Горничная':
        hasAccess = ['cleanings', 'profile'].includes(basePath);
        break;
      default:
        hasAccess = false;
    }

    if (!hasAccess) {
      this.alerts
        .open('У вас нет доступа к этому модулю', {
          label: 'Доступ запрещен',
          appearance: 'negative',
          autoClose: 3000,
        })
        .subscribe();
      this.router.navigate(['/dashboard/profile']);
      return false;
    }

    return true;
  }
} 