import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { getApiError, getApiErrorMessage } from '../api/errors';
import { AuthShell } from '../components/AuthShell';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { cn } from '../utils/cn';

const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email'),
  password: z.string().min(1, 'Password is required').max(72, 'Password is too long'),
});

type LoginValues = z.infer<typeof loginSchema>;

interface LoginLocationState {
  from?: string;
}

export function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { login, user } = useAuth();
  const { addToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const state = location.state as LoginLocationState | null;
  const requestedPath =
    state?.from?.startsWith('/') && !state.from.startsWith('//')
      ? state.from
      : null;

  const destinationFor = (role: 'admin' | 'client') => {
    if (role === 'admin') {
      return requestedPath?.startsWith('/admin')
        ? requestedPath
        : '/admin/products';
    }
    return requestedPath && !requestedPath.startsWith('/admin')
      ? requestedPath
      : '/';
  };

  if (user) {
    return <Navigate to={destinationFor(user.role)} replace />;
  }

  const onSubmit = async (values: LoginValues) => {
    setServerError(null);
    try {
      const nextUser = await login(values.email, values.password);
      addToast({
        title: nextUser.role === 'admin' ? 'Welcome back, admin' : 'Welcome back',
        message:
          nextUser.role === 'admin'
            ? 'Your store is ready when you are.'
            : 'Your Purelis ritual is right where you left it.',
        tone: 'success',
      });
      navigate(destinationFor(nextUser.role), { replace: true });
    } catch (error) {
      const apiError = getApiError(error);
      if (apiError?.statusCode === 429) {
        setServerError(
          'Too many sign-in attempts. Please wait a minute before trying again.',
        );
      } else {
        setServerError(getApiErrorMessage(error));
      }
    }
  };

  return (
    <AuthShell
      eyebrow="Welcome back"
      title="Step back into your ritual."
      subtitle="Sign in to find your bag, revisit your essentials and continue where you left off."
      footer={
        <>
          New to Purelis?{' '}
          <Link
            to="/signup"
            className="font-medium text-calm-sage underline decoration-calm-sage/35 underline-offset-4 transition hover:text-calm-ink"
          >
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
        {serverError ? (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl border border-[#B8674F]/20 bg-[#F7EDE8] px-4 py-3 text-[#8D4D38]"
          >
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <p className="text-xs leading-5">{serverError}</p>
          </div>
        ) : null}

        <div>
          <label htmlFor="login-email" className="label-calm">
            Email address
          </label>
          <div className="relative">
            <Mail
              size={16}
              strokeWidth={1.5}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-calm-muted"
            />
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              aria-invalid={Boolean(errors.email)}
              className={cn(
                'input-calm pl-11',
                errors.email && 'border-[#B8674F]/55 focus:border-[#B8674F]',
              )}
              {...register('email')}
            />
          </div>
          {errors.email ? (
            <p className="mt-1.5 text-[11px] text-[#A15842]">{errors.email.message}</p>
          ) : null}
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-3">
            <label htmlFor="login-password" className="label-calm !mb-0">
              Password
            </label>
            <span className="text-[10px] text-calm-muted">8–72 characters</span>
          </div>
          <div className="relative">
            <LockKeyhole
              size={16}
              strokeWidth={1.5}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-calm-muted"
            />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter your password"
              aria-invalid={Boolean(errors.password)}
              className={cn(
                'input-calm px-11',
                errors.password && 'border-[#B8674F]/55 focus:border-[#B8674F]',
              )}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((show) => !show)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-calm-muted transition hover:bg-calm-mist hover:text-calm-ink"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password ? (
            <p className="mt-1.5 text-[11px] text-[#A15842]">{errors.password.message}</p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-calm mt-1 w-full"
        >
          {isSubmitting ? (
            <>
              <LoaderCircle size={15} className="animate-spin" />
              Signing in
            </>
          ) : (
            <>
              Sign in
              <ArrowRight size={15} />
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-2 rounded-2xl bg-calm-mist/55 px-4 py-3 text-calm-sage">
          <ShieldCheck size={14} strokeWidth={1.5} />
          <p className="text-[10px] leading-5">
            Your password is encrypted and never shared.
          </p>
        </div>
      </form>
    </AuthShell>
  );
}
