package com.devashish.honest.social.net.honest_social_net.controller;

import java.io.IOException;
import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.devashish.honest.social.net.honest_social_net.models.Comment;
import com.devashish.honest.social.net.honest_social_net.models.LoggedInUser;
import com.devashish.honest.social.net.honest_social_net.models.Post;
import com.devashish.honest.social.net.honest_social_net.models.Post.VISIBILITY;
import com.devashish.honest.social.net.honest_social_net.services.DaoService;

@RestController
public class ImageController {

	@Autowired
	private DaoService daoService;

	@PostMapping("/postStatus")
	public String postStatus(@RequestPart("image") MultipartFile image, @RequestPart("caption") String caption,
			@RequestPart("userId") String userId) {
		LoggedInUser user = daoService.getUserById(userId);
		Post post = new Post();
		post.setCaption(caption);
		post.setUserId(userId);
		post.setVisibility(VISIBILITY.EVERYONE);
		if (image != null) {
			try {
				post.setImage(image.getBytes());
			} catch (IOException e) {
				e.printStackTrace();
			}
		}
		daoService.savePost(post);
		user.addPost(post);
		daoService.saveUser(user);
		return "success";
	}

	@GetMapping(value = "/getPost")
	public ResponseEntity<byte[]> getPost(@RequestParam("userId") String userId,
			@RequestParam("friendId") String friendId, @RequestParam("postId") String postId) {
		Post post = daoService.getPostById(postId);
		HttpHeaders headers = new HttpHeaders();
		headers.setContentType(MediaType.IMAGE_JPEG);
		headers.add("caption", post.getCaption());
		if(post.getLikes()==null) {
			post.setLikes(new ArrayList<String>());
		}
		if(post.getComments()==null) {
			post.setComments(new ArrayList<Comment>());
		}
		return new ResponseEntity<>(post.getImage(), headers, HttpStatus.OK);
	}

}
