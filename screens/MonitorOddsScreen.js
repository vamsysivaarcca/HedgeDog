import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';

const MonitorOddsScreen = ({ route }) => {
  const { userId, selectedTeam, betAmount, eventId } = route.params;
  console.log('Received userId in MonitorOddsScreen:', userId);

  const [monitoredOdds, setMonitoredOdds] = useState([]);
  const [safetyStatus, setSafetyStatus] = useState({ percentage: 0, label: 'Loading...' });
  const [loading, setLoading] = useState(true);

  // Fetch monitored odds
  const fetchMonitoredOdds = async () => {
    try {
      console.log('Fetching monitored odds...');
      const response = await axios.get(
        `http://192.168.86.25:8080/api/odds/fetch-monitored-odds?userId=${userId}`
      );

      if (response.data.message) {
        Alert.alert('Info', response.data.message);
      } else {
        console.log('Fetched Monitored Odds:', response.data.odds);
        setMonitoredOdds(response.data.odds || []);
        calculateSafety(response.data.odds);
      }
    } catch (error) {
      console.error('Error fetching monitored odds:', error.message);
      Alert.alert('Error', 'Failed to fetch monitored odds.');
    }
  };

  

  // Calculate safety percentage
  const calculateSafety = async (odds) => {
    try {
      const teamOdds = odds?.find((o) => o.name === selectedTeam)?.price || 0;

      console.log('Sending odds to AI for safety prediction:', teamOdds);
      const response = await axios.post('http://192.168.86.25:5001/predict_safety', {
        odds: [teamOdds],
      });

      const safetyPercentage = response.data.predictions[0]?.safety || 0;
      console.log('Safety Response:', response.data);

      const label = getSafetyLabel(safetyPercentage);
      setSafetyStatus({ percentage: safetyPercentage, label });
    } catch (error) {
      console.error('Error calculating safety:', error.message);
      Alert.alert('Error', 'Failed to calculate safety status.');
    } finally {
      setLoading(false);
    }
  };

  // Determine safety label
  const getSafetyLabel = (percentage) => {
    if (percentage > 80) return 'Very Safe';
    if (percentage > 60) return 'Safe';
    if (percentage > 40) return 'At Risk';
    if (percentage > 20) return 'High Risk';
    return 'Very High Risk';
  };

  useEffect(() => {
    fetchMonitoredOdds();

    // Refresh odds every 25 seconds
    const interval = setInterval(fetchMonitoredOdds, 25000);
    return () => clearInterval(interval);
  }, []);

  const renderProgressBar = () => {
    const progressColor =
      safetyStatus.percentage > 80 ? '#28a745' : // Dark Green
      safetyStatus.percentage > 60 ? '#85e085' : // Light Green
      safetyStatus.percentage > 40 ? '#ffc107' : // Amber
      safetyStatus.percentage > 20 ? '#ff8566' : // Light Red
      '#dc3545'; // Dark Red

    return (
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            { width: `${safetyStatus.percentage}%`, backgroundColor: progressColor },
          ]}
        >
          <Text style={styles.progressText}>{`${safetyStatus.percentage.toFixed(2)}%`}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Monitoring Odds</Text>
      <Text style={styles.subtitle}>Bet: {selectedTeam} | Amount: ${betAmount}</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : (
        <>
          <Text style={styles.eventHeader}>
            Event Odds:
          </Text>
          {monitoredOdds.length > 0 ? (
            monitoredOdds.map((team, index) => (
              <View key={index} style={styles.oddsItem}>
                <Text style={styles.teamText}>
                  {team.name}: {team.price}
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noDataText}>No odds available.</Text>
          )}

          {renderProgressBar()}
          <Text style={styles.safetyLabel}>{safetyStatus.label}</Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f5f5f5' },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 18, textAlign: 'center', marginBottom: 20, color: '#555' },
  eventHeader: { fontSize: 20, fontWeight: '600', textAlign: 'center', marginBottom: 10 },
  oddsItem: {
    backgroundColor: '#e9ecef',
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
  },
  teamText: { fontSize: 16, color: '#333', textAlign: 'center' },
  progressBarContainer: {
    width: '100%',
    height: 30,
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    overflow: 'hidden',
    marginVertical: 20,
  },
  progressBar: { height: '100%', justifyContent: 'center', alignItems: 'center' },
  progressText: { color: '#fff', fontWeight: 'bold' },
  safetyLabel: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginTop: 10 },
  noDataText: { fontSize: 16, textAlign: 'center', color: 'gray' },
});

export default MonitorOddsScreen;