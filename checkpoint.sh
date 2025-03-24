#!/bin/bash

# Script to commit and push changes to GitHub
# Usage: ./checkpoint.sh "Your commit message here"

# Check if a commit message was provided
if [ $# -eq 0 ]; then
    echo "Error: Please provide a commit message."
    echo "Usage: ./checkpoint.sh \"Your commit message here\""
    exit 1
fi

# Store the commit message
COMMIT_MESSAGE="$1"

# Get current date and time for the checkpoint reference
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")
FULL_MESSAGE="CHECKPOINT [$TIMESTAMP]: $COMMIT_MESSAGE"

# Add all changes
echo "Adding all changes to git..."
git add .

# Commit with the provided message
echo "Committing changes with message: $FULL_MESSAGE"
git commit -m "$FULL_MESSAGE"

# Push to GitHub
echo "Pushing changes to GitHub..."
git push origin $(git rev-parse --abbrev-ref HEAD)

echo "Checkpoint complete! Your changes have been committed and pushed to GitHub."
echo "Commit message: $FULL_MESSAGE"
