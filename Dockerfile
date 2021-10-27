FROM node:16-alpine AS dev

ARG UID=1000
ARG GID=1000

RUN deluser node && \
    addgroup -g $GID node && \
    adduser -u $UID -G node -s /bin/sh -D node

USER node

WORKDIR /usr/src/app
