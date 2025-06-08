import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  signal,
} from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TuiButton, TuiTextfield } from '@taiga-ui/core';
import { TuiChevron } from '@taiga-ui/kit';
import { TuiNavigation } from '@taiga-ui/layout';
import { RouterLink, Router } from '@angular/router';
import { TuiIcon } from '@taiga-ui/core';
import { AuthService } from '../../services/auth.service';
import { AsyncPipe, JsonPipe, NgIf } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
import { Employee } from '../../interfaces/employee.interface';

@Component({
  standalone: true,
  selector: 'navsidebar',
  imports: [
    TuiButton,
    TuiChevron,
    TuiNavigation,
    TuiTextfield,
    ReactiveFormsModule,
    RouterLink,
    TuiIcon,
    NgIf,
    AsyncPipe,
  ],
  templateUrl: './navsidebar.component.html',
  styleUrl: './navsidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NavSidebarComponent implements OnInit {
  protected currentUser$ = new BehaviorSubject<Employee | null>(null);

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserProfile();
  }

  private loadUserProfile(): void {
    this.authService.getProfile().subscribe({
      next: (profile) => {
        this.currentUser$.next(profile);
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
        this.router.navigate(['/']);
      },
    });
  }

  protected isMenuItemVisible(menuItem: string): boolean {
    const currentUser = this.currentUser$.value;
    if (!currentUser) return false;

    const jobTitle = currentUser.jobPosition.jobTitle;

    switch (jobTitle) {
      case 'Менеджер':
        return ['Заявки', 'Бронирования', 'Номера'].includes(menuItem);
      case 'Портье':
        return ['Бронирования', 'Номера', 'Справочники'].includes(menuItem);
      case 'Управляющий':
        return true;
      case 'Горничная':
        return ['Уборка'].includes(menuItem);
      default:
        return false;
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
