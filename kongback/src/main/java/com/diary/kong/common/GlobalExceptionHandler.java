package com.diary.kong.common;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    // ✅ CustomException 처리
    @ExceptionHandler(CustomException.class)
    public ResponseEntity<ApiResponse<String>> handleCustomException(CustomException ex) {
        ApiResponse<String> response = new ApiResponse<>(ex.getStatus(), ex.getMessage(), null);
        return ResponseEntity.ok(response);  // HTTP 200 상태로 응답
    }

    // 유효성 검증 실패 처리
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<String>> handleValidationException(MethodArgumentNotValidException ex) {
        String errorMessage = ex.getBindingResult().getFieldError().getDefaultMessage();
        ApiResponse<String> response = ApiResponse.error(400, errorMessage);
        return ResponseEntity.badRequest().body(response);
    }

    // 기타 예외 처리
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<String>> handleGeneralException(Exception ex) {
        log.error("서버 오류 발생: {}", ex.getMessage(), ex);
        ApiResponse<String> response = ApiResponse.error(500, "서버 오류가 발생했습니다.");
        return ResponseEntity.status(500).body(response);
    }
}