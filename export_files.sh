#!/bin/bash

# Create export directory structure
mkdir -p DynamicSurveyExport/ClientApp DynamicSurveyExport/Server DynamicSurveyExport/DbScripts

# Copy Angular frontend files
echo "Copying Angular frontend files..."
cp -r ClientApp/* DynamicSurveyExport/ClientApp/ 2>/dev/null || true

# Copy server files
echo "Copying server files..."
cp -r server/* DynamicSurveyExport/Server/ 2>/dev/null || true
cp -r Server/* DynamicSurveyExport/Server/ 2>/dev/null || true
cp -r shared/* DynamicSurveyExport/Server/ 2>/dev/null || true

# Copy database scripts
echo "Copying database scripts..."
cp migrate.js migrate-direct.js test-server.js DynamicSurveyExport/DbScripts/ 2>/dev/null || true

# Create ZIP file
echo "Creating ZIP archive..."
cd DynamicSurveyExport && zip -r ../DynamicSurveySourceCode.zip * && cd ..

echo "Export completed successfully. Files are available in DynamicSurveySourceCode.zip"
