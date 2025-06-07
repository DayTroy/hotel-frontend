import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({ providedIn: "root" })
export class BookingsApiService {
  private readonly apiUrl = 'http://localhost:3000/api';

  constructor(
    private readonly httpClient: HttpClient 
  ) {}

  getAll(): Observable<any> {
    return this.httpClient.get(`${this.apiUrl}/bookings`);
  }

  findBooking(bookingId: string): Observable<any> {
    return this.httpClient.get(`${this.apiUrl}/bookings/${bookingId}`);
  }

  delete(bookingId: string): Observable<any> {
    return this.httpClient.delete(`${this.apiUrl}/bookings/${bookingId}`);
  }

  create(booking: any): Observable<any> {
    return this.httpClient.post(`${this.apiUrl}/bookings`, booking);
  }

  update(bookingId: string, booking: any): Observable<any> {
    return this.httpClient.patch(`${this.apiUrl}/bookings/${bookingId}`, booking);
  }
}