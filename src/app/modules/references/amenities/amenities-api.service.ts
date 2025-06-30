import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: "root" })
export class AmenitiesApiService {
  private readonly apiUrl = environment.apiUrl;

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