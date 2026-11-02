import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Gauge,
  LoaderCircle,
  Search,
  SearchX,
  Shield,
  ShieldCheck,
  Trash2,
  UserRound,
  Users,
} from 'lucide-react';
import { getApiErrorMessage } from '../../api/errors';
import { deleteUser, listUsers, updateUserRole } from '../../api/users';
import { AdminPageHeader, AdminStat, ConfirmDialog } from '../../components/AdminUI';
import { EmptyState } from '../../components/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import type { User, UserRole } from '../../types';
import { cn } from '../../utils/cn';
import { formatDate, getInitials, pluralize } from '../../utils/format';

const CLIENT_LIMIT = 1000;

export function UsersAdmin() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [roleTarget, setRoleTarget] = useState<User | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await listUsers();
      setUsers(result);
    } catch (loadError) {
      setError(getApiErrorMessage(loadError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const filteredUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return users;
    return users.filter(
      (member) =>
        member.email.toLowerCase().includes(normalized) ||
        String(member.id) === normalized,
    );
  }, [users, query]);

  const clients = users.filter((member) => member.role === 'client');
  const admins = users.filter((member) => member.role === 'admin');
  const capacity = Math.min(100, (clients.length / CLIENT_LIMIT) * 100);
  const atLimit = clients.length >= CLIENT_LIMIT;

  const nextRole = (role: UserRole): UserRole =>
    role === 'admin' ? 'client' : 'admin';

  const changeRole = async () => {
    if (!roleTarget) return;
    const newRole = nextRole(roleTarget.role);
    setBusyId(roleTarget.id);
    try {
      await updateUserRole(roleTarget.id, newRole);
      addToast({
        title: newRole === 'admin' ? 'Admin access granted' : 'Admin access removed',
        message:
          newRole === 'admin'
            ? `${roleTarget.email} can now manage the store.`
            : `${roleTarget.email} is now a store member.`,
        tone: 'success',
      });
      setRoleTarget(null);
      await loadUsers();
    } catch (roleError) {
      addToast({
        title: 'Could not update access',
        message: getApiErrorMessage(roleError),
        tone: 'error',
      });
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await deleteUser(deleteTarget.id);
      addToast({
        title: 'Account removed',
        message: `${deleteTarget.email} no longer has access to Purelis.`,
        tone: 'success',
      });
      setDeleteTarget(null);
      await loadUsers();
    } catch (deleteError) {
      addToast({
        title: 'Could not remove account',
        message: getApiErrorMessage(deleteError),
        tone: 'error',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div>
      <AdminPageHeader
        eyebrow="People"
        title="Members"
        description="A small, thoughtful community. Manage roles and keep the member count within its calm limits."
      />

      <div className="mt-7 grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">
        <AdminStat
          icon={Users}
          label="Accounts"
          value={users.length}
          detail="Admins and members"
          tone="sage"
        />
        <AdminStat
          icon={UserRound}
          label="Clients"
          value={clients.length}
          detail={`Of ${CLIENT_LIMIT.toLocaleString('en-IN')} members`}
          tone="sand"
        />
        <AdminStat
          icon={ShieldCheck}
          label="Admins"
          value={admins.length}
          detail="Store access holders"
        />
        <AdminStat
          icon={Gauge}
          label="Member room"
          value={`${Math.max(0, CLIENT_LIMIT - clients.length)}`}
          detail={atLimit ? 'Registrations are closed' : 'New registrations open'}
          tone={atLimit ? 'warning' : 'default'}
        />
      </div>

      <section className="mt-4 rounded-card border border-white/60 bg-calm-ivory p-5 shadow-card">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-display text-[8px] font-semibold uppercase tracking-[0.18em] text-calm-muted">
              Member capacity
            </p>
            <p className="mt-1 text-[11px] text-calm-body">
              {pluralize(clients.length, 'client')} of{' '}
              {CLIENT_LIMIT.toLocaleString('en-IN')} · admins are excluded
            </p>
          </div>
          <p className="font-serif text-lg text-calm-ink">
            {atLimit ? 'Full' : `${Math.round(capacity)}%`}
          </p>
        </div>
        <div className="mt-3 h-3 overflow-hidden rounded-full bg-calm-track">
          <div
            className={cn(
              'h-full min-w-[3px] rounded-full transition-all duration-500',
              atLimit ? 'bg-[#A75B44]' : 'bg-calm-sage',
            )}
            style={{ width: `${Math.max(0.4, capacity)}%` }}
          />
        </div>
        {atLimit ? (
          <p className="mt-3 text-[10px] leading-5 text-[#9B6049]">
            Registrations are closed until a client account is removed.
          </p>
        ) : null}
      </section>

      <section className="mt-6 rounded-card border border-white/60 bg-calm-ivory shadow-card">
        <div className="flex flex-col gap-3 border-b border-calm-sand/35 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-[9px] font-semibold uppercase tracking-[0.16em] text-calm-ink">
              The people
            </p>
            <p className="mt-1 text-[10px] text-calm-muted">
              {filteredUsers.length} matching {filteredUsers.length === 1 ? 'account' : 'accounts'}
            </p>
          </div>
          <label className="flex h-10 w-full items-center gap-2 rounded-full border border-calm-sand/60 bg-white/75 px-4 sm:w-64">
            <Search size={14} className="shrink-0 text-calm-muted" />
            <span className="sr-only">Search members</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by email or ID"
              className="min-w-0 flex-1 bg-transparent text-xs text-calm-ink outline-none"
            />
          </label>
        </div>

        {isLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 5 }, (_, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className="skeleton h-10 w-10 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-3 w-1/3" />
                  <div className="skeleton h-2.5 w-1/5" />
                </div>
                <div className="skeleton h-3 w-16" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-5">
            <EmptyState
              calm
              icon={AlertTriangle}
              title="Could not load the member list"
              message={error}
              action={
                <button type="button" onClick={() => void loadUsers()} className="btn-calm">
                  Try again
                </button>
              }
              className="border-0 bg-transparent py-10"
            />
          </div>
        ) : users.length === 0 ? (
          <div className="p-5">
            <EmptyState
              calm
              icon={Users}
              title="No members yet"
              message="New client accounts will appear here as they join the store."
              className="border-0 bg-transparent py-10"
            />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-5">
            <EmptyState
              calm
              icon={SearchX}
              title="No members match"
              message="Try a different email address or account ID."
              action={
                <button type="button" onClick={() => setQuery('')} className="btn-calm-secondary">
                  Clear search
                </button>
              }
              className="border-0 bg-transparent py-10"
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left">
              <thead>
                <tr className="border-b border-calm-sand/35 text-[8px] uppercase tracking-[0.14em] text-calm-muted">
                  <th className="px-5 py-3 font-semibold">Member</th>
                  <th className="px-4 py-3 font-semibold">ID</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Joined</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-calm-sand/25">
                {filteredUsers.map((member) => {
                  const isSelf = member.id === currentUser?.id;
                  const isBusy = busyId === member.id;
                  return (
                    <tr key={member.id} className="transition hover:bg-white/45">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <span className="relative grid h-10 w-10 shrink-0 place-items-center rounded-full bg-calm-sand/45 font-display text-[9px] font-semibold text-calm-ink">
                            {getInitials(member.email)}
                            <span className="absolute right-0 top-0 h-2.5 w-2.5 rounded-full bg-calm-online ring-2 ring-calm-ivory" />
                          </span>
                          <div className="min-w-0">
                            <p className="flex items-center gap-2 text-xs font-medium text-calm-ink">
                              <span className="max-w-[250px] truncate">{member.email}</span>
                              {isSelf ? (
                                <span className="rounded-full bg-calm-mist px-2 py-0.5 font-display text-[6.5px] font-semibold uppercase tracking-[0.12em] text-calm-sage">
                                  You
                                </span>
                              ) : null}
                            </p>
                            <p className="mt-0.5 font-display text-[7.5px] uppercase tracking-[0.12em] text-calm-muted">
                              Purelis account
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-[10px] text-calm-muted">
                        #{String(member.id).padStart(3, '0')}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-display text-[7.5px] font-semibold uppercase tracking-[0.1em]',
                            member.role === 'admin'
                              ? 'bg-calm-sage text-white'
                              : 'bg-calm-mist text-calm-sage',
                          )}
                        >
                          {member.role === 'admin' ? (
                            <Shield size={9} />
                          ) : (
                            <UserRound size={9} />
                          )}
                          {member.role}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-[10px] text-calm-muted">
                        {formatDate(member.createdAt)}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setRoleTarget(member)}
                            disabled={isSelf || isBusy}
                            aria-label={
                              member.role === 'admin'
                                ? `Remove admin access from ${member.email}`
                                : `Give admin access to ${member.email}`
                            }
                            className="flex h-8 items-center gap-1.5 rounded-full px-3 text-[8px] font-medium text-calm-muted transition hover:bg-white hover:text-calm-ink disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            {isBusy ? (
                              <LoaderCircle size={13} className="animate-spin" />
                            ) : member.role === 'admin' ? (
                              <UserRound size={13} />
                            ) : (
                              <Shield size={13} />
                            )}
                            {member.role === 'admin' ? 'Make client' : 'Make admin'}
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(member)}
                            disabled={isSelf}
                            aria-label={`Delete ${member.email}`}
                            className="grid h-8 w-8 place-items-center rounded-full text-calm-muted transition hover:bg-[#F5E9E4] hover:text-[#9B6049] disabled:cursor-not-allowed disabled:opacity-30"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <ConfirmDialog
        open={Boolean(roleTarget)}
        title={
          roleTarget?.role === 'admin'
            ? 'Remove admin access?'
            : 'Give admin access?'
        }
        description={
          roleTarget
            ? roleTarget.role === 'admin'
              ? `${roleTarget.email} will return to a client account and lose access to the store console.`
              : `${roleTarget.email} will be able to manage products and members across the entire store.`
            : ''
        }
        confirmLabel={
          roleTarget?.role === 'admin' ? 'Remove access' : 'Grant admin access'
        }
        onClose={() => setRoleTarget(null)}
        onConfirm={() => void changeRole()}
        isBusy={busyId === roleTarget?.id}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Remove this account?"
        description={
          deleteTarget
            ? `${deleteTarget.email} will lose access immediately. Their cart and payment records are removed too. This cannot be undone.`
            : ''
        }
        confirmLabel="Remove account"
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => void handleDelete()}
        isBusy={isDeleting}
        destructive
      />
    </div>
  );
}
