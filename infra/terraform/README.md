# infra/terraform/ — Cloud (AWS, Terraform)

Infrastructure as code for Astro Karma on AWS, region **`ap-south-1` (Mumbai)**. See
[../../docs/SPEC.md](../../docs/SPEC.md) §2 and §10–§11 for the architecture and cost.

> Status: **not scaffolded yet** (Phase 4). This README defines the intended structure.

## What it provisions
| Component | AWS service | Notes |
|---|---|---|
| Web hosting | **S3 + CloudFront** | static SPA/PWA, HTTPS, custom domain |
| API | **ECR + App Runner** | FastAPI container image |
| Database | **RDS PostgreSQL** (`db.t4g.micro`) | source of truth |
| Secrets | **SSM Parameter Store** | Claude key, Google OAuth secret, DB creds, JWT secret |
| Exports/backup | **S3** (bucket) | later: Word/JSON backups |
| Email (optional) | **SES** | later: emailed export |
| DNS/TLS | **Route 53 + ACM** | custom domain + certs |

## Intended structure
```
infra/terraform/
├── main.tf                 # providers, backend (remote state), region ap-south-1
├── variables.tf
├── outputs.tf
├── versions.tf
├── terraform.tfvars.example
└── modules/
    ├── web/                # S3 + CloudFront + Route53/ACM
    ├── api/                # ECR + App Runner + IAM
    ├── db/                 # RDS Postgres + subnet/security groups
    └── secrets/            # SSM parameters
```

## Conventions
- **Remote state** (S3 backend + DynamoDB lock) — configured in `main.tf`.
- **No secrets in the repo.** `*.tfvars` are gitignored; commit only `*.tfvars.example`.
- Single environment (personal app); add workspaces if a staging env is ever needed.

## Usage (once scaffolded)
```
terraform init
terraform plan  -var-file=terraform.tfvars
terraform apply -var-file=terraform.tfvars
```
