package com.devashish.honest.social.net.honest_social_net.controller;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.devashish.honest.social.net.honest_social_net.models.FriendsPost;
import com.devashish.honest.social.net.honest_social_net.models.LoggedInUser;
import com.devashish.honest.social.net.honest_social_net.services.DaoService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

@Controller
public class ControllerClass {
	
	Logger logger = LoggerFactory.getLogger(ControllerClass.class);
	
	@Autowired
	private DaoService daoService;
	
	@GetMapping("/")
	public String login(Model model) {
		model.addAttribute("date", new Date());
		return "login";
	}
	
	@GetMapping("/login")
	public String login(@RequestParam("id") String id,Model model) {
		var user = daoService.getUserById(id);
		if(user==null) {
			user = new LoggedInUser(id);
			daoService.saveUser(user);
			logger.info("new user "+id+" signed up");
		} else {
			logger.info("existing user "+id+" logged in");
		}
		populateUserData(user);
		ObjectMapper objectMapper = new ObjectMapper();
        String userJson;
		try {
			userJson = objectMapper.writeValueAsString(user);
			model.addAttribute("user", userJson);
		} catch (JsonProcessingException e) {
			e.printStackTrace();
		}
		return "home";
	}

	private void populateUserData(LoggedInUser user) {
		if(user.getPosts()==null) {
			user.setPosts(new ArrayList<String>());
		}
		if(user.getFriends()==null) {
			user.setFriends(new ArrayList<String>());
		}
		if(user.getFriendsPosts()==null) {
			user.setFriendsPosts(new ArrayList<FriendsPost>());
		}
		if(user.getNotifications()==null) {
			user.setNotifications(new ArrayList<String>());
		}
		for(int i=0;i<user.getFriends().size();i++) {
			String friendId = user.getFriends().get(i);
			LoggedInUser friend = daoService.getUserById(friendId);
			if(friend==null) {
				continue;
			}
			List<String> friendsPostIds = friend.getPosts();
			if(friendsPostIds!=null) {
				List<FriendsPost> friendsPosts = new ArrayList<FriendsPost>();
				for(int j=0;j<friendsPostIds.size();j++) {
					String postId = friendsPostIds.get(j);
					FriendsPost friendsPost = new FriendsPost();
					friendsPost.setFriendId(friendId);
					friendsPost.setPostId(postId);
					friendsPosts.add(friendsPost);
				}
				user.getFriendsPosts().addAll(friendsPosts);
			}
		}
	}
}
