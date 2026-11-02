import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import api from '../api/client';

export default function Home() {
  const [target, setTarget] = useState(null);

  useEffect(() => {
    api
      .get('/preferences')
      .then(res => setTarget(res.data ? '/dashboard' : '/onboarding'))
      .catch(() => setTarget('/onboarding'));
  }, []);

  if (!target) return <div className="center">Loading...</div>;
  return <Navigate to={target} replace />;
}
