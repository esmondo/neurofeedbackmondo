#!/bin/bash

# Fix MuseService imports
find src -type f -name "*.jsx" -exec sed -i '' 's/import { MuseService } from/import museService from/g' {} \;
find src -type f -name "*.jsx" -exec sed -i '' 's/MuseService\./museService\./g' {} \;

# Fix DatabaseService imports
find src -type f -name "*.jsx" -exec sed -i '' 's/import { DatabaseService } from/import databaseService from/g' {} \;
find src -type f -name "*.jsx" -exec sed -i '' 's/DatabaseService\./databaseService\./g' {} \;

echo "Import statements have been fixed" 