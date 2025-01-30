import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, FlatList, Alert } from 'react-native';
import axios from 'axios';

const MonitorOddsScreen = ({ route }) => {
  const { userId, eventId, selectedTeam, betAmount } = route.params;

  const [loading, setLoading] = useState(true);
  const [oddsData, setOddsData] = useState(null);
  const [error, setError] = useState(null);
  const [safetyPercentage, setSafetyPercentage] = useState(0); // State for risk percentage

  // Poll the API every 25 seconds
  const fetchOddsWithHedge = async () => {
    try {
      const response = await axios.get(
        'http://192.168.86.49:8080/api/odds/fetch-monitored-odds-with-hedge',
        {
          params: { userId: userId, currentBet: betAmount },
        }
      );

      setOddsData(response.data);

      // Call the predict_safety API for risk percentage
      const safetyResponse = await axios.post(
        'http://192.168.86.49:5001/predict_safety',
        { odds: [response.data.latestOddsSelectedTeam] }
      );
      setSafetyPercentage(safetyResponse.data.predictions[0].safety);

      setError(null);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching odds or safety:', err.message);
      setError('Failed to fetch odds or safety. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOddsWithHedge(); // Initial call
    const interval = setInterval(fetchOddsWithHedge, 25000); // Poll every 25 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  const getSafetyColor = (percentage) => {
    if (percentage >= 90) return 'green';
    if (percentage >= 80) return 'lightgreen';
    if (percentage >= 65) return 'orange';
    return 'red';
  };

  const getSafetyStatus = (percentage) => {
    if (percentage >= 90) return 'Very Safe';
    if (percentage >= 80) return 'Safe';
    if (percentage >= 65) return 'Hanging In';
    return 'At Risk';
  };

  const renderOddsData = () => {
    if (!oddsData) return null;

    const {
      latestOddsSelectedTeam,
      latestOddsOppositeTeam,
      hedgingResult: { hedgeAmount, profit, hedgeTeam },
    } = oddsData;

    return (
      <View>
        <Text style={styles.header}>Live Odds</Text>
        <Text style={styles.text}>
          Selected Team Odds: <Text style={styles.bold}>{latestOddsSelectedTeam}</Text>
        </Text>
        <Text style={styles.text}>
          Opposite Team Odds: <Text style={styles.bold}>{latestOddsOppositeTeam}</Text>
        </Text>

        <Text style={styles.header}>Hedging Suggestion</Text>
        <Text style={styles.text}>
          Hedge Team: <Text style={styles.bold}>{hedgeTeam}</Text>
        </Text>
        <Text style={styles.text}>
          Hedge Amount: <Text style={styles.bold}>${hedgeAmount.toFixed(2)}</Text>
        </Text>
        <Text style={styles.text}>
          Profit: <Text style={[styles.bold, profit >= 0 ? styles.profit : styles.loss]}>
            ${profit.toFixed(2)}
          </Text>
        </Text>

        {/* Risk Percentage Bar */}
        <Text style={styles.header}>Safety Percentage</Text>
        <View style={styles.progressBar}>
          <View
            style={{
              width: `${safetyPercentage}%`,
              backgroundColor: getSafetyColor(safetyPercentage),
              height: '100%',
              borderRadius: 10,
            }}
          />
        </View>
        <Text style={styles.safetyText}>
          {safetyPercentage.toFixed(2)}% - {getSafetyStatus(safetyPercentage)}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Monitor Odds</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : error ? (
        <Text style={styles.error}>{error}</Text>
      ) : (
        renderOddsData()
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  header: { fontSize: 20, fontWeight: 'bold', marginTop: 15 },
  text: { fontSize: 18, marginVertical: 5 },
  bold: { fontWeight: 'bold' },
  profit: { color: 'green' },
  loss: { color: 'red' },
  error: { color: 'red', textAlign: 'center', fontSize: 16 },
  progressBar: {
    height: 20,
    width: '100%',
    backgroundColor: '#e0e0e0',
    borderRadius: 10,
    marginVertical: 10,
  },
  safetyText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default MonitorOddsScreen;
