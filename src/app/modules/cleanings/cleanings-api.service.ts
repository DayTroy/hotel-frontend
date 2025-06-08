import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { CleaningTask } from "../../interfaces/cleaning.interface";

@Injectable({ providedIn: "root" })
export class CleaningsApiService {
  private readonly apiUrl = 'http://localhost:3000/api';

  constructor(
    private readonly httpClient: HttpClient 
  ) {}

  getAll(): Observable<any[]> {
    return this.httpClient.get<any[]>(`${this.apiUrl}/cleanings`);
  }

  findCleaning(cleaningId: string): Observable<any> {
    return this.httpClient.get<any>(`${this.apiUrl}/cleanings/${cleaningId}`);
  }

  editCleaning(cleaningId: string, updatedRequest: CleaningTask): Observable<any> {
    return this.httpClient.patch<any>(`${this.apiUrl}/cleanings/${cleaningId}`, updatedRequest);
  }

  deleteCleaning(cleaningId: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/cleanings/${cleaningId}`);
  }

  createCleaning(cleaningTask: CleaningTask): Observable<any> {
    return this.httpClient.post<any>(`${this.apiUrl}/cleanings`, cleaningTask);
  }
}