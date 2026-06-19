import { NextResponse } from 'next/server'
import Groq from 'groq-sdk'

const client = new Groq({
  apiKey: process.env.GROQ_API_KEY
})

export async function POST(request) {
  try {
    const { blueprint } = await request.json()

    const response = await client.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      max_tokens: 2000,
      messages: [
        {
          role: 'system',
          content: `You are a senior security architect and cloud cost estimator.
Given an app blueprint, analyze it and return a risk report.

CRITICAL: Return ONLY valid JSON. No markdown, no code blocks, no explanation.

Format:
{
  "security_issues": [
    { "issue": "string", "severity": "high", "fix": "string" }
  ],
  "cost_estimate_usd_per_month": 25,
  "compliance_gaps": [
    { "regulation": "GDPR", "gap": "string", "fix": "string" }
  ],
  "accessibility_issues": [
    { "issue": "string", "severity": "medium", "fix": "string" }
  ]
}

Rules:
- severity must be: "high", "medium", or "low"
- Base cost estimate on the tier (1=$0, 2=$0-25, 3=$50-200) and the specific features listed
- Only include compliance_gaps if the app handles personal data, payments, or health info — otherwise return empty array
- Be specific to THIS app, not generic advice
- Include 2-4 security issues, 2-3 accessibility issues`
        },
        {
          role: 'user',
          content: `Analyze this app blueprint: ${JSON.stringify(blueprint)}`
        }
      ]
    })

    const raw = response.choices[0].message.content.trim()
    const cleaned = raw
      .replace(/^```json\n?/, '')
      .replace(/^```\n?/, '')
      .replace(/\n?```$/, '')
      .trim()

    const riskReport = JSON.parse(cleaned)

    return NextResponse.json({ riskReport })

  } catch (error) {
    console.error('Risk Radar error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze risks. Try again.' },
      { status: 500 }
    )
  }
}