package com.diary.kong.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
@AllArgsConstructor
public class UserDetailDto {
    private Long id;
    private String email;
    private String nickname;
}