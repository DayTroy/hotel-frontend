import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({ providedIn: "root" })
export class RequestsApiService {
  private readonly apiUrl = 'http://localhost:3000/api';

  constructor(
    private readonly httpClient: HttpClient 
  ) {}

  getAll(): Observable<any> {
    return this.httpClient.get(`${this.apiUrl}/requests`);
  }

  findRequest(requestId: string): Observable<any> {
    return this.httpClient.get(`${this.apiUrl}/requests/${requestId}`);
  }

  editRequest(requestId: string, updatedRequest: any): Observable<any> {
    return this.httpClient.patch(`${this.apiUrl}/requests/${requestId}`, updatedRequest);
  }

  deleteRequest(requestId: string): Observable<any> {
    return this.httpClient.delete(`${this.apiUrl}/requests/${requestId}`);
  }
}