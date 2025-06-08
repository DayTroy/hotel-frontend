import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  TuiButton,
  TuiDataList,
  TuiDropdown,
  TuiIcon,
  TuiTextfield,
} from '@taiga-ui/core';
import { TuiAvatar } from '@taiga-ui/kit';
import { TuiInputSearch, TuiNavigation } from '@taiga-ui/layout';
import { AuthService } from '../../services/auth.service';
import { BehaviorSubject } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { Employee } from '../../interfaces/employee.interface';
import { SearchResult } from '../../interfaces/search-result.interface';

@Component({
  standalone: true,
  selector: 'navheader',
  imports: [
    FormsModule,
    TuiAvatar,
    TuiButton,
    TuiDataList,
    TuiDropdown,
    TuiNavigation,
    TuiTextfield,
    TuiInputSearch,
    RouterLink,
    AsyncPipe,
    TuiIcon
  ],
  templateUrl: './navheader.component.html',
  styleUrl: './navheader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class NavHeaderComponent implements OnInit {
  protected open = false;
  protected avatarText$ = new BehaviorSubject<string>('');
  protected currentUser$ = new BehaviorSubject<Employee | null>(null);
  protected searchText = '';
  protected readonly searchResults$ = new BehaviorSubject<SearchResult[]>([]);

  private readonly availableModules: SearchResult[] = [
    { name: 'Заявки', url: '/dashboard/requests', icon: 'send' },
    { name: 'Бронирования', url: '/dashboard/bookings', icon: 'book-open-check' },
    { name: 'Номера', url: '/dashboard/search-rooms', icon: 'key-round' },
    { name: 'Уборка', url: '/dashboard/cleanings', icon: 'paintbrush' },
    { name: 'Аналитика', url: '/dashboard/analytics', icon: 'chart-line' },
    { name: 'Справочники', url: '/dashboard/references', icon: 'book-marked' },
    { name: 'Профиль', url: '/dashboard/profile', icon: 'user-round' },
  ];

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
        this.avatarText$.next(`${profile.firstName[0]}${profile.lastName[0]}`);
        this.currentUser$.next(profile);
      },
      error: (error) => {
        console.error('Error loading user profile:', error);
        this.router.navigate(['/']);
      }
    });
  }

  protected onSearchChange(searchText: string): void {
    this.searchText = searchText;
    const currentUser = this.currentUser$.value;
    if (!currentUser) return;

    const jobTitle = currentUser.jobPosition.jobTitle;
    let availableModules: string[] = [];

    switch (jobTitle) {
      case 'Менеджер':
        availableModules = ['Заявки', 'Бронирования', 'Номера', 'Профиль'];
        break;
      case 'Портье':
        availableModules = ['Бронирования', 'Номера', 'Справочники', 'Профиль'];
        break;
      case 'Управляющий':
        availableModules = ['Заявки', 'Бронирования', 'Номера', 'Уборка', 'Аналитика', 'Справочники', 'Профиль'];
        break;
      case 'Горничная':
        availableModules = ['Уборка', 'Профиль'];
        break;
      default:
        availableModules = ['Профиль'];
    }

    const filteredResults = this.availableModules
      .filter(module => 
        availableModules.includes(module.name) &&
        module.name.toLowerCase().includes(searchText.toLowerCase())
      );

    this.searchResults$.next(filteredResults);
  }

  protected onClick(): void {
    this.open = false;
  }

  logout(): void {
    this.authService.logout();
  }
}
