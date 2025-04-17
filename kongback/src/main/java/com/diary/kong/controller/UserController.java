package com.diary.kong.controller;

import com.diary.kong.common.ApiResponse;
import com.diary.kong.dto.UserSaveDto;
import com.diary.kong.model.User;
import com.diary.kong.service.UserService;
import jakarta.validation.Valid;
import org.springframework.hateoas.Link;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import static org.springframework.hateoas.server.mvc.WebMvcLinkBuilder.linkTo;

@RestController
@RequestMapping("/api/v1/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<User>> registerUser(@Valid @RequestBody UserSaveDto userSaveDto) {
        User user = userService.registerUser(userSaveDto);

        // HATEOAS 링크 추가
        ApiResponse<User> response = ApiResponse.success(user, "회원가입이 성공적으로 완료되었습니다.");
        Link selfLink = linkTo(UserController.class).slash("signup").withSelfRel();
        response.add(selfLink);

        return ResponseEntity.ok(response);
    }



}