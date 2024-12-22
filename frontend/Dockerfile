# Use a Node.js base image
FROM node:20

# Set the working directory
WORKDIR /app

# Copy only package.json and package-lock.json first to use Docker's caching mechanism
COPY package.json package-lock.json ./

# Use npm ci for faster and more deterministic installs
RUN npm ci --prefer-offline --no-audit

# Copy the rest of the app's source code
COPY . .

# Expose the development port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
