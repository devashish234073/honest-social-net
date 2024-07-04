import { Component, OnInit } from '@angular/core';
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
  posts:any = [];

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
          this.apiCallService.getData("http://localhost:3000/getPost?postId="+postId, { "token": this.token }).subscribe((resp) => {
            let postData = resp.body;
            let headers:any = resp.headers;
            console.log("postData",postData);
            console.log("headers",headers);
            console.log("headers['caption']",headers["caption"]);
            let post:any = {};
            if(headers["caption"]) {
              post["caption"] = headers["caption"];
            }
            if(postData["caption"]) {
              post["caption"] = postData["caption"];
            }
            if(postData && postData.imgData) {
              let blob = new Blob([new Uint8Array(postData.imgData.data)], { type: 'image/jpeg' });
              let imgUrl = URL.createObjectURL(blob);
              post["imageUrl"] = imgUrl;
            }
            console.log(post);
            this.posts.push(post);
          });
        }
      });
    }
  }
}
