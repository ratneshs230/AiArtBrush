#!/bin/bash

# Chrome MCP Setup Script for Claude Code Projects
# This script sets up Chrome MCP server configuration in any project directory

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration paths
MCP_CHROME_PATH="/home/ratnesh/mcp-chrome"
TEMPLATE_PATH="/home/ratnesh/.mcp-template.json"
SERVER_SCRIPT_PATH="$MCP_CHROME_PATH/app/native-server/dist/mcp/mcp-server-stdio.js"

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

# Function to check if Chrome MCP is installed
check_chrome_mcp_installation() {
    print_status "Checking Chrome MCP installation..."
    
    if [[ ! -d "$MCP_CHROME_PATH" ]]; then
        print_error "Chrome MCP not found at $MCP_CHROME_PATH"
        exit 1
    fi
    
    if [[ ! -f "$SERVER_SCRIPT_PATH" ]]; then
        print_error "Chrome MCP server script not found at $SERVER_SCRIPT_PATH"
        print_status "Try building the server with: cd $MCP_CHROME_PATH && npm run build"
        exit 1
    fi
    
    print_success "Chrome MCP installation verified"
}

# Function to check if template exists
check_template() {
    print_status "Checking template file..."
    
    if [[ ! -f "$TEMPLATE_PATH" ]]; then
        print_error "Template file not found at $TEMPLATE_PATH"
        print_status "Creating template file..."
        
        cat > "$TEMPLATE_PATH" << EOF
{
  "mcpServers": {
    "chrome": {
      "command": "node",
      "args": [
        "$SERVER_SCRIPT_PATH"
      ],
      "env": {}
    }
  }
}
EOF
        print_success "Template file created at $TEMPLATE_PATH"
    else
        print_success "Template file found"
    fi
}

# Function to setup Chrome MCP in current directory
setup_project_mcp() {
    local current_dir=$(pwd)
    local project_name=$(basename "$current_dir")
    
    print_status "Setting up Chrome MCP for project: $project_name"
    print_status "Current directory: $current_dir"
    
    # Check if .mcp.json already exists
    if [[ -f ".mcp.json" ]]; then
        print_warning ".mcp.json already exists in this directory"
        read -p "Do you want to overwrite it? (y/N): " -r
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_status "Setup cancelled"
            exit 0
        fi
    fi
    
    # Copy template to current directory
    cp "$TEMPLATE_PATH" ".mcp.json"
    print_success "Copied Chrome MCP configuration to .mcp.json"
    
    # Make the configuration file readable
    chmod 644 ".mcp.json"
    
    print_success "Chrome MCP setup completed for project: $project_name"
    print_status "Configuration file: $current_dir/.mcp.json"
}

# Function to verify configuration
verify_configuration() {
    print_status "Verifying configuration..."
    
    if [[ ! -f ".mcp.json" ]]; then
        print_error "No .mcp.json file found in current directory"
        exit 1
    fi
    
    # Check if the JSON is valid
    if ! python3 -m json.tool .mcp.json > /dev/null 2>&1; then
        print_error "Invalid JSON in .mcp.json"
        exit 1
    fi
    
    print_success "Configuration is valid"
    print_status "To use Chrome MCP in Claude Code, restart Claude Code in this project directory"
}

# Function to show usage
show_usage() {
    echo "Chrome MCP Setup Script for Claude Code Projects"
    echo
    echo "Usage: $0 [COMMAND]"
    echo
    echo "Commands:"
    echo "  setup     Set up Chrome MCP in current project directory (default)"
    echo "  verify    Verify existing Chrome MCP configuration"
    echo "  help      Show this help message"
    echo
    echo "Examples:"
    echo "  $0                    # Setup Chrome MCP in current directory"
    echo "  $0 setup              # Same as above"
    echo "  $0 verify             # Verify existing configuration"
}

# Main script logic
main() {
    local command="${1:-setup}"
    
    case "$command" in
        setup)
            check_chrome_mcp_installation
            check_template
            setup_project_mcp
            verify_configuration
            ;;
        verify)
            verify_configuration
            ;;
        help|--help|-h)
            show_usage
            ;;
        *)
            print_error "Unknown command: $command"
            show_usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"