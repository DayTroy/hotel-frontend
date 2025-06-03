import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({ providedIn: "root" })
export class ReferencesApiService {
  private readonly apiUrl = 'http://localhost:3000/api';

  constructor(
    private readonly httpClient: HttpClient 
  ) {}

  getRooms(): Observable<any> {
    return this.httpClient.get(`${this.apiUrl}/rooms`);
  }

  getRoomCategories(): Observable<any> {
    return this.httpClient.get(`${this.apiUrl}/roomCategories`);
  }

  deleteRoomCategory(categoryId: string): Observable<any> {
    return this.httpClient.delete(`${this.apiUrl}/roomCategories/${categoryId}`);
  }

  createRoomCategory(category: any): Observable<any> {
    return this.httpClient.post(`${this.apiUrl}/roomCategories`, category);
  }

  updateRoomCategory(categoryId: string, category: any): Observable<any> {
    return this.httpClient.patch(`${this.apiUrl}/roomCategories/${categoryId}`, category);
  }
}