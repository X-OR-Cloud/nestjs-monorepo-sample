#!/bin/bash

echo "🔨 Building all microservices..."

# Build each app individually
echo "📦 Building IAM service..."
nest build iam

echo "📦 Building BPM service..."
nest build bpm

echo "📦 Building LGM service..."
nest build lgm

echo "📦 Building NSM service..."
nest build nsm

echo "✅ All services built successfully!"

# Show build results
echo "📊 Build Results:"
ls -la dist/apps/
