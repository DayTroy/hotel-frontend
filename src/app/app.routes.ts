import { LoginComponent } from './login/login.component';
import { Routes } from '@angular/router';
import { ProfileComponent } from './profile/profile.component';
import DashboardComponent from './dashboard/dashboard.component';
import { ReferencesComponent } from './references/references.component';
import { HomeComponent } from './home/home.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'login', component: LoginComponent },
  { path: 'profile', component: ProfileComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'references', component: ReferencesComponent }
    ]
  }
];
