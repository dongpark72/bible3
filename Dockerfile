FROM node:18-alpine

WORKDIR /app

# Copy package files from server directory
COPY server/package*.json ./server/

# Install dependencies
RUN cd server && npm install

# Copy the rest of the application
COPY . .

EXPOSE 3000

# Start the server
CMD ["node", "server/index.js"]
