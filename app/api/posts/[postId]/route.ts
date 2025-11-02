import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClerkSupabaseClientSSR } from '@/lib/supabase/server'

// GET /api/posts/[postId] - Get single post with all engagements
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ postId: string }> }
) {
  try {
    const { userId, getToken } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { postId } = await params
    const supabase = createClerkSupabaseClientSSR(getToken)

    // Fetch post details
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .eq('clerk_user_id', userId)
      .single()

    if (postError || !post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 })
    }

    // Fetch all engagements for this post (excluding hidden ones)
    const { data: engagements, error: engagementsError } = await supabase
      .from('engagements')
      .select('*')
      .eq('post_id', postId)
      .eq('hidden', false)
      .order('created_at', { ascending: false })

    if (engagementsError) {
      console.error('Error fetching engagements:', engagementsError)
      return NextResponse.json(
        { error: 'Failed to fetch engagements' },
        { status: 500 }
      )
    }

    // Calculate stats
    const totalEngagements = engagements.length
    const highICPCount = engagements.filter((e) => e.icp_fit === 'high').length
    const mediumICPCount = engagements.filter(
      (e) => e.icp_fit === 'medium'
    ).length
    const lowICPCount = engagements.filter((e) => e.icp_fit === 'low').length
    const contactedCount = engagements.filter((e) => e.contacted).length

    const icpMatchPercentage =
      totalEngagements > 0
        ? Math.round((highICPCount / totalEngagements) * 100)
        : 0

    // Get top ICP engagers (sorted by ICP score)
    const topICPEngagers = engagements
      .filter((e) => e.icp_score !== null)
      .sort((a, b) => (b.icp_score || 0) - (a.icp_score || 0))
      .slice(0, 5)

    // Get recent engagements (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const recentEngagements = engagements.filter(
      (e) => e.created_at >= oneDayAgo
    )

    return NextResponse.json({
      post,
      engagements,
      stats: {
        totalEngagements,
        icpMatchPercentage,
        highICPCount,
        mediumICPCount,
        lowICPCount,
        contactedCount,
        topICPEngagers,
        recentCount: recentEngagements.length,
      },
    })
  } catch (error) {
    console.error('Unexpected error in GET /api/posts/[postId]:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
