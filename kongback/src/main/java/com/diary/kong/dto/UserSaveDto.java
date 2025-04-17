package com.diary.kong.dto;

import com.diary.kong.model.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UserSaveDto {

    @Email(message = "유효한 이메일 형식을 입력하세요.")
    @NotBlank(message = "이메일은 필수 입력 항목입니다.")
    private String email;

    @NotBlank(message = "비밀번호는 필수 입력 항목입니다.")
    private String password;

    @NotBlank(message = "닉네임은 필수 입력 항목입니다.")
    private String nickname;


    // toEntity
    public User toEntity(String encodedPassword){
        return User.builder()
                .email(email)
                .password(encodedPassword)
                .nickname(nickname)
                .build();
    }
}