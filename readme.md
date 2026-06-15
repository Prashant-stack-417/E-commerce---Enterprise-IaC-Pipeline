# E-Commerce Enterprise DevSecOps Pipeline — Setup Guide

## Prerequisites

* Ubuntu/Debian Linux
* Python 3.11+
* Docker & Docker Compose
* GitHub Account
* AWS Account (Free Tier Supported)
* Terraform v1.5+
* Kubernetes (Minikube/EKS)
* SonarQube Server
* Java 17+

---

## 1. Clone & Install Dependencies

```bash
git clone https://github.com/your-username/ecommerce-devsecops.git

cd ecommerce-devsecops

python3 -m venv .venv

source .venv/bin/activate

pip install -r requirements.txt
```

---

## 2. Configure Environment

```bash
cp .env.example .env

nano .env
```

Required Variables:

```env
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=

SONAR_TOKEN=
SONAR_HOST_URL=

DOCKER_USERNAME=
DOCKER_PASSWORD=
```

---

## 3. Start SonarQube

```bash
docker compose up -d sonarqube
```

Access:

```text
http://localhost:9000
```

Default Credentials:

```text
Username: admin
Password: admin
```

---

## 4. Terraform Infrastructure Validation

```bash
cd terraform

terraform init

terraform fmt

terraform validate

terraform plan
```

---

## 5. Run Security Scans Locally

### SonarQube (SAST)

```bash
sonar-scanner
```

---

### Dependency Scan

```bash
dependency-check.sh \
--project ecommerce-app \
--scan .
```

---

### Trivy Container Scan

```bash
trivy fs .
```

Docker Image Scan:

```bash
trivy image ecommerce-app:latest
```

---

### Checkov IaC Scan

```bash
checkov -d terraform/
```

---

## 6. Build Docker Image

```bash
docker build -t ecommerce-app:latest .
```

Verify:

```bash
docker images
```

Run Container:

```bash
docker run -d -p 8080:8080 ecommerce-app:latest
```

---

## 7. Kubernetes Deployment

Apply resources:

```bash
kubectl apply -f kubernetes/deployment.yaml

kubectl apply -f kubernetes/service.yaml

kubectl apply -f kubernetes/ingress.yaml
```

Check status:

```bash
kubectl get pods

kubectl get svc

kubectl get ingress
```

---

## 8. Run DAST Security Testing

Deploy application to test environment.

Run OWASP ZAP:

```bash
docker run -t \
owasp/zap2docker-stable \
zap-baseline.py \
-t http://application-url
```

Generated reports:

```text
reports/zap-report.html
reports/zap-report.json
```

---

## 9. GitHub Actions Pipeline

Pipeline automatically executes:

* Build Application
* Unit Tests
* SonarQube Scan
* Dependency Scan
* Trivy Scan
* Checkov Scan
* Docker Build
* Kubernetes Deployment
* OWASP ZAP Scan

Workflow Location:

```text
.github/workflows/devsecops.yml
```

---

## 10. Security Gate Logic

Pipeline automatically fails when:

* Critical SonarQube findings detected
* High severity CVEs discovered
* Insecure Terraform resources found
* Critical container vulnerabilities identified
* OWASP ZAP critical alerts generated

---

## 11. Deploy Infrastructure

```bash
cd terraform

terraform apply
```

Creates:

* VPC
* Security Groups
* EC2/EKS Cluster
* RDS Database
* S3 Bucket
* Load Balancer

---

## 12. Monitoring

Deploy Prometheus:

```bash
kubectl apply -f monitoring/prometheus.yaml
```

Deploy Grafana:

```bash
kubectl apply -f monitoring/grafana.yaml
```

Access:

```text
http://localhost:3000
```

---

## Project Structure

```text
ecommerce-devsecops/
├── app/
│   ├── frontend/
│   ├── backend/
│   ├── tests/
│   └── Dockerfile
│
├── terraform/
│   ├── main.tf
│   ├── variables.tf
│   ├── outputs.tf
│   ├── vpc.tf
│   ├── eks.tf
│   ├── rds.tf
│   └── s3.tf
│
├── kubernetes/
│   ├── deployment.yaml
│   ├── service.yaml
│   └── ingress.yaml
│
├── security/
│   ├── sonarqube/
│   ├── trivy/
│   ├── checkov/
│   └── zap/
│
├── reports/
│
├── monitoring/
│   ├── prometheus/
│   └── grafana/
│
├── .github/
│   └── workflows/
│       └── devsecops.yml
│
├── requirements.txt
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## Security Tools Used

| Tool             | Purpose                              |
| ---------------- | ------------------------------------ |
| SonarQube        | Static Application Security Testing  |
| Dependency Check | Software Composition Analysis        |
| Trivy            | Container & Dependency Scanning      |
| Checkov          | Infrastructure as Code Security      |
| OWASP ZAP        | Dynamic Application Security Testing |
| GitHub Actions   | CI/CD Automation                     |

---

## Security Workflow

```text
Developer Push
      │
      ▼
GitHub Actions
      │
 ┌────┴─────┐
 │ Build    │
 │ Tests    │
 └────┬─────┘
      ▼
 SonarQube
      ▼
 Dependency Scan
      ▼
 Trivy Scan
      ▼
 Checkov Scan
      ▼
 Docker Build
      ▼
 Kubernetes Deploy
      ▼
 OWASP ZAP
      ▼
 Security Reports
```

# E-Commerce Enterprise DevSecOps Pipeline
