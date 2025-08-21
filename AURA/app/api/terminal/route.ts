// TERMINAL API ROUTE - Command processing endpoint
// /Users/matthewsimon/Projects/AURA/AURA/app/api/terminal/route.ts

import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";

// Terminal command processing endpoint
export async function POST(req: NextRequest) {
  try {
    const { command, workingDirectory = "~" } = await req.json();

    // Basic command validation
    if (!command || typeof command !== "string") {
      return NextResponse.json({ error: "Invalid command" }, { status: 400 });
    }

    // Sanitize command - basic protection
    const sanitizedCommand = command.trim();

    // For now, we'll implement basic built-in commands
    // In a production environment, you'd want more sophisticated processing
    const result = await processCommand(sanitizedCommand, workingDirectory);

    return NextResponse.json(result);
  } catch (error) {
    console.error("Terminal API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

async function processCommand(command: string, workingDirectory: string) {
  const startTime = Date.now();

  try {
    // Built-in commands that don't require system execution
    if (command === "clear") {
      return {
        output: "",
        exitCode: 0,
        duration: Date.now() - startTime,
        builtin: true,
      };
    }

    if (command === "help") {
      return {
        output: `AURA Terminal Commands:
  help     - Show this help message
  clear    - Clear terminal buffer
  pwd      - Show current directory
  ls       - List directory contents
  history  - Show command history
  whoami   - Show current user
  date     - Show current date/time
  echo <text> - Display text`,
        exitCode: 0,
        duration: Date.now() - startTime,
        builtin: true,
      };
    }

    if (command === "pwd") {
      return {
        output: workingDirectory,
        exitCode: 0,
        duration: Date.now() - startTime,
        builtin: true,
      };
    }

    if (command === "whoami") {
      return {
        output: "aura-user",
        exitCode: 0,
        duration: Date.now() - startTime,
        builtin: true,
      };
    }

    if (command === "date") {
      return {
        output: new Date().toString(),
        exitCode: 0,
        duration: Date.now() - startTime,
        builtin: true,
      };
    }

    if (command.startsWith("echo ")) {
      return {
        output: command.substring(5),
        exitCode: 0,
        duration: Date.now() - startTime,
        builtin: true,
      };
    }

    // For security, we'll simulate common commands rather than executing them
    // In a production environment, you'd implement proper sandboxing
    if (command === "ls" || command === "ls -la") {
      return {
        output: `total 8
drwxr-xr-x  3 user  staff   96 ${new Date().toLocaleDateString()} .
drwxr-xr-x  4 user  staff  128 ${new Date().toLocaleDateString()} ..
-rw-r--r--  1 user  staff 1024 ${new Date().toLocaleDateString()} README.md
-rw-r--r--  1 user  staff 2048 ${new Date().toLocaleDateString()} package.json
drwxr-xr-x  2 user  staff   64 ${new Date().toLocaleDateString()} src`,
        exitCode: 0,
        duration: Date.now() - startTime,
        builtin: true,
      };
    }

    // For unrecognized commands, return command not found
    return {
      output: `Command not found: ${command}`,
      exitCode: 127,
      duration: Date.now() - startTime,
      builtin: true,
    };
  } catch (error) {
    return {
      output: `Error executing command: ${error instanceof Error ? error.message : "Unknown error"}`,
      exitCode: 1,
      duration: Date.now() - startTime,
      builtin: true,
    };
  }
}

// For future enhancement - real command execution with proper sandboxing
async function executeCommand(
  command: string,
  workingDirectory: string,
): Promise<{
  output: string;
  exitCode: number;
  duration: number;
}> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const parts = command.split(" ");
    const cmd = parts[0];
    const args = parts.slice(1);

    // Resolve working directory
    const cwd =
      workingDirectory === "~"
        ? process.env.HOME || "/tmp"
        : path.resolve(workingDirectory);

    const child = spawn(cmd, args, {
      cwd,
      stdio: ["pipe", "pipe", "pipe"],
      shell: true,
    });

    let output = "";
    let errorOutput = "";

    child.stdout?.on("data", (data) => {
      output += data.toString();
    });

    child.stderr?.on("data", (data) => {
      errorOutput += data.toString();
    });

    child.on("close", (code) => {
      resolve({
        output: output + errorOutput,
        exitCode: code || 0,
        duration: Date.now() - startTime,
      });
    });

    child.on("error", (error) => {
      resolve({
        output: `Command failed: ${error.message}`,
        exitCode: 1,
        duration: Date.now() - startTime,
      });
    });

    // Timeout after 30 seconds
    setTimeout(() => {
      child.kill();
      resolve({
        output: "Command timed out",
        exitCode: 124,
        duration: Date.now() - startTime,
      });
    }, 30000);
  });
}
