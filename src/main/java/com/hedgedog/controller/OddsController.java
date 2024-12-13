package com.hedgedog.controller;

import com.hedgedog.service.OddsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/odds")
public class OddsController {

    @Autowired
    private OddsService oddsService;

    // 1. Fetch Sports
    @GetMapping("/sports")
    public ResponseEntity<?> getSports() {
        List<Map<String, String>> sports = oddsService.fetchSports();
        return ResponseEntity.ok(sports);
    }

    @GetMapping("/markets")
    public ResponseEntity<?> getMarkets(@RequestParam String sport, @RequestParam String region, @RequestParam String bookmaker) {
        try {
            List<String> markets = oddsService.fetchMarkets(sport, region, bookmaker);
            return ResponseEntity.ok(markets);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch markets", "details", e.getMessage()));
        }
    }


    // 2. Fetch Bookmakers
    @GetMapping("/bookmakers")
    public ResponseEntity<?> getBookmakers(@RequestParam String sport, @RequestParam String     region) {
        Set<String> bookmakers = oddsService.fetchBookmakers(sport, region);
        return ResponseEntity.ok(bookmakers);
    }

    // 3. Fetch Live Odds
    @GetMapping("/live-odds")
    public ResponseEntity<?> getLiveOdds(@RequestParam String sport,
                                         @RequestParam String region,
                                         @RequestParam String markets,
                                         @RequestParam String bookmakers) {
        List<Map<String, Object>> oddsData = oddsService.fetchLiveOdds(sport, region, markets, bookmakers);
        return ResponseEntity.ok(oddsData);
    }

    // 4. Add Event to Monitor
    @GetMapping("/monitor")
    public ResponseEntity<?> addEventToMonitor(@RequestParam Long userId,
                                               @RequestParam String eventId,
                                               @RequestParam String sport,
                                               @RequestParam String region,
                                               @RequestParam String markets,
                                               @RequestParam String bookmakers) {
        String message = oddsService.addEventToMonitor(userId, eventId, sport, region, markets, bookmakers);
        return ResponseEntity.ok(Map.of("message", message));
    }

    // Stop monitoring odds for a user
    @DeleteMapping("/stop-monitor")
    public ResponseEntity<?> stopMonitoringEvent(@RequestParam Long userId) {
        String message = oddsService.stopMonitoringEvent(userId);
        return ResponseEntity.ok(Map.of("message", message));
    }

    // 5. Fetch Monitored Odds
    @GetMapping("/fetch-monitored-odds")
    public ResponseEntity<?> fetchMonitoredOdds(@RequestParam Long userId) {
        Map<String, Object> odds = oddsService.fetchMonitoredOdds(userId);
        return ResponseEntity.ok(odds);
    }

}