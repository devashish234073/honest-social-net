package com.devashish.honest.social.net.honest_social_net.models;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import jakarta.persistence.*;

@Entity
@Table(name = "post")
public class Post {
	@Id
    @GeneratedValue(strategy = GenerationType.UUID)
	private String id;
	@Lob
	private byte[] image;
	private String caption;
	public static enum VISIBILITY{EVERYONE,ONLYFRIENDS,PRIVATE};
	@Enumerated(EnumType.ORDINAL)
	private VISIBILITY visibility;
	@Column(name = "user_id",length=255)
	private String userId;
	@Temporal(TemporalType.TIMESTAMP)
	private Date date;
	@ElementCollection(fetch = FetchType.EAGER)
	@CollectionTable(name = "post_likes", joinColumns = @JoinColumn(name = "post_id"))
	@Column(name = "likes")
	private List<String> likes;
	@OneToMany(cascade = CascadeType.ALL, orphanRemoval = true,fetch = FetchType.EAGER)
    @JoinColumn(name = "post_id")
	private List<Comment> comments;
	public Post() {
		this.date = new Date();
	}
	public Post(String caption) {
		this();
		this.caption = caption;
	}
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
	public void addComment(Comment comment) {
		if(this.comments==null) {
			this.comments = new ArrayList<Comment>();
		}
		this.comments.add(comment);
	}
	public String getId() {
		return id;
	}
	public void setId(String id) {
		this.id = id;
	}
	public byte[] getImage() {
		return image;
	}
	public void setImage(byte[] image) {
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
	@Override
	public String toString() {
		return "Post [id=" + id + ", image=" + image + ", caption=" + caption + ", visibility=" + visibility
				+ ", userId=" + userId + ", date=" + date + ", likes=" + likes + ", comments=" + comments + "]";
	}
}
