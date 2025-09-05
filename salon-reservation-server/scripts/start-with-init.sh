#!/bin/bash

# Hair Salon Reservation System - Interactive Startup Script
# This script provides an interactive database initialization option before starting the server

set -e  # Exit on any error

# Colors for better output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Script directory and project root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Function to print colored output
print_header() {
    echo -e "${PURPLE}================================${NC}"
    echo -e "${PURPLE} 🏪 Hair Salon Reservation API${NC}"
    echo -e "${PURPLE}================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

# Function to check if required files exist
check_requirements() {
    print_info "Checking requirements..."
    
    # Check if we're in the right directory
    if [[ ! -f "$PROJECT_ROOT/package.json" ]]; then
        print_error "package.json not found. Please run this script from the server directory."
        exit 1
    fi
    
    # Check if database initialization script exists
    if [[ ! -f "$SCRIPT_DIR/initDatabase.js" ]]; then
        print_error "Database initialization script not found at $SCRIPT_DIR/initDatabase.js"
        exit 1
    fi
    
    # Check if server file exists
    if [[ ! -f "$PROJECT_ROOT/bin/www" ]] && [[ ! -f "$PROJECT_ROOT/server.js" ]] && [[ ! -f "$PROJECT_ROOT/app.js" ]]; then
        print_error "Server entry point not found. Looking for bin/www, server.js, or app.js"
        exit 1
    fi
    
    print_success "All requirements satisfied"
}

# Function to get user input for database initialization
prompt_database_init() {
    echo ""
    echo -e "${BLUE}🔧 Database Initialization${NC}"
    echo "----------------------------------------"
    echo ""
    
    while true; do
        read -p "$(echo -e "${CYAN}Do you want to initialize the database? (Y/N): ${NC}")" choice
        
        case $choice in
            [Yy]* ) 
                echo ""
                print_info "Initializing database..."
                
                # Change to project root to ensure correct relative paths
                cd "$PROJECT_ROOT"
                
                if node scripts/initDatabase.js; then
                    print_success "Database initialized successfully!"
                else
                    print_error "Database initialization failed!"
                    echo ""
                    read -p "$(echo -e "${YELLOW}Continue anyway? (Y/N): ${NC}")" continue_choice
                    case $continue_choice in
                        [Yy]* ) 
                            print_warning "Continuing without database initialization..."
                            ;;
                        * ) 
                            print_info "Exiting..."
                            exit 1
                            ;;
                    esac
                fi
                break
                ;;
            [Nn]* )
                print_info "Skipping database initialization."
                break
                ;;
            * )
                print_warning "Please answer Y or N."
                ;;
        esac
    done
}

# Function to start the server
start_server() {
    echo ""
    echo -e "${BLUE}🚀 Starting API Server${NC}"
    echo "----------------------------------------"
    echo ""
    
    cd "$PROJECT_ROOT"
    
    # Determine the correct start command
    if [[ -f "bin/www" ]]; then
        START_CMD="node bin/www"
    elif [[ -f "server.js" ]]; then
        START_CMD="node server.js"
    else
        START_CMD="npm start"
    fi
    
    print_info "Starting server with command: $START_CMD"
    print_info "Server will be available at: http://localhost:${PORT:-4000}"
    echo ""
    print_success "Server is starting..."
    echo ""
    
    # Execute the start command
    exec $START_CMD
}

# Function to handle script interruption
cleanup() {
    echo ""
    print_warning "Script interrupted. Cleaning up..."
    exit 130
}

# Set up signal handlers
trap cleanup SIGINT SIGTERM

# Main execution flow
main() {
    print_header
    
    check_requirements
    
    prompt_database_init
    
    start_server
}

# Run main function
main "$@"