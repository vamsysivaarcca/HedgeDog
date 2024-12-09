package com.hedgedog.config;

import com.hedgedog.service.OddsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@EnableScheduling
public class SchedulerConfig {

    @Autowired
    private OddsService oddsService;

    // Run every 10 seconds to monitor odds for selected events
    @Scheduled(fixedRate = 10000)
    public void monitorSelectedEvents() {
        oddsService.fetchMonitoredOdds();
    }
}
