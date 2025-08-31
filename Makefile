.PHONY: help build dev backend start clean install test lint

# Default target
help:
	@echo "Available commands:"
	@echo "  make build     - Build the frontend for production"
	@echo "  make dev       - Start development server"
	@echo "  make backend   - Start backend server"
	@echo "  make start     - Start both frontend and backend"
	@echo "  make clean     - Clean build artifacts"
	@echo "  make install   - Install dependencies"
	@echo "  make test      - Run tests"
	@echo "  make lint      - Run linter"

# Build the project
build:
	@echo "🏗️  Building frontend for production..."
	npm run build
	@echo "✅ Build completed! Files are in the 'dist' directory."

# Start development server
dev:
	@echo "🚀 Starting development server..."
	npm run dev

# Start backend server
backend:
	@echo "🔧 Starting backend server..."
	npm run backend

# Start both frontend and backend
start:
	@echo "🚀 Starting VRS system (frontend + backend)..."
	npm run start

# Clean build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf dist/
	rm -rf node_modules/
	@echo "✅ Clean completed!"

# Install dependencies
install:
	@echo "📦 Installing dependencies..."
	npm install
	@echo "✅ Dependencies installed!"

# Run tests
test:
	@echo "🧪 Running tests..."
	npm test

# Run linter
lint:
	@echo "🔍 Running linter..."
	npm run lint
