import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '../store/authStore';

export const SessionExpiredModal = () => {
  const navigate = useNavigate();
  const { showSessionExpired, setShowSessionExpired, logout } = useAuthStore();

  useEffect(() => {
    const handleSessionExpired = () => {
      setShowSessionExpired(true);
    };

    window.addEventListener('session-expired', handleSessionExpired);

    return () => {
      window.removeEventListener('session-expired', handleSessionExpired);
    };
  }, [setShowSessionExpired]);

  const handleClose = () => {
    setShowSessionExpired(false);
    logout();
    navigate('/login');
  };

  return (
    <Dialog open={showSessionExpired} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Session Expired</DialogTitle>
          <DialogDescription>
            Your session has expired. Please log in again to continue.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={handleClose}>Go to Login</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};