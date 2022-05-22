# Set the base image to Ubuntu
FROM node:latest

# Instalando cosas necesarias del sistema
RUN apt-get -y update; 

RUN  apt-get -y install apt-utils; 

#Instalando ffmpeg
RUN apt-get install -y ffmpeg

#Instalando dependencias
WORKDIR /app

COPY package*.json ./

RUN ls

RUN npm install

COPY . ./

CMD ["npm", "start"]