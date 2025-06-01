import { LoginComponent } from './login/login.component';
import { Routes } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';
import DashboardComponent from './dashboard/dashboard.component';
import { ReferencesComponent } from './references/references.component';
import { HomeComponent } from './home/home.component';
import { SearchRoomsComponent } from './search-rooms/search-rooms.component';
import { AnalyticsComponent } from './analytics/analytics.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'profile', component: ProfileComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'references', component: ReferencesComponent },
      { path: 'search-rooms', component: SearchRoomsComponent },
      // { path: 'requests', component: RequestsComponent },
      // { path: 'bookings', component: BookingsComponent },
      // { path: 'cleaning', component: CleaningComponent },
      // { path: 'rooms', component: RoomsComponent },
      { path: 'analytics', component: AnalyticsComponent }
    ]
  }
];
