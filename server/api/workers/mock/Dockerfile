FROM python:3.10-slim

WORKDIR /app
COPY . .
RUN pip3 install -r requirements.txt

CMD [ "celery", "-A", "mock", "worker", "-Q", "mock_queue", "--loglevel=INFO" ]