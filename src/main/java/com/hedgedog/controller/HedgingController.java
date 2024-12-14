package com.hedgedog.controller;

import com.hedgedog.service.HedgingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/hedging")
public class HedgingController {

    private final HedgingService hedgingService;

    @Autowired
    public HedgingController(HedgingService hedgingService) {
        this.hedgingService = hedgingService;
    }

    @GetMapping("/calculate")
    public ResponseEntity<Map<String, Object>> calculateHedge(
            @RequestParam double currentBet,
            @RequestParam double currentOdds,
            @RequestParam double hedgeOdds
    ) {
        Map<String, Object> response = hedgingService.calculateHedge(currentBet, currentOdds, hedgeOdds);

        if (response.containsKey("error")) {
            return ResponseEntity.badRequest().body(response);
        }

        return ResponseEntity.ok(response);
    }
}
