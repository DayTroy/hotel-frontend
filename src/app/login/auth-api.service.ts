import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ILoginForm } from "./models/LoginForm.interface";
import { IRegistrationForm } from "./models/RegistrationForm.interface";

@Injectable({ providedIn: "root" })
export class AuthApiService {
  private readonly apiUrl = 'http://localhost:3000/api'; // Замените на ваш реальный URL API

  constructor(
    private readonly httpClient: HttpClient 
  ) {}

  login(credentials: ILoginForm): Observable<any> {
    return this.httpClient.post(`${this.apiUrl}/auth/login`, credentials);
  }

  register(userData: IRegistrationForm): Observable<any> {
    return this.httpClient.post(`${this.apiUrl}/auth/register`, userData);
  }
}