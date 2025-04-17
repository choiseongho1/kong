package com.diary.kong.service;

import com.diary.kong.common.CustomException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class MoodAnalysisService {

    private final ChatModel chatModel;

    public MoodAnalysisService(ChatModel chatModel) {
        this.chatModel = chatModel;
    }

    public String analyzeMood(String content) {

        if (content == null || content.isEmpty()) {
            throw new CustomException(999 , "내용이 존재하지 않습니다.");
        }

        return generateMood(content);

    }


    private String generateMood(String diffContent) {
        String prompt = createMoodPrompt(diffContent);
        return chatModel.call(new Prompt(prompt).getContents());
    }

    private String createMoodPrompt(String content) {
        return String.format("""
        당신은 최고의 감정 분석가입니다.
        아래의 일기 내용을 읽고 사용자의 기분을 분석하세요.

        **분석 결과는 반드시 아래 형식을 따라야 합니다.**

        - 기분 상태를 반드시 아래의 단어 중 하나로만 응답하세요:
        [HAPPY, SAD, ANGRY, NEUTRAL, EXCITED, CALM, ANXIOUS, TIRED, BORED, CONFUSED, HOPEFUL, LONELY, SURPRISED]

        다른 설명 없이 정확히 해당 단어만 출력하세요.

        일기 내용:
        "%s"
        """, content);
    }

}