FROM node:20-alpine

WORKDIR /app

# Ensure Atlas TLS certificates are available in minimal alpine images.
RUN apk add --no-cache ca-certificates && update-ca-certificates

# Copy backend only
COPY backend/package*.json ./

RUN npm install

COPY backend/ .

EXPOSE 5000

CMD ["node", "src/server.js"]
