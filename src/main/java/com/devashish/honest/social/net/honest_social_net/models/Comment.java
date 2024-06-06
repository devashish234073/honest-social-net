package com.devashish.honest.social.net.honest_social_net.models;

import java.util.Date;

public class Comment {
	private String userId;
	private String comment;
	private Date date;
	public String getUserId() {
		return userId;
	}
	public void setUserId(String userId) {
		this.userId = userId;
	}
	public String getComment() {
		return comment;
	}
	public void setComment(String comment) {
		this.comment = comment;
	}
	public Date getDate() {
		return date;
	}
	public void setDate(Date date) {
		this.date = date;
	}
}
