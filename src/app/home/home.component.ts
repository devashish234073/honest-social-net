import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiCallService } from '../api-call.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  userId:string | null = '';
  token:string | null = '';

  constructor(private route: ActivatedRoute, private router: Router, private apiCallService: ApiCallService) {}

  ngOnInit(): void {
    this.userId = sessionStorage.getItem("userId");
    this.token = sessionStorage.getItem("token");
    if(!this.userId || this.userId=='' || !this.token || this.token=='') {
      this.router.navigate(['/']);
    } else {
      this.apiCallService.getData("http://localhost:3000/getAllPosts",{"token":this.token}).subscribe((resp) => {
        console.log(resp);
      });
    }
  }
}
