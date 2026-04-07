import assert from "node:assert/strict";
import { execFile as execFileCallback } from "node:child_process";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFile = promisify(execFileCallback);
const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function parseScalar(rawValue) {
  const value = rawValue.trim();
  if (value.length === 0) {
    return "";
  }

  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  if (/^-?\d+$/.test(value)) {
    return Number(value);
  }

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

async function pathExists(targetPath) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function collectRelativeFiles(rootPath, basePath = rootPath) {
  const entries = await fs.readdir(rootPath, { withFileTypes: true });
  const files = [];

  for (const entry of [...entries].sort((left, right) => left.name.localeCompare(right.name))) {
    const absolutePath = path.join(rootPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collectRelativeFiles(absolutePath, basePath)));
      continue;
    }

    if (entry.isFile()) {
      files.push(path.relative(basePath, absolutePath).split(path.sep).join(path.posix.sep));
    }
  }

  return files;
}

async function createFakeGlobalSkillsbase(binRoot) {
  const localSkillsbasePath = path.resolve(repoRoot, "..", "skillsbase", "bin", "skillsbase.mjs");
  if (!(await pathExists(localSkillsbasePath))) {
    return null;
  }

  const binDir = path.join(binRoot, "bin");
  const scriptPath = path.join(binDir, "skillsbase");
  await fs.mkdir(binDir, { recursive: true });
  await fs.writeFile(
    scriptPath,
    `#!/usr/bin/env bash
exec node "${localSkillsbasePath}" "$@"
`,
    "utf8",
  );
  await fs.chmod(scriptPath, 0o755);
  return binDir;
}

async function loadManifest() {
  const manifestPath = path.join(repoRoot, "sources.yaml");
  const text = await fs.readFile(manifestPath, "utf8");
  const manifest = { sources: [] };
  const lines = text.split(/\r?\n/);
  let currentSource = null;
  let currentListKey = null;

  for (const [index, rawLine] of lines.entries()) {
    const line = rawLine.replace(/\s+$/, "");
    const lineNumber = index + 1;

    if (line.length === 0 || line.trimStart().startsWith("#")) {
      continue;
    }

    const topLevelMatch = /^([A-Za-z][A-Za-z0-9]*):\s*(.*)$/.exec(line);
    if (topLevelMatch && !line.startsWith(" ")) {
      const [, key, value] = topLevelMatch;
      if (key === "sources") {
        currentSource = null;
        currentListKey = null;
      } else {
        manifest[key] = parseScalar(value);
      }
      continue;
    }

    const sourceStartMatch = /^  - key:\s*(.+)$/.exec(line);
    if (sourceStartMatch) {
      currentSource = { key: parseScalar(sourceStartMatch[1]), include: [] };
      manifest.sources.push(currentSource);
      currentListKey = null;
      continue;
    }

    const sourcePropertyMatch = /^    ([A-Za-z][A-Za-z0-9]*):\s*(.*)$/.exec(line);
    if (sourcePropertyMatch && currentSource) {
      const [, key, value] = sourcePropertyMatch;
      if (value.length === 0) {
        currentSource[key] = [];
        currentListKey = key;
      } else {
        currentSource[key] = parseScalar(value);
        currentListKey = null;
      }
      continue;
    }

    const listItemMatch = /^      - (.+)$/.exec(line);
    if (listItemMatch && currentSource && currentListKey) {
      currentSource[currentListKey].push(parseScalar(listItemMatch[1]));
      continue;
    }

    throw new Error(`Unsupported sources.yaml syntax at line ${lineNumber}: ${rawLine}`);
  }

  return manifest;
}

test("template exposes the managed baseline and official entrypoints", async () => {
  const requiredPaths = [
    "package.json",
    "package-lock.json",
    "sources.yaml",
    "README.md",
    "docs/maintainer-workflow.md",
    "skills/README.md",
    "skills/hagi/SKILL.md",
    "skills/hagi/agents/openai.yaml",
    "skills/hagi/references/cli-usage.md",
    "skills/hagi/references/local-development.md",
    "skills/hagi/references/proposal-flow.md",
    "skills/hagi/references/validation.md",
    ".github/workflows/skills-sync.yml",
    ".github/workflows/skills-manage.yml",
    ".github/actions/skillsbase-sync/action.yml",
    ".github/actions/skillsbase-manage/action.yml",
  ];

  for (const relativePath of requiredPaths) {
    assert.equal(await pathExists(path.join(repoRoot, relativePath)), true, `missing ${relativePath}`);
  }

  const packageJson = JSON.parse(await fs.readFile(path.join(repoRoot, "package.json"), "utf8"));
  assert.equal(packageJson.scripts.sync, "skillsbase sync --repo .");
  assert.equal(packageJson.scripts["sync:check"], "skillsbase sync --check --repo .");
  assert.equal(packageJson.scripts.test, "node --test ./tests/*.test.mjs");

  const [readme, workflowDoc, workflow, manageWorkflow, action, manageAction] = await Promise.all([
    fs.readFile(path.join(repoRoot, "README.md"), "utf8"),
    fs.readFile(path.join(repoRoot, "docs/maintainer-workflow.md"), "utf8"),
    fs.readFile(path.join(repoRoot, ".github/workflows/skills-sync.yml"), "utf8"),
    fs.readFile(path.join(repoRoot, ".github/workflows/skills-manage.yml"), "utf8"),
    fs.readFile(path.join(repoRoot, ".github/actions/skillsbase-sync/action.yml"), "utf8"),
    fs.readFile(path.join(repoRoot, ".github/actions/skillsbase-manage", "action.yml"), "utf8"),
  ]);

  assert.match(readme, /npm install --global @hagicode\/skillsbase/);
  assert.match(readme, /npm run sync/);
  assert.match(readme, /npm run sync:check/);
  assert.match(readme, /npm test/);
  assert.match(readme, /skills-manage\.yml/);
  assert.match(readme, /does not commit, push, or open pull requests/i);
  assert.doesNotMatch(readme, /bin\/skillsbase\.mjs/);
  assert.match(workflowDoc, /GitHub Maintenance Path/);
  assert.match(workflowDoc, /Local CLI commands remain the primary maintainer path/);
  assert.match(workflowDoc, /does not commit, push, or open pull requests/i);
  assert.match(workflow, /uses: \.\/\.github\/actions\/skillsbase-sync/);
  assert.match(workflow, /run-tests: "true"/);
  assert.match(manageWorkflow, /workflow_dispatch:/);
  assert.match(manageWorkflow, /operation:/);
  assert.match(manageWorkflow, /uses: \.\/\.github\/actions\/skillsbase-manage/);
  assert.match(action, /npm install --global @hagicode\/skillsbase/);
  assert.match(action, /skillsbase sync --check --repo \./);
  assert.match(manageAction, /allow-missing-sources:/);
  assert.match(manageAction, /case "\$\{OPERATION\}" in/);
  assert.match(manageAction, /command=\(skillsbase "\$\{OPERATION\}"/);
});

test("default hagi skill matches the remote source declaration", async () => {
  const manifest = await loadManifest();
  assert.equal(manifest.managedBy, "skillsbase");
  assert.equal(manifest.remoteRepository, "HagiCode-org/skillsbase-template");
  assert.equal(manifest.sources.length, 1);

  const source = manifest.sources[0];
  assert.equal(source.key, "cli-github");
  assert.equal(source.label, "HagiCode CLI skills");
  assert.equal(source.kind, "github-repository");
  assert.equal(source.root, "HagiCode-org/cli");
  assert.deepEqual(source.include, ["hagi"]);

  const skillRoot = path.join(repoRoot, "skills", "hagi");
  const metadata = JSON.parse(await fs.readFile(path.join(skillRoot, ".skill-source.json"), "utf8"));
  const actualFiles = await collectRelativeFiles(skillRoot);

  assert.equal(metadata.sourceKey, source.key);
  assert.equal(metadata.sourceLabel, source.label);
  assert.equal(metadata.sourceKind, source.kind);
  assert.equal(metadata.sourceRoot, source.root);
  assert.equal(metadata.sourcePath, "HagiCode-org/cli@hagi");
  assert.equal(metadata.originalName, "hagi");
  assert.equal(metadata.targetName, "hagi");
  assert.equal(metadata.targetPath, "skills/hagi");
  assert.equal(metadata.installReference, "HagiCode-org/cli@hagi");
  assert.deepEqual(
    metadata.files,
    actualFiles.filter((filePath) => filePath !== ".skill-source.json"),
  );
});

test("repo-local drift check stays stable outside the template working directory", async () => {
  const tempRoot = await fs.mkdtemp(path.join(os.tmpdir(), "skillsbase-template-global-"));
  const fakeBin = await createFakeGlobalSkillsbase(tempRoot);
  const { stderr, stdout } = await execFile(
    "npm",
    ["--prefix", repoRoot, "run", "sync:check"],
    {
      cwd: os.tmpdir(),
      env: {
        ...process.env,
        PATH: fakeBin ? `${fakeBin}:${process.env.PATH}` : process.env.PATH,
      },
      maxBuffer: 16 * 1024 * 1024,
      timeout: 60_000,
    },
  );

  assert.match(`${stdout}${stderr}`, /no drift detected/i);
});
