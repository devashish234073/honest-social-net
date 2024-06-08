package com.devashish.honest.social.net.honest_social_net.models;

import java.util.Date;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;

@Entity
@Table(name = "comment")
public class Comment {
	@Id
    @GeneratedValue(strategy = GenerationType.UUID)
	private String id;
	@Column(name = "user_id",length=255)
	private String userId;
	@Column(name = "comment",length=255)
	private String comment;
	@Temporal(TemporalType.TIMESTAMP)
	@Column(name = "date")
	private Date date;
	public Comment() {
		this.date = new Date();
	}
	public Comment(String comment) {
		this();
		this.comment = comment;
	}
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
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	@Override
	public String toString() {
		return "Comment [id=" + id + ", userId=" + userId + ", comment=" + comment + ", date=" + date + "]";
	}
}
