FROM node:8-alpine
WORKDIR /app
COPY . .
RUN npm install
ENV PORT 5500
EXPOSE 5500
CMD [ "npm", "start" ]