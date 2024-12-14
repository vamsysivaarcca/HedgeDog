package com.hedgedog.service;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.Map;

@Service
public class HedgingService {

    public Map<String, Object> calculateHedge(double currentBet, double currentOdds, double hedgeOdds) {
        Map<String, Object> response = new HashMap<>();

        // Input validation
        if (currentBet <= 0 || currentOdds <= 0 || hedgeOdds <= 0) {
            response.put("error", "Invalid input values. All inputs must be positive.");
            return response;
        }

        // Core hedging logic
        double hedgeAmount = (currentBet * currentOdds) / hedgeOdds;
        double totalStake = currentBet + hedgeAmount;
        double profit = hedgeAmount * hedgeOdds - totalStake;

        // Round the values to 2 decimal places
        response.put("currentBet", currentBet);
        response.put("currentOdds", currentOdds);
        response.put("hedgeOdds", hedgeOdds);
        response.put("hedgeAmount", Math.round(hedgeAmount * 100.0) / 100.0);
        response.put("totalStake", Math.round(totalStake * 100.0) / 100.0);
        response.put("profit", Math.round(profit * 100.0) / 100.0);

        return response;
    }
}
