package com.hedgedog.controller;

import com.hedgedog.service.OddsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/hedging")
public class HedgingController {

    @Autowired
    private OddsService oddsService;

    // Endpoint to calculate hedge suggestions dynamically
    @GetMapping("/calculate")
    public ResponseEntity<?> calculateHedge(
            @RequestParam Long userId,
            @RequestParam double currentBet
    ) {
        try {
            // Delegate to OddsService to dynamically fetch odds and calculate hedging
            Map<String, Object> response = oddsService.fetchMonitoredOddsWithHedge(userId, currentBet);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
