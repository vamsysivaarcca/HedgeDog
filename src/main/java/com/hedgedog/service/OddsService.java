package com.hedgedog.service;

import com.hedgedog.model.Odds;
import com.hedgedog.repository.OddsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class OddsService {

    private static final String API_KEY = "8e34ba8cb7d825726fd7d790005b0d36";
    private static final String BASE_API_URL = "https://api.the-odds-api.com/v4";

    private final RestTemplate restTemplate = new RestTemplate();

    // Track dynamically monitored events: User ID -> Event Details
    private final Map<Long, Map<String, String>> monitoredEvents = new ConcurrentHashMap<>();

    // Temporary cache for events fetched via /live-odds
    private final Map<String, Map<String, Object>> fetchedEventsCache = new ConcurrentHashMap<>();

    @Autowired
    private OddsRepository oddsRepository;

    // 1. Fetch All Sports
    public List<Map<String, String>> fetchSports() {
        String url = String.format("%s/sports?apiKey=%s", BASE_API_URL, API_KEY);
        List<Map<String, Object>> rawSports = fetchListFromAPI(url);

        List<Map<String, String>> sports = new ArrayList<>();
        if (rawSports != null) {
            for (Map<String, Object> sport : rawSports) {
                Map<String, String> parsedSport = new HashMap<>();
                parsedSport.put("key", (String) sport.get("key"));
                parsedSport.put("title", (String) sport.get("title"));
                sports.add(parsedSport);
            }
        }
        return sports;
    }

    // 2. Fetch Bookmakers for Sport and Region
    public Set<String> fetchBookmakers(String sport, String region) {
        String url = String.format(
                "%s/sports/%s/odds?apiKey=%s&regions=%s",
                BASE_API_URL, sport, API_KEY, region
        );

        List<Map<String, Object>> oddsData = fetchListFromAPI(url);
        Set<String> bookmakers = new HashSet<>();
        if (oddsData != null) {
            for (Map<String, Object> event : oddsData) {
                List<Map<String, Object>> bookmakersList = (List<Map<String, Object>>) event.get("bookmakers");
                if (bookmakersList != null) {
                    bookmakers.addAll(bookmakersList.stream()
                            .map(bookmaker -> (String) bookmaker.get("key"))
                            .collect(Collectors.toSet()));
                }
            }
        }
        return bookmakers;
    }

    // 3. Fetch Live Odds and Cache Events
    public List<Map<String, Object>> fetchLiveOdds(String sport, String region, String markets, String bookmakers) {
        String url = String.format(
                "%s/sports/%s/odds?apiKey=%s&regions=%s&markets=%s&bookmakers=%s",
                BASE_API_URL, sport, API_KEY, region, markets, bookmakers
        );

        System.out.println("Fetching odds with URL: " + url);
        List<Map<String, Object>> oddsData = fetchListFromAPI(url);

        // Cache all events (ensure all valid 'id' fields are cached)
        fetchedEventsCache.clear();
        if (oddsData != null) {
            for (Map<String, Object> event : oddsData) {
                String eventId = (String) event.get("id");
                if (eventId != null && !eventId.isEmpty()) {
                    fetchedEventsCache.put(eventId.trim(), event);
                }
            }
        }
        System.out.println("Cached Event IDs: " + fetchedEventsCache.keySet());

        return oddsData;
    }

    // 4. Add Event to Monitor
    public String addEventToMonitor(Long userId, String eventId, String sport, String region, String markets, String bookmakers) {
        String trimmedEventId = eventId.trim();
        if (!fetchedEventsCache.containsKey(trimmedEventId)) {
            return "Invalid Event ID. Please select a valid event.";
        }

        Map<String, String> eventDetails = new HashMap<>();
        eventDetails.put("eventId", trimmedEventId);
        eventDetails.put("sport", sport);
        eventDetails.put("region", region);
        eventDetails.put("markets", markets);
        eventDetails.put("bookmakers", bookmakers);

        monitoredEvents.put(userId, eventDetails);
        System.out.println("Started monitoring odds for User ID: " + userId + ", Event ID: " + trimmedEventId);
        return "Monitoring started for Event ID: " + trimmedEventId;
    }

    // 5. Fetch Monitored Odds
    public void fetchMonitoredOdds() {
        monitoredEvents.forEach((userId, eventDetails) -> {
            String url = String.format(
                    "%s/sports/%s/odds?apiKey=%s&regions=%s&markets=%s&bookmakers=%s",
                    BASE_API_URL,
                    eventDetails.get("sport"),
                    API_KEY,
                    eventDetails.get("region"),
                    eventDetails.get("markets"),
                    eventDetails.get("bookmakers")
            );

            try {
                List<Map<String, Object>> oddsData = Arrays.asList(restTemplate.getForObject(url, Map[].class));
                System.out.println("Fetched odds for User ID " + userId + ", Event ID " + eventDetails.get("eventId") + ": " + oddsData);
            } catch (Exception e) {
                System.err.println("Error fetching monitored odds for User ID " + userId + ": " + e.getMessage());
            }
        });
    }

    // 6. Remove Event from Monitoring
    public void removeEventToMonitor(Long userId) {
        monitoredEvents.remove(userId);
        System.out.println("Stopped monitoring odds for User ID: " + userId);
    }

    // Utility Method: Fetch List from API
    private List<Map<String, Object>> fetchListFromAPI(String url) {
        try {
            return Arrays.asList(restTemplate.getForObject(url, Map[].class));
        } catch (Exception e) {
            System.err.println("Error fetching data: " + e.getMessage());
            return Collections.emptyList();
        }
    }
}
