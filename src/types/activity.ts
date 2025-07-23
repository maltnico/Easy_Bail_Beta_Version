export interface Activity {
  id: string;
  type: 'document' | 'payment' | 'property' | 'tenant' | 'automation' | 'incident' | 'login' | 'system';
  action: string;
  title: string;
  description: string;
  entityId?: string;
  entityType?: 'property' | 'tenant' | 'document' | 'automation' | 'incident';
  entityName?: string;
  userId: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  readAt?: Date;
  priority: 'low' | 'medium' | 'high';
  category: 'success' | 'warning' | 'error' | 'info';
}

export interface ActivityFilter {
  type?: string;
  category?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  entityType?: string;
  unreadOnly?: boolean;
}

export interface ActivityStats {
  total: number;
  unread: number;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
  recent: number; // Last 24h
}
