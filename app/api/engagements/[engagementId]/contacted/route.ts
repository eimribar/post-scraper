import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createClerkSupabaseClientSSR } from '@/lib/supabase/server'

// PATCH /api/engagements/[engagementId]/contacted - Mark engagement as contacted
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ engagementId: string }> }
) {
  try {
    const { userId, getToken } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { engagementId } = await params
    const supabase = createClerkSupabaseClientSSR(getToken)

    // Verify the engagement belongs to a post owned by this user
    const { data: engagement, error: fetchError } = await supabase
      .from('engagements')
      .select('id, post_id, posts!inner(clerk_user_id)')
      .eq('id', engagementId)
      .single()

    if (fetchError || !engagement) {
      return NextResponse.json(
        { error: 'Engagement not found' },
        { status: 404 }
      )
    }

    // Check ownership
    if (engagement.posts.clerk_user_id !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Mark as contacted and hide from main list
    const { error: updateError } = await supabase
      .from('engagements')
      .update({
        contacted: true,
        hidden: true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', engagementId)

    if (updateError) {
      console.error('Error updating engagement:', updateError)
      return NextResponse.json(
        { error: 'Failed to update engagement' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(
      'Unexpected error in PATCH /api/engagements/[engagementId]/contacted:',
      error
    )
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
