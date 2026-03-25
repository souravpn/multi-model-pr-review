import { EnumStringSchema } from '@google/generative-ai';
import { ModelReview, ConsolidatedReport, PRData } from '../types';

export class MarkdownReporter {
  static generateReport(
    prData: PRData,
    reviews: ModelReview[],
    consolidated: ConsolidatedReport
  ): string {
    const sections = [
      this.generateHeader(prData),
      this.generateExecutiveSummary(consolidated),
      this.generateTopPriorities(consolidated),
      this.generateIndividualReviews(reviews),
      this.generateConsolidatedAnalysis(consolidated),
      this.generateAgreementMatrix(consolidated),
    ];

    return sections.filter((s) => s).join('\n\n');
  }

  private static generateHeader(prData: PRData): string {
    return `# PR Review Report

**Title:** ${prData.title}
**Author:** ${prData.author}
**Repository:** ${prData.repository}
**Branch:** ${prData.baseRef} ← ${prData.headRef}
**URL:** [View on GitHub](${prData.url})
**Date:** ${new Date().toISOString()}

## Statistics
- Files Changed: ${prData.stats.filesChanged}
- Lines Added: ${prData.stats.additions}
- Lines Deleted: ${prData.stats.deletions}
- Commits: ${prData.commits.length}

${prData.description ? `## Description\n${prData.description}` : ''}`;
  }

  private static generateExecutiveSummary(report: ConsolidatedReport): string {
    return `## Executive Summary

${report.executiveSummary}`;
  }

  private static generateTopPriorities(report: ConsolidatedReport): string {
    if (!report.topPriorityActions || report.topPriorityActions.length === 0) {
      return '';
    }

    const items = report.topPriorityActions
      .slice(0, 5)
      .map((action) => `- ${action}`)
      .join('\n');

    return `## Top Priority Actions

${items}`;
  }

  private static generateIndividualReviews(reviews: ModelReview[]): string {
    const successfulReviews = reviews.filter((r) => !r.error);

    if (successfulReviews.length === 0) {
      return '';
    }

    const reviewSections = successfulReviews
      .map((review) => this.generateReviewSection(review))
      .join('\n\n');

    return `## Individual Model Reviews\n\n${reviewSections}`;
  }

  private static generateReviewSection(review: ModelReview): string {
    const categories = [
      { name: 'Code Quality', key: 'codeQuality' },
      { name: 'Security', key: 'security' },
      { name: 'Performance', key: 'performance' },
      { name: 'Test Coverage', key: 'testCoverage' },
      { name: 'Documentation', key: 'documentation' },
      { name: 'Best Practices', key: 'bestPractices' },
    ];

    const categoryReviews = categories
      .map(({ name, key }) => {
        const category = (review as any)[key];
        const score = '⭐'.repeat(category.score) + '☆'.repeat(5 - category.score);

        let content = `### ${name} (${score})\n`;

        if (category.findings && category.findings.length > 0) {
          content += '\n**Findings:**\n';
          category.findings.forEach((finding: any) => {
            const severityEmoji = {
              critical: '🔴',
              high: '🟠',
              medium: '🟡',
              low: '🟢',
            };
                        content += `- ${finding.severity || '◆'} ${finding.description}\n`;

            // content += `- ${severityEmoji[finding.severity] as string || '◆'} ${finding.description}\n`;
          });
        }

        if (category.suggestions && category.suggestions.length > 0) {
          content += '\n**Suggestions:**\n';
          category.suggestions.forEach((suggestion: string) => {
            content += `- ${suggestion}\n`;
          });
        }

        return content;
      })
      .join('\n');

    return `### ${review.modelName} (${review.modelId})
**Overall Score:** ${review.overallScore}/5
**Execution Time:** ${review.executionTime}ms

${review.overallSummary}

${categoryReviews}`;
  }

  private static generateConsolidatedAnalysis(
    report: ConsolidatedReport
  ): string {
    const categories = [
      { name: 'Code Quality', key: 'codeQuality' },
      { name: 'Security', key: 'security' },
      { name: 'Performance', key: 'performance' },
      { name: 'Test Coverage', key: 'testCoverage' },
      { name: 'Documentation', key: 'documentation' },
      { name: 'Best Practices', key: 'bestPractices' },
    ];

    const analyses = categories
      .map(({ name, key }) => {
        const category = (report.categories as any)[key];
        const score = '⭐'.repeat(category.consensus) + '☆'.repeat(5 - category.consensus);

        let content = `### ${name} (${score})\n`;
        content += `**Consensus Score:** ${category.consensus}/5\n`;
        content += `**Recommendation:** ${category.recommendation}\n`;

        if (category.disagreements && category.disagreements.length > 0) {
          content += '\n**Model Disagreements:**\n';
          category.disagreements.forEach(
            (d: any) =>
              (content += `- ${d.model}: ${d.score}/5 (Δ ${Math.abs(d.score - category.consensus)})\n`)
          );
        }

        if (category.synthesizedFindings && category.synthesizedFindings.length > 0) {
          content += '\n**Key Findings:**\n';
          category.synthesizedFindings.slice(0, 3).forEach((finding: any) => {
            content += `- ${finding.description}\n`;
          });
        }

        return content;
      })
      .join('\n');

    return `## Consolidated Analysis\n\n${analyses}`;
  }

  private static generateAgreementMatrix(report: ConsolidatedReport): string {
    const matrix = report.modelAgreementMatrix;
    if (!matrix || Object.keys(matrix).length === 0) {
      return '';
    }

    let table = '## Model Agreement Matrix\n\n| Category | ';
    const models = Object.keys(matrix[Object.keys(matrix)[0]] || {});
    table += models.map((m) => m).join(' | ') + ' | Consensus |\n';
    table +=
      '|' +
      Array(models.length + 2)
        .fill('---')
        .join('|') +
      '|\n';

    Object.entries(matrix).forEach(([category, scores]: any) => {
      table += `| ${category} | `;
      const consensusScores = Object.values(scores).map(
        (s: any) => s.scores[0]
      );
      table += (consensusScores as number[])
        .map((s) => this.scoreToStars(s))
        .join(' | ');
      table += ` | ${this.scoreToStars(scores[models[0]]?.consensus || 0)} |\n`;
    });

    return table;
  }

  private static scoreToStars(score: number): string {
    if (!score) return '−';
    return '⭐'.repeat(score) + '☆'.repeat(Math.max(0, 5 - score));
  }
}
