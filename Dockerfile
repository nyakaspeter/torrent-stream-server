# syntax=docker/dockerfile:1

# Comments are provided throughout this file to help you get started.
# If you need more help, visit the Dockerfile reference guide at
# https://docs.docker.com/go/dockerfile-reference/

ARG NODE_VERSION=20.10.0
ARG PNPM_VERSION=8.14.0

################################################################################
# Use node image for base image for all stages.
FROM node:${NODE_VERSION}-slim as base

# Set working directory for all build stages.
WORKDIR /usr/src/app

# Install pnpm.
RUN --mount=type=cache,target=/root/.npm \
    npm install -g pnpm@${PNPM_VERSION}

################################################################################
# Create a stage for building the application.
FROM base as build

RUN npm i -g typescript@5

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=pnpm-lock.yaml,target=pnpm-lock.yaml \
    --mount=type=cache,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# Copy the rest of the source files into the image.
COPY . .
# Run the build script.
RUN pnpm run build

################################################################################
# Create a new stage to run the application with minimal runtime dependencies
# where the necessary files are copied from the build stage.
FROM base as final

# Use production node environment by default.
ENV NODE_ENV production
ENV KEEP_DOWNLOADED_FILES false
ENV DOWNLOAD_SPEED_LIMIT -1
ENV UPLOAD_SPEED_LIMIT -1
ENV TORRENT_STORAGE_DIR /data
ENV TORRENT_SEED_TIME 60000
ENV TORRENT_TIMEOUT 5000

VOLUME /data

RUN mkdir -p /data
RUN chown -R node /data

# Run the application as a non-root user.
USER node

# Copy package.json so that package manager commands can be used.
COPY package.json .

COPY --from=build /usr/src/app/node_modules ./node_modules
COPY --from=build /usr/src/app/dist ./dist

# Expose the port that the application listens on.
EXPOSE 8000

# Run the application.
CMD pnpm start
