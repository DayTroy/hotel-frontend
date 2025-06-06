import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({ providedIn: "root" })
export class AmenitiesApiService {
  private readonly apiUrl = 'http://localhost:3000/api';

  constructor(
    private readonly httpClient: HttpClient 
  ) {}

  getAll(): Observable<any> {
    return this.httpClient.get(`${this.apiUrl}/amenities`);
  }

  delete(amenityId: string): Observable<any> {
    return this.httpClient.delete(`${this.apiUrl}/amenities/${amenityId}`);
  }

  create(amenity: any): Observable<any> {
    return this.httpClient.post(`${this.apiUrl}/amenities`, amenity);
  }

  update(amenityId: string, category: any): Observable<any> {
    return this.httpClient.patch(`${this.apiUrl}/amenities/${amenityId}`, category);
  }
}