'use client';

import React, { useRef, useEffect } from 'react';
import { Bell, Loader2 } from 'lucide-react';
import { useNotification } from '@/context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

const NotificationDropdown = () => {
  const { notifications, unreadCount, loading, hasMore, fetchNotifications, markAllAsRead, markAsSeen, loadMore } = useNotification();
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleBellClick = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      fetchNotifications(1);
    }
  };

  const handleNotificationItemClick = (notification) => {
    if (notification.status === 'unread') {
      markAsSeen(notification.id);
    }
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleBellClick}
        className="relative p-2 text-gray-600 rounded-lg hover:bg-gray-100"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 w-80 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-sm text-blue-600 hover:underline cursor-pointer"
                >
                  Mark all as read
                </button>
              )}
            </div>

            {(() => {
              if (loading && notifications.length === 0) {
                return (
                  <div key="loading" className="flex justify-center items-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                  </div>
                );
              }
              if (notifications.length === 0) {
                return (
                  <div key="empty" className="text-center text-gray-500 py-4">
                    No notifications
                  </div>
                );
              }
              return (
                <div key="notifications-container" className="max-h-96 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      onClick={() => handleNotificationItemClick(notification)}
                      className={`p-3 rounded-lg cursor-pointer ${
                        notification.status === 'unread'
                          ? 'bg-blue-50'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="font-medium">{notification.title}</div>
                      <p className="text-sm text-gray-600 mt-1">
                        {notification.message}
                      </p>
                      <span className="text-xs text-gray-500 mt-2 block">
                        {formatDistanceToNow(new Date(notification.created_at), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  ))}
                  {hasMore && (
                    <button
                      key="load-more"
                      onClick={loadMore}
                      className="w-full text-center text-sm text-blue-600 hover:underline py-2"
                    >
                      Load more
                    </button>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown; 