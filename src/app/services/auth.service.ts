import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Router } from '@angular/router';
import { Employee } from '../interfaces/employee.interface';
import { LoginResponse } from '../interfaces/login-response.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'access_token';
  private readonly API_URL = environment.apiUrl;
  public currentUserSubject = new BehaviorSubject<Employee | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private jwtHelper = new JwtHelperService();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadUserFromToken();
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/login`, { email, password })
      .pipe(
        tap(response => {
          localStorage.setItem(this.TOKEN_KEY, response.token);
          this.currentUserSubject.next(response.employee);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    const token = localStorage.getItem(this.TOKEN_KEY);
    return token !== null && !this.jwtHelper.isTokenExpired(token);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  private loadUserFromToken(): void {
    const token = this.getToken();
    if (token && !this.jwtHelper.isTokenExpired(token)) {
      this.getProfile().subscribe({
        next: (profile) => {
          this.currentUserSubject.next(profile);
        },
        error: (error) => {
          console.error('Error loading user profile:', error);
          this.currentUserSubject.next(null);
        }
      });
    } else {
      this.currentUserSubject.next(null);
    }
  }

  hasRole(role: string): boolean {
    const employee = this.currentUserSubject.value;
    return employee?.jobPosition.jobTitle === role;
  }

  getProfile(): Observable<Employee> {
    return this.http.get<Employee>(`${this.API_URL}/auth/profile`).pipe(
      tap(profile => {
        this.currentUserSubject.next(profile);
      })
    );
  }

  updateProfile(profileData: any) {
    return this.http.patch<Employee>(`${this.API_URL}/auth/profile/update`, profileData).pipe(
      tap(profile => {
        this.currentUserSubject.next(profile);
      })
    );
  }
}