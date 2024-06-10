package com.devashish.honest.social.net.honest_social_net.services;

import com.devashish.honest.social.net.honest_social_net.models.Post;
import com.devashish.honest.social.net.honest_social_net.models.LoggedInUser;
import com.devashish.honest.social.net.honest_social_net.repo.CommentRepository;
import com.devashish.honest.social.net.honest_social_net.repo.PostRepository;
import com.devashish.honest.social.net.honest_social_net.repo.UserRepository;
import com.devashish.honest.social.net.honest_social_net.models.Comment;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DaoService {

    @Autowired
    private PostRepository postRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CommentRepository commentRepository;

    public Post savePost(Post post) {
        return postRepository.save(post);
    }

    public LoggedInUser saveUser(LoggedInUser user) {
        return userRepository.save(user);
    }

    public Comment saveComment(Comment comment) {
        return commentRepository.save(comment);
    }

    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    public List<LoggedInUser> getAllUsers() {
        return userRepository.findAll();
    }
    
    public LoggedInUser getUserById(String id) {
    	Optional<LoggedInUser> user = userRepository.findById(id);
        return user.isEmpty()?null:user.get();
    }

    public List<Comment> getAllComments() {
        return commentRepository.findAll();
    }
}
