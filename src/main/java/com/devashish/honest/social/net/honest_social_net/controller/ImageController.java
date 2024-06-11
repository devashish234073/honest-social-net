package com.devashish.honest.social.net.honest_social_net.controller;

import java.io.IOException;
import java.util.ArrayList;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.devashish.honest.social.net.honest_social_net.models.Post;
import com.devashish.honest.social.net.honest_social_net.models.Post.VISIBILITY;
import com.devashish.honest.social.net.honest_social_net.services.DaoService;

@RestController
public class ImageController {
	
	@Autowired
	private DaoService daoService;
	
	@PostMapping("/postStatus")
    public String postStatus(@RequestPart("image") MultipartFile image,
    		@RequestPart("caption") String caption,
            @RequestPart("userId") String userId) {
		Post post = new Post();
		post.setCaption(caption);
		post.setUserId(userId);
		post.setVisibility(VISIBILITY.EVERYONE);
		if(image!=null) {
			try {
				post.setImage(image.getBytes());
			} catch (IOException e) {
				e.printStackTrace();
			}	
		}
		daoService.savePost(post);
		return "success";
	}
	
	@GetMapping("/getPost")
	public byte[] getPost(String userId,String friendId,String postId) {
		Post post = daoService.getPostById(postId);
		return post.getImage();
	}
    		
}
