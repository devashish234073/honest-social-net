import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiCallService } from '../api-call.service';
import { CommunicationService } from '../communication.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  userId: string | null = '';
  token: string | null = '';
  posts: any = [];
  popupVisible = false;
  generateWithAI = false;
  likesToShow: String[] = [];
  friendOutput:any = {};
  @ViewChild("popup") popup?: ElementRef;
  @ViewChild("friendId") friendIdRef?: ElementRef;
  @ViewChild("aicheckbox") aicheckboxref?: ElementRef;
  @ViewChild("captionField") captionFieldRef?: ElementRef;
  @ViewChild("fileChooser") fileChooserRef?: ElementRef;

  constructor(private route: ActivatedRoute, private router: Router, private apiCallService: ApiCallService, private communicationService: CommunicationService) { }

  ngOnInit(): void {
    this.userId = sessionStorage.getItem("userId");
    this.token = sessionStorage.getItem("token");
    this.friendOutput = {};
    if (!this.userId || this.userId == '' || !this.token || this.token == '') {
      this.router.navigate(['/']);
    } else {
      this.apiCallService.getData(this.apiCallService.getBackendHost()+"/getAllPosts", { "token": this.token }).subscribe((resp) => {
        let postIds = resp.body;
        console.log(postIds);
        for (let postIndx = 0; postIndx < postIds.length; postIndx++) {
          let postId = postIds[postIndx];
          this.apiCallService.getData(this.apiCallService.getBackendHost()+"/getPost?postId=" + postId, { "token": this.token }).subscribe((resp) => {
            let post: any = resp.body;
            let headers: any = resp.headers;
            if (post && post.postId) {
              console.log("resp", resp);
              if (post["comments"]) {
                post["comments"] = JSON.parse(post["comments"]);
                console.log(`post["comments"]`, post["comments"]);
              }
              if (post["likes"]) {
                post["likes"] = JSON.parse(post["likes"]);
                console.log(`post["likes"]`, post["likes"]);
              }
              if (post.imgData) {
                let blob = new Blob([new Uint8Array(post.imgData.data)], { type: 'image/jpeg' });
                let imgUrl = URL.createObjectURL(blob);
                post["imageUrl"] = imgUrl;
              }
              console.log("added post", post);
              this.posts.push(post);
            } else {
              console.log("invalid post "+postId,resp);
            }
          });
        }
      });
    }
  }

  searchFriend() {
    let friendId = this.friendIdRef?.nativeElement.value.trim();
    if(!friendId || friendId=="") {
      this.friendOutput = {"error":"Enter friend id to search"};
    } else {
      this.apiCallService.getData(this.apiCallService.getBackendHost()+"/searchUser?userIdToSearch=" + friendId, { "token": this.token }).subscribe((resp) => {
        let respBody = resp.body;
        this.friendOutput = respBody;
        console.log("friend search result",this.friendOutput);
      });
    }
  }

  sendFriendRequest(friendId:String) {
    this.apiCallService.getData(this.apiCallService.getBackendHost()+"/sendFriendRequest?friendId="+friendId,{"token":this.token}).subscribe((resp) => {
      this.friendOutput.buttonLabel = resp.body.message;
    });
  }

  toggleCheckbox() {
    if(this.aicheckboxref) {
      let aicheckbox = this.aicheckboxref.nativeElement;
      if(aicheckbox.checked) {
        aicheckbox.checked = false;
      } else {
        aicheckbox.checked = true;
      }
      this.setGenerateWithAI();
    }
  }

  setGenerateWithAI() {
    if(this.aicheckboxref) {
      this.generateWithAI = this.aicheckboxref.nativeElement.checked;
    }
  }

  postStatus() {
    let generateUsingAI = false;
    if(this.aicheckboxref) {
      generateUsingAI = this.aicheckboxref.nativeElement.checked;
    }
    let imageFile = '';
    if(this.fileChooserRef) {
      imageFile = this.fileChooserRef.nativeElement.files[0];
    }
    let caption = '';
    if(this.captionFieldRef) {
      caption = this.captionFieldRef.nativeElement.value;
    }
    let data = {"generateUsingAI":generateUsingAI,"imageFile":imageFile,"caption":caption};
    console.log("posting status with data",data);
    this.apiCallService.postStatus(imageFile,caption,generateUsingAI);
  }

  showPopup(event: MouseEvent, likedBy: string[]) {
    this.popupVisible = true;
    this.likesToShow = likedBy;
    let top = `${event.clientY + 90}px`;
    let left = `${event.clientX + 100}px`;
    if (this.popup) {
      this.popup.nativeElement.style.top = top;
      this.popup.nativeElement.style.left = left;
    }
  }

  closePopup() {
    this.popupVisible = false;
  }

  getLikesToShow() {
    return this.likesToShow;
  }
}
