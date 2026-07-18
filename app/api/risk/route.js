import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createOpenRouterCompletion, getContent } from '@/lib/claude/client'

export async function POST(request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { blueprint } = await request.json()

    const response = await createOpenRouterCompletion({
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

    const raw = getContent(response).trim()
    const cleaned = raw
      .replace(/^```json\n?/, '')
      .replace(/^```\n?/, '')
      .replace(/\n?```$/, '')
      .trim()

    // Safely extract the first JSON object in the string
    let riskReport
    try {
      riskReport = JSON.parse(cleaned)
    } catch {
      // Fallback: pull out the first {...} block in case of extra text
      const match = cleaned.match(/\{[\s\S]*\}/)
      if (!match) throw new Error('No valid JSON found in response')
      riskReport = JSON.parse(match[0])
    }

    return NextResponse.json({ riskReport })

  } catch (error) {
    console.error('Risk Radar error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to analyze risks. Try again.' },
      { status: 500 }
    )
  }
}