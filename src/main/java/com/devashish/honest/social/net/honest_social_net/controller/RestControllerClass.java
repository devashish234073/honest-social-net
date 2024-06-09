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
}
