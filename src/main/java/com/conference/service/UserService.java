package com.conference.service;

import com.conference.dto.UserDTO;
import com.conference.model.User;
import com.conference.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;  // Inject PasswordEncoder

    @Autowired
    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;  // Initialize PasswordEncoder
    }

    // Convert Entity to DTO
    private UserDTO convertToDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .password(user.getPassword())  // This is the encoded password
                .role(user.getRole())
                .deleted(user.isDeleted())
                .build();
    }

    // Convert DTO to Entity
    private User convertToEntity(UserDTO userDTO) {
        return User.builder()
                .id(userDTO.getId())
                .username(userDTO.getUsername())
                .email(userDTO.getEmail())
                .password(userDTO.getPassword())  // Accept the encoded password from DTO
                .role(userDTO.getRole())
                .deleted(userDTO.isDeleted())
                .build();
    }

    // Get all users
    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Get user by ID
    public UserDTO getUserById(Long id) {
        return userRepository.findById(id)
                .map(this::convertToDTO)
                .orElse(null);  // or handle as you wish (404 etc.)
    }

    // Create new user with encoded password
    public UserDTO createUser(UserDTO userDTO) {
        User user = convertToEntity(userDTO);

        // Encode password before saving
        String encodedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encodedPassword);  // Set encoded password

        User savedUser = userRepository.save(user);
        return convertToDTO(savedUser);
    }

    // Soft delete user by ID
    public void softDeleteUser(Long id) {
        Optional<User> userOptional = userRepository.findById(id);
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            user.setDeleted(true);
            userRepository.save(user);
        }
    }
}
