// Mock data for UI demonstration

export const mockPosts = [
  {
    id: '1',
    url: 'https://www.linkedin.com/posts/example1',
    author_name: 'John Doe',
    content:
      'Just launched our new AI-powered analytics platform! Excited to see how it transforms data insights for enterprise teams. What features would you prioritize in a modern analytics tool? 🚀',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    stats: {
      totalEngagements: 127,
      icpMatchPercentage: 78,
      newCount: 8,
      topICPEngagers: [
        {
          id: '1-1',
          name: 'Sarah Chen',
          profile_image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
          icp_score: 95,
        },
        {
          id: '1-2',
          name: 'Michael Rodriguez',
          profile_image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
          icp_score: 92,
        },
        {
          id: '1-3',
          name: 'Emma Thompson',
          profile_image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
          icp_score: 88,
        },
      ],
    },
  },
  {
    id: '2',
    url: 'https://www.linkedin.com/posts/example2',
    author_name: 'John Doe',
    content:
      'Building in public: Here are 5 lessons learned from scaling our SaaS from $0 to $1M ARR in 18 months. Thread 👇',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    stats: {
      totalEngagements: 89,
      icpMatchPercentage: 42,
      newCount: 3,
      topICPEngagers: [
        {
          id: '2-1',
          name: 'David Kim',
          profile_image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
          icp_score: 85,
        },
        {
          id: '2-2',
          name: 'Lisa Patel',
          profile_image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
          icp_score: 79,
        },
      ],
    },
  },
  {
    id: '3',
    url: 'https://www.linkedin.com/posts/example3',
    author_name: 'John Doe',
    content:
      'Hiring alert! We\'re looking for a Senior Product Manager to join our team. Remote-first, competitive salary, and the chance to shape the future of enterprise software. DM me if interested!',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    stats: {
      totalEngagements: 52,
      icpMatchPercentage: 65,
      newCount: 0,
      topICPEngagers: [
        {
          id: '3-1',
          name: 'James Wilson',
          profile_image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
          icp_score: 91,
        },
        {
          id: '3-2',
          name: 'Priya Sharma',
          profile_image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
          icp_score: 87,
        },
        {
          id: '3-3',
          name: 'Alex Johnson',
          profile_image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
          icp_score: 82,
        },
      ],
    },
  },
]

export const mockEngagements = [
  {
    id: 'eng-1',
    name: 'Sarah Chen',
    profile_url: 'https://www.linkedin.com/in/example',
    profile_image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    headline: 'VP of Product at TechCorp | Building the future of enterprise SaaS',
    reaction_type: 'LIKE',
    icp_score: 95,
    icp_fit: 'high' as const,
    contacted: false,
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'eng-2',
    name: 'Michael Rodriguez',
    profile_url: 'https://www.linkedin.com/in/example',
    profile_image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    headline: 'Director of Engineering at DataFlow Inc | Cloud Architecture Expert',
    reaction_type: 'PRAISE',
    icp_score: 92,
    icp_fit: 'high' as const,
    contacted: false,
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'eng-3',
    name: 'Emma Thompson',
    profile_url: 'https://www.linkedin.com/in/example',
    profile_image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    headline: 'CTO at StartupXYZ | Ex-Google | Angel Investor',
    reaction_type: 'INTEREST',
    icp_score: 88,
    icp_fit: 'high' as const,
    contacted: true,
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'eng-4',
    name: 'David Kim',
    profile_url: 'https://www.linkedin.com/in/example',
    profile_image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    headline: 'Senior Product Manager at FinTech Solutions',
    reaction_type: 'LIKE',
    icp_score: 72,
    icp_fit: 'medium' as const,
    contacted: false,
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'eng-5',
    name: 'Lisa Patel',
    profile_url: 'https://www.linkedin.com/in/example',
    profile_image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
    headline: 'Marketing Manager at BrandCo',
    reaction_type: 'EMPATHY',
    icp_score: 45,
    icp_fit: 'low' as const,
    contacted: false,
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'eng-6',
    name: 'James Wilson',
    profile_url: 'https://www.linkedin.com/in/example',
    profile_image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    headline: 'Founder & CEO at CloudScale | 2x Exits | Forbes 30 Under 30',
    reaction_type: 'PRAISE',
    icp_score: 98,
    icp_fit: 'high' as const,
    contacted: false,
    created_at: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'eng-7',
    name: 'Priya Sharma',
    profile_url: 'https://www.linkedin.com/in/example',
    profile_image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    headline: 'VP of Sales at Enterprise Software Co | Helping teams scale globally',
    reaction_type: 'INTEREST',
    icp_score: 87,
    icp_fit: 'high' as const,
    contacted: true,
    created_at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'eng-8',
    name: 'Alex Johnson',
    profile_url: 'https://www.linkedin.com/in/example',
    profile_image_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    headline: 'Product Designer at DesignStudio | UI/UX Enthusiast',
    reaction_type: 'LIKE',
    icp_score: 58,
    icp_fit: 'medium' as const,
    contacted: false,
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
]

export const mockPostStats = {
  totalEngagements: mockEngagements.length,
  icpMatchPercentage: 62,
  highICPCount: 5,
  mediumICPCount: 2,
  lowICPCount: 1,
  contactedCount: 2,
  topICPEngagers: mockEngagements
    .filter((e) => e.icp_fit === 'high')
    .slice(0, 5),
  recentCount: 3,
}

export const mockPost = {
  id: '1',
  url: 'https://www.linkedin.com/posts/example1',
  author_name: 'John Doe',
  content:
    'Just launched our new AI-powered analytics platform! Excited to see how it transforms data insights for enterprise teams. What features would you prioritize in a modern analytics tool? 🚀\n\nKey highlights:\n• Real-time data processing\n• Predictive analytics with ML\n• Beautiful, customizable dashboards\n• Enterprise-grade security\n\n#ProductLaunch #AI #Analytics #SaaS',
  created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  total_reactions: 127,
}
