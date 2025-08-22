#!/bin/bash

# =========================================================================
# MyKeyManager All-in-One Quick Start
# Fast deployment using Docker Hub images
# =========================================================================

set -e

echo "🚀 MyKeyManager All-in-One Quick Start"
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
print_status "Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

if ! docker info &> /dev/null; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

print_success "Docker is ready"

# Check if Docker Compose is available
print_status "Checking Docker Compose..."
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    print_error "Docker Compose is not available. Please install Docker Compose."
    exit 1
fi

# Use docker-compose or docker compose based on availability
DOCKER_COMPOSE_CMD="docker-compose"
if ! command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker compose"
fi

print_success "Docker Compose is ready"

# Check for port conflicts
print_status "Checking for port conflicts..."

check_port() {
    local port=$1
    local service=$2
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Port $port is already in use (needed for $service)"
        return 1
    fi
    return 0
}

PORTS_OK=true
check_port 3000 "Frontend" || PORTS_OK=false
check_port 8000 "Backend API" || PORTS_OK=false
check_port 5432 "PostgreSQL" || PORTS_OK=false
check_port 6379 "Redis" || PORTS_OK=false

if [ "$PORTS_OK" = false ]; then
    print_warning "Some ports are in use. You can either:"
    print_warning "1. Stop services using those ports"
    print_warning "2. Copy .env.all-in-one.example to .env and change ports"
    echo
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Exiting. Fix port conflicts and try again."
        exit 1
    fi
fi

# Download configuration files if not present
print_status "Setting up configuration files..."

if [ ! -f "docker-compose.hub-all-in-one.yml" ]; then
    print_status "Downloading docker-compose configuration..."
    curl -sL https://raw.githubusercontent.com/Acwildweb/MyKeyManager/main/docker-compose.hub-all-in-one.yml -o docker-compose.hub-all-in-one.yml
    print_success "Downloaded docker-compose.hub-all-in-one.yml"
fi

if [ ! -f ".env.all-in-one.example" ]; then
    print_status "Downloading environment example..."
    curl -sL https://raw.githubusercontent.com/Acwildweb/MyKeyManager/main/.env.all-in-one.example -o .env.all-in-one.example
    print_success "Downloaded .env.all-in-one.example"
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    print_status "Creating default .env file..."
    cp .env.all-in-one.example .env
    print_success "Created .env file (customize as needed)"
fi

# Pull latest images
print_status "Pulling latest Docker images..."
$DOCKER_COMPOSE_CMD -f docker-compose.hub-all-in-one.yml pull

# Start services
print_status "Starting MyKeyManager services..."
$DOCKER_COMPOSE_CMD -f docker-compose.hub-all-in-one.yml up -d

# Wait for services to be ready
print_status "Waiting for services to start..."
sleep 10

# Check service health
print_status "Checking service health..."

FRONTEND_PORT=$(grep "^FRONTEND_PORT=" .env 2>/dev/null | cut -d'=' -f2 || echo "3000")
BACKEND_PORT=$(grep "^BACKEND_PORT=" .env 2>/dev/null | cut -d'=' -f2 || echo "8000")

# Wait for backend to be ready
for i in {1..30}; do
    if curl -f http://localhost:$BACKEND_PORT/api/health >/dev/null 2>&1; then
        print_success "Backend API is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        print_warning "Backend API is taking longer than expected to start"
    fi
    sleep 2
done

# Wait for frontend to be ready
for i in {1..30}; do
    if curl -f http://localhost:$FRONTEND_PORT/health >/dev/null 2>&1; then
        print_success "Frontend is ready"
        break
    fi
    if [ $i -eq 30 ]; then
        print_warning "Frontend is taking longer than expected to start"
    fi
    sleep 2
done

# Final status
echo
echo "🎉 MyKeyManager All-in-One is ready!"
echo "======================================"
echo
echo "📱 Frontend:      http://localhost:$FRONTEND_PORT"
echo "🔧 Backend API:   http://localhost:$BACKEND_PORT"
echo "📊 API Docs:      http://localhost:$BACKEND_PORT/docs"
echo
echo "📋 Management Commands:"
echo "  • Stop:         $DOCKER_COMPOSE_CMD -f docker-compose.hub-all-in-one.yml down"
echo "  • Restart:      $DOCKER_COMPOSE_CMD -f docker-compose.hub-all-in-one.yml restart"
echo "  • Logs:         $DOCKER_COMPOSE_CMD -f docker-compose.hub-all-in-one.yml logs -f"
echo "  • Status:       $DOCKER_COMPOSE_CMD -f docker-compose.hub-all-in-one.yml ps"
echo
echo "📁 Data is persisted in Docker volumes:"
echo "  • Database:     mykeymanager_postgres_data"
echo "  • Redis:        mykeymanager_redis_data"
echo
print_success "Setup complete! Enjoy using MyKeyManager! 🎯"
