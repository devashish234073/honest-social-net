package com.devashish.honest.social.net.honest_social_net.models;

import java.util.Date;
import java.util.List;

public class Post {
	private String id;
	private String image;
	private String caption;
	public static enum VISIBILITY{EVERYONE,ONLYFRIENDS,PRIVATE};
	private VISIBILITY visibility;
	private String userId;
	private Date date;
	private List<String> likes;
	private List<Comment> comments;
	public String getUserId() {
		return userId;
	}
	public void setUserId(String userId) {
		this.userId = userId;
	}
	public Date getDate() {
		return date;
	}
	public void setDate(Date date) {
		this.date = date;
	}
	public List<String> getLikes() {
		return likes;
	}
	public void setLikes(List<String> likes) {
		this.likes = likes;
	}
	public List<Comment> getComments() {
		return comments;
	}
	public void setComments(List<Comment> comments) {
		this.comments = comments;
	}
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public String getImage() {
		return image;
	}
	public void setImage(String image) {
		this.image = image;
	}
	public String getCaption() {
		return caption;
	}
	public void setCaption(String caption) {
		this.caption = caption;
	}
	public VISIBILITY getVisibility() {
		return visibility;
	}
	public void setVisibility(VISIBILITY visibility) {
		this.visibility = visibility;
	}
}
