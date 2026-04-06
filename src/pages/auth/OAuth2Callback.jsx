import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Spinner from '../../components/common/Spinner';

export default function OAuth2CallbackPage() {
  const [params] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const token = params.get('token');
    const email = params.get('email');
    const name = params.get('name');
    if (token) {
      login({ email, fullName: name, role: 'CUSTOMER' }, token);
      navigate('/', { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, []);

  return <div className="min-h-screen flex items-center justify-center"><Spinner size="lg" /></div>;
}
