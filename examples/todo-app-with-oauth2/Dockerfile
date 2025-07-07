# Basis-Image mit Python
FROM python:3.11-slim

# Arbeitsverzeichnis im Container
WORKDIR /app

# Abhängigkeiten kopieren
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# App-Code kopieren
COPY . .

# Umgebungsvariablen-Datei (optional, besser via docker-compose oder Secrets setzen)
# COPY .env .env

# Port für Flask
EXPOSE 5000

# Startbefehl
CMD ["flask", "run", "--host=0.0.0.0", "--port=5000"]