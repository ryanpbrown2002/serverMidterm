FROM node:lts

WORKDIR /app

COPY package*.json ./
RUN npm install

# Copy everything (including public folder and views)
COPY . .

EXPOSE 3000

CMD ["node", "server.js"]
