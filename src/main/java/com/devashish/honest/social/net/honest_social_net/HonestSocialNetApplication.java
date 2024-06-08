package com.devashish.honest.social.net.honest_social_net;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ConfigurableApplicationContext;

import com.devashish.honest.social.net.honest_social_net.models.Comment;
import com.devashish.honest.social.net.honest_social_net.models.LoggedInUser;
import com.devashish.honest.social.net.honest_social_net.models.Post;
import com.devashish.honest.social.net.honest_social_net.services.DaoService;

@SpringBootApplication
public class HonestSocialNetApplication {

	public static void main(String[] args) {
		ConfigurableApplicationContext ctxt = SpringApplication.run(HonestSocialNetApplication.class, args);
		DaoService daoService = ctxt.getBean(DaoService.class);
		LoggedInUser user = new LoggedInUser();
		Post post = new Post("What is this");
		Comment comment = new Comment("Hello check");
		post.addComment(comment);
		daoService.saveUser(user);
		daoService.savePost(post);
		System.out.println(daoService.getAllUsers());
		user.addPost(post);
		daoService.saveUser(user);
		System.out.println(daoService.getAllUsers());
		System.out.println(daoService.getAllPosts());
		System.out.println(daoService.getAllComments());
	}

}
