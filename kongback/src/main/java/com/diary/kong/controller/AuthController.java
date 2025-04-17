package com.diary.kong.controller;

import com.diary.kong.common.ApiResponse;
import com.diary.kong.dto.LoginResponseDto;
import com.diary.kong.security.TokenResponse;
import com.diary.kong.dto.UserLoginDto;
import com.diary.kong.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponseDto>> login(@Valid @RequestBody UserLoginDto userLoginDto) {
        LoginResponseDto loginResponseDto = authService.login(userLoginDto);
        return ResponseEntity.ok(new ApiResponse<>(200, "로그인 성공", loginResponseDto));
    }

    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<TokenResponse>> refresh(@RequestBody String refreshToken) {
        TokenResponse newTokens = authService.refreshAccessToken(refreshToken);
        return ResponseEntity.ok(new ApiResponse<>(200, "토큰 재발급 성공", newTokens));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<String>> logout(@RequestBody String email) {
        authService.logout(email);
        return ResponseEntity.ok(new ApiResponse<>(200, "로그아웃 성공", null));
    }
}
