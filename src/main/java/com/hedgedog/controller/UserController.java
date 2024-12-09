package com.hedgedog.controller;

import com.hedgedog.repository.UserRepository;
import com.hedgedog.model.User;
import com.hedgedog.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        User registeredUser = userService.registerUser(user);
        return ResponseEntity.ok(registeredUser);
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestParam String username, @RequestParam String password) {
        User loggedInUser = userService.loginUser(username, password);
        if (loggedInUser != null) {
            return ResponseEntity.ok(loggedInUser);
        }
        return ResponseEntity.status(401).body("Invalid credentials");
    }

    @GetMapping("/test-db")
    public ResponseEntity<?> testDatabaseConnection() {
        try {
            userRepository.count(); // Try any operation
            return ResponseEntity.ok("Database connection successful");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Database connection failed: " + e.getMessage());
        }
    }

}
