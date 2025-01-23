import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Injectable({ providedIn: "root" })
export class AuthApiService {
  constructor(
    private readonly httpClient: HttpClient 
  ) {}

  login(): void {
    const url = '';
    this.httpClient.get(url);
  }

  register(): void {
    const url = '';
    this.httpClient.get(url);
  }
}