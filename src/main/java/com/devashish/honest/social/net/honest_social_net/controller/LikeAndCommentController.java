package com.devashish.honest.social.net.honest_social_net.controller;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.devashish.honest.social.net.honest_social_net.models.Comment;
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
		if(postAuthorId==null) {
			return new ArrayList<String>();
		}
		LoggedInUser postAuthor = daoService.getUserById(postAuthorId);
		if(postAuthor==null) {
			return new ArrayList<String>();
		}
		if(post.getLikes()==null) {
			post.setLikes(new ArrayList<String>());
		}
		if(post.getLikes().indexOf(userId)>-1) {
			post.getLikes().remove(userId);//unlike
			if(!userId.equals(postAuthorId)) {
				postAuthor.addNotification("post " + postId + " un-liked by " + userId); 	
			}
		} else {
			post.getLikes().add(userId);//like
			if(!userId.equals(postAuthorId)) {
			    postAuthor.addNotification("post " + postId + " liked by " + userId);
			}
		}
		daoService.savePost(post);
		daoService.saveUser(postAuthor);
		return post.getLikes();
	}
	
	@GetMapping("commentOnPost")
	public List<Comment> commentOnPost(@RequestParam("postId") String postId,@RequestParam("userId") String userId,@RequestParam("comment") String commentStr) {
		Post post = daoService.getPostById(postId);
		var emptyCommentList = new ArrayList<Comment>();
		if(post==null) {
			return emptyCommentList;
		}
		String postAuthorId = post.getUserId();
		if(postAuthorId==null) {
			return emptyCommentList;
		}
		LoggedInUser postAuthor = daoService.getUserById(postAuthorId);
		if(postAuthor==null) {
			return emptyCommentList;
		}
		if(post.getComments()==null) {
			post.setComments(emptyCommentList);
		}
		Comment comment = new Comment();
		comment.setComment(commentStr);
		comment.setUserId(userId);
		comment.setDate(new Date());
		post.addComment(comment);
		if(!userId.equals(postAuthorId)) {
			String notification = userId+" commented '"+commentStr+"' on your post "+postId;
			postAuthor.addNotification(notification);
		}
		daoService.savePost(post);
		daoService.saveUser(postAuthor);
		return post.getComments();
	}
}
