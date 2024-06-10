package com.devashish.honest.social.net.honest_social_net.models;

import java.util.List;

public class FriendsAndFriendRequests {
	private List<String> friendRequests;
	private List<String> friends;
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
}
