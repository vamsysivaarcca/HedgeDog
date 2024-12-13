package com.hedgedog.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class OddsService {

    private static final String API_KEY = "47f455138d53715ad83d4a84ae9658ee";
    private static final String BASE_API_URL = "https://api.the-odds-api.com/v4";

    private final RestTemplate restTemplate = new RestTemplate();

    // Cache for fetched events to enable monitoring
    private final Map<String, Map<String, Object>> fetchedEventsCache = new ConcurrentHashMap<>();

    // Track events being monitored dynamically: User ID -> Event Details
    private final Map<Long, Map<String, String>> monitoredEvents = new ConcurrentHashMap<>();

    // Fetch all sports
    public List<Map<String, String>> fetchSports() {
        String url = String.format("%s/sports?apiKey=%s", BASE_API_URL, API_KEY);
        List<Map<String, Object>> rawSports = fetchListFromAPI(url);

        if (rawSports == null) return Collections.emptyList();

        return rawSports.stream()
                .map(sport -> Map.of(
                        "key", (String) sport.get("key"),
                        "group", (String) sport.get("group"),
                        "title", (String) sport.get("title")
                ))
                .collect(Collectors.toList());
    }

    // Fetch bookmakers for a sport and region
    public Set<String> fetchBookmakers(String sport, String region) {
        String url = String.format("%s/sports/%s/odds?apiKey=%s&regions=%s", BASE_API_URL, sport, API_KEY, region);
        List<Map<String, Object>> oddsData = fetchListFromAPI(url);

        if (oddsData == null) return Collections.emptySet();

        return oddsData.stream()
                .flatMap(event -> ((List<Map<String, Object>>) event.getOrDefault("bookmakers", Collections.emptyList())).stream())
                .map(bookmaker -> (String) bookmaker.get("key"))
                .collect(Collectors.toSet());
    }

    // Fetch live odds with dynamic markets
    public List<Map<String, Object>> fetchLiveOdds(String sport, String region, String markets, String bookmakers) {
        String url = String.format(
                "%s/sports/%s/odds?apiKey=%s&regions=%s&markets=%s&bookmakers=%s",
                BASE_API_URL, sport, API_KEY, region, markets, bookmakers
        );

        List<Map<String, Object>> oddsData = fetchListFromAPI(url);

        fetchedEventsCache.clear(); // Clear previous cache
        if (oddsData != null) {
            oddsData.forEach(event -> {
                String eventId = (String) event.get("id");
                if (eventId != null) fetchedEventsCache.put(eventId.trim(), event);
            });
        }

        return oddsData;
    }

    // Add event to monitor
    public String addEventToMonitor(Long userId, String eventId, String sport, String region, String markets, String bookmakers) {
        // Remove reliance on fetchedEventsCache
        Map<String, String> eventDetails = Map.of(
                "eventId", eventId,
                "sport", sport,
                "region", region,
                "markets", markets,
                "bookmakers", bookmakers
        );

        monitoredEvents.put(userId, eventDetails);
        System.out.println("Started monitoring odds for User ID: " + userId + ", Event ID: " + eventId);
        return "Started monitoring odds for Event ID: " + eventId;
    }

    // Fetch odds for monitored events
    public Map<String, Object> fetchMonitoredOdds(Long userId) {
        Map<String, String> eventDetails = monitoredEvents.get(userId);

        if (eventDetails == null) {
            return Map.of("message", "No event is being monitored for this user.");
        }

        String url = String.format(
                "%s/sports/%s/odds?apiKey=%s&regions=%s&markets=%s&bookmakers=%s",
                BASE_API_URL, eventDetails.get("sport"), API_KEY,
                eventDetails.get("region"), eventDetails.get("markets"), eventDetails.get("bookmakers")
        );

        try {
            System.out.println("Fetching Monitored Odds: " + url); // Log the URL
            Map<String, Object>[] oddsData = restTemplate.getForObject(url, Map[].class);

            System.out.println("API Response: " + Arrays.toString(oddsData)); // Log API Response

            if (oddsData != null && oddsData.length > 0) {
                Map<String, Object> selectedEvent = Arrays.stream(oddsData)
                        .filter(e -> eventDetails.get("eventId").equals(e.get("id")))
                        .findFirst()
                        .orElse(null);

                if (selectedEvent != null) {
                    List<Map<String, Object>> bookmakers = (List<Map<String, Object>>) selectedEvent.get("bookmakers");
                    if (bookmakers != null && !bookmakers.isEmpty()) {
                        List<Map<String, Object>> markets = (List<Map<String, Object>>) bookmakers.get(0).get("markets");
                        if (markets != null && !markets.isEmpty()) {
                            List<Map<String, Object>> outcomes = (List<Map<String, Object>>) markets.get(0).get("outcomes");

                            return Map.of(
                                    "userId", userId,
                                    "eventId", eventDetails.get("eventId"),
                                    "odds", outcomes
                            );
                        }
                    }
                }
            }
            return Map.of("message", "No odds available for the monitored event.");
        } catch (Exception e) {
            System.err.println("Error fetching monitored odds: " + e.getMessage());
            e.printStackTrace(); // Print full stack trace for debugging
            return Map.of("error", "Failed to fetch odds", "details", e.getMessage());
        }
    }



    // Utility method: Fetch list from API
    private List<Map<String, Object>> fetchListFromAPI(String url) {
        try {
            return Arrays.asList(restTemplate.getForObject(url, Map[].class));
        } catch (Exception e) {
            System.err.println("Error fetching data: " + e.getMessage());
            return Collections.emptyList();
        }
    }

    public void fetchMonitoredOddsForAllUsers() {
        monitoredEvents.forEach((userId, eventDetails) -> {
            String url = String.format(
                    "%s/sports/%s/odds?apiKey=%s&regions=%s&markets=%s&bookmakers=%s",
                    BASE_API_URL, eventDetails.get("sport"), API_KEY,
                    eventDetails.get("region"), eventDetails.get("markets"), eventDetails.get("bookmakers")
            );

            try {
                Map<String, Object> oddsData = fetchMapFromAPI(url);
                System.out.println("Monitored Odds for User ID " + userId + ": " + oddsData);
            } catch (Exception e) {
                System.err.println("Failed to fetch monitored odds for User ID " + userId + ": " + e.getMessage());
            }
        });
    }

    public String stopMonitoringEvent(Long userId) {
        if (monitoredEvents.containsKey(userId)) {
            monitoredEvents.remove(userId);
            return "Stopped monitoring odds for User ID: " + userId;
        } else {
            return "No event is being monitored for this User ID.";
        }
    }

    // Utility method: Fetch map from API
    private Map<String, Object> fetchMapFromAPI(String url) {
        try {
            return restTemplate.getForObject(url, Map.class);
        } catch (Exception e) {
            System.err.println("Error fetching monitored odds: " + e.getMessage());
            return Map.of("error", e.getMessage());
        }
    }
}