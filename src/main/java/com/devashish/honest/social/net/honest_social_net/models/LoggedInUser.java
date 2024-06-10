package com.devashish.honest.social.net.honest_social_net.models;

import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;

@Entity
@Table(name = "logged_in_user")
public class LoggedInUser {
	@Id
    private String id;
	@ElementCollection(fetch = FetchType.EAGER)
	@CollectionTable(name = "logged_in_user_friend_requests", joinColumns = @JoinColumn(name = "logged_in_user_id"))
	@Column(name = "friend_requests")
    private List<String> friendRequests;
	@ElementCollection(fetch = FetchType.EAGER)
	@CollectionTable(name = "logged_in_user_friends", joinColumns = @JoinColumn(name = "logged_in_user_id"))
	@Column(name = "friends")
    private List<String> friends;
	@Column(name = "posts")
	@CollectionTable(name = "user_posts", joinColumns = @JoinColumn(name = "logged_in_user_id"))
    private List<String> posts;
	@Column(name = "friends_posts")
	@CollectionTable(name = "logged_in_user_friends_posts", joinColumns = @JoinColumn(name = "logged_in_user_id"))
    private List<String> friendsPosts;
	@ElementCollection(fetch = FetchType.EAGER)
	@CollectionTable(name = "logged_in_user_notifications", joinColumns = @JoinColumn(name = "logged_in_user_id"))
	@Column(name = "notification")
    private List<String> notifications;
	public LoggedInUser() {
		
	}
	public LoggedInUser(String id) {
		this.id = id;
	}
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public List<String> getFriendRequests() {
		return friendRequests;
	}
	public void setFriendRequests(List<String> friendRequests) {
		this.friendRequests = friendRequests;
	}
	public void addFriendRequest(String friendId) {
		if(this.friendRequests==null) {
			this.friendRequests = new ArrayList<String>();
		}
		this.friendRequests.add(friendId);
	}
	public List<String> getFriends() {
		return friends;
	}
	public void setFriends(List<String> friends) {
		this.friends = friends;
	}
	public void addFriend(String friendsId) {
		if(this.friends==null) {
			this.friends = new ArrayList<String>();
		}
		this.friends.add(friendsId);
	}
	public List<String> getFriendsPosts() {
		return friendsPosts;
	}
	public void setFriendsPosts(List<String> friendsPosts) {
		this.friendsPosts = friendsPosts;
	}
	public List<String> getNotifications() {
		return notifications;
	}
	public void setNotifications(List<String> notifications) {
		this.notifications = notifications;
	}
	public void addNotification(String notification) {
		if(this.notifications==null) {
			this.notifications = new ArrayList<String>();
		}
		this.notifications.add(notification);
	}
	public List<String> getPosts() {
		return posts;
	}
	public void setPosts(List<String> posts) {
		this.posts = posts;
	}
	public void addPost(Post post) {
		if(this.posts==null) {
			this.posts = new ArrayList<String>();
		}
		this.posts.add(post.getId());
	}
	@Override
	public String toString() {
		return "LoggedInUser [id=" + id + ", friendRequests=" + friendRequests + ", friends=" + friends + ", posts="
				+ posts + ", friendsPosts=" + friendsPosts + ", notifications=" + notifications + "]";
	}
}
