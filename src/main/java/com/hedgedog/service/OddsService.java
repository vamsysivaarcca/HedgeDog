package com.hedgedog.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
public class OddsService {

    private static final String API_KEY = "c75c856976a011b4fbfc59c0c62ab8e2";
    private static final String BASE_API_URL = "https://api.the-odds-api.com/v4";

    private final RestTemplate restTemplate = new RestTemplate();

    // Cache for fetched events to enable monitoring
    private final Map<String, Map<String, Object>> fetchedEventsCache = new ConcurrentHashMap<>();

    // Track events being monitored dynamically: User ID -> Event Details
    private final Map<Long, Map<String, Object>> monitoredEvents = new ConcurrentHashMap<>();



    @Autowired
    private HedgingService hedgingService;

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

    public List<String> fetchMarkets(String sport, String region, String bookmaker) {
        String url = String.format(
                "%s/sports/%s/odds?apiKey=%s&regions=%s&bookmakers=%s",
                BASE_API_URL, sport, API_KEY, region, bookmaker
        );

        try {
            // Fetch odds data from the external API
            List<Map<String, Object>> oddsData = fetchListFromAPI(url);

            // Log the full API response for debugging
            System.out.println("Full API Response for Markets: " + oddsData);

            // Extract markets dynamically
            return oddsData.stream()
                    .flatMap(event -> ((List<Map<String, Object>>) event.getOrDefault("bookmakers", Collections.emptyList())).stream())
                    .filter(bm -> bookmaker.equals(bm.get("key")))
                    .flatMap(bm -> ((List<Map<String, Object>>) bm.getOrDefault("markets", Collections.emptyList())).stream())
                    .map(market -> (String) market.get("key"))
                    .distinct()
                    .collect(Collectors.toList());

        } catch (Exception e) {
            System.err.println("Error fetching markets: " + e.getMessage());
            return Collections.emptyList();
        }
    }


    // Fetch live odds with dynamic markets
    public List<Map<String, Object>> fetchLiveOdds(String sport, String region, String markets, String bookmakers) {
        String url = String.format(
                "%s/sports/%s/odds?apiKey=%s&regions=%s&markets=%s&bookmakers=%s",
                BASE_API_URL, sport, API_KEY, region, markets, bookmakers
        );

        System.out.println("Fetching Live Odds URL: " + url); // Log the request URL for debugging

        List<Map<String, Object>> oddsData = fetchListFromAPI(url);

        if (oddsData != null) {
            return oddsData; // Return full response data including all markets
        }

        return Collections.emptyList();
    }




    // Add event to monitor
    public String addEventToMonitor(Long userId, String eventId, String sport, String region, String markets, String bookmakers, String team, double initialOdds, double betAmount) {
        // Add all details to monitored events
        Map<String, Object> eventDetails = Map.of(
                "eventId", eventId,
                "sport", sport,
                "region", region,
                "markets", markets,
                "bookmakers", bookmakers,
                "team", team,
                "initialOdds", initialOdds,
                "betAmount", betAmount
        );

        monitoredEvents.put(userId, eventDetails);

        System.out.println("Monitoring event for User ID " + userId + ": " + eventDetails);
        return "Started monitoring odds for Event ID: " + eventId + " on team: " + team + " at initial odds: " + initialOdds;
    }




    // Fetch odds for monitored events
    public Map<String, Object> fetchMonitoredOdds(Long userId) {
        Map<String, Object> eventDetails = monitoredEvents.get(userId);


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


    public Map<String, Object> fetchMonitoredOddsWithHedge(Long userId, double currentBet) {
        Map<String, Object> eventDetails = monitoredEvents.get(userId);

        if (eventDetails == null) {
            return Map.of("message", "No event is being monitored for this user.");
        }

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
            Map<String, Object>[] oddsData = restTemplate.getForObject(url, Map[].class);

            if (oddsData == null) {
                throw new RuntimeException("No odds data received from the API.");
            }

            for (Map<String, Object> event : oddsData) {
                if (eventDetails.get("eventId").equals(event.get("id").toString())) {
                    // Safely get bookmakers
                    List<Map<String, Object>> bookmakers = safeCastToList(event.get("bookmakers"));
                    if (bookmakers.isEmpty()) continue;

                    // Safely get markets
                    List<Map<String, Object>> markets = safeCastToList(bookmakers.get(0).get("markets"));
                    if (markets.isEmpty()) continue;

                    // Safely get outcomes
                    List<Map<String, Object>> outcomes = safeCastToList(markets.get(0).get("outcomes"));
                    if (outcomes.isEmpty()) continue;

                    // Fetch latest odds
                    String selectedTeam = (String) eventDetails.get("team");
                    double latestOddsSelectedTeam = extractOddsForTeam(outcomes, selectedTeam);
                    String hedgeTeam = extractHedgeTeam(outcomes, selectedTeam);
                    double latestOddsOppositeTeam = extractOddsForTeam(outcomes, hedgeTeam);

                    // Fetch initial odds
                    double initialOdds = (double) eventDetails.get("initialOdds");

                    // Calculate hedging suggestion
                    Map<String, Object> hedgeResult = hedgingService.calculateHedge(
                            currentBet, initialOdds, latestOddsOppositeTeam, hedgeTeam);

                    return Map.of(
                            "userId", userId,
                            "eventId", eventDetails.get("eventId"),
                            "initialOdds", initialOdds,
                            "latestOddsSelectedTeam", latestOddsSelectedTeam,
                            "latestOddsOppositeTeam", latestOddsOppositeTeam,
                            "hedgingResult", hedgeResult
                    );
                }
            }
            return Map.of("message", "No odds available for the monitored event.");
        } catch (Exception e) {
            return Map.of("error", "Failed to fetch odds and calculate hedging", "details", e.getMessage());
        }
    }




    @Scheduled(fixedRate = 25000) // Runs every 25 seconds
    public void fetchLatestOddsForMonitoredEvents() {
        if (monitoredEvents.isEmpty()) {
            System.out.println("No events are currently being monitored.");
            return;
        }

        for (Map.Entry<Long, Map<String, Object>> entry : monitoredEvents.entrySet()) {
            Long userId = entry.getKey();
            Map<String, Object> eventDetails = entry.getValue();

            try {
                String url = String.format(
                        "%s/sports/%s/odds?apiKey=%s&regions=%s&markets=%s&bookmakers=%s",
                        BASE_API_URL,
                        eventDetails.get("sport"),
                        API_KEY,
                        eventDetails.get("region"),
                        eventDetails.get("markets"),
                        eventDetails.get("bookmakers")
                );

                // Fetch odds data
                Map<String, Object>[] oddsData = restTemplate.getForObject(url, Map[].class);

                // Loop through fetched events
                for (Map<String, Object> event : oddsData) {
                    if (event.get("id").equals(eventDetails.get("eventId"))) {
                        // Safe cast: "bookmakers"
                        List<Map<String, Object>> bookmakers = safeCastToList(event.get("bookmakers"));
                        if (!bookmakers.isEmpty()) {
                            Map<String, Object> firstBookmaker = bookmakers.get(0);

                            // Safe cast: "markets"
                            List<Map<String, Object>> markets = safeCastToList(firstBookmaker.get("markets"));
                            if (!markets.isEmpty()) {
                                Map<String, Object> firstMarket = markets.get(0);

                                // Safe cast: "outcomes"
                                List<Map<String, Object>> outcomes = safeCastToList(firstMarket.get("outcomes"));
                                if (outcomes != null && !outcomes.isEmpty()) {
                                    double latestOdds = extractOddsForTeam(outcomes, (String) eventDetails.get("team"));
                                    String hedgeTeam = extractHedgeTeam(outcomes, (String) eventDetails.get("team")); // Dynamic hedge team
                                    double initialOdds = (double) eventDetails.get("initialOdds");
                                    double betAmount = (double) eventDetails.get("betAmount");

// Calculate hedge suggestion
                                    Map<String, Object> hedgeSuggestion = hedgingService.calculateHedge(betAmount, initialOdds, latestOdds, hedgeTeam);

                                    System.out.println("Hedge Suggestion for User ID " + userId + ": " + hedgeSuggestion);
                                }
                            }
                        }
                    }
                }
            } catch (Exception e) {
                System.err.println("Error fetching odds for User ID " + userId + ": " + e.getMessage());
            }
        }
    }

    // Helper method for safe casting to List<Map<String, Object>>
    private List<Map<String, Object>> safeCastToList(Object obj) {
        if (obj instanceof List) {
            return (List<Map<String, Object>>) obj;
        }
        return Collections.emptyList(); // Return empty list if cast fails
    }
    public Map<String, Object> getLatestHedgeSuggestions(Long userId) {
        Map<String, Object> eventDetails = monitoredEvents.get(userId);

        if (eventDetails == null) {
            return Map.of("message", "No event is currently being monitored for this user.");
        }

        double initialOdds = (double) eventDetails.get("initialOdds");
        double betAmount = (double) eventDetails.get("betAmount");
        String team = (String) eventDetails.get("team");

        // Placeholder for latest odds (replace with dynamically fetched odds)
        double latestOdds = 1.91;

        // Calculate hedge suggestion
        String hedgeTeam = team.equalsIgnoreCase("Over") ? "Under" : "Over"; // Example placeholder logic
        Map<String, Object> hedgeSuggestion = hedgingService.calculateHedge(betAmount, initialOdds, latestOdds, hedgeTeam);

        return Map.of(
                "userId", userId,
                "eventId", eventDetails.get("eventId"),
                "team", team,
                "initialOdds", initialOdds,
                "latestOdds", latestOdds,
                "hedgeSuggestion", hedgeSuggestion
        );
    }


    private String extractHedgeTeam(List<Map<String, Object>> outcomes, String selectedTeam) {
        for (Map<String, Object> outcome : outcomes) {
            String teamName = (String) outcome.get("name");
            if (teamName != null && !teamName.equalsIgnoreCase(selectedTeam)) {
                return teamName; // Return the opposite team
            }
        }
        throw new RuntimeException("No hedge team found for the selected event.");
    }

    // Extract odds for the specified team
    private double extractOddsForTeam(List<Map<String, Object>> outcomes, String team) {
        for (Map<String, Object> outcome : outcomes) {
            String outcomeName = (String) outcome.get("name");
            if (outcomeName != null && outcomeName.equalsIgnoreCase(team)) {
                Object priceObj = outcome.get("price");
                if (priceObj != null) {
                    return Double.parseDouble(priceObj.toString());
                }
            }
        }
        throw new RuntimeException("Odds for team '" + team + "' not found in outcomes.");
    }
    // Helper method to extract hedge odds (e.g., odds for "Under")
    private double extractHedgeOdds(List<Map<String, Object>> outcomes) {
        for (Map<String, Object> outcome : outcomes) {
            String name = (String) outcome.get("name");
            if (name != null && name.equalsIgnoreCase("Under")) {
                return Double.parseDouble(outcome.get("price").toString());
            }
        }
        throw new RuntimeException("No hedge odds (e.g., 'Under') found in outcomes.");
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