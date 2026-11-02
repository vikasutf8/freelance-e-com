import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { getApiError, getApiErrorMessage } from '../api/errors';
import { AuthShell } from '../components/AuthShell';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { cn } from '../utils/cn';

const signupSchema = z
  .object({
    email: z.string().trim().min(1, 'Email is required').email('Enter a valid email'),
    password: z
      .string()
      .min(8, 'Use at least 8 characters')
      .max(72, 'Password must be 72 characters or fewer'),
    confirmPassword: z.string().min(1, 'Confirm your password'),
    terms: z.boolean().refine((accepted) => accepted, {
      message: 'Please accept the terms to continue',
    }),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type SignupValues = z.infer<typeof signupSchema>;

export function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isClosed, setIsClosed] = useState(false);
  const { register: registerUser, user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      terms: false,
    },
  });

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin/products' : '/'} replace />;
  }

  const onSubmit = async (values: SignupValues) => {
    setServerError(null);
    setIsClosed(false);
    try {
      await registerUser(values.email, values.password);
      addToast({
        title: 'Your ritual begins',
        message: 'Your Purelis account is ready. Time to find your essentials.',
        tone: 'success',
      });
      navigate('/', { replace: true });
    } catch (error) {
      const apiError = getApiError(error);
      if (apiError?.statusCode === 403) {
        setIsClosed(true);
        setServerError(
          'Registrations are currently closed. We have reached our member limit, but your skin ritual can wait for us.',
        );
      } else {
        setServerError(getApiErrorMessage(error));
      }
    }
  };

  return (
    <AuthShell
      eyebrow="Join the ritual"
      title="A place for your everyday essentials."
      subtitle="Create your account to build a bag, keep your favourites close and check out simply with UPI."
      footer={
        <>
          Already a member?{' '}
          <Link
            to="/login"
            className="font-medium text-calm-sage underline decoration-calm-sage/35 underline-offset-4 transition hover:text-calm-ink"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
        {serverError ? (
          <div
            role="alert"
            className={cn(
              'flex items-start gap-3 rounded-2xl border px-4 py-3',
              isClosed
                ? 'border-calm-sand/60 bg-calm-mist/60 text-calm-body'
                : 'border-[#B8674F]/20 bg-[#F7EDE8] text-[#8D4D38]',
            )}
          >
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <div className="text-xs leading-5">
              <p className="font-semibold">
                {isClosed ? 'Membership is paused' : 'Could not create account'}
              </p>
              <p className="mt-0.5 opacity-90">{serverError}</p>
            </div>
          </div>
        ) : null}

        <div>
          <label htmlFor="signup-email" className="label-calm">
            Email address
          </label>
          <div className="relative">
            <Mail
              size={16}
              strokeWidth={1.5}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-calm-muted"
            />
            <input
              id="signup-email"
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
          <label htmlFor="signup-password" className="label-calm">
            Password
          </label>
          <div className="relative">
            <LockKeyhole
              size={16}
              strokeWidth={1.5}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-calm-muted"
            />
            <input
              id="signup-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="At least 8 characters"
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

        <div>
          <label htmlFor="signup-confirm" className="label-calm">
            Confirm password
          </label>
          <div className="relative">
            <Check
              size={16}
              strokeWidth={1.5}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-calm-muted"
            />
            <input
              id="signup-confirm"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="Repeat your password"
              aria-invalid={Boolean(errors.confirmPassword)}
              className={cn(
                'input-calm pl-11',
                errors.confirmPassword && 'border-[#B8674F]/55 focus:border-[#B8674F]',
              )}
              {...register('confirmPassword')}
            />
          </div>
          {errors.confirmPassword ? (
            <p className="mt-1.5 text-[11px] text-[#A15842]">
              {errors.confirmPassword.message}
            </p>
          ) : null}
        </div>

        <div>
          <label className="flex cursor-pointer items-start gap-3 py-1">
            <input
              type="checkbox"
              className="mt-0.5 h-4 w-4 shrink-0 rounded border-calm-sand accent-calm-sage"
              {...register('terms')}
            />
            <span className="text-[10.5px] leading-5 text-calm-muted">
              I agree to the{' '}
              <Link
                to="/info/terms"
                className="font-medium text-calm-sage underline underline-offset-2"
              >
                terms
              </Link>{' '}
              and{' '}
              <Link
                to="/info/privacy"
                className="font-medium text-calm-sage underline underline-offset-2"
              >
                privacy policy
              </Link>
              .
            </span>
          </label>
          {errors.terms ? (
            <p className="mt-1 text-[11px] text-[#A15842]">{errors.terms.message}</p>
          ) : null}
        </div>

        <button type="submit" disabled={isSubmitting} className="btn-calm w-full">
          {isSubmitting ? (
            <>
              <LoaderCircle size={15} className="animate-spin" />
              Creating your account
            </>
          ) : (
            <>
              Create account
              <ArrowRight size={15} />
            </>
          )}
        </button>
      </form>
    </AuthShell>
  );
}
