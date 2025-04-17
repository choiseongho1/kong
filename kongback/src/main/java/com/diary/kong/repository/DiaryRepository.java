package com.diary.kong.repository;

import com.diary.kong.model.Diary;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DiaryRepository extends JpaRepository<Diary, Long> {
    List<Diary> findByUserId(Long userId);

    List<Diary> findByUserIdAndDateBetween(Long userId, String startDate, String endDate);  // ✅ 월별 조회를 위한 메서드 수정
}
