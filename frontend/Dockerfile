FROM ccr.ccs.tencentyun.com/pdabase/node14 as build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

FROM ccr.ccs.tencentyun.com/library/nginx

COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80