import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({ providedIn: "root" })
export class RoomsApiService {
  private readonly apiUrl = 'http://localhost:3000/api';

  constructor(
    private readonly httpClient: HttpClient 
  ) {}

  getAll(): Observable<any> {
    return this.httpClient.get(`${this.apiUrl}/rooms`);
  }

  delete(roomId: string): Observable<any> {
    return this.httpClient.delete(`${this.apiUrl}/rooms/${roomId}`);
  }

  create(room: any): Observable<any> {
    return this.httpClient.post(`${this.apiUrl}/rooms`, room);
  }

  update(roomId: string, room: any): Observable<any> {
    return this.httpClient.patch(`${this.apiUrl}/rooms/${roomId}`, room);
  }
}