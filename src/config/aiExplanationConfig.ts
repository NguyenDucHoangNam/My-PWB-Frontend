export const AI_EXPLANATION_CONFIG = {
  // ========================================
  // Feature Flags per Page
  // ========================================
  enabledPages: {
    producerPortfolio: true,       // PersonalProducerPortfolioPage
    projectWorkspace: true,        // ProjectWorkspacePage
    teamManagement: true,          // TeamManagementPage
    contractDetails: true,         // Contract pages
    milestoneDetails: true,        // MilestoneDetailPage
    chatMessages: false,           // Too noisy
    adminPanel: false,             // Not needed
  },

  // ========================================
  // API Configuration
  // ========================================
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:8080',
    endpoints: {
      explain: '/api/ai/explanation',
      health: '/api/ai/explanation/health',
    },
    timeout: 15000,  // 15 seconds
  },

  // ========================================
  // Cache Configuration
  // ========================================
  cache: {
    enabled: true,
    storageKey: 'ai-explanation-cache',
    ttl: 24 * 60 * 60 * 1000,  // 24 hours
    maxSize: 100,               // Max cached items
  },

  // ========================================
  // UI Configuration
  // ========================================
  ui: {
    minTextLength: 2,           // Min chars to show AI button
    maxTextLength: 200,         // Max selectable chars
    buttonDelay: 300,           // ms delay before showing button
    floatingButtonOffset: 8,    // px offset from selection
    popoverWidth: 400,          // px (desktop)
    popoverMobileWidth: '90vw', // Mobile width
  },

  // ========================================
  // Feature Flags
  // ========================================
  features: {
    showRelatedTerms: true,
    maxRelatedTerms: 3,
    allowCopy: true,
    allowShare: false,         // Future feature
    showProcessingTime: true,
    keyboardShortcuts: true,   // Ctrl+Shift+E
  },

  // ========================================
  // Selectable CSS Classes per Page
  // ========================================
  selectableAreas: {
    producerPortfolio: [
      '.portfolio-description',
      '.service-description',
      '.project-description',
      'p',  // All paragraphs
    ],
    projectWorkspace: [
      '.milestone-description',
      '.project-brief',
      '.deliverable-item',
    ],
    teamManagement: [
      '.role-description',
      '.member-bio',
    ],
  },
} as const;

export type PageKey = keyof typeof AI_EXPLANATION_CONFIG.enabledPages;
