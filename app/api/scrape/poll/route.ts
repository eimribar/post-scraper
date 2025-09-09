import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  console.log('=== POLL SCRAPE STATUS START ===')
  
  try {
    const supabase = await createClient()
    
    // Check authentication
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { jobId } = await request.json()
    if (!jobId) {
      return NextResponse.json({ error: 'Job ID required' }, { status: 400 })
    }

    // Get job details
    const { data: job, error: jobError } = await supabase
      .from('scraping_jobs')
      .select('*')
      .eq('id', jobId)
      .eq('user_id', user.id)
      .single()

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 })
    }

    // If job is already completed or failed, return current status
    if (job.status === 'completed' || job.status === 'failed') {
      return NextResponse.json({ 
        status: job.status,
        jobId: job.id,
        message: job.status === 'completed' ? 'Job completed' : job.error_message
      })
    }

    // Check Apify run status
    const apifyToken = process.env.APIFY_API_TOKEN
    const runId = job.apify_run_id

    if (!runId) {
      return NextResponse.json({ 
        status: 'processing',
        jobId: job.id,
        message: 'Waiting for run to start'
      })
    }

    console.log(`Checking Apify run status for run ID: ${runId}`)
    
    const statusResponse = await fetch(
      `https://api.apify.com/v2/actor-runs/${runId}?token=${apifyToken}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    if (!statusResponse.ok) {
      console.error('Failed to fetch Apify run status')
      return NextResponse.json({ 
        status: 'processing',
        jobId: job.id,
        message: 'Unable to check status'
      })
    }

    const runData = await statusResponse.json()
    const runStatus = runData.data?.status
    
    console.log(`Apify run status: ${runStatus}`)

    // If run is still in progress
    if (runStatus === 'RUNNING' || runStatus === 'READY') {
      return NextResponse.json({ 
        status: 'processing',
        jobId: job.id,
        message: 'Scraping in progress'
      })
    }

    // If run failed
    if (runStatus === 'FAILED' || runStatus === 'ABORTED' || runStatus === 'TIMED-OUT') {
      await supabase
        .from('scraping_jobs')
        .update({ 
          status: 'failed',
          error_message: `Apify run ${runStatus.toLowerCase()}`,
          completed_at: new Date().toISOString()
        })
        .eq('id', jobId)

      return NextResponse.json({ 
        status: 'failed',
        jobId: job.id,
        message: `Scraping ${runStatus.toLowerCase()}`
      })
    }

    // If run succeeded, fetch and process the data
    if (runStatus === 'SUCCEEDED') {
      const datasetId = runData.data?.defaultDatasetId
      
      if (!datasetId) {
        console.error('No dataset ID found in completed run')
        return NextResponse.json({ 
          status: 'processing',
          jobId: job.id,
          message: 'Waiting for dataset'
        })
      }

      console.log(`Fetching dataset: ${datasetId}`)
      
      // Fetch the dataset
      const datasetUrl = `https://api.apify.com/v2/datasets/${datasetId}/items?token=${apifyToken}`
      const datasetResponse = await fetch(datasetUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!datasetResponse.ok) {
        console.error('Failed to fetch dataset')
        await supabase
          .from('scraping_jobs')
          .update({ 
            status: 'failed',
            error_message: 'Failed to fetch results',
            completed_at: new Date().toISOString()
          })
          .eq('id', jobId)

        return NextResponse.json({ 
          status: 'failed',
          jobId: job.id,
          message: 'Failed to fetch results'
        })
      }

      const scrapedData = await datasetResponse.json()
      console.log(`Dataset fetched: ${Array.isArray(scrapedData) ? scrapedData.length : 0} items`)

      // Check if post exists, if not create it
      const { data: existingPost } = await supabase
        .from('posts')
        .select('id')
        .eq('url', job.post_url)
        .single()
      
      let postId = existingPost?.id
      
      if (!postId) {
        const { data: newPost } = await supabase
          .from('posts')
          .insert({
            url: job.post_url,
            author_name: 'LinkedIn User',
            author_headline: '',
            content: '',
            total_reactions: scrapedData.length,
            posted_at: new Date().toISOString(),
          })
          .select('id')
          .single()
        
        postId = newPost?.id
      }

      // Process and insert engagement data
      const engagements = scrapedData.map((item: any) => ({
        post_id: postId,
        scraping_job_id: jobId,
        user_id: job.user_id,
        linkedin_profile_url: item.reactor?.profile_url || '',
        name: item.reactor?.name || 'Unknown User',
        headline: item.reactor?.headline || '',
        title: item.reactor?.headline || '',
        company: '',
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

      console.log(`=== POLL SUCCESS: Processed ${engagements.length} engagements ===`)
      
      return NextResponse.json({ 
        status: 'completed',
        jobId: job.id,
        engagementsCount: engagements.length,
        message: `Successfully scraped ${engagements.length} engagements`
      })
    }

    // Unknown status
    return NextResponse.json({ 
      status: 'processing',
      jobId: job.id,
      message: 'Checking status...'
    })

  } catch (error) {
    console.error('=== POLL ERROR ===', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Internal server error'
    }, { status: 500 })
  }
}