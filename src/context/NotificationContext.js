'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_BASE_URL}`;

export function NotificationProvider({ children }) {
  const { user, token } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchNotifications = async (pageNum = 1, status = 'all') => {
    if (!user || !token) return;

    try {
      const response = await axios.get(
        `${API_BASE_URL}/notification/employee/${user.id}?page=${pageNum}&per_page=10${status !== 'all' ? `&status=${status}` : ''}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.code === 200) {
        if (pageNum === 1) {
          setNotifications(response.data.notifications);
        } else {
          setNotifications(prev => [...prev, ...response.data.notifications]);
        }
        setUnreadCount(response.data.unread_count || 0);
        setHasMore(response.data.notifications.length === 10);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    if (!user || !token) return;

    try {
      const response = await axios.put(
        `${API_BASE_URL}/notification/employee/${user.id}/mark-all-read`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.code === 200) {
        setUnreadCount(0);
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, status: 'read' }))
        );
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  const markAsSeen = async (notificationId) => {
    if (!user || !token) return;

    try {
      const response = await axios.put(
        `${API_BASE_URL}/notification/employee/${user.id}/mark-seen/${notificationId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (response.data.code === 200) {
        setNotifications(prev => 
          prev.map(notification => 
            notification.id === notificationId 
              ? { ...notification, status: 'read' }
              : notification
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (error) {
      console.error('Error marking notification as seen:', error);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
    }
  };

  useEffect(() => {
    if (user && token) {
      fetchNotifications(page);
    }
  }, [user, token, page]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        loading,
        hasMore,
        fetchNotifications,
        markAllAsRead,
        markAsSeen,
        loadMore
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => useContext(NotificationContext); 