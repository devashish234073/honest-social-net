import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiCallService } from '../api-call.service';
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
  @ViewChild("popup") popup?: ElementRef;

  constructor(private route: ActivatedRoute, private router: Router, private apiCallService: ApiCallService) { }

  ngOnInit(): void {
    this.userId = sessionStorage.getItem("userId");
    this.token = sessionStorage.getItem("token");
    if (!this.userId || this.userId == '' || !this.token || this.token == '') {
      this.router.navigate(['/']);
    } else {
      this.apiCallService.getData("http://localhost:3000/getAllPosts", { "token": this.token }).subscribe((resp) => {
        let postIds = resp.body;
        console.log(postIds);
        for (let postIndx = 0; postIndx < postIds.length; postIndx++) {
          let postId = postIds[postIndx];
          this.apiCallService.getData("http://localhost:3000/getPost?postId=" + postId, { "token": this.token }).subscribe((resp) => {
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

  setGenerateWithAI(event: Event) {
    const checkbox = event.target as HTMLInputElement;
    this.generateWithAI = checkbox.checked;
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
