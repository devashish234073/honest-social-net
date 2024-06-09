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
		LoggedInUser user1 = new LoggedInUser("user1");
		LoggedInUser user2 = new LoggedInUser("user2");
		LoggedInUser user3 = new LoggedInUser("user3");
		Post post = new Post("What is this");
		Comment comment = new Comment("Hello check");
		post.addComment(comment);
		daoService.saveUser(user1);
		daoService.savePost(post);
		System.out.println(daoService.getAllUsers());
		user1.addPost(post);
		user2.addFriend("user1");
		user3.addFriend("user1");
		user1.addFriend("user2");
		user1.addFriend("user3");
		daoService.saveUser(user1);
		daoService.saveUser(user2);
		daoService.saveUser(user3);
		System.out.println(daoService.getAllUsers());
		System.out.println(daoService.getAllPosts());
		System.out.println(daoService.getAllComments());
	}

}
