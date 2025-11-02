import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClerkSupabaseClientSSR } from '@/lib/supabase/server'

// GET /api/posts - List all posts for user with stats
export async function GET(request: NextRequest) {
  try {
    const { userId, getToken } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClerkSupabaseClientSSR(getToken)

    // Fetch all posts for this user
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select(`
        id,
        url,
        author_name,
        content,
        total_reactions,
        posted_at,
        created_at,
        last_scraped_at,
        is_active
      `)
      .eq('clerk_user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (postsError) {
      console.error('Error fetching posts:', postsError)
      return NextResponse.json({ error: 'Failed to fetch posts' }, { status: 500 })
    }

    // For each post, get engagement stats
    const postsWithStats = await Promise.all(
      posts.map(async (post) => {
        // Total engagements
        const { count: totalEngagements } = await supabase
          .from('engagements')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id)
          .eq('hidden', false)

        // ICP match percentage (high ICP only)
        const { count: highICPCount } = await supabase
          .from('engagements')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id)
          .eq('icp_fit', 'high')
          .eq('hidden', false)

        // New engagements (created in last 24 hours)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
        const { count: newCount } = await supabase
          .from('engagements')
          .select('*', { count: 'exact', head: true })
          .eq('post_id', post.id)
          .gte('created_at', oneDayAgo)
          .eq('hidden', false)

        // Top ICP engagers (top 3)
        const { data: topICPEngagers } = await supabase
          .from('engagements')
          .select('id, name, profile_image_url, icp_score')
          .eq('post_id', post.id)
          .eq('hidden', false)
          .not('icp_score', 'is', null)
          .order('icp_score', { ascending: false })
          .limit(3)

        const icpMatchPercentage = totalEngagements && totalEngagements > 0
          ? Math.round((highICPCount || 0) / totalEngagements * 100)
          : 0

        return {
          ...post,
          stats: {
            totalEngagements: totalEngagements || 0,
            icpMatchPercentage,
            newCount: newCount || 0,
            topICPEngagers: topICPEngagers || []
          }
        }
      })
    )

    return NextResponse.json({ posts: postsWithStats })
  } catch (error) {
    console.error('Unexpected error in GET /api/posts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
