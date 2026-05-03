FROM node:20-bookworm-slim

WORKDIR /app

# Ensure TLS trust store exists for MongoDB Atlas connections.
RUN apt-get update \
	&& apt-get install -y --no-install-recommends ca-certificates \
	&& rm -rf /var/lib/apt/lists/*

# Copy backend only
COPY backend/package*.json ./

RUN npm install

COPY backend/ .

EXPOSE 5000

CMD ["node", "src/server.js"]
