FROM node:20-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
      git ca-certificates curl python3 build-essential \
    && rm -rf /var/lib/apt/lists/*

# yt-dlp: pinned baseline; entrypoint runs `yt-dlp -U` to self-heal when
# YouTube rotates extractor internals (happens ~monthly). ffmpeg deliberately
# omitted — caption-only workload uses --skip-download.
ARG YTDLP_VERSION=2025.09.26
RUN curl -fsSL -o /usr/local/bin/yt-dlp \
      "https://github.com/yt-dlp/yt-dlp/releases/download/${YTDLP_VERSION}/yt-dlp" \
 && chmod +x /usr/local/bin/yt-dlp \
 && /usr/local/bin/yt-dlp --version

WORKDIR /app

ARG REPO_URL=https://github.com/rabbishimon613-lang/kiripedia.git
ARG REPO_BRANCH=main
ENV REPO_URL=${REPO_URL} REPO_BRANCH=${REPO_BRANCH}

COPY loop.mjs /loop.mjs
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 7860

CMD ["/entrypoint.sh"]
