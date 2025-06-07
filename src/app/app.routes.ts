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

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'references', component: ReferencesComponent },
      { path: 'search-rooms', component: SearchRoomsComponent },
      { path: 'requests', component: RequestsComponent },
      { path: 'requests/:id', component: RequestInfoComponent },  
      { path: 'bookings', component: BookingsComponent },
      { path: 'bookings/:id', component: BookingInfoComponent },  
      { path: 'cleanings', component: CleaningsComponent },
      { path: 'cleanings/:id', component: CleaningInfoComponent },
      { path: 'analytics', component: AnalyticsComponent },
      { path: 'profile', component: ProfileComponent },
    ]
  }
];
