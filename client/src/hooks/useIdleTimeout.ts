import { useEffect, useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  updateLastActivity, 
  setIdleWarningShown, 
  logout,
  selectLastActivity,
  selectIdleTimeout,
  selectIsIdleWarningShown,
  selectIsAuthenticated
} from '~/redux/slices/auth.slice';

interface UseIdleTimeoutOptions {
  warningTime?: number; // Time before showing warning (default: 10 minutes)
  logoutTime?: number; // Time before auto logout (default: 15 minutes)
  onWarning?: () => void;
  onLogout?: () => void;
}

export const useIdleTimeout = (options: UseIdleTimeoutOptions = {}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const lastActivity = useSelector(selectLastActivity);
  const idleTimeout = useSelector(selectIdleTimeout);
  const isIdleWarningShown = useSelector(selectIsIdleWarningShown);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  
  const warningTime = options.warningTime || 10 * 60 * 1000; // 10 minutes
  const logoutTime = options.logoutTime || 15 * 60 * 1000; // 15 minutes
  
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const logoutTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const activityCheckRef = useRef<NodeJS.Timeout | null>(null);

  // Update activity on user interaction
  const updateActivity = useCallback(() => {
    if (isAuthenticated) {
      dispatch(updateLastActivity());
    }
  }, [dispatch, isAuthenticated]);

  // Show idle warning
  const showIdleWarning = useCallback(() => {
    if (!isIdleWarningShown && isAuthenticated) {
      dispatch(setIdleWarningShown(true));
      options.onWarning?.();
      
      // Show browser notification if supported
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Phiên đăng nhập sắp hết hạn', {
          body: 'Bạn sẽ bị đăng xuất trong 5 phút nữa nếu không hoạt động.',
          icon: '/favicon.ico',
          tag: 'idle-warning',
        });
      }
    }
  }, [dispatch, isIdleWarningShown, isAuthenticated, options]);

  // Auto logout
  const performLogout = useCallback(async () => {
    if (isAuthenticated) {
      try {
        await dispatch(logout()).unwrap();
        options.onLogout?.();
        navigate('/login', { 
          state: { 
            message: 'Phiên đăng nhập đã hết hạn do không hoạt động',
            from: window.location.pathname 
          } 
        });
      } catch (error) {
        console.error('Auto logout failed:', error);
        // Force clear auth state even if API fails
        dispatch(logout());
        navigate('/login');
      }
    }
  }, [dispatch, isAuthenticated, navigate, options]);

  // Reset timeouts
  const resetTimeouts = useCallback(() => {
    // Clear existing timeouts
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }
    if (logoutTimeoutRef.current) {
      clearTimeout(logoutTimeoutRef.current);
    }

    if (isAuthenticated) {
      const timeSinceLastActivity = Date.now() - lastActivity;
      const remainingWarningTime = Math.max(0, warningTime - timeSinceLastActivity);
      const remainingLogoutTime = Math.max(0, logoutTime - timeSinceLastActivity);

      // Set warning timeout
      if (remainingWarningTime > 0) {
        warningTimeoutRef.current = setTimeout(showIdleWarning, remainingWarningTime);
      } else if (!isIdleWarningShown) {
        // Show warning immediately if already past warning time
        showIdleWarning();
      }

      // Set logout timeout
      if (remainingLogoutTime > 0) {
        logoutTimeoutRef.current = setTimeout(performLogout, remainingLogoutTime);
      } else {
        // Logout immediately if already past logout time
        performLogout();
      }
    }
  }, [
    isAuthenticated,
    lastActivity,
    warningTime,
    logoutTime,
    isIdleWarningShown,
    showIdleWarning,
    performLogout
  ]);

  // Activity check interval
  const startActivityCheck = useCallback(() => {
    if (activityCheckRef.current) {
      clearInterval(activityCheckRef.current);
    }

    if (isAuthenticated) {
      // Check activity every 30 seconds
      activityCheckRef.current = setInterval(() => {
        const timeSinceLastActivity = Date.now() - lastActivity;
        
        if (timeSinceLastActivity >= logoutTime) {
          performLogout();
        } else if (timeSinceLastActivity >= warningTime && !isIdleWarningShown) {
          showIdleWarning();
        }
      }, 30000); // 30 seconds
    }
  }, [isAuthenticated, lastActivity, warningTime, logoutTime, isIdleWarningShown, showIdleWarning, performLogout]);

  // Event listeners for user activity
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'focus',
      'visibilitychange'
    ];

    const handleActivity = () => {
      updateActivity();
      resetTimeouts();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // User returned to the page
        updateActivity();
        resetTimeouts();
      } else {
        // User left the page - start logout timer
        if (logoutTimeoutRef.current) {
          clearTimeout(logoutTimeoutRef.current);
        }
        logoutTimeoutRef.current = setTimeout(performLogout, 5 * 60 * 1000); // 5 minutes when page is hidden
      }
    };

    // Add event listeners
    events.forEach(event => {
      if (event === 'visibilitychange') {
        document.addEventListener(event, handleVisibilityChange);
      } else {
        document.addEventListener(event, handleActivity, true);
      }
    });

    // Start activity check
    startActivityCheck();

    // Initial timeout setup
    resetTimeouts();

    // Cleanup
    return () => {
      events.forEach(event => {
        if (event === 'visibilitychange') {
          document.removeEventListener(event, handleVisibilityChange);
        } else {
          document.removeEventListener(event, handleActivity, true);
        }
      });

      if (activityCheckRef.current) {
        clearInterval(activityCheckRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      if (logoutTimeoutRef.current) {
        clearTimeout(logoutTimeoutRef.current);
      }
    };
  }, [isAuthenticated, updateActivity, resetTimeouts, startActivityCheck, performLogout]);

  // Reset timeouts when authentication state changes
  useEffect(() => {
    if (isAuthenticated) {
      resetTimeouts();
      startActivityCheck();
    } else {
      // Clear all timeouts when not authenticated
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
      if (logoutTimeoutRef.current) {
        clearTimeout(logoutTimeoutRef.current);
      }
      if (activityCheckRef.current) {
        clearInterval(activityCheckRef.current);
      }
    }
  }, [isAuthenticated, resetTimeouts, startActivityCheck]);

  // Return functions for manual control
  return {
    updateActivity,
    showIdleWarning,
    performLogout,
    resetTimeouts,
    isIdleWarningShown,
    timeUntilWarning: Math.max(0, warningTime - (Date.now() - lastActivity)),
    timeUntilLogout: Math.max(0, logoutTime - (Date.now() - lastActivity)),
  };
};