import { LoginComponent } from './modules/login/login.component';
import { Routes } from '@angular/router';
import { ProfileComponent } from './modules/profile/profile.component';
import DashboardComponent from './modules/dashboard/dashboard.component';
import { ReferencesComponent } from './modules/references/references.component';
import { HomeComponent } from './modules/home/home.component';
import { SearchRoomsComponent } from './modules/search-rooms/search-rooms.component';
import { AnalyticsComponent } from './modules/analytics/analytics.component';
import { RequestsComponent } from './modules/requests/requests.component';
import { BookingsComponent } from './modules/bookings/bookings.component';
import { RequestInfoComponent } from './modules/request-info/request-info.component';
import { BookingInfoComponent } from './modules/booking-info/booking-info.component';
import { CleaningsComponent } from './modules/cleanings/cleanings.component';
import { CleaningInfoComponent } from './modules/cleaning-info/cleaning-info.component';
import { RoleGuard } from './guards/role.guard';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    // canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { 
        path: 'references', 
        component: ReferencesComponent,
        // canActivate: [RoleGuard]
      },
      { 
        path: 'search-rooms', 
        component: SearchRoomsComponent,
        canActivate: [RoleGuard]
      },
      { 
        path: 'requests', 
        component: RequestsComponent,
        canActivate: [RoleGuard]
      },
      { 
        path: 'requests/:id', 
        component: RequestInfoComponent,
        canActivate: [RoleGuard]
      },  
      { 
        path: 'bookings', 
        component: BookingsComponent,
        canActivate: [RoleGuard]
      },
      { 
        path: 'bookings/:id', 
        component: BookingInfoComponent,
        canActivate: [RoleGuard]
      },  
      { 
        path: 'cleanings', 
        component: CleaningsComponent,
        canActivate: [RoleGuard]
      },
      { 
        path: 'cleanings/:id', 
        component: CleaningInfoComponent,
        canActivate: [RoleGuard]
      },
      { 
        path: 'analytics', 
        component: AnalyticsComponent,
        canActivate: [RoleGuard]
      },
      { path: 'profile', component: ProfileComponent },
    ]
  },
  { path: '**', redirectTo: '/dashboard' }
];
