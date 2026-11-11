FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

# VITE_* vars are inlined at build time (.env is dockerignored)
ARG VITE_BACKEND_URL
ARG VITE_S3_IMAGE_URL
ARG VITE_RAZORPAY_KEY_ID
ENV VITE_BACKEND_URL=$VITE_BACKEND_URL \
    VITE_S3_IMAGE_URL=$VITE_S3_IMAGE_URL \
    VITE_RAZORPAY_KEY_ID=$VITE_RAZORPAY_KEY_ID

RUN npm run build

FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]