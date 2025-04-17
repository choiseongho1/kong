package com.diary.kong.service;


import com.diary.kong.common.CustomException;
import com.diary.kong.dto.DiaryDetailDto;
import com.diary.kong.dto.DiarySaveDto;
import com.diary.kong.model.Diary;
import com.diary.kong.model.User;
import com.diary.kong.repository.DiaryRepository;
import com.diary.kong.repository.UserRepository;
import io.micrometer.common.util.StringUtils;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class DiaryService {

    private final DiaryRepository diaryRepository;
    private final UserRepository userRepository;
    private final MoodAnalysisService moodAnalysisService;

    @Transactional
    public DiaryDetailDto createDiary(Long userId, DiarySaveDto diarySaveDto) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new CustomException(999, "사용자를 찾을 수 없습니다."));

        String mood = moodAnalysisService.analyzeMood(diarySaveDto.getContent());


        if(StringUtils.isEmpty(diarySaveDto.getDate())){
            diarySaveDto.setDate(LocalDate.now().toString().formatted(DateTimeFormatter.ofPattern("yyyyMMdd")));
        }

        Diary diary = Diary.builder()
            .content(diarySaveDto.getContent())
            .mood(mood)
            .date(diarySaveDto.getDate())
            .createdAt(LocalDateTime.now())
            .user(user)
            .build();

        Diary savedDiary = diaryRepository.save(diary);

        return DiaryDetailDto.builder()
            .id(savedDiary.getId())
            .content(savedDiary.getContent())
            .mood(savedDiary.getMood())
            .date(savedDiary.getDate())
            .createdAt(savedDiary.getCreatedAt())
            .build();
    }


    public List<DiaryDetailDto> getDiariesByMonth(Long userId, String yearMonth) {
        int year = Integer.parseInt(yearMonth.substring(0, 4));
        int month = Integer.parseInt(yearMonth.substring(4, 6));

        LocalDate startDate = LocalDate.of(year, month, 1);
        LocalDate endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
        String formattedStartDate = startDate.format(formatter);
        String formattedEndDate = endDate.format(formatter);

        return diaryRepository.findByUserIdAndDateBetween(userId, formattedStartDate, formattedEndDate)
            .stream()
            .map(diary -> new DiaryDetailDto(
                diary.getId(),
                diary.getContent(),
                diary.getMood(),
                diary.getDate(),
                diary.getCreatedAt()
            ))
            .collect(Collectors.toList());
    }

    @Transactional
    public DiaryDetailDto updateDiary(Long diaryId, DiarySaveDto diarySaveDto) {
        Diary diary = diaryRepository.findById(diaryId)
            .orElseThrow(() -> new CustomException(999,"일기를 찾을 수 없습니다."));

        verifyOwnership(diary.getUser().getId());


        diary.setContent(diarySaveDto.getContent());

        Diary savedDiary = diaryRepository.save(diary);

        return DiaryDetailDto.builder()
            .id(savedDiary.getId())
            .content(savedDiary.getContent())
            .mood(savedDiary.getMood())
            .date(savedDiary.getDate())
            .createdAt(savedDiary.getCreatedAt())
            .build();
    }

    @Transactional
    public void deleteDiary(Long diaryId) {
        Diary diary = diaryRepository.findById(diaryId)
            .orElseThrow(() -> new CustomException(999,"일기를 찾을 수 없습니다."));

        verifyOwnership(diary.getUser().getId());

        diaryRepository.delete(diary);
    }

    private void verifyOwnership(Long diaryUserId) {
        Long currentUserId = Long.valueOf(SecurityContextHolder.getContext().getAuthentication().getName());
        if (!currentUserId.equals(diaryUserId)) {
            throw new CustomException(999, "권한이 없습니다.");
        }
    }



}