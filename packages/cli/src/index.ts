#!/usr/bin/env node
import { Command } from "commander";
import inquirer from "inquirer";
import chalk from "chalk";
import ora from "ora";
import fs from "fs";
import path from "path";
import os from "os";

const CONFIG_DIR = path.join(os.homedir(), ".signhify");
const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

interface Config {
  serverUrl: string;
  token?: string;
}

function loadConfig(): Config {
  if (!fs.existsSync(CONFIG_FILE)) {
    return { serverUrl: "http://localhost:4000" };
  }
  try {
    return JSON.parse(fs.readFileSync(CONFIG_FILE, "utf-8"));
  } catch {
    return { serverUrl: "http://localhost:4000" };
  }
}

function saveConfig(config: Config) {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2), "utf-8");
}

async function request(endpoint: string, options: RequestInit = {}) {
  const config = loadConfig();
  const url = `${config.serverUrl}/api${endpoint}`;

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  } as Record<string, string>;

  if (config.token) {
    headers["Authorization"] = `Bearer ${config.token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  if (!res.ok) {
    if (res.status === 401) {
      console.error(
        chalk.red("\nError: Unauthorized. Please run 'signhify login' first."),
      );
      process.exit(1);
    }
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData.error || `HTTP ${res.status}`);
  }

  return res.json();
}

const program = new Command();
program
  .name("signhify")
  .description("CLI orchestrator for Signhify AI")
  .version("1.0.0");

// Configure base URL
program
  .command("config")
  .description("Set the base URL for the Signhify server")
  .action(async () => {
    const config = loadConfig();
    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "serverUrl",
        message: "Enter Signhify server URL:",
        default: config.serverUrl,
      },
    ]);
    saveConfig({ ...config, serverUrl: answers.serverUrl });
    console.log(chalk.green("Server URL updated successfully."));
  });

// Login
program
  .command("login")
  .description("Login to get an auth token")
  .action(async () => {
    const config = loadConfig();
    const answers = await inquirer.prompt([
      {
        type: "input",
        name: "email",
        message: "Enter email:",
      },
      {
        type: "password",
        name: "password",
        message: "Enter password:",
        mask: "*",
      },
    ]);

    const spinner = ora("Authenticating...").start();
    try {
      const res = await fetch(`${config.serverUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: answers.email,
          password: answers.password,
        }),
      });

      if (!res.ok) {
        throw new Error("Invalid credentials");
      }

      const data = (await res.json()) as any;
      saveConfig({ ...config, token: data.token });
      spinner.succeed(chalk.green("Authenticated successfully. Token saved."));
    } catch (err: any) {
      spinner.fail(chalk.red(`Authentication failed: ${err.message}`));
    }
  });

// Ask agent
program
  .command("ask")
  .description("Issue a command/query to Signhify agents")
  .argument("<message>", "The prompt or instruction for the agents")
  .option("-t, --thread <threadId>", "Thread ID to continue conversation")
  .action(async (message, options) => {
    const config = loadConfig();
    if (!config.token) {
      console.error(chalk.red("Error: Please run 'signhify login' first."));
      process.exit(1);
    }

    const spinner = ora("Connecting to agent router...").start();

    try {
      const res = await fetch(`${config.serverUrl}/api/agents/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.token}`,
        },
        body: JSON.stringify({
          message,
          threadId: options.thread,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      spinner.stop();

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          try {
            const event = JSON.parse(line.slice(5).trim());
            if (event.type === "status") {
              console.log(chalk.cyan(`✦ ${event.message}`));
            } else if (event.type === "agent") {
              console.log(
                chalk.bold.yellow(
                  `\n[Agent: ${event.agentType.toUpperCase()}]`,
                ),
              );
            } else if (event.type === "token") {
              process.stdout.write(event.token);
            } else if (event.type === "error") {
              console.error(chalk.red(`\nError: ${event.error}`));
            }
          } catch {
            // ignore JSON parse errors
          }
        }
      }
      console.log("\n");
    } catch (err: any) {
      spinner.fail(chalk.red(`Error: ${err.message}`));
    }
  });

// Threads CRUD
const threads = program.command("threads").description("Manage threads");

threads
  .command("list")
  .description("List recent threads")
  .action(async () => {
    const spinner = ora("Fetching threads...").start();
    try {
      const list = (await request("/threads")) as any[];
      spinner.stop();
      if (list.length === 0) {
        console.log(chalk.yellow("No threads found."));
        return;
      }
      list.forEach((t) => {
        console.log(
          chalk.blue(`ID: ${t._id} | Title: ${t.title || "Untitled"}`),
        );
      });
    } catch (err: any) {
      spinner.fail(chalk.red(`Failed to fetch threads: ${err.message}`));
    }
  });

threads
  .command("create")
  .description("Create a new thread")
  .argument("<title>", "Thread title")
  .action(async (title) => {
    const spinner = ora("Creating thread...").start();
    try {
      const thread = (await request("/threads", {
        method: "POST",
        body: JSON.stringify({ title }),
      })) as any;
      spinner.succeed(chalk.green(`Thread created. ID: ${thread._id}`));
    } catch (err: any) {
      spinner.fail(chalk.red(`Failed to create thread: ${err.message}`));
    }
  });

// Memory Vault CRUD
const memory = program
  .command("memory")
  .description("Manage memory vault notes");

memory
  .command("list")
  .description("List memory notes")
  .action(async () => {
    const spinner = ora("Fetching memories...").start();
    try {
      const list = (await request("/notes")) as any[];
      spinner.stop();
      if (list.length === 0) {
        console.log(chalk.yellow("Memory vault is empty."));
        return;
      }
      list.forEach((m) => {
        console.log(
          chalk.magenta(
            `ID: ${m._id} | Key: ${m.title} | Tags: [${m.tags.join(", ")}]`,
          ),
        );
        console.log(
          chalk.gray(
            `  ${m.content.slice(0, 80)}${m.content.length > 80 ? "..." : ""}`,
          ),
        );
      });
    } catch (err: any) {
      spinner.fail(chalk.red(`Failed to fetch memories: ${err.message}`));
    }
  });

memory
  .command("add")
  .description("Add a note to the memory vault")
  .argument("<key>", "Title or key")
  .argument("<value>", "Content or value")
  .option("-t, --tags <tags>", "Comma-separated tags", "")
  .action(async (key, value, options) => {
    const spinner = ora("Saving to vault...").start();
    const tags = options.tags
      ? options.tags.split(",").map((t: string) => t.trim())
      : [];
    try {
      await request("/notes", {
        method: "POST",
        body: JSON.stringify({ title: key, content: value, tags }),
      });
      spinner.succeed(chalk.green("Saved to memory vault successfully."));
    } catch (err: any) {
      spinner.fail(chalk.red(`Failed to save memory: ${err.message}`));
    }
  });

memory
  .command("delete")
  .description("Delete a note from memory vault")
  .argument("<id>", "Memory ID")
  .action(async (id) => {
    const spinner = ora("Deleting memory...").start();
    try {
      await request(`/notes/${id}`, { method: "DELETE" });
      spinner.succeed(chalk.green("Memory deleted."));
    } catch (err: any) {
      spinner.fail(chalk.red(`Failed to delete memory: ${err.message}`));
    }
  });

// Scheduler CRUD
const schedule = program
  .command("schedule")
  .description("Manage scheduled tasks");

schedule
  .command("list")
  .description("List scheduled tasks")
  .action(async () => {
    const spinner = ora("Fetching schedules...").start();
    try {
      const list = (await request("/schedule")) as any[];
      spinner.stop();
      if (list.length === 0) {
        console.log(chalk.yellow("No scheduled tasks."));
        return;
      }
      list.forEach((s) => {
        console.log(
          chalk.cyan(
            `ID: ${s._id} | Name: ${s.name} | Cron: ${s.cronExpression} | Enabled: ${s.enabled}`,
          ),
        );
        console.log(chalk.gray(`  Prompt: ${s.prompt}`));
      });
    } catch (err: any) {
      spinner.fail(chalk.red(`Failed to fetch schedule: ${err.message}`));
    }
  });

schedule
  .command("add")
  .description("Schedule a new task run")
  .argument("<name>", "Task name")
  .argument("<cron>", "Cron expression (e.g. '0 9 * * *')")
  .argument("<prompt>", "Agent instructions")
  .action(async (name, cron, prompt) => {
    const spinner = ora("Scheduling task...").start();
    try {
      await request("/schedule", {
        method: "POST",
        body: JSON.stringify({ name, cronExpression: cron, prompt }),
      });
      spinner.succeed(chalk.green("Task scheduled successfully."));
    } catch (err: any) {
      spinner.fail(chalk.red(`Failed to schedule task: ${err.message}`));
    }
  });

schedule
  .command("delete")
  .description("Delete a scheduled task")
  .argument("<id>", "Task ID")
  .action(async (id) => {
    const spinner = ora("Unscheduling...").start();
    try {
      await request(`/schedule/${id}`, { method: "DELETE" });
      spinner.succeed(chalk.green("Task deleted."));
    } catch (err: any) {
      spinner.fail(chalk.red(`Failed to delete task: ${err.message}`));
    }
  });

schedule
  .command("status")
  .description("Show scheduler status (active jobs, running tasks)")
  .action(async () => {
    const spinner = ora("Fetching scheduler status...").start();
    try {
      const status = (await request("/schedule/status")) as any;
      spinner.stop();
      console.log(chalk.bold.cyan("\nScheduler Status"));
      console.log(chalk.white(`  Active jobs: ${status.activeJobs}`));
      console.log(chalk.white(`  Running tasks: ${status.runningTasks}`));
      if (status.jobIds?.length > 0) {
        console.log(chalk.gray(`  Job IDs: ${status.jobIds.join(", ")}`));
      }
    } catch (err: any) {
      spinner.fail(chalk.red(`Failed to fetch status: ${err.message}`));
    }
  });

schedule
  .command("toggle")
  .description("Enable or disable a scheduled task")
  .argument("<id>", "Task ID")
  .action(async (id) => {
    const spinner = ora("Toggling task...").start();
    try {
      await request(`/schedule/${id}/toggle`, { method: "PATCH" });
      spinner.succeed(chalk.green("Task toggled."));
    } catch (err: any) {
      spinner.fail(chalk.red(`Failed to toggle task: ${err.message}`));
    }
  });

// ─── Memory (semantic) ────────────────────────────────────────────

const memSemantic = program
  .command("recall")
  .description("Semantic memory search and context retrieval");

memSemantic
  .command("search")
  .description("Search memory by semantic similarity")
  .argument("<query>", "Search query")
  .option("-k, --top <n>", "Number of results", "5")
  .action(async (query, options) => {
    const spinner = ora("Searching memories...").start();
    try {
      const result = (await request(
        `/memory/search?q=${encodeURIComponent(query)}&topK=${options.top}`,
      )) as any;
      spinner.stop();
      if (!result.episodes?.length && !result.facts?.length) {
        console.log(chalk.yellow("No matching memories found."));
        return;
      }
      if (result.episodes?.length) {
        console.log(chalk.bold.cyan("\nEpisodes:"));
        result.episodes.forEach((e: any) => {
          console.log(chalk.white(`  [${e.score?.toFixed(2)}] ${e.summary}`));
        });
      }
      if (result.facts?.length) {
        console.log(chalk.bold.magenta("\nFacts:"));
        result.facts.forEach((f: any) => {
          console.log(
            chalk.white(`  [${f.score?.toFixed(2)}] ${f.key}: ${f.value}`),
          );
        });
      }
    } catch (err: any) {
      spinner.fail(chalk.red(`Search failed: ${err.message}`));
    }
  });

memSemantic
  .command("context")
  .description("Get relevant memory context for a query")
  .argument("<query>", "Query to get context for")
  .action(async (query) => {
    const spinner = ora("Building context...").start();
    try {
      const result = (await request(
        `/memory/context?q=${encodeURIComponent(query)}`,
      )) as any;
      spinner.stop();
      if (result.context) {
        console.log(chalk.bold.cyan("\nRelevant Context:"));
        console.log(chalk.white(result.context));
      } else {
        console.log(chalk.yellow("No relevant context found."));
      }
    } catch (err: any) {
      spinner.fail(chalk.red(`Context fetch failed: ${err.message}`));
    }
  });

memSemantic
  .command("stats")
  .description("Show memory statistics")
  .action(async () => {
    const spinner = ora("Fetching memory stats...").start();
    try {
      const stats = (await request("/memory/stats")) as any;
      spinner.stop();
      console.log(chalk.bold.cyan("\nMemory Statistics"));
      console.log(chalk.white(`  Episodes: ${stats.episodes}`));
      console.log(chalk.white(`  Facts: ${stats.facts}`));
      console.log(
        chalk.white(
          `  Profile: ${stats.profileExists ? "Exists" : "Not created"}`,
        ),
      );
    } catch (err: any) {
      spinner.fail(chalk.red(`Failed to fetch stats: ${err.message}`));
    }
  });

memSemantic
  .command("fact")
  .description("Manage memory facts")
  .argument("<action>", "Action: get, list, delete")
  .argument("[key]", "Fact key (for get/delete)")
  .action(async (action, key) => {
    const spinner = ora("Processing...").start();
    try {
      if (action === "list") {
        const facts = (await request("/memory/facts")) as any[];
        spinner.stop();
        if (!facts.length) {
          console.log(chalk.yellow("No facts stored."));
          return;
        }
        console.log(chalk.bold.magenta("\nFacts:"));
        facts.forEach((f: any) => {
          console.log(
            chalk.white(
              `  ${f.key}: ${f.value} (${f.confidence?.toFixed(2) ?? "?"})`,
            ),
          );
        });
      } else if (action === "get" && key) {
        const fact = (await request(
          `/memory/facts/${encodeURIComponent(key)}`,
        )) as any;
        spinner.stop();
        if (fact) {
          console.log(chalk.white(`  ${fact.key}: ${fact.value}`));
          console.log(
            chalk.gray(
              `  Confidence: ${fact.confidence?.toFixed(2)} | Source: ${fact.source}`,
            ),
          );
        } else {
          console.log(chalk.yellow(`Fact "${key}" not found.`));
        }
      } else if (action === "delete" && key) {
        await request(`/memory/facts/${encodeURIComponent(key)}`, {
          method: "DELETE",
        });
        spinner.succeed(chalk.green(`Fact "${key}" deleted.`));
      } else {
        spinner.fail(chalk.red("Usage: recall fact <get|list|delete> [key]"));
      }
    } catch (err: any) {
      spinner.fail(chalk.red(`Failed: ${err.message}`));
    }
  });

// ─── Profile ──────────────────────────────────────────────────────

program
  .command("profile")
  .description("View and manage your user profile")
  .action(async () => {
    const spinner = ora("Fetching profile...").start();
    try {
      const profile = (await request("/profile")) as any;
      spinner.stop();
      console.log(chalk.bold.cyan("\nUser Profile"));

      if (profile.preferences && Object.keys(profile.preferences).length > 0) {
        console.log(chalk.bold.white("\n  Preferences:"));
        for (const [k, v] of Object.entries(profile.preferences)) {
          console.log(chalk.white(`    ${k}: ${v}`));
        }
      }
      if (profile.currentProjects?.length) {
        console.log(chalk.bold.white("\n  Current Projects:"));
        profile.currentProjects.forEach((p: string) =>
          console.log(chalk.white(`    • ${p}`)),
        );
      }
      if (profile.recurringTasks?.length) {
        console.log(chalk.bold.white("\n  Recurring Tasks:"));
        profile.recurringTasks.forEach((t: string) =>
          console.log(chalk.white(`    • ${t}`)),
        );
      }
      if (profile.importantPeople?.length) {
        console.log(chalk.bold.white("\n  Important People:"));
        profile.importantPeople.forEach((p: string) =>
          console.log(chalk.white(`    • ${p}`)),
        );
      }
      if (profile.topicsOfInterest?.length) {
        console.log(chalk.bold.white("\n  Topics of Interest:"));
        console.log(chalk.gray(`    ${profile.topicsOfInterest.join(", ")}`));
      }
      if (profile.preferredAgents?.length) {
        console.log(chalk.bold.white("\n  Preferred Agents:"));
        console.log(chalk.gray(`    ${profile.preferredAgents.join(", ")}`));
      }
    } catch (err: any) {
      spinner.fail(chalk.red(`Failed to fetch profile: ${err.message}`));
    }
  });

// ─── Skills ───────────────────────────────────────────────────────

const skills = program.command("skills").description("Manage generated skills");

skills
  .command("list")
  .description("List all skills")
  .action(async () => {
    const spinner = ora("Fetching skills...").start();
    try {
      const list = (await request("/skills")) as any[];
      spinner.stop();
      if (!list.length) {
        console.log(chalk.yellow("No skills found."));
        return;
      }
      list.forEach((s: any) => {
        const status = s.approved
          ? chalk.green("approved")
          : chalk.yellow("pending");
        console.log(
          chalk.cyan(
            `ID: ${s._id} | Name: ${s.name} | Status: ${status} | Uses: ${s.executionCount ?? 0}`,
          ),
        );
        if (s.description) console.log(chalk.gray(`  ${s.description}`));
      });
    } catch (err: any) {
      spinner.fail(chalk.red(`Failed to fetch skills: ${err.message}`));
    }
  });

skills
  .command("approve")
  .description("Approve a skill for use")
  .argument("<id>", "Skill ID")
  .action(async (id) => {
    const spinner = ora("Approving skill...").start();
    try {
      await request(`/skills/${id}/approve`, { method: "POST" });
      spinner.succeed(chalk.green("Skill approved."));
    } catch (err: any) {
      spinner.fail(chalk.red(`Failed to approve skill: ${err.message}`));
    }
  });

skills
  .command("reject")
  .description("Reject a skill")
  .argument("<id>", "Skill ID")
  .action(async (id) => {
    const spinner = ora("Rejecting skill...").start();
    try {
      await request(`/skills/${id}/reject`, { method: "POST" });
      spinner.succeed(chalk.green("Skill rejected."));
    } catch (err: any) {
      spinner.fail(chalk.red(`Failed to reject skill: ${err.message}`));
    }
  });

// ─── Status ───────────────────────────────────────────────────────

program
  .command("status")
  .description("Show server health and feature status")
  .action(async () => {
    const config = loadConfig();
    const spinner = ora("Checking server status...").start();
    try {
      const res = await fetch(`${config.serverUrl}/api/health`);
      const data = (await res.json()) as any;
      spinner.stop();
      console.log(chalk.bold.cyan("\nServer Health"));
      console.log(
        chalk.white(
          `  Status: ${data.status === "ok" ? chalk.green("OK") : chalk.red(data.status)}`,
        ),
      );
      console.log(chalk.white(`  Version: ${data.version}`));
      console.log(chalk.white(`  Timestamp: ${data.timestamp}`));
      if (data.features?.length) {
        console.log(chalk.bold.white("\n  Features:"));
        data.features.forEach((f: string) =>
          console.log(chalk.gray(`    ✓ ${f}`)),
        );
      }
    } catch (err: any) {
      spinner.fail(chalk.red(`Server unreachable: ${err.message}`));
    }
  });

// ─── Interactive TUI ──────────────────────────────────────────────

program
  .command("tui")
  .description("Launch interactive terminal UI for chatting with agents")
  .action(async () => {
    const config = loadConfig();
    if (!config.token) {
      console.error(chalk.red("Error: Please run 'signhify login' first."));
      process.exit(1);
    }

    console.log(
      chalk.bold.cyan("\n  ╔══════════════════════════════════════╗"),
    );
    console.log(chalk.bold.cyan("  ║     Signhify AI — Interactive TUI    ║"));
    console.log(chalk.bold.cyan("  ╚══════════════════════════════════════╝"));
    console.log(chalk.gray("  Type your message and press Enter."));
    console.log(
      chalk.gray("  Commands: /quit  /memory  /profile  /status  /help\n"),
    );

    const sessionHistory: Array<{ role: string; content: string }> = [];
    let running = true;

    while (running) {
      try {
        const { input } = await inquirer.prompt([
          {
            type: "input",
            name: "input",
            message: chalk.green("you › "),
          },
        ]);

        const trimmed = input.trim();
        if (!trimmed) continue;

        // Handle commands
        if (trimmed === "/quit" || trimmed === "/exit") {
          running = false;
          console.log(chalk.gray("\n  Goodbye!\n"));
          break;
        }

        if (trimmed === "/help") {
          console.log(chalk.bold.white("\n  Commands:"));
          console.log(chalk.gray("    /quit      Exit the TUI"));
          console.log(chalk.gray("    /memory    Search your memory"));
          console.log(chalk.gray("    /profile   View your profile"));
          console.log(chalk.gray("    /status    Check server health"));
          console.log(chalk.gray("    /clear     Clear screen"));
          console.log(chalk.gray("    /history   Show conversation history\n"));
          continue;
        }

        if (trimmed === "/clear") {
          console.clear();
          continue;
        }

        if (trimmed === "/history") {
          if (sessionHistory.length === 0) {
            console.log(chalk.gray("  No conversation history yet.\n"));
          } else {
            console.log(chalk.bold.white("\n  Conversation History:"));
            sessionHistory.forEach((msg) => {
              const prefix =
                msg.role === "user" ? chalk.green("you") : chalk.cyan("ai");
              console.log(
                chalk.gray(
                  `  ${prefix} › ${msg.content.slice(0, 120)}${msg.content.length > 120 ? "..." : ""}`,
                ),
              );
            });
            console.log();
          }
          continue;
        }

        if (trimmed === "/memory") {
          const { query } = await inquirer.prompt([
            {
              type: "input",
              name: "query",
              message: chalk.magenta("search › "),
            },
          ]);
          if (query.trim()) {
            const spinner = ora("Searching memories...").start();
            try {
              const result = (await request(
                `/memory/search?q=${encodeURIComponent(query.trim())}&topK=3`,
              )) as any;
              spinner.stop();
              if (result.episodes?.length) {
                result.episodes.forEach((e: any) => {
                  console.log(
                    chalk.gray(`  [${e.score?.toFixed(2)}] ${e.summary}`),
                  );
                });
              } else {
                console.log(chalk.gray("  No matching memories."));
              }
            } catch (err: any) {
              spinner.fail(chalk.red(`Search failed: ${err.message}`));
            }
          }
          console.log();
          continue;
        }

        if (trimmed === "/profile") {
          const spinner = ora("Loading profile...").start();
          try {
            const profile = (await request("/profile")) as any;
            spinner.stop();
            if (
              profile.preferences &&
              Object.keys(profile.preferences).length > 0
            ) {
              console.log(chalk.bold.white("  Preferences:"));
              for (const [k, v] of Object.entries(profile.preferences)) {
                console.log(chalk.gray(`    ${k}: ${v}`));
              }
            }
            if (profile.currentProjects?.length) {
              console.log(
                chalk.bold.white(
                  "  Projects: " + profile.currentProjects.join(", "),
                ),
              );
            }
            console.log();
          } catch (err: any) {
            spinner.fail(chalk.red(`Profile fetch failed: ${err.message}`));
          }
          continue;
        }

        if (trimmed === "/status") {
          const spinner = ora("Checking server...").start();
          try {
            const res = await fetch(`${config.serverUrl}/api/health`);
            const data = (await res.json()) as any;
            spinner.stop();
            console.log(
              chalk.white(
                `  Server: ${data.status === "ok" ? chalk.green("OK") : chalk.red("DOWN")} | v${data.version}\n`,
              ),
            );
          } catch (err: any) {
            spinner.fail(chalk.red(`Server unreachable: ${err.message}`));
          }
          continue;
        }

        // Send chat message via SSE
        sessionHistory.push({ role: "user", content: trimmed });
        const spinner = ora().start();

        try {
          const res = await fetch(`${config.serverUrl}/api/agents/chat`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${config.token}`,
            },
            body: JSON.stringify({
              message: trimmed,
              threadId: undefined,
            }),
          });

          if (!res.ok) {
            throw new Error(`HTTP ${res.status}`);
          }

          spinner.stop();
          process.stdout.write(chalk.cyan("ai  › "));

          const reader = res.body!.getReader();
          const decoder = new TextDecoder();
          let buffer = "";
          let fullResponse = "";

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split("\n\n");
            buffer = lines.pop() ?? "";

            for (const line of lines) {
              if (!line.startsWith("data:")) continue;
              try {
                const event = JSON.parse(line.slice(5).trim());
                if (event.type === "status") {
                  spinner.text = event.message;
                  spinner.start();
                } else if (event.type === "agent") {
                  spinner.stop();
                } else if (event.type === "token") {
                  spinner.stop();
                  process.stdout.write(event.token);
                  fullResponse += event.token;
                } else if (event.type === "error") {
                  spinner.fail(chalk.red(event.error));
                }
              } catch {
                // ignore
              }
            }
          }
          console.log("\n");
          sessionHistory.push({ role: "assistant", content: fullResponse });
        } catch (err: any) {
          spinner.fail(chalk.red(`Error: ${err.message}`));
          console.log();
        }
      } catch (err: any) {
        if (err.name === "ExitPromptError") {
          running = false;
          console.log(chalk.gray("\n  Goodbye!\n"));
        } else {
          console.error(chalk.red(`Error: ${err.message}`));
        }
      }
    }
  });

program.parse(process.argv);
