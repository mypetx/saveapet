#!/bin/bash

echo "🚀 SaveAPet - Deploy Script"
echo "============================"
echo ""

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
    echo "❌ Fly CLI not found. Installing..."
    curl -L https://fly.io/install.sh | sh
    echo "✅ Fly CLI installed. Please restart your terminal and run this script again."
    exit 1
fi

# Check if logged in
if ! flyctl auth whoami &> /dev/null; then
    echo "🔐 Please login to Fly.io..."
    flyctl auth login
fi

echo ""
echo "📦 Step 1: Launching app on Fly.io..."
echo "--------------------------------------"
flyctl launch --no-deploy

echo ""
echo "🗄️  Step 2: Creating PostgreSQL database..."
echo "--------------------------------------------"
read -p "Enter database name (default: saveapet-db): " db_name
db_name=${db_name:-saveapet-db}
flyctl postgres create --name $db_name --region gru

echo ""
echo "🔗 Step 3: Attaching database to app..."
echo "----------------------------------------"
flyctl postgres attach $db_name

echo ""
echo "🔑 Step 4: Setting secrets..."
echo "------------------------------"
SECRET_KEY=$(mix phx.gen.secret)
JWT_SECRET=$(mix phx.gen.secret)

flyctl secrets set SECRET_KEY_BASE="$SECRET_KEY"
flyctl secrets set JWT_SECRET="$JWT_SECRET"

echo ""
echo "🚀 Step 5: Deploying application..."
echo "------------------------------------"
flyctl deploy

echo ""
echo "📊 Step 6: Running database migrations..."
echo "------------------------------------------"
flyctl ssh console -C "/app/bin/perdi_meu_pet eval 'PerdiMeuPet.Release.migrate()'"

echo ""
echo "✅ Deploy completed successfully!"
echo ""
echo "🌐 Opening your application..."
flyctl open

echo ""
echo "📝 Useful commands:"
echo "  - View logs: flyctl logs"
echo "  - SSH console: flyctl ssh console"
echo "  - Run migrations: flyctl ssh console -C \"/app/bin/perdi_meu_pet eval 'PerdiMeuPet.Release.migrate()'\""
echo ""
