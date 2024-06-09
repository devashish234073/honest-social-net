package com.devashish.honest.social.net.honest_social_net.controller;

import java.util.Date;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class ControllerClass {
	@GetMapping("/")
	public String login(Model model) {
		model.addAttribute("date", new Date());
		return "login";
	}
	
	@GetMapping("/login")
	public String login(@RequestParam("id") String id,Model model) {
		model.addAttribute("date", id+" " + new Date());
		return "home";
	}
}
