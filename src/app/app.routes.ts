import { LoginComponent } from './login/login.component';
import { Routes } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';
import DashboardComponent from './dashboard/dashboard.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
    { path: 'login', component: LoginComponent },
    { path: 'profile', component: ProfileComponent },
  ];
