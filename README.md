HedgeDog Project Documentation
1. Introduction
HedgeDog is an innovative AI-powered sports betting assistant designed to revolutionize the way users approach risk and decision-making. The platform leverages real-time data, advanced hedging strategies, and predictive AI to empower users with informed choices, proving that luck can also be overturned if data is made use of the right way.
By combining sports analytics, real-time odds monitoring, and AI-driven insights, HedgeDog aims to create a future where technology levels the playing field for bettors.

2. Backend Progress
The backend is the core of HedgeDog, providing scalable APIs and implementing complex hedging logic.
Completed:
Tech Stack: Spring Boot with PostgreSQL as the database.
Core Features:
User registration, login, and session management.
API integration with external odds providers for real-time data.
Hedging logic for H2H, totals, and spread markets.
Dynamic odds monitoring with configurable intervals.
Safety percentage calculations using AI-driven insights.
Dockerized backend deployed on AWS EC2 with ECR.
Remaining:
Full integration of anomaly detection for odds discrepancies.
Enhanced security features for API access.
Scalability optimizations for high traffic during peak events.
Extended support for additional sports and bookmakers.

3. Frontend Progress
The frontend is built for seamless user interaction, designed with accessibility and real-time updates in mind.
Completed:
Tech Stack: React Native with Expo for cross-platform compatibility (iOS and Android).
Core Features:
User-friendly odds selection and bet placement.
Adjustable odds and amount inputs for dynamic hedging.
Real-time updates from the backend.
Integration of a Safety Percentage Bar for intuitive risk analysis.
Multi-market support (H2H, totals, spreads).
Remaining:
Enhanced UI/UX design for a polished look and feel.
Support for push notifications to alert users of key events.
Offline mode for viewing previously fetched data.

4. AI Progress
The AI component is designed to provide predictive insights and anomaly detection.
Completed:
Tech Stack: Python with Flask for AI model integration.
Core Features:
Linear regression model for calculating safety percentages.
AI-driven analysis of initial vs. current odds for hedging suggestions.
Real-time updates integrated into the backend.
Remaining:
Advanced machine learning models for game-context prediction.
Training models with historical betting data for enhanced accuracy.
Development of anomaly detection for suspicious odds and glitches.

5. Cloud Progress
HedgeDog is designed for a scalable, reliable, and secure cloud-based infrastructure.
Completed:
Backend Hosting: Dockerized backend running on AWS EC2.
Frontend Hosting: Dockerized frontend integrated with backend.
Database: PostgreSQL hosted on EC2 with proper configuration.
DevOps: Docker Compose used for managing multi-service setups.
Remaining:
Transition to ECS with Fargate for container orchestration.
Deployment of CI/CD pipelines using GitHub Actions.
Implementing cloud monitoring for performance and reliability.

6. Flow of the Application
Login and Region Selection:
Users log in and select their preferred region (e.g., US, EU).
Odds Selection:
Users select a sport, bookmaker, and market (H2H, totals, spreads).
Bet Details:
Users input initial odds, adjust amounts, and start monitoring.
Real-Time Odds Monitoring:
Backend fetches updated odds every 25 seconds.
Hedging Suggestions:
AI analyzes the odds and provides hedging recommendations.
Safety Insights:
Users see the safety percentage of their bets in real-time.



7. Future Enhancements
Stock Market Integration:
The principles of HedgeDog extend beyond sports. We aim to adapt its core logic to the stock market, allowing users to hedge their financial investments. Key enhancements include:
Dynamic Stock Hedging:
AI-powered hedging strategies for high-volatility stocks.
Portfolio Risk Analysis:
A “Safety Percentage Bar” for diversified portfolios.
Real-Time Market Monitoring:
Continuous updates on stock performance and risk mitigation.

