const Anthropic = require('@anthropic-ai/sdk');

class PerformanceAnalyzer {
  constructor(apiKey) {
    this.client = new Anthropic({
      apiKey: apiKey,
    });
  }

  /**
   * Analyze multiple meeting transcripts and provide performance feedback
   * @param {Array} transcripts - Array of transcript objects
   * @param {string} userEmail - User's email to identify their contributions
   * @returns {Object} Analysis with strengths and areas for improvement
   */
  async analyzeMeetings(transcripts, userEmail) {
    if (!transcripts || transcripts.length === 0) {
      return {
        summary: 'No meetings found in the specified period.',
        strengths: [],
        improvements: [],
        meetingCount: 0
      };
    }

    console.log(`Analyzing ${transcripts.length} meetings with Claude...`);

    // Prepare transcript summaries for analysis
    const transcriptSummaries = transcripts.map(t => ({
      title: t.meetingTitle,
      date: new Date(t.modifiedTime).toLocaleDateString(),
      wordCount: t.wordCount,
      preview: t.content.substring(0, 2000) // First 2000 chars for context
    }));

    const prompt = this.buildAnalysisPrompt(transcripts, transcriptSummaries, userEmail);

    try {
      const message = await this.client.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 4096,
        messages: [{
          role: 'user',
          content: prompt
        }]
      });

      const analysisText = message.content[0].text;
      const parsed = this.parseAnalysis(analysisText);

      return {
        ...parsed,
        meetingCount: transcripts.length,
        analyzedAt: new Date().toISOString()
      };

    } catch (err) {
      console.error('Error calling Claude API:', err);
      throw err;
    }
  }

  buildAnalysisPrompt(transcripts, summaries, userEmail) {
    const userIdentifier = userEmail ? userEmail.split('@')[0] : 'the user';

    return `You are an executive communication coach analyzing meeting transcripts to provide constructive feedback.

CONTEXT:
- User: ${userIdentifier}
- Number of meetings: ${transcripts.length}
- Time period: Past week

MEETINGS ANALYZED:
${summaries.map((s, i) => `${i + 1}. "${s.title}" (${s.date}) - ${s.wordCount} words`).join('\n')}

FULL TRANSCRIPTS:
${transcripts.map((t, i) => `
=== MEETING ${i + 1}: ${t.meetingTitle} ===
Date: ${new Date(t.modifiedTime).toLocaleDateString()}

${t.content}

`).join('\n---\n')}

TASK:
Analyze these meeting transcripts focusing on ${userIdentifier}'s communication patterns and meeting behavior. Provide:

1. SKILLFUL ENGAGEMENT (2-4 specific strengths)
   - Identify concrete examples where they communicated effectively
   - Quote or reference specific moments
   - Explain WHY each was skillful

2. AREAS FOR IMPROVEMENT (1-3 specific areas)
   - For each area, provide:
     a) What they did (with specific example/quote)
     b) Why it could be improved
     c) A concrete alternative approach
   - Focus on actionable, practical suggestions

FORMAT YOUR RESPONSE EXACTLY AS FOLLOWS:

## Skillful Engagement

### [Strength 1 Title]
[Description with specific example]

### [Strength 2 Title]
[Description with specific example]

## Areas for Improvement

### [Area 1 Title]
**What happened:** [Specific example with quote if possible]
**Why improve:** [Impact or reason]
**Try instead:** [Specific alternative approach]

### [Area 2 Title]
**What happened:** [Specific example]
**Why improve:** [Impact or reason]
**Try instead:** [Specific alternative approach]

IMPORTANT:
- Be specific and concrete - reference actual moments from the transcripts
- Be constructive and growth-oriented, not judgmental
- Focus on communication skills: listening, questioning, clarity, empathy, facilitation
- If you can't identify the user's contributions clearly, note that and analyze the overall meeting dynamics`;
  }

  parseAnalysis(text) {
    // Parse the structured response from Claude
    const result = {
      summary: '',
      strengths: [],
      improvements: [],
      rawAnalysis: text
    };

    // Extract strengths
    const strengthsMatch = text.match(/## Skillful Engagement([\s\S]*?)(?=## Areas for Improvement|$)/);
    if (strengthsMatch) {
      const strengthsSection = strengthsMatch[1];
      const strengthItems = strengthsSection.match(/### ([^\n]+)\n([\s\S]*?)(?=###|$)/g);

      if (strengthItems) {
        result.strengths = strengthItems.map(item => {
          const titleMatch = item.match(/### ([^\n]+)/);
          const contentMatch = item.match(/### [^\n]+\n([\s\S]*)/);
          return {
            title: titleMatch ? titleMatch[1].trim() : '',
            description: contentMatch ? contentMatch[1].trim() : ''
          };
        });
      }
    }

    // Extract improvements
    const improvementsMatch = text.match(/## Areas for Improvement([\s\S]*?)$/);
    if (improvementsMatch) {
      const improvementsSection = improvementsMatch[1];
      const improvementItems = improvementsSection.match(/### ([^\n]+)\n([\s\S]*?)(?=###|$)/g);

      if (improvementItems) {
        result.improvements = improvementItems.map(item => {
          const titleMatch = item.match(/### ([^\n]+)/);
          const whatMatch = item.match(/\*\*What happened:\*\*\s*([^\n]+(?:\n(?!\*\*)[^\n]+)*)/);
          const whyMatch = item.match(/\*\*Why improve:\*\*\s*([^\n]+(?:\n(?!\*\*)[^\n]+)*)/);
          const tryMatch = item.match(/\*\*Try instead:\*\*\s*([^\n]+(?:\n(?!\*\*)[^\n]+)*)/);

          return {
            title: titleMatch ? titleMatch[1].trim() : '',
            whatHappened: whatMatch ? whatMatch[1].trim() : '',
            whyImprove: whyMatch ? whyMatch[1].trim() : '',
            tryInstead: tryMatch ? tryMatch[1].trim() : ''
          };
        });
      }
    }

    return result;
  }
}

module.exports = PerformanceAnalyzer;
