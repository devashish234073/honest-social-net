package com.devashish.honest.social.net.honest_social_net.controller;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.devashish.honest.social.net.honest_social_net.models.LoggedInUser;
import com.devashish.honest.social.net.honest_social_net.models.Post;
import com.devashish.honest.social.net.honest_social_net.services.DaoService;

@RestController
public class LikeAndCommentController {
	
	@Autowired
	private DaoService daoService;
	
	@GetMapping("likePost")
	public List<String> likePost(@RequestParam("postId") String postId,@RequestParam("userId") String userId) {
		Post post = daoService.getPostById(postId);
		if(post==null) {
			return new ArrayList<String>();
		}
		String postAuthorId = post.getUserId();
		LoggedInUser postAuthor = daoService.getUserById(postAuthorId);
		if(postAuthor==null) {
			return new ArrayList<String>();
		}
		if(post.getLikes()==null) {
			post.setLikes(new ArrayList<String>());
		}
		if(post.getLikes().indexOf(userId)>-1) {
			post.getLikes().remove(userId);//unlike
			postAuthor.addNotification("post " + postId + " un-liked by " + userId); 
		} else {
			post.getLikes().add(userId);//like
			postAuthor.addNotification("post " + postId + " liked by " + userId);
		}
		daoService.savePost(post);
		daoService.saveUser(postAuthor);
		return post.getLikes();
	}
}
