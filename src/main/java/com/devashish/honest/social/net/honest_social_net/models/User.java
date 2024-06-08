package com.devashish.honest.social.net.honest_social_net.models;

import java.util.List;

public class User {
    private String id;
    private List<String> friendRequests;
    private List<String> friends;
    private List<String> friendsPosts;
    private List<String> notifications;
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
	public List<String> getFriends() {
		return friends;
	}
	public void setFriends(List<String> friends) {
		this.friends = friends;
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
}
