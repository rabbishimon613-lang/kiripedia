FROM node:20-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
      git ca-certificates curl python3 build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ARG REPO_URL=https://github.com/projectmamad48/KiriPedia.git
ARG REPO_BRANCH=main
ENV REPO_URL=${REPO_URL} REPO_BRANCH=${REPO_BRANCH}

COPY loop.mjs /loop.mjs
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 7860

CMD ["/entrypoint.sh"]
