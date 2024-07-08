import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse, HttpEventType, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ApiCallService {

  backendHost: string = "http://localhost:3000";

  constructor(private http: HttpClient, private router: Router) { }

  getData(url: String, headersData: any): Observable<HttpResponse<any>> {
    const headers = new HttpHeaders(headersData);
    return this.http.get<any>(`${url}`, { headers, observe: 'response' }).pipe(
      map(response => response),
      catchError(error => {
        console.error(`Error occurred calling ${url} headers(${JSON.stringify(headersData)}):`, error);
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("userId");
        this.router.navigate(['/']);
        return throwError(error);
      })
    );
  }

  getBackendHost() {
    return this.backendHost;
  }

  postStatus(imageFile: string, caption: string, generateUsingAI: boolean) {
    const image = (document.getElementById('image') as HTMLInputElement);
    //const imageFile = image.files?.[0];
    //const caption = (document.getElementById('caption') as HTMLInputElement).value.trim();
    //const generateUsingAI = (document.getElementById('generateUsingAI') as HTMLInputElement).checked;
    const token: string | null = sessionStorage.getItem("token");  // Replace with the actual user ID

    if (!caption) {
      alert("Can't post without caption");
      return;
    }

    const formData = new FormData();
    if (imageFile) {
      formData.append('image', imageFile);
    }
    formData.append('caption', caption);
    formData.append('token', token ? token : '');
    if (generateUsingAI) {
      formData.append('aigenerate', 'true');
    }

    this.http.post(`${this.backendHost}/postStatus`, formData, { observe: 'events', reportProgress: true })
      .subscribe({
        next: (event) => {
          if (event.type === HttpEventType.UploadProgress) {
            const percentDone = Math.round(100 * event.loaded / (event.total ?? 1));
            console.log(`File is ${percentDone}% uploaded.`);
          } else if (event.type === HttpEventType.Response) {
            if (event.status === 200) {
              alert('Status update success.'+(generateUsingAI?" Please reload after few minutes for AI generated image.":""));
              window.location.reload();
            } else {
              alert('Status update failed. Error code ' + event.status);
            }
          }
        },
        error: (error: HttpErrorResponse) => {
          console.error('Upload failed', error);
          alert('Status update failed. Error code ' + error.status);
        }
      });
  }

}
