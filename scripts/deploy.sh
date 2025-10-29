#!/bin/bash

echo "SaveAPet - Deploy Script"

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
    echo "Fly CLI not found. Installing..."
    curl -L https://fly.io/install.sh | sh
    echo "Fly CLI installed. Please restart your terminal and run this script again."
    exit 1
fi

# Check if logged in
if ! flyctl auth whoami &> /dev/null; then
    echo "Please login to Fly.io..."
    flyctl auth login
fi

echo "Step 1: Launching app on Fly.io..."
# Skip PostgreSQL creation - we're using SQLite with persistent volume
flyctl launch --no-deploy --no-postgres

echo "Step 2: Creating persistent volume for SQLite..."
echotl volumes create saveapet_data --region gru --size 1

echo "Step 3: Setting secrets..."
SECRET_KEY=$(mix phx.gen.secret)
JWT_SECRET=$(mix phx.gen.secret)

flyctl secrets set SECRET_KEY_BASE="$SECRET_KEY"
flyctl secrets set JWT_SECRET="$JWT_SECRET"

echo "Step 4: Deploying application..."
flyctl deploy

echo "Step 5: Running database migrations..."
flyctl ssh console -C "/app/bin/perdi_meu_pet eval 'PerdiMeuPet.Release.migrate()'"

echo "Deploy completed successfully!"

echo "Opening your application..."
flyctl open

echo "Useful commands:"
echo "  - View logs: flyctl logs"
echo "  - SSH console: flyctl ssh console"
echo "  - Run migrations: flyctl ssh console -C \"/app/bin/perdi_meu_pet eval 'PerdiMeuPet.Release.migrate()'\""
