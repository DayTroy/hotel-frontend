import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({ providedIn: "root" })
export class EmployeesApiService {
  private readonly apiUrl = 'http://localhost:3000/api';

  constructor(
    private readonly httpClient: HttpClient 
  ) {}

  getAll(): Observable<any> {
    return this.httpClient.get(`${this.apiUrl}/employees`);
  }

  delete(employeeId: string): Observable<any> {
    return this.httpClient.delete(`${this.apiUrl}/employees/${employeeId}`);
  }

  create(employee: any): Observable<any> {
    return this.httpClient.post(`${this.apiUrl}/employees`, employee);
  }

  update(employeeId: string, employee: any): Observable<any> {
    return this.httpClient.patch(`${this.apiUrl}/employees/${employeeId}`, employee);
  }
}