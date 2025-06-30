import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from '../../../../environments/environment';

@Injectable({ providedIn: "root" })
export class RoomCategoriesApiService {
  private readonly apiUrl = environment.apiUrl;

  constructor(
    private readonly httpClient: HttpClient 
  ) {}

  getAll(): Observable<any> {
    return this.httpClient.get(`${this.apiUrl}/roomCategories`);
  }

  delete(categoryId: string): Observable<any> {
    return this.httpClient.delete(`${this.apiUrl}/roomCategories/${categoryId}`);
  }

  create(category: any): Observable<any> {
    return this.httpClient.post(`${this.apiUrl}/roomCategories`, category);
  }

  update(categoryId: string, category: any): Observable<any> {
    return this.httpClient.patch(`${this.apiUrl}/roomCategories/${categoryId}`, category);
  }
}