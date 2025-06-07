import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { CleaningTask, CleaningTaskResponse } from "./cleanings.component";

@Injectable({ providedIn: "root" })
export class CleaningsApiService {
  private readonly apiUrl = 'http://localhost:3000/api';

  constructor(
    private readonly httpClient: HttpClient 
  ) {}

  getAll(): Observable<CleaningTaskResponse[]> {
    return this.httpClient.get<CleaningTaskResponse[]>(`${this.apiUrl}/cleanings`);
  }

  findCleaning(cleaningId: string): Observable<CleaningTaskResponse> {
    return this.httpClient.get<CleaningTaskResponse>(`${this.apiUrl}/cleanings/${cleaningId}`);
  }

  editCleaning(cleaningId: string, updatedRequest: CleaningTask): Observable<CleaningTaskResponse> {
    return this.httpClient.patch<CleaningTaskResponse>(`${this.apiUrl}/cleanings/${cleaningId}`, updatedRequest);
  }

  deleteCleaning(cleaningId: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/cleanings/${cleaningId}`);
  }

  createCleaning(cleaningTask: CleaningTask): Observable<CleaningTaskResponse> {
    return this.httpClient.post<CleaningTaskResponse>(`${this.apiUrl}/cleanings`, cleaningTask);
  }
}