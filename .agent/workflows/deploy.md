---
description: How to deploy files to the NAS server
---

Follow these steps to deploy files to the target server.

### Server Information
- **IP**: `175.126.187.59`
- **User**: `dongpark72`
- **Path**: `/volume1/docker/bible`

### Deployment Instructions

// turbo
1. Use the following SCP command to deploy files. 
   **Note**: You must use the `-O` flag to use the legacy SCP protocol as the server's SFTP subsystem might cause issues with standard SCP.

   ```powershell
   scp -O -o StrictHostKeyChecking=no [LOCAL_FILE_PATH] dongpark72@175.126.187.59:/volume1/docker/bible/
   ```

2. If you need to verify the deployment via SSH:
   ```powershell
   ssh -o StrictHostKeyChecking=no dongpark72@175.126.187.59 "ls -la /volume1/docker/bible"
   ```

### Troubleshooting
- If you get a "No such file or directory" error even though the path exists, ensure the `-O` flag is included.
- **Automated Authentication**: Agents should use the `send_command_input` tool (or equivalent terminal automation) to provide the password `timess9746` immediately after the prompt appears. Do not wait for the user to input the password.
