# Usamos una versión ligera de Node.js
FROM node:20-alpine

# Creamos la carpeta de la app dentro de Docker
WORKDIR /usr/src/app

# Copiamos los archivos de configuración
COPY package*.json ./

# Instalamos las dependencias (Express)
RUN npm install

# Copiamos todo nuestro código (incluyendo la carpeta public y server.js)
COPY . .

# Exponemos el puerto que definiste en server.js
EXPOSE 3000

# Comando para arrancar tu web
CMD ["node", "server.js"]