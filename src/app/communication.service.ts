import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommunicationService {
  private notificationsEventSubject = new Subject<any>();
  notificationsEvent$ = this.notificationsEventSubject.asObservable();

  private friendsEventSubject = new Subject<any>();
  friendsEvent$ = this.friendsEventSubject.asObservable();

  private friendRequestEventSubject = new Subject<any>();
  friendRequestEvent$ = this.friendRequestEventSubject.asObservable();

  emitUpdatedNotifications(notifications:any) {
    this.notificationsEventSubject.next(notifications);
  }

  emitUpdatedFriendRequests(friendRequests:any) {
    this.friendRequestEventSubject.next(friendRequests);
  }

  emitUpdatedFriendsList(friendsList:any) {
    this.friendsEventSubject.next(friendsList);
  }

  constructor() { }
}
