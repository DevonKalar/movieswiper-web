import { useState } from 'react';
import useAuth from '@providers/AuthContext';
import type { UpdateAccountData } from '@/types/auth';

const AccountSettingsForm = () => {
  const { user, updateAccount, isLoading, error } = useAuth();
  const [formData, setFormData] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
    password: '',
  });
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    const payload: UpdateAccountData = {};
    if (formData.firstName) payload.firstName = formData.firstName;
    if (formData.lastName)  payload.lastName  = formData.lastName;
    if (formData.email)     payload.email     = formData.email;
    if (formData.password)  payload.password  = formData.password;
    await updateAccount(payload);
    setSuccessMsg('Account updated successfully.');
    setFormData(p => ({ ...p, password: '' }));
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <p className="text-red-500">{error.message}</p>}
      {successMsg && <p className="text-green-500">{successMsg}</p>}
      <label htmlFor="account-first">First Name</label>
      <input
        id="account-first"
        type="text"
        value={formData.firstName}
        onChange={e => setFormData(p => ({ ...p, firstName: e.target.value }))}
        className="border-0 border-b-2 border-primary-subtle rounded-none"
      />
      <label htmlFor="account-last">Last Name</label>
      <input
        id="account-last"
        type="text"
        value={formData.lastName}
        onChange={e => setFormData(p => ({ ...p, lastName: e.target.value }))}
        className="border-0 border-b-2 border-primary-subtle rounded-none"
      />
      <label htmlFor="account-email">Email</label>
      <input
        id="account-email"
        type="email"
        value={formData.email}
        onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
        className="border-0 border-b-2 border-primary-subtle rounded-none"
      />
      <label htmlFor="account-password">
        New Password{' '}
        <span className="type-label-sm text-text-muted">(leave blank to keep current)</span>
      </label>
      <input
        id="account-password"
        type="password"
        placeholder="New password (optional)"
        value={formData.password}
        onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
        className="border-0 border-b-2 border-primary-subtle rounded-none"
      />
      <button type="submit" disabled={isLoading} className="mt-4">
        Save Changes
      </button>
    </form>
  );
};

export default AccountSettingsForm;
