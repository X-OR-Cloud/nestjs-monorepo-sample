@echo off
echo 🔨 Building all microservices...

echo 📦 Building IAM service...
call nest build iam

echo 📦 Building BPM service...
call nest build bpm

echo 📦 Building LGM service...
call nest build lgm

echo 📦 Building NSM service...
call nest build nsm

echo ✅ All services built successfully!

echo 📊 Build Results:
dir dist\apps\
