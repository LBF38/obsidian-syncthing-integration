FROM mcr.microsoft.com/devcontainers/typescript-node:1-22
# Install GNUPG2
RUN apt-get update \
    && apt-get install -y --no-install-recommends gnupg2 \
    && rm -rf /var/lib/apt/lists/*
