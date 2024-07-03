import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiCallService {

  constructor(private http: HttpClient) { }

  getData(url:String,headersData:any ): Observable<any> {
    const headers = new HttpHeaders(headersData);
    return this.http.get<any>(`${url}`, { headers });
  }
}
