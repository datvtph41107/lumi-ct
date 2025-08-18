#!/bin/bash

# Script to fix @/ imports in TypeScript files

echo "Fixing @/ imports to relative paths..."

# Function to calculate relative path
calculate_relative_path() {
    local from_dir="$1"
    local to_path="$2"
    
    # Remove @/ prefix
    to_path="${to_path#@/}"
    
    # Count directory depth
    depth=$(echo "$from_dir" | tr -cd '/' | wc -c)
    
    # Build relative path
    relative=""
    for ((i=0; i<depth; i++)); do
        relative="../$relative"
    done
    
    echo "${relative}${to_path}"
}

# Find all TypeScript files with @/ imports
find src -name "*.ts" -type f | while read -r file; do
    echo "Processing: $file"
    
    # Get directory of the file (relative to src/)
    file_dir=$(dirname "$file" | sed 's|^src/||')
    
    # Process the file line by line
    while IFS= read -r line; do
        if [[ $line =~ import.*from[[:space:]]*[\'\"]\@\/ ]]; then
            # Extract the import path
            import_path=$(echo "$line" | sed -n "s/.*from[[:space:]]*['\"]@\/\([^'\"]*\)['\"].*/\1/p")
            
            if [ -n "$import_path" ]; then
                # Calculate relative path
                relative_path=$(calculate_relative_path "$file_dir" "@/$import_path")
                
                # Replace in the line
                new_line=$(echo "$line" | sed "s|@/$import_path|$relative_path|g")
                echo "$new_line"
            else
                echo "$line"
            fi
        else
            echo "$line"
        fi
    done < "$file" > "${file}.tmp" && mv "${file}.tmp" "$file"
done

echo "Import paths fixed!"