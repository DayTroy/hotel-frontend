import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({ providedIn: "root" })
export class JobPositionsApiService {
  private readonly apiUrl = 'http://localhost:3000/api';

  constructor(
    private readonly httpClient: HttpClient 
  ) {}

  getAll(): Observable<any> {
    return this.httpClient.get(`${this.apiUrl}/job-positions`);
  }

  delete(jobPositionId: string): Observable<any> {
    return this.httpClient.delete(`${this.apiUrl}/job-positions/${jobPositionId}`);
  }

  create(jobPosition: any): Observable<any> {
    return this.httpClient.post(`${this.apiUrl}/job-positions`, jobPosition);
  }

  update(jobPositionId: string, jobPosition: any): Observable<any> {
    return this.httpClient.patch(`${this.apiUrl}/job-positions/${jobPositionId}`, jobPosition);
  }
}