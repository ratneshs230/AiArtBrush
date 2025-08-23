# Chrome MCP Configuration for Claude Code Projects

This guide helps you configure Chrome MCP (Model Context Protocol) server for individual Claude Code projects, allowing Claude Code to control your Chrome browser in any project environment.

## Overview

The Chrome MCP server enables Claude Code to:
- Navigate web pages
- Take screenshots
- Fill forms and interact with elements
- Execute JavaScript
- Manage browser tabs and windows
- Access browser history and bookmarks

## Prerequisites

- Chrome MCP server installed at `/home/ratnesh/mcp-chrome`
- Node.js runtime available
- Chrome browser installed

## Quick Setup

### Method 1: Using the Setup Script (Recommended)

1. Navigate to your project directory:
   ```bash
   cd /path/to/your/project
   ```

2. Run the setup script:
   ```bash
   ~/setup-chrome-mcp.sh
   ```

3. Restart Claude Code in your project directory

### Method 2: Manual Setup

1. Copy the template configuration:
   ```bash
   cp ~/.mcp-template.json /path/to/your/project/.mcp.json
   ```

2. Verify the configuration is valid:
   ```bash
   python3 -m json.tool .mcp.json
   ```

3. Restart Claude Code in your project directory

## Configuration Details

The `.mcp.json` file contains:

```json
{
  "mcpServers": {
    "chrome": {
      "command": "node",
      "args": [
        "/home/ratnesh/mcp-chrome/app/native-server/dist/mcp/mcp-server-stdio.js"
      ],
      "env": {}
    }
  }
}
```

### Configuration Scopes

- **Global**: `~/.claude.json` - Available in all projects
- **Project**: `.mcp.json` - Only available in current project
- **Local**: Project-specific with additional restrictions

## Usage Examples

Once configured, Claude Code can use Chrome MCP tools:

```bash
# In Claude Code
"Open localhost:3000 in browser"
"Take a screenshot of the current page"
"Fill the form with test data"
"Navigate to the dashboard and click login"
```

## Verification

### Check Configuration
```bash
~/setup-chrome-mcp.sh verify
```

### Test Chrome MCP Connection
In Claude Code, ask:
```
"Can you open a browser tab?"
```

If configured correctly, Claude Code will open a new Chrome tab.

## Troubleshooting

### Common Issues

1. **"Chrome MCP server not found"**
   - Verify installation: `ls -la ~/mcp-chrome`
   - Check if server is built: `ls -la ~/mcp-chrome/app/native-server/dist/mcp/`

2. **"Invalid JSON in .mcp.json"**
   - Validate JSON: `python3 -m json.tool .mcp.json`
   - Copy fresh template: `cp ~/.mcp-template.json .mcp.json`

3. **"Claude Code not recognizing MCP server"**
   - Ensure `.mcp.json` is in project root
   - Restart Claude Code in the project directory
   - Check file permissions: `ls -la .mcp.json`

4. **"Node.js not found"**
   - Install Node.js: `sudo apt install nodejs npm`
   - Verify installation: `node --version`

### Debug Mode

To debug Chrome MCP issues:

1. Check Claude Code logs for MCP server connection errors
2. Test server directly:
   ```bash
   cd ~/mcp-chrome/app/native-server
   node dist/mcp/mcp-server-stdio.js
   ```

### Browser Profile Issues

If Chrome opens with wrong profile:
- Close all Chrome instances before starting Claude Code
- Or modify the server configuration to specify a profile

## Multiple Projects

This setup allows each project to have its own Chrome MCP configuration:

```bash
# Project A
cd /path/to/project-a
~/setup-chrome-mcp.sh

# Project B  
cd /path/to/project-b
~/setup-chrome-mcp.sh
```

Each project will have independent Chrome MCP access when running Claude Code in that directory.

## Advanced Configuration

### Custom Environment Variables

Modify `.mcp.json` to add environment variables:

```json
{
  "mcpServers": {
    "chrome": {
      "command": "node",
      "args": [
        "/home/ratnesh/mcp-chrome/app/native-server/dist/mcp/mcp-server-stdio.js"
      ],
      "env": {
        "BROWSER_MCP_PORT": "3000",
        "BROWSER_PROFILE": "Default"
      }
    }
  }
}
```

### Multiple Browser Configurations

Add multiple Chrome configurations:

```json
{
  "mcpServers": {
    "chrome-main": {
      "command": "node",
      "args": ["/home/ratnesh/mcp-chrome/app/native-server/dist/mcp/mcp-server-stdio.js"],
      "env": {"BROWSER_PROFILE": "Default"}
    },
    "chrome-work": {
      "command": "node", 
      "args": ["/home/ratnesh/mcp-chrome/app/native-server/dist/mcp/mcp-server-stdio.js"],
      "env": {"BROWSER_PROFILE": "Profile 1"}
    }
  }
}
```

## Files Created

- `~/.mcp-template.json` - Template configuration file
- `~/setup-chrome-mcp.sh` - Setup script
- `.mcp.json` - Project-specific configuration (created in each project)

## Support

For issues related to:
- Chrome MCP server: Check [mcp-chrome repository](https://github.com/your-repo/mcp-chrome)
- Claude Code: Check official Claude Code documentation
- This setup: Verify all files exist and have correct permissions