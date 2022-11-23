FROM node:14.20-slim

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# Install python/pip
#RUN apk add --update --no-cache python3 && ln -sf python3 /usr/bin/python

RUN yarn install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 3977
CMD [ "node", "index.js" ]