import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { ApiCallService } from './api-call.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'honest-social-net';
  token:string | null = '';
  loggedIn = false;
  @ViewChild("userId") userId?: ElementRef;

  links = [
    { title: 'Demo video on hibernate version', link: 'https://www.youtube.com/watch?v=8MUYecplXnQ' },
    { title: 'Demo video on standalone node version', link: 'https://www.youtube.com/watch?v=xUR8KqrOigw&t=2s' },
    { title: 'Demo video on AI image generation', link: 'https://www.youtube.com/watch?v=leTTwS5opzY&t=3s' }
  ];

  constructor(private router: Router,private apiCallService: ApiCallService) { }

  ngOnInit(): void {
    this.token = sessionStorage.getItem("token");
    this.apiCallService.getData("http://localhost:3000/checkLogin",{"token":this.token}).subscribe((resp) => {
      console.log(resp.msg);
      if (resp.loggedIn) {
        console.log("marked logged in");
        sessionStorage.setItem("userId",resp.userId);
        this.loggedIn = true;
        this.router.navigate(['/login']);
      } else {
        this.loggedIn = false;
        sessionStorage.removeItem("userId");
        this.router.navigate(['/']);
      }
    });
  }

  logout() {
    this.loggedIn = false;
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("token");
    this.router.navigate(['/']);
  }

  login() {
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("token");
    let user = this.userId?.nativeElement.value.trim();
    if (user == "") {
      alert("user id is required");
    } else if(user.indexOf(" ")>-1) {
      alert("user id can't contain space");
    } else {
      this.apiCallService.getData("http://localhost:3000/login/" + user,{}).subscribe((resp) => {
        console.log(resp.msg);
        if (resp.loggedIn) {
          console.log("marked logged in");
          this.loggedIn = true;
          sessionStorage.setItem("userId",resp.userId);
          sessionStorage.setItem("token",resp.token);
          this.router.navigate(['/login/']);
        }
      });
    }
  }
}
