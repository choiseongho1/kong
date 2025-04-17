package com.diary.kong.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
@AllArgsConstructor
public class DiaryDetailDto {
    private Long id;
    private String content;
    private String mood;

    private String date;
    private LocalDateTime createdAt;
}