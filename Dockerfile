# Build stage
FROM node:21-alpine3.18 as build
WORKDIR /usr/src/app
COPY package*.json .
RUN npm install
COPY . .
RUN npm run build

# Development stage
FROM node:21-alpine3.18 as development
WORKDIR /usr/src/app
ARG NODE_ENV=development
ENV NODE_ENV=${NODE_ENV}
COPY --from=build /usr/src/app /usr/src/app
CMD ["npm", "run", "dev"]

# Production stage
FROM node:21-alpine3.18 as production
WORKDIR /usr/src/app
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
COPY package*.json .
RUN npm install --omit=dev
COPY --from=development /usr/src/app/dist ./dist
CMD ["npm", "run", "prod"]
