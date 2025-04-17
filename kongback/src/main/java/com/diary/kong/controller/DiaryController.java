package com.diary.kong.controller;

import com.diary.kong.dto.DiarySaveDto;
import com.diary.kong.dto.DiaryDetailDto;
import com.diary.kong.service.DiaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/diaries")
@RequiredArgsConstructor
public class DiaryController {

    private final DiaryService diaryService;

    @PostMapping("/create")
    public ResponseEntity<DiaryDetailDto> createDiary(@RequestParam Long userId, @RequestBody DiarySaveDto diarySaveDto) {
        DiaryDetailDto response = diaryService.createDiary(userId, diarySaveDto);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<DiaryDetailDto>> getDiariesByMonth(
        @PathVariable Long userId,
        @RequestParam String yearMonth) {
        List<DiaryDetailDto> diaries = diaryService.getDiariesByMonth(userId, yearMonth);
        return ResponseEntity.ok(diaries);
    }


    @PutMapping("/update/{diaryId}")
    public ResponseEntity<DiaryDetailDto> updateDiary(@PathVariable Long diaryId, @RequestBody DiarySaveDto diarySaveDto) {
        DiaryDetailDto updatedDiary = diaryService.updateDiary(diaryId, diarySaveDto);
        return ResponseEntity.ok(updatedDiary);
    }

    @DeleteMapping("/delete/{diaryId}")
    public ResponseEntity<Void> deleteDiary(@PathVariable Long diaryId) {
        diaryService.deleteDiary(diaryId);
        return ResponseEntity.noContent().build();
    }
}
