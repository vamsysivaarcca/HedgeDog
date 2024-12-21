package com.hedgedog.service;
import org.springframework.stereotype.Service;
import java.util.HashMap;
import java.util.Map;
@Service
public class HedgingService {
    public Map<String, Object> calculateHedge(double currentBet, double currentOdds, double latestOdds, String hedgeTeam) {
        Map<String, Object> response = new HashMap<>();

        if (currentBet <= 0 || currentOdds <= 0 || latestOdds <= 0) {
            response.put("error", "Invalid input values. All inputs must be positive.");
            return response;
        }

        double hedgeAmount = (currentBet * currentOdds) / latestOdds;
        double totalStake = currentBet + hedgeAmount;
        double profit = (hedgeAmount * latestOdds) - totalStake;

        // Populate response
        response.put("currentBet", currentBet);
        response.put("currentOdds", currentOdds);
        response.put("latestOdds", latestOdds);
        response.put("hedgeAmount", Math.round(hedgeAmount * 100.0) / 100.0);
        response.put("totalStake", Math.round(totalStake * 100.0) / 100.0);
        response.put("profit", Math.round(profit * 100.0) / 100.0);
        response.put("hedgeTeam", hedgeTeam); // Dynamically suggest the hedge team

        return response;
    }
}