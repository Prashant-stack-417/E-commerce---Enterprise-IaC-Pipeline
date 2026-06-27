# Stage 1: Build dependencies
FROM python:3.11-slim as builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir --user -r requirements.txt

# Stage 2: Final minimal security hardening runtime
FROM python:3.11-slim as runner

WORKDIR /app

# Run as non-privileged service account to mitigate container escape risks
RUN groupadd -g 10001 appgroup && \
    useradd -u 10001 -g appgroup -s /bin/bash appuser

# Copy installed site-packages from builder
COPY --from=builder /root/.local /home/appuser/.local
ENV PATH=/home/appuser/.local/bin:$PATH

# Copy app source with appropriate ownership
COPY --chown=appuser:appgroup app /app/app
COPY --chown=appuser:appgroup requirements.txt /app/requirements.txt

USER appuser

EXPOSE 8080

ENV PYTHONUNBUFFERED=1
ENV PORT=8080

CMD ["uvicorn", "app.backend.main:app", "--host", "0.0.0.0", "--port", "8080"]
