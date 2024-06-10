package com.devashish.honest.social.net.honest_social_net.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.devashish.honest.social.net.honest_social_net.models.LoggedInUser;
import com.devashish.honest.social.net.honest_social_net.services.DaoService;

@RestController
public class RestControllerClass {
	
	@Autowired
	private DaoService daoService;
	
	@GetMapping("getNotifications")
	public List<String> getNotifications(@RequestParam("userId") String userId) {
		LoggedInUser user = daoService.getUserById(userId);
		List<String> notifications = user.getNotifications();
		if(notifications==null) {
			return new ArrayList<String>();
		}
		return notifications;
	}
	
	@GetMapping("getFriendRequests")
	public List<String> getFriendRequests(@RequestParam("userId") String userId) {
		LoggedInUser user = daoService.getUserById(userId);
		List<String> friendRequests = user.getFriendRequests();
		if(friendRequests==null) {
			return new ArrayList<String>();
		}
		return friendRequests;
	}
	
	@GetMapping("searchFriend")
	public String searchFriend(@RequestParam("friendId") String friendId,@RequestParam("userId") String userId) {
		String validationResult = performBasicValidation(friendId,userId);
		if(validationResult!=null) {
			return validationResult;
		}
		LoggedInUser friend = daoService.getUserById(friendId);
		return friendId+" Found. Send Friend Request";
	}
	
	private String performBasicValidation(String friendId, String userId) {
		if(friendId.equals(userId)) {
			return "You can't send friend request to yourself";
		}
		LoggedInUser friend = daoService.getUserById(friendId);
		if(friend==null) {
			return friendId+" Not found";
		}
		LoggedInUser user = daoService.getUserById(userId);
		if(user.getFriends()!=null && user.getFriends().contains(friendId)) {
			return friendId+" Found and is already your friend";
		}
		if(friend.getFriendRequests()!=null && friend.getFriendRequests().contains(userId)) {
			return "You have alread sent friend request to "+friendId;
		}
		if(user.getFriendRequests()!=null && user.getFriendRequests().contains(friendId)) {
			return "You have already have a frnd req from "+friendId;
		}
		return null;
	}

	@GetMapping("sendFriendReq")
	public String sendFriendReq(@RequestParam("friendId") String friendId,@RequestParam("userId") String userId) {
		String validationResult = performBasicValidation(friendId,userId);
		if(validationResult!=null) {
			return validationResult;
		}
		LoggedInUser friend = daoService.getUserById(friendId);
		friend.addFriendRequest(friendId);
		friend.addNotification("You have one friend request from @"+userId);
		daoService.saveUser(friend);
		return "Frend Request sent to " + friendId;
	}
}
