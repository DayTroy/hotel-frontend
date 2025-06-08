import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, take, filter } from 'rxjs/operators';
import { TuiAlertService } from '@taiga-ui/core';

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
    return this.authService.currentUser$.pipe(
      filter(user => user !== undefined), // Ждем, пока профиль загрузится
      take(1),
      map(user => {
        if (!user) {
          this.router.navigate(['/']);
          return false;
        }

        const jobTitle = user.jobPosition.jobTitle;
        const path = route.routeConfig?.path;

        // Если это корневой путь dashboard, перенаправляем на нужный модуль
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

        // Разрешаем доступ к профилю всем пользователям
        if (path === 'profile') {
          return true;
        }

        // Проверяем доступ в зависимости от должности
        let hasAccess = false;
        const basePath = path?.split('/')[0] || '';

        switch (jobTitle) {
          case 'Менеджер':
            hasAccess = ['requests', 'bookings', 'search-rooms', 'profile'].includes(basePath);
            break;
          case 'Портье':
            hasAccess = ['bookings', 'search-rooms', 'references', 'profile'].includes(basePath);
            break;
          case 'Управляющий':
            hasAccess = true; // Доступ ко всем модулям
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
      })
    );
  }

  private checkAccess(jobTitle: string, path: string | null): boolean {
    let hasAccess = false;
    const pathParts = path?.split('/') || [];
    const basePath = pathParts[pathParts.length - 1] || '';
    
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
    return hasAccess;
  }
} 