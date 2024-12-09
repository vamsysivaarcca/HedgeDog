package com.hedgedog.controller;

import com.hedgedog.service.OddsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Set;

@RestController
@RequestMapping("/api/odds")
public class OddsController {

    @Autowired
    private OddsService oddsService;

    @GetMapping("/sports")
    public ResponseEntity<?> getSports() {
        return ResponseEntity.ok(oddsService.fetchSports());
    }

    @GetMapping("/bookmakers")
    public ResponseEntity<?> getBookmakers(@RequestParam String sport, @RequestParam String region) {
        Set<String> bookmakers = oddsService.fetchBookmakers(sport, region);
        return ResponseEntity.ok(bookmakers);
    }

    @GetMapping("/live-odds")
    public ResponseEntity<?> getLiveOdds(
            @RequestParam String sport,
            @RequestParam String region,
            @RequestParam(required = false, defaultValue = "h2h") String markets,
            @RequestParam String bookmakers) {
        return ResponseEntity.ok(oddsService.fetchLiveOdds(sport, region, markets, bookmakers));
    }

    @PostMapping("/monitor")
    public ResponseEntity<?> startMonitoring(@RequestParam Long userId,
                                             @RequestParam String eventId,
                                             @RequestParam String sport,
                                             @RequestParam String region,
                                             @RequestParam(required = false, defaultValue = "h2h") String markets,
                                             @RequestParam String bookmakers) {
        String response = oddsService.addEventToMonitor(userId, eventId, sport, region, markets, bookmakers);
        if (response.startsWith("Invalid")) {
            return ResponseEntity.badRequest().body(response);
        }
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/monitor")
    public ResponseEntity<?> stopMonitoring(@RequestParam Long userId) {
        oddsService.removeEventToMonitor(userId);
        return ResponseEntity.ok("Monitoring stopped.");
    }
}
