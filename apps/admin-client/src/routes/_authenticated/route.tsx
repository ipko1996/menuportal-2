import {
  createFileRoute,
  useNavigate,
  useRouter,
} from '@tanstack/react-router';
import { AuthenticatedLayout } from '@/components/layout/authenticated-layout';
import { useAuth } from '@clerk/clerk-react';
import { useState, useEffect } from 'react';

export const Route = createFileRoute('/_authenticated')({
  component: AuthenticatedRoute,
});

const COUNTDOWN = 5; // Countdown seconds

function AuthenticatedRoute() {
  const { isLoaded, isSignedIn, getToken } = useAuth();

  if (!isLoaded) {
    return (
      <div className="flex h-svh items-center justify-center">
        <div className="border-primary size-8 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    );
  }

  if (!isSignedIn) {
    return <Unauthorized />;
  }

  return <AuthenticatedLayout />;
}

function Unauthorized() {
  const navigate = useNavigate();
  const { history } = useRouter();

  const [cancelled, setCancelled] = useState(false);
  const [countdown, setCountdown] = useState(COUNTDOWN);

  // Set and run the countdown
  useEffect(() => {
    if (cancelled) return;
    const interval = setInterval(() => {
      setCountdown(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [cancelled]);

  // Navigate to sign-in page when countdown hits 0
  useEffect(() => {
    if (countdown > 0) return;
    navigate({ to: '/clerk/sign-in' }); // Adjust this path to your sign-in route
  }, [countdown, navigate]);

  return (
    <div className="h-svh">
      <div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
        <h1 className="text-[7rem] leading-tight font-bold">401</h1>
        <span className="font-medium">Unauthorized Access</span>
        <p className="text-muted-foreground text-center">
          You must be authenticated to access this resource.
        </p>
        <div className="mt-6 flex gap-4">
          <button
            className="border-border hover:bg-accent rounded-md border px-4 py-2"
            onClick={() => history.go(-1)}
          >
            Go Back
          </button>
          <button
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2"
            onClick={() => navigate({ to: '/clerk/sign-up' })}
          >
            Sign In
          </button>
        </div>
        <div className="mt-4 h-8 text-center">
          {!cancelled && (
            <>
              <p className="text-muted-foreground text-sm">
                {countdown > 0
                  ? `Redirecting to Sign In page in ${countdown}s`
                  : `Redirecting...`}
              </p>
              <button
                className="text-primary text-sm hover:underline"
                onClick={() => setCancelled(true)}
              >
                Cancel Redirect
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
