import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: "root" })
export class DepartmentsApiService {
  private readonly apiUrl = environment.apiUrl;

  constructor(
    private readonly httpClient: HttpClient 
  ) {}

  getAll(): Observable<any> {
    return this.httpClient.get(`${this.apiUrl}/departments`);
  }

  delete(departmentId: string): Observable<any> {
    return this.httpClient.delete(`${this.apiUrl}/departments/${departmentId}`);
  }

  create(department: any): Observable<any> {
    return this.httpClient.post(`${this.apiUrl}/departments`, department);
  }

  update(departmentId: string, category: any): Observable<any> {
    return this.httpClient.patch(`${this.apiUrl}/departments/${departmentId}`, category);
  }
}