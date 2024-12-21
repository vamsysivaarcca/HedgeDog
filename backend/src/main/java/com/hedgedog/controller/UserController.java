package com.hedgedog.controller;

import com.hedgedog.repository.UserRepository;
import com.hedgedog.model.User;
import com.hedgedog.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

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
            // Return userId and status as part of a response map
            Map<String, Object> response = new HashMap<>();
            response.put("userId", loggedInUser.getId()); // Assuming 'getId()' returns the user ID
            response.put("username", loggedInUser.getUsername());
            response.put("status", "Login Successful");

            return ResponseEntity.ok(response);
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
