import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('=== SCRAPE INITIATE START ===')
  
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error('No authenticated user')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    console.log('User authenticated:', user.id)

    const { url } = await request.json()
    console.log('LinkedIn URL received:', url)
    
    // Validate LinkedIn URL
    if (!url || !url.includes('linkedin.com/posts/')) {
      return NextResponse.json({ error: 'Invalid LinkedIn URL' }, { status: 400 })
    }

    // Create scraping job record
    const { data: job, error: jobError } = await supabase
      .from('scraping_jobs')
      .insert({
        user_id: user.id,
        post_url: url,
        status: 'pending',
      })
      .select()
      .single()

    if (jobError) {
      console.error('Error creating job:', jobError)
      return NextResponse.json({ error: 'Failed to create job' }, { status: 500 })
    }

    // Initialize Apify actor
    const apifyToken = process.env.ENGAGETRACKER_APIFY_API_TOKEN
    const actorId = process.env.ENGAGETRACKER_APIFY_ACTOR_ID || 'apimaestro~linkedin-post-reactions'
    
    // Use polling in development, webhooks in production
    const webhookUrl = process.env.NODE_ENV === 'production' 
      ? `${process.env.NEXT_PUBLIC_ENGAGETRACKER_APP_URL}/api/scrape/webhook`
      : null
    
    console.log('Apify config:', {
      actorId,
      tokenPresent: !!apifyToken,
      tokenLength: apifyToken?.length,
      webhookUrl,
      environment: process.env.NODE_ENV
    })
    
    const apifyUrl = `https://api.apify.com/v2/acts/${actorId}/runs`
    console.log('Calling Apify API:', apifyUrl)
    
    const apifyResponse = await fetch(
      `https://api.apify.com/v2/acts/${actorId}/runs`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apifyToken}`,
        },
        body: JSON.stringify({
          post_url: url,
          reaction_type: 'ALL',
          // Only include webhooks in production
          ...(webhookUrl ? {
            webhooks: [
              {
                eventTypes: ['ACTOR.RUN.SUCCEEDED'],
                requestUrl: webhookUrl,
                payloadTemplate: JSON.stringify({
                  jobId: job.id,
                  runId: '{{runId}}',
                  datasetId: '{{defaultDatasetId}}',
                }),
              },
            ],
          } : {}),
        }),
      }
    )

    if (!apifyResponse.ok) {
      const errorText = await apifyResponse.text()
      console.error('Apify API error:', errorText)
      
      let errorMessage = 'Failed to start scraping'
      try {
        const errorJson = JSON.parse(errorText)
        errorMessage = errorJson.error?.message || errorMessage
      } catch (e) {
        // If not JSON, use the raw text
        errorMessage = errorText.substring(0, 200) // Limit error message length
      }
      
      // Update job status to failed
      await supabase
        .from('scraping_jobs')
        .update({ 
          status: 'failed',
          error_message: errorMessage,
          completed_at: new Date().toISOString()
        })
        .eq('id', job.id)
      
      return NextResponse.json({ 
        error: errorMessage,
        jobId: job.id 
      }, { status: 500 })
    }

    const apifyData = await apifyResponse.json()
    
    // The actual structure is { data: { id: "...", ... } }
    const runId = apifyData.data?.id || apifyData.id
    
    console.log('✅ Apify run started successfully:', {
      jobId: job.id,
      runId: runId,
      status: apifyData.data?.status,
      actorId: actorId,
      fullResponse: JSON.stringify(apifyData).substring(0, 500)
    })
    
    // Update job with Apify run ID
    const { error: updateError } = await supabase
      .from('scraping_jobs')
      .update({ 
        status: 'processing',
        apify_run_id: runId
      })
      .eq('id', job.id)
    
    if (updateError) {
      console.error('Failed to update job status:', updateError)
    }

    console.log('=== SCRAPE INITIATE SUCCESS ===')
    return NextResponse.json({ 
      jobId: job.id,
      runId: runId 
    })
  } catch (error) {
    console.error('=== SCRAPE INITIATE ERROR ===', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}