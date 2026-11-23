# Use a small official Node.js image
FROM node:20-alpine

# Set the working directory inside the container
WORKDIR /app

# Install production dependencies first (better layer caching)
COPY package*.json ./
RUN npm install --omit=dev

# Copy the rest of the app
COPY . .

# Cloud Run sends traffic to port 8080
ENV PORT=8080
EXPOSE 8080

CMD ["npm", "start"]
