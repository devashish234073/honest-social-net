package com.devashish.honest.social.net.honest_social_net.controller;

import java.util.Date;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import com.devashish.honest.social.net.honest_social_net.services.DaoService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

@Controller
public class ControllerClass {
	
	@Autowired
	private DaoService daoService;
	
	@GetMapping("/")
	public String login(Model model) {
		model.addAttribute("date", new Date());
		return "login";
	}
	
	@GetMapping("/login")
	public String login(@RequestParam("id") String id,Model model) {
		var user = daoService.getUserById(id);
		ObjectMapper objectMapper = new ObjectMapper();
        String userJson;
		try {
			userJson = objectMapper.writeValueAsString(user);
			model.addAttribute("user", userJson);
		} catch (JsonProcessingException e) {
			e.printStackTrace();
		}
		return "home";
	}
}
