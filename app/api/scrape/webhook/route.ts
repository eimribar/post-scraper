import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Verify webhook signature (optional but recommended for production)
function verifyWebhookSignature(payload: string, signature: string): boolean {
  const secret = process.env.WEBHOOK_SECRET
  if (!secret) return true // Skip verification if no secret is set
  
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
  
  return signature === expectedSignature
}

export async function POST(request: NextRequest) {
  console.log('=== WEBHOOK RECEIVED ===')
  
  try {
    const body = await request.text()
    const signature = request.headers.get('x-apify-signature') || ''
    
    console.log('Webhook headers:', {
      signature,
      contentType: request.headers.get('content-type'),
      bodyLength: body.length
    })
    
    // Verify webhook signature in production
    if (process.env.NODE_ENV === 'production' && !verifyWebhookSignature(body, signature)) {
      console.error('Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }

    const data = JSON.parse(body)
    console.log('Webhook payload:', JSON.stringify(data).substring(0, 500))
    
    const { jobId, runId, datasetId } = data
    
    if (!jobId || !datasetId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const supabase = await createClient()
    
    // Fetch data from Apify dataset
    const apifyToken = process.env.APIFY_API_TOKEN
    const datasetUrl = `https://api.apify.com/v2/datasets/${datasetId}/items?token=${apifyToken}`
    
    console.log('Fetching dataset from:', datasetUrl.replace(apifyToken!, '[REDACTED]'))
    
    const datasetResponse = await fetch(datasetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!datasetResponse.ok) {
      console.error('Failed to fetch Apify dataset')
      
      await supabase
        .from('scraping_jobs')
        .update({ 
          status: 'failed',
          error_message: 'Failed to fetch scraping results',
          completed_at: new Date().toISOString()
        })
        .eq('id', jobId)
      
      return NextResponse.json({ error: 'Failed to fetch dataset' }, { status: 500 })
    }

    const scrapedData = await datasetResponse.json()
    
    console.log(`Dataset fetched: ${Array.isArray(scrapedData) ? scrapedData.length : 0} items`)
    if (scrapedData.length > 0) {
      console.log('First item sample:', JSON.stringify(scrapedData[0]).substring(0, 300))
    }
    
    // Get the job details
    const { data: job } = await supabase
      .from('scraping_jobs')
      .select('*')
      .eq('id', jobId)
      .single()
    
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // Check if post exists, if not create it
    const { data: existingPost } = await supabase
      .from('posts')
      .select('id')
      .eq('url', job.post_url)
      .single()
    
    let postId = existingPost?.id
    
    if (!postId) {
      // Extract post info from metadata if available
      const postMetadata = scrapedData[0]?._metadata || {}
      const { data: newPost } = await supabase
        .from('posts')
        .insert({
          url: job.post_url,
          author_name: 'LinkedIn User',  // Not provided by new actor
          author_headline: '',
          content: '',
          total_reactions: scrapedData.length,
          posted_at: new Date().toISOString(),
        })
        .select('id')
        .single()
      
      postId = newPost?.id
    }

    // Process and insert engagement data (new format from apimaestro actor)
    const engagements = scrapedData.map((item: any) => ({
      post_id: postId,
      scraping_job_id: jobId,
      user_id: job.user_id,
      linkedin_profile_url: item.reactor?.profile_url || '',
      name: item.reactor?.name || 'Unknown User',
      headline: item.reactor?.headline || '',
      title: item.reactor?.headline || '',
      company: '',  // Not provided in new format
      profile_image_url: item.reactor?.profile_pictures?.large || item.reactor?.profile_pictures?.medium || '',
      reaction_type: item.reaction_type?.toLowerCase() || 'like',
    }))

    // Batch insert engagements
    if (engagements.length > 0) {
      const { error: insertError } = await supabase
        .from('engagements')
        .insert(engagements)
      
      if (insertError) {
        console.error('Error inserting engagements:', insertError)
      }
    }

    // Update job status to completed
    await supabase
      .from('scraping_jobs')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', jobId)

    console.log(`=== WEBHOOK SUCCESS: Processed ${engagements.length} engagements ===`)
    return NextResponse.json({ 
      success: true, 
      message: `Processed ${engagements.length} engagements` 
    })
  } catch (error) {
    console.error('=== WEBHOOK ERROR ===', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error',
      details: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}