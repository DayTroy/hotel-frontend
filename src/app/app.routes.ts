import { LoginComponent } from './login/login.component';
import { Routes } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';
import DashboardComponent from './dashboard/dashboard.component';
import { ReferencesComponent } from './references/references.component';
import { HomeComponent } from './home/home.component';
import { SearchRoomsComponent } from './search-rooms/search-rooms.component';
import { AnalyticsComponent } from './analytics/analytics.component';
import { RequestsComponent } from './requests/requests.component';
import { BookingsComponent } from './bookings/bookings.component';
import { CleaningComponent } from './cleaning/cleaning.component';import { RequestInfoComponent } from './request-info/request-info.component';
import { BookingInfoComponent } from './booking-info/booking-info.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'profile', component: ProfileComponent },
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
      { path: 'bookings/1', component: BookingInfoComponent },  
      { path: 'cleaning', component: CleaningComponent },
      { path: 'analytics', component: AnalyticsComponent }
    ]
  }
];
