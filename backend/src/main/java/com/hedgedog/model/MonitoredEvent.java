package com.hedgedog.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "monitored_events")
public class MonitoredEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;
    @Column(name = "event_id", nullable = false)
    private String eventId;
    private String sport;
    private String region;
    private String markets;
    private String bookmakers;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // Getters and Setters
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public String getSport() { return sport; }
    public void setSport(String sport) { this.sport = sport; }

    public String getRegion() { return region; }
    public void setRegion(String region) { this.region = region; }

    public String getMarkets() { return markets; }
    public void setMarkets(String markets) { this.markets = markets; }

    public String getBookmakers() { return bookmakers; }
    public void setBookmakers(String bookmakers) { this.bookmakers = bookmakers; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}