package com.diary.kong.service;

import com.diary.kong.common.CustomException;
import com.diary.kong.dto.UserSaveDto;
import com.diary.kong.model.User;
import com.diary.kong.repository.UserRepository;
import com.diary.kong.security.JwtTokenProvider;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = new BCryptPasswordEncoder();
    }

    public User registerUser(UserSaveDto userSaveDto) {
        if (userRepository.existsByEmail(userSaveDto.getEmail())) {
            throw new CustomException(999, "이미 존재하는 이메일입니다.");
        }

        String encodedPassword = passwordEncoder.encode(userSaveDto.getPassword());

        User user = userSaveDto.toEntity(encodedPassword);

        return userRepository.save(user);
    }

}