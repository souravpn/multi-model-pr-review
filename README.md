# Multi-Model PR Review CLI

Review pull requests using Claude, GPT-4, and Gemini simultaneously with a consolidated report. This tool runs parallel code reviews from multiple AI models and synthesizes findings into a unified perspective.

## Features

- **Multi-Model Reviews**: Simultaneously review PRs with Claude (Opus), GPT-4, and/or Gemini
- **Consolidated Analysis**: Uses Claude Sonnet to synthesize findings and identify consensus/disagreements
- **GitHub Integration**: Direct PR review from GitHub URLs
- **Local File Support**: Review local diff files for development/testing
- **Flexible Output**: Markdown reports with detailed category analysis
- **CLI & Programmatic API**: Use as command-line tool or import as a library

## Installation

### Global CLI

```bash
npm install -g multi-model-pr-review
pr-review --help
```

### As a Library

```bash
npm install multi-model-pr-review
```

### Local Development

```bash
git clone <repo>
cd multi-model-pr-review
npm install
npm run build
npm link  # Make `pr-review` available globally
```

## Setup API Keys

Create a `.env` file in your project root (or use environment variables):

```bash
cp .env.example .env
```

Then add your API keys:

```
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
GITHUB_TOKEN=ghp_...
```

### Getting API Keys

- **Anthropic (Claude)**: https://console.anthropic.com/account/keys
- **OpenAI (GPT-4)**: https://platform.openai.com/account/api-keys
- **Google (Gemini)**: https://aistudio.google.com/app/apikey
- **GitHub Token**: Create at https://github.com/settings/tokens (needs `repo` scope)

## Quick Start

### Review a GitHub PR

```bash
pr-review review --url https://github.com/owner/repo/pull/123
```

### Review a Local Diff File

```bash
pr-review review --file ./changes.diff
```

### Save to File

```bash
pr-review review --url https://github.com/owner/repo/pull/123 --output review-report.md
```

## Usage

### CLI Commands

```bash
# View all options
pr-review --help

# Review a PR
pr-review review --help
```

### Review Command Options

```
Options:
  -u, --url <url>                    GitHub PR URL to review
  -f, --file <path>                  Local diff file to review
  -o, --output <path>                Output file path (default: stdout)
  --consolidate                      Enable consolidation with Claude (default: true)
  --no-consolidate                   Disable consolidation (creates side-by-side report)
  --claude                           Include Claude Opus in review (default: true)
  --no-claude                        Skip Claude Opus
  --openai                           Include GPT-4 in review (default: true)
  --no-openai                        Skip GPT-4
  --gemini                           Include Gemini in review (default: true)
  --no-gemini                        Skip Gemini
  --claude-model <model>             Override Claude model
  --openai-model <model>             Override OpenAI model
  --gemini-model <model>             Override Gemini model
  --timeout <seconds>                Review timeout per model (default: 60)
  --max-chars <chars>                Max chars per file per model (default: 50000)
  --verbose                          Enable verbose logging
```

### Config Commands

```bash
# Validate API keys
pr-review config validate
```

## Examples

### Basic GitHub PR Review

```bash
export ANTHROPIC_API_KEY=sk-ant-...
export OPENAI_API_KEY=sk-...
export GEMINI_API_KEY=...
export GITHUB_TOKEN=ghp_...

pr-review review --url https://github.com/anthropics/anthropic-sdk-python/pull/1
```

### Review with Specific Models

```bash
# Only Claude and GPT-4, no Gemini
pr-review review --file my-changes.diff --no-gemini --output report.md
```

### Side-by-Side Comparison (No Consolidation)

```bash
# Get individual reviews without synthesis
pr-review review --url https://github.com/owner/repo/pull/456 --no-consolidate
```

### Development/Testing with Local Diff

Create a sample diff file (`test.diff`):

```diff
diff --git a/src/app.ts b/src/app.ts
index abc123..def456 100644
--- a/src/app.ts
+++ b/src/app.ts
@@ -10,6 +10,12 @@ export function calculateTotal(items: any[]) {
+  // Fixed potential issue with null items
+  const filtered = items.filter(i => i != null);
   return items.reduce((sum, item) => sum + item.price, 0);
 }
```

Then review:

```bash
pr-review review --file test.diff --output test-report.md
```

## Programmatic API

Use the tool as a library in your own projects:

```typescript
import {
  ReviewOrchestrator,
  Consolidator,
  MarkdownReporter,
  GitHubFetcher,
  ProviderFactory,
} from 'multi-model-pr-review';

// Fetch PR data
const fetcher = new GitHubFetcher(
  'https://github.com/owner/repo/pull/123',
  'your_github_token'
);
const prData = await fetcher.fetch();

// Create providers
const claudeProvider = ProviderFactory.create('claude', 'your_anthropic_key');
const openaiProvider = ProviderFactory.create('openai', 'your_openai_key');
const providers = [claudeProvider, openaiProvider];

// Run reviews
const orchestrator = new ReviewOrchestrator(
  providers,
  prData.diff,
  prData.title
);
const reviews = await orchestrator.orchestrate();

// Consolidate results
const consolidator = new Consolidator('your_anthropic_key');
const consolidated = await consolidator.consolidate(reviews);

// Generate report
const report = MarkdownReporter.generateReport(prData, reviews, consolidated);
console.log(report);
```

## Report Structure

The generated markdown report includes:

1. **Executive Summary** — High-level overview of the code changes
2. **Top Priority Actions** — Critical issues across all reviews
3. **Category Analysis** — Detailed breakdown by:
   - Code Quality
   - Security
   - Performance
   - Test Coverage
   - Documentation
   - Best Practices
4. **Model Agreement Matrix** — Shows where models agree/disagree
5. **Individual Model Reviews** — Full details from each provider

## Build & Development

### Build TypeScript

```bash
npm run build
```

### Watch Mode

```bash
npm run build:watch
```

### Development with ts-node

```bash
npm run dev -- --help
```

## Testing

```bash
# Validate configuration
pr-review config validate

# Test with a sample diff
pr-review review --file sample.diff --verbose
```

## Publishing

### To npm

```bash
npm run build
npm publish
```

### As a Tarball

```bash
npm pack
# Creates multi-model-pr-review-1.0.0.tgz
npm install -g ./multi-model-pr-review-1.0.0.tgz
```

## Troubleshooting

### API Key Not Found

```bash
# Check if .env file exists
ls -la .env

# Verify environment variables
echo $ANTHROPIC_API_KEY
```

### Module Not Found After Install

```bash
# Rebuild TypeScript
npm run build

# Ensure bin/ directory exists with compiled JS
ls -la bin/
```

### Review Timeout

Increase the timeout (default 60 seconds):

```bash
pr-review review --url ... --timeout 120
```

### Large PRs

Reduce characters per file:

```bash
pr-review review --file large-diff.diff --max-chars 25000
```

## License

MIT

## Contributing

Contributions welcome! Please submit PRs to the main repository.

## Support

For issues and questions:
- GitHub Issues: https://github.com/yourusername/multi-model-pr-review/issues
- Documentation: See individual module docs in `src/`

## Added line for testing...
