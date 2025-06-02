import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { ILoginForm } from "./models/LoginForm.interface";

@Injectable({ providedIn: "root" })
export class AuthApiService {
  private readonly apiUrl = 'http://localhost:3000/api';

  constructor(
    private readonly httpClient: HttpClient 
  ) {}

  login(credentials: ILoginForm): Observable<any> {
    return this.httpClient.post(`${this.apiUrl}/auth/login`, credentials);
  }
}