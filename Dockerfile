# Usa Node 20 estable y liviano
FROM node:20-alpine

# Para logs y diag
# ENV NODE_ENV=production

# Crea directorio de trabajo
WORKDIR /usr/src/app

# Copia solo manifiestos para instalación determinística
COPY package*.json ./

# Instala dependencias (solo prod)
RUN npm ci --omit=dev --legacy-peer-deps

# Copia el resto del código
COPY . .

# Expone el puerto interno del contenedor
EXPOSE 3000

# Comando de arranque (tu index.js escucha process.env.PORT || 3000)
CMD ["node", "src/index.js"]
