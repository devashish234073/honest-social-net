import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ApiCallService {

  constructor(private http: HttpClient) { }

  getData(url: String, headersData: any): Observable<HttpResponse<any>> {
    const headers = new HttpHeaders(headersData);
    return this.http.get<any>(`${url}`, { headers, observe: 'response' }).pipe(
      map(response => response),
      catchError(error => {
        console.error('Error occurred:', error);
        return throwError(error);
      })
    );
  }

}