import { useState } from 'react';
import { SignInIcon } from '@icons';
import useAuth from '@providers/AuthContext';
import type { PromoteAccountData } from '@/types/auth';

interface PromoteAccountFormProps {
  onSuccess?: () => void;
}

const PromoteAccountForm = ({ onSuccess }: PromoteAccountFormProps) => {
  const { promoteAccount, isLoading, error } = useAuth();
  const [formData, setFormData] = useState<PromoteAccountData>({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.email || !formData.firstName || !formData.lastName || !formData.password) {
      setValidationError('All fields are required.');
      return;
    }
    setValidationError(null);
    await promoteAccount(formData);
    onSuccess?.();
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {validationError && <p className="text-red-500">{validationError}</p>}
      {error && <p className="text-red-500">{error.message}</p>}
      <label htmlFor="promote-email">Email</label>
      <input
        id="promote-email"
        type="email"
        placeholder="Enter your email"
        value={formData.email}
        onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
        className="border-0 border-b-2 border-primary-subtle rounded-none"
      />
      <label htmlFor="promote-first">First Name</label>
      <input
        id="promote-first"
        type="text"
        placeholder="Enter your first name"
        value={formData.firstName}
        onChange={e => setFormData(p => ({ ...p, firstName: e.target.value }))}
        className="border-0 border-b-2 border-primary-subtle rounded-none"
      />
      <label htmlFor="promote-last">Last Name</label>
      <input
        id="promote-last"
        type="text"
        placeholder="Enter your last name"
        value={formData.lastName}
        onChange={e => setFormData(p => ({ ...p, lastName: e.target.value }))}
        className="border-0 border-b-2 border-primary-subtle rounded-none"
      />
      <label htmlFor="promote-password">Password</label>
      <input
        id="promote-password"
        type="password"
        placeholder="Create a password"
        value={formData.password}
        onChange={e => setFormData(p => ({ ...p, password: e.target.value }))}
        className="border-0 border-b-2 border-primary-subtle rounded-none"
      />
      <button type="submit" disabled={isLoading} className="mt-4">
        Create Account <SignInIcon className="inline-block ml-2" height={20} width={20} />
      </button>
    </form>
  );
};

export default PromoteAccountForm;
