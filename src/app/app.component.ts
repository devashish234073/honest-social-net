import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { ApiCallService } from './api-call.service';
import { HttpResponse } from '@angular/common/http';

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
  menuData = {"friendRequests":[],"notifications":[],"friends":[]};
  popupData:any = {"friendRequests":[],"notifications":[],"friends":[]};//at a time only one value should be populated
  @ViewChild("userId") userId?: ElementRef;

  links = [
    { title: 'Demo video on hibernate version', link: 'https://www.youtube.com/watch?v=8MUYecplXnQ' },
    { title: 'Demo video on standalone node version', link: 'https://www.youtube.com/watch?v=xUR8KqrOigw&t=2s' },
    { title: 'Demo video on AI image generation', link: 'https://www.youtube.com/watch?v=leTTwS5opzY&t=3s' }
  ];

  constructor(private router: Router,private apiCallService: ApiCallService) { }

  ngOnInit(): void {
    this.token = sessionStorage.getItem("token");
    if(this.token) {
      this.apiCallService.getData("http://localhost:3000/checkLogin",{"token":this.token}).subscribe((resp) => {
        if (resp.body.loggedIn) {
          console.log("marked logged in",resp.body);
          sessionStorage.setItem("userId",resp.body.userId);
          this.loggedIn = true;
          this.getMenuData();
          this.router.navigate(['/login']);
        } else {
          this.loggedIn = false;
          sessionStorage.removeItem("userId");
          this.router.navigate(['/']);
        }
      });
    } else {
      this.loggedIn = false;
    }
  }

  getMenuData() {
    this.apiCallService.getData("http://localhost:3000/getUserData",{"token":this.token}).subscribe((resp) => {
      console.log("menu data",resp.body);
      this.menuData = resp.body;
    });
  }

  logout() {
    this.loggedIn = false;
    sessionStorage.removeItem("userId");
    sessionStorage.removeItem("token");
    this.router.navigate(['/']);
  }

  openFriendReqDialog() {
    this.popupData = {"friendRequests":[],"notifications":[],"friends":[]};
    this.popupData["friendRequests"] = this.menuData["friendRequests"];
  }

  openNotificationsDialog() {
    this.popupData = {"friendRequests":[],"notifications":[],"friends":[]};
    this.popupData["notifications"] = this.menuData["notifications"];
  }

  openFriendsDialog() {
    this.popupData = {"friendRequests":[],"notifications":[],"friends":[]};
    this.popupData["friends"] = this.menuData["friends"];
  }

  closeDialog() {
    this.popupData = {"friendRequests":[],"notifications":[],"friends":[]};
  }

  acceptFriendRequest(friendId:any) {
    this.apiCallService.getData("http://localhost:3000/acceptFriendRequest?friendId="+friendId,{"token":this.token}).subscribe((resp) => {
      if(resp.body.message && resp.body.friendRequests && resp.body.friends) {
        this.menuData.friendRequests = resp.body.friendRequests;
        this.popupData.friendRequests = resp.body.friendRequests;
        this.menuData.friends = resp.body.friends;
      } else if(resp.body.message){
        alert(resp.body.message);
      }
    });
  }

  rejectFriendRequest(friendId:any) {
    this.apiCallService.getData("http://localhost:3000/rejectFriendRequest?friendId="+friendId,{"token":this.token}).subscribe((resp) => {
      if(resp.body.message && resp.body.friendRequests) {
        this.menuData.friendRequests = resp.body.friendRequests;
        this.popupData.friendRequests = resp.body.friendRequests;
      } else if(resp.body.message){
        alert(resp.body.message);
      }
    });
  }

  deleteNotification(notification:String) {
    this.apiCallService.getData("http://localhost:3000/deleteNotification?notification="+notification,{"token":this.token}).subscribe((resp) => {
      if(resp.body.message && resp.body.notifications) {
        this.menuData.notifications = resp.body.notifications;
        this.popupData.notifications = resp.body.notifications;
      } else if(resp.body.message){
        alert(resp.body.message);
      }
    });
  }

  unfriend(friendId:any) {
    this.apiCallService.getData("http://localhost:3000/unFriend?friendId="+friendId,{"token":this.token}).subscribe((resp) => {
      if(resp.body.message && resp.body.friends) {
        this.menuData.friendRequests = resp.body.friends;
        this.popupData.friends = resp.body.friends;
      } else if(resp.body.message){
        alert(resp.body.message);
      }
    });
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
      this.apiCallService.getData("http://localhost:3000/login/" + user,{}).subscribe((resp: HttpResponse<any>) => {
        console.log(resp);
        if (resp.body.loggedIn) {
          console.log("marked logged in");
          this.loggedIn = true;
          sessionStorage.setItem("userId",resp.body.userId);
          sessionStorage.setItem("token",resp.body.token);
          this.userId = resp.body.userId;
          this.token = resp.body.token;
          this.getMenuData();
          this.router.navigate(['/login/']);
        }
      });
    }
  }
}
