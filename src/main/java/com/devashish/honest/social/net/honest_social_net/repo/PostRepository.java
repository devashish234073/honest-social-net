package com.devashish.honest.social.net.honest_social_net.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.devashish.honest.social.net.honest_social_net.models.Post;

public interface PostRepository extends JpaRepository<Post, Long> {
	
}
