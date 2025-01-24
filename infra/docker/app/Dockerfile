
#####################
# Multi stage build #
#####################

ARG GITHUB_SHA=NO_COMMIT
ARG VERSION=NO_VERSION

########################################
# Build monitorenv backend with maven #
########################################
FROM gradle:8.4-jdk17 as buildBack

ARG GITHUB_SHA
ARG VERSION

WORKDIR /tmp/

COPY --chown=gradle:gradle backend/ /tmp/
COPY --chown=gradle:gradle backend/build.gradle.kts /tmp/BUILD_GRADLE_WITH_ENV_VARS
RUN chown -R gradle /tmp/*

USER gradle
RUN sed -e "s/COMMIT_TO_CHANGE/$GITHUB_SHA/g" \
  -e "s/VERSION_TO_CHANGE/${VERSION}/g" \
  BUILD_GRADLE_WITH_ENV_VARS > build.gradle.kts

RUN gradle assemble

###########################
# Build frontend with npm #
###########################
FROM node:20-alpine as buildFront

ENV DEBIAN_FRONTEND=noninteractive
ENV DISABLE_ESLINT_PLUGIN=true

ARG VERSION
ARG ENV_PROFILE
ENV REACT_APP_ENV=$ENV_PROFILE
RUN echo ${REACT_APP_ENV}

COPY frontend/ /tmp/frontend/
COPY infra/ /tmp/infra/
WORKDIR /tmp/frontend

# Files are expected to be in /tmp/frontend/dist/monitorenv-frontend
# TODO Remove `--legacy-peer-deps` option as soon as CRA is migrate to Vite.
RUN npm ci --legacy-peer-deps
RUN npm run build

######################
# Upload sourcemaps  #
######################
FROM getsentry/sentry-cli:latest as buildSourcemaps

ARG VERSION
ARG SENTRY_URL
ARG SENTRY_AUTH_TOKEN
ARG SENTRY_ORG
ARG SENTRY_PROJECT

RUN mkdir -p /tmp/frontend/build
COPY --from=buildFront /tmp/frontend/build /tmp/frontend/build
# Upload sourcemaps to sentry
RUN sentry-cli sourcemaps inject /tmp/frontend/build
RUN sentry-cli \
  --url ${SENTRY_URL} \
  --auth-token ${SENTRY_AUTH_TOKEN} \
  sourcemaps upload /tmp/frontend/build \
  --release ${VERSION} \
  --org ${SENTRY_ORG} \
  --project ${SENTRY_PROJECT}

######################
# Create final image #
######################
FROM azul/zulu-openjdk-alpine:17-jre

ARG VERSION
ENV VERSION=$VERSION

ARG ENV_PROFILE
ENV ENV_PROFILE=$ENV_PROFILE

ENV ENV_DB_URL=""

# Add bash
RUN apk add --no-cache bash

RUN adduser -D monitorenv
USER monitorenv

EXPOSE 8880
EXPOSE 5000
EXPOSE 5001
WORKDIR /home/monitorenv

ENV JAVA_TOOL_OPTIONS="-Dcom.sun.management.jmxremote.ssl=false \
  -Dcom.sun.management.jmxremote.authenticate=false \
  -Dcom.sun.management.jmxremote.port=5000 \
  -Dcom.sun.management.jmxremote.rmi.port=5001 \
  -Dcom.sun.management.jmxremote.registry.ssl=false \
  -Dcom.sun.management.jmxremote.host=0.0.0.0 \
  -Djava.rmi.server.hostname=0.0.0.0"

# Copy files for the back
COPY --from=buildBack /tmp/build/libs/monitorenv-${VERSION}.jar /home/monitorenv
COPY infra/configurations/backend /home/monitorenv/configurations/

USER monitorenv
# Copy files for the front
RUN mkdir /home/monitorenv/public
COPY --from=buildSourcemaps /tmp/frontend/build /home/monitorenv/public/
COPY --from=buildFront /tmp/infra/docker/app/env.sh /home/monitorenv/

# Add logs folder to be mounted as volume
RUN mkdir /home/monitorenv/logs

# Set up environement variable that define the root folder use for serving static files
# It must point to the front (React) files
ENV STATIC_FILES_PATH=/home/monitorenv/public

# Default profile is for local. Can be overiden at start : docker run -e "SPRING_PROFILES_ACTIVE=prod"
ENV SPRING_PROFILES_ACTIVE=${ENV_PROFILE}

RUN echo ${ENV_PROFILE}

USER root
RUN chown monitorenv /home/monitorenv/env.sh
RUN chmod +x /home/monitorenv/env.sh
USER monitorenv

ENTRYPOINT ["/home/monitorenv/env.sh"]

CMD exec java -Dspring.config.additional-location="/home/monitorenv/configurations/" -jar "monitorenv-${VERSION}.jar"
