FROM python:3.10-slim

RUN apt-get update && apt-get install -y curl wget
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    g++ \
    make \
    libc6-dev \
    libffi-dev \
    libssl-dev \
    libbz2-dev \
    libreadline-dev \
    libsqlite3-dev \
    zlib1g-dev \
    libncursesw5-dev \
    libgdbm-dev \
    libnss3-dev \
    curl \
    ca-certificates \
    wget \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY . .

RUN pip3 install -r requirements.txt

CMD [ "celery", "-A", "aecif_worker", "worker", "-Q", "aecif_queue", "--loglevel=INFO" ]


