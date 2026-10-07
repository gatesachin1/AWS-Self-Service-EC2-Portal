aws_region   = "us-east-1"
project_name = "ecc-portal"
environment  = "dev"

# CORS — scoped to the local frontend dev server for now (backend-only deploy).
# Add your CloudFront domain here too once you deploy the frontend module,
# e.g. ["http://localhost:3001", "https://xxxxxxxxxx.cloudfront.net"]
allowed_origins = ["http://localhost:3001"]

lambda_memory_mb        = 256
lambda_timeout_seconds  = 30
log_retention_days      = 14

throttling_burst_limit = 100
throttling_rate_limit  = 50

# PriceClass_100 = US + Europe edge locations (cheapest, ~$1-2/month for low traffic)
cloudfront_price_class = "PriceClass_100"
