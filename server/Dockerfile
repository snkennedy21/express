FROM node:21

WORKDIR /usr/src/server

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

EXPOSE 3000

CMD ["npm", "run", "devStart"]