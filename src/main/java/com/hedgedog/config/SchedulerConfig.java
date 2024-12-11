package com.hedgedog.config;

import com.hedgedog.service.OddsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

@Configuration
@EnableScheduling
public class SchedulerConfig {

    @Autowired
    private OddsService oddsService;

    // Scheduler to fetch odds for monitored events every 10 seconds
    @Scheduled(fixedRate = 10000000)
    public void monitorOdds() {
        System.out.println("Running scheduled task: Fetch Monitored Odds");

        // For each user monitoring an event, fetch the latest odds
        try {
            oddsService.fetchMonitoredOddsForAllUsers();
            System.out.println("Odds monitoring updated successfully.");
        } catch (Exception e) {
            System.err.println("Error in scheduled odds monitoring: " + e.getMessage());
        }
    }
}
