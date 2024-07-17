import { Component, OnInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
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
  friendOutput: any = {};
  hideTimer: any = null;
  checkGrammarLabel: string = "Check Grammar";
  @ViewChild("popup") popup?: ElementRef;
  @ViewChild("friendId") friendIdRef?: ElementRef;
  @ViewChild("aicheckbox") aicheckboxref?: ElementRef;
  @ViewChild("captionField") captionFieldRef?: ElementRef;
  @ViewChild("fileChooser") fileChooserRef?: ElementRef;
  @ViewChild("codeBlock") codeBlockRef?: ElementRef;

  jsCode: string | null = null;

  constructor(private route: ActivatedRoute, private renderer: Renderer2, private router: Router, private apiCallService: ApiCallService, private communicationService: CommunicationService) { }

  injectJs() {
    const script = this.renderer.createElement('script');
    script.type = 'text/javascript';
    script.text = this.jsCode;
    this.renderer.appendChild(document.body, script);
  }

  ngOnInit(): void {
    this.userId = sessionStorage.getItem("userId");
    this.token = sessionStorage.getItem("token");
    this.friendOutput = {};
    if (!this.userId || this.userId == '' || !this.token || this.token == '') {
      this.router.navigate(['/']);
    } else {
      this.apiCallService.getData(this.apiCallService.getBackendHost() + "/getAllPosts", { "token": this.token }).subscribe((resp) => {
        let postIds = resp.body;
        console.log(postIds);
        for (let postIndx = 0; postIndx < postIds.length; postIndx++) {
          let postId = postIds[postIndx];
          this.apiCallService.getData(this.apiCallService.getBackendHost() + "/getPost?postId=" + postId, { "token": this.token }).subscribe((resp) => {
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
              console.log("invalid post " + postId, resp);
            }
          });
        }
      });
    }
  }

  likeOrUnlikePost(post: any) {
    this.apiCallService.getData(this.apiCallService.getBackendHost() + "/likeOrUnlikePost?postId=" + post.postId, { "token": this.token }).subscribe((resp) => {
      post.likes = resp.body.likes;
    });
  }

  commentOnPost(post: any, comment: any) {
    if (comment && comment.value) {
      this.apiCallService.getData(this.apiCallService.getBackendHost() + "/commentOnPost?postId=" + post.postId + "&comment=" + comment.value, { "token": this.token }).subscribe((resp) => {
        post.comments = resp.body.comments;
        comment.value = "";
      });
    } else {
      alert("Please enter comment first..");
    }
  }

  searchFriend() {
    let friendId = this.friendIdRef?.nativeElement.value.trim();
    if (!friendId || friendId == "") {
      this.friendOutput = { "error": "Enter friend id to search" };
    } else {
      this.apiCallService.getData(this.apiCallService.getBackendHost() + "/searchUser?userIdToSearch=" + friendId, { "token": this.token }).subscribe((resp) => {
        let respBody = resp.body;
        this.friendOutput = respBody;
        console.log("friend search result", this.friendOutput);
      });
    }
  }

  sendFriendRequest(friendId: String) {
    this.apiCallService.getData(this.apiCallService.getBackendHost() + "/sendFriendRequest?friendId=" + friendId, { "token": this.token }).subscribe((resp) => {
      this.friendOutput.buttonLabel = resp.body.message;
    });
  }

  toggleCheckbox() {
    if (this.aicheckboxref) {
      let aicheckbox = this.aicheckboxref.nativeElement;
      if (aicheckbox.checked) {
        aicheckbox.checked = false;
      } else {
        aicheckbox.checked = true;
      }
      this.setGenerateWithAI();
    }
  }

  setGenerateWithAI() {
    if (this.aicheckboxref) {
      this.generateWithAI = this.aicheckboxref.nativeElement.checked;
    }
  }

  postStatus() {
    let generateUsingAI = false;
    if (this.aicheckboxref) {
      generateUsingAI = this.aicheckboxref.nativeElement.checked;
    }
    let imageFile = '';
    if (this.fileChooserRef) {
      imageFile = this.fileChooserRef.nativeElement.files[0];
    }
    let caption = '';
    if (this.captionFieldRef) {
      caption = this.captionFieldRef.nativeElement.value;
    }
    let data = { "generateUsingAI": generateUsingAI, "imageFile": imageFile, "caption": caption };
    console.log("posting status with data", data);
    this.apiCallService.postStatus(imageFile, caption, generateUsingAI);
  }

  processGraphResp(rawResp:string) {
    let rawRespSplit = rawResp.split("```");
    console.log("graph rawRespSplit",rawRespSplit);
    for(let indx in rawRespSplit) {
      if(rawRespSplit[indx].trim().startsWith("javascript")) {
        console.log("graph value selected",rawRespSplit[indx].trim());
        return rawRespSplit[indx].replace("javascript","");
      }
    }
    return rawResp;
  }

  checkGrammar() {
    let caption = '';
    if (this.captionFieldRef) {
      let postFldRef = this.captionFieldRef.nativeElement;
      caption = postFldRef.value;
      this.checkGrammarLabel = "Checking...";
      this.apiCallService.getData(this.apiCallService.getBackendHost() + "/checkGrammar?caption=" + caption, { "token": this.token }).subscribe((resp) => {
        console.log("grammar check response", resp.body);
        if(caption.startsWith("graph:")) {
          let rawResp = resp.body["value"];
          let processedResp = this.processGraphResp(rawResp);
          this.jsCode = "setTimeout(()=>{"+processedResp+"},1000);";
          this.injectJs();
        } else if(caption.startsWith("graph2:")) {
          let rawResp = resp.body["value"];
          let processedResp = this.processGraphResp(rawResp);
          this.jsCode = "setTimeout(()=>{"+processedResp+"},1000);";
          this.injectJs();
        } else {
          let decision = confirm(resp.body["value"] + "\nDo you want to replace the post caption with the grammer corrected value?");
          if (decision) {
            postFldRef.value = resp.body["value"];
          }
        }
        this.checkGrammarLabel = "Check Grammar";
      });
    }
  }

  showPopup(event: MouseEvent, likedBy: string[]) {
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
    this.popupVisible = true;
    this.likesToShow = likedBy;
    let top = `${event.clientY + 90}px`;
    let left = `${event.clientX + 100}px`;
    if (this.popup) {
      this.popup.nativeElement.style.top = top;
      this.popup.nativeElement.style.left = left;
    }
  }

  closePopup(event: MouseEvent) {
    this.hideTimer = setTimeout(() => {
      this.popupVisible = false;
    }, 100);
  }

  getLikesToShow() {
    return this.likesToShow;
  }
}
