import React, { useEffect, useState } from 'react';
import styles from './NewsFeed.module.css';

interface NewsItem {
  id: string;
  headline: string;
  summary: string;
  source: string;
  publishedAt: string;
  url: string;
  category: 'breaking' | 'injury' | 'transaction' | 'recap' | 'general';
  teamIds?: string[];
}

interface NewsFeedProps {
  limit?: number;
  category?: string;
  teamId?: string;
}

export const NewsFeed: React.FC<NewsFeedProps> = ({ 
  limit = 5,
  category,
  teamId
}) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock data
        const mockNews: NewsItem[] = [
          {
            id: 'news-1',
            headline: 'Chiefs clinch playoff spot with last-minute win over Raiders',
            summary: 'Patrick Mahomes led a 75-yard drive in the final two minutes to secure a 24-21 victory and a playoff berth.',
            source: 'NFL.com',
            publishedAt: '2025-05-29T08:30:00Z',
            url: '#',
            category: 'recap',
            teamIds: ['KC', 'LV']
          },
          {
            id: 'news-2',
            headline: '49ers defense dominates in shutout victory against Seahawks',
            summary: 'San Francisco held Seattle to just 187 total yards in a 27-0 win at Levi\'s Stadium.',
            source: 'ESPN',
            publishedAt: '2025-05-29T07:15:00Z',
            url: '#',
            category: 'recap',
            teamIds: ['SF', 'SEA']
          },
          {
            id: 'news-3',
            headline: 'Eagles announce Jalen Hurts as starting QB for Week 10',
            summary: 'After missing two games with a shoulder injury, Hurts has been cleared to return against the Cowboys.',
            source: 'NFL Network',
            publishedAt: '2025-05-28T22:45:00Z',
            url: '#',
            category: 'injury',
            teamIds: ['PHI']
          },
          {
            id: 'news-4',
            headline: 'Bengals trade for veteran cornerback before deadline',
            summary: 'Cincinnati acquired Pro Bowl cornerback Marcus Peters from the Ravens for a 2026 third-round pick.',
            source: 'CBS Sports',
            publishedAt: '2025-05-28T19:20:00Z',
            url: '#',
            category: 'transaction',
            teamIds: ['CIN', 'BAL']
          },
          {
            id: 'news-5',
            headline: 'Bills activate Von Miller from injured reserve',
            summary: 'The star pass rusher is expected to play Sunday after completing his recovery from a knee injury.',
            source: 'NFL.com',
            publishedAt: '2025-05-28T16:10:00Z',
            url: '#',
            category: 'injury',
            teamIds: ['BUF']
          },
          {
            id: 'news-6',
            headline: 'NFL announces schedule changes for Week 12',
            summary: 'Two games have been flexed to primetime slots due to playoff implications.',
            source: 'NFL Communications',
            publishedAt: '2025-05-28T14:30:00Z',
            url: '#',
            category: 'general'
          },
          {
            id: 'news-7',
            headline: 'Chargers place starting left tackle on IR',
            summary: 'Rashawn Slater will miss at least four games with a pectoral injury suffered in practice.',
            source: 'ESPN',
            publishedAt: '2025-05-28T12:45:00Z',
            url: '#',
            category: 'injury',
            teamIds: ['LAC']
          }
        ];
        
        // Filter by category if provided
        let filteredNews = mockNews;
        if (category) {
          filteredNews = filteredNews.filter(item => item.category === category);
        }
        
        // Filter by team if provided
        if (teamId) {
          filteredNews = filteredNews.filter(item => 
            item.teamIds && item.teamIds.includes(teamId)
          );
        }
        
        setNews(filteredNews.slice(0, limit));
        setLoading(false);
      } catch (err) {
        setError('Failed to load news');
        setLoading(false);
        console.error('Error fetching news:', err);
      }
    };

    fetchNews();
  }, [limit, category, teamId]);

  // Format date to relative time (e.g., "2 hours ago")
  const formatRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`;
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  // Get category badge class
  const getCategoryClass = (category: string): string => {
    switch(category) {
      case 'breaking':
        return styles.badgeBreaking;
      case 'injury':
        return styles.badgeInjury;
      case 'transaction':
        return styles.badgeTransaction;
      case 'recap':
        return styles.badgeRecap;
      default:
        return styles.badgeGeneral;
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}></div>
        <p>Loading news...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p>{error}</p>
        <button 
          className={styles.retryButton}
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={styles.newsFeedContainer}>
      {news.length === 0 ? (
        <p className={styles.noNewsMessage}>No news articles available</p>
      ) : (
        <ul className={styles.newsList}>
          {news.map(item => (
            <li key={item.id} className={styles.newsItem}>
              <div className={styles.newsHeader}>
                <span className={`${styles.categoryBadge} ${getCategoryClass(item.category)}`}>
                  {item.category.toUpperCase()}
                </span>
                <span className={styles.timestamp}>{formatRelativeTime(item.publishedAt)}</span>
              </div>
              <h3 className={styles.headline}>{item.headline}</h3>
              <p className={styles.summary}>{item.summary}</p>
              <div className={styles.newsFooter}>
                <span className={styles.source}>{item.source}</span>
                <a href={item.url} className={styles.readMoreLink} target="_blank" rel="noopener noreferrer">
                  Read More
                </a>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NewsFeed;
