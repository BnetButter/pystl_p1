FROM python:3.10-slim

WORKDIR /app

COPY . .
RUN apt-get update && apt-get install -y curl postgresql-client wget
RUN pip3 install -r requirements.txt

CMD [ "python3", "manage.py", "runserver", "0.0.0.0:8000" ]