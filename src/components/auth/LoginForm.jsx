import { SignInIcon } from "@icons";
import useAuth from "@providers/AuthContext";
import { useState } from 'react';

const LoginForm = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const { login, isLoading, error } = useAuth();
  const [validationError, setValidationError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      setValidationError("Please enter both email and password.");
      return;
    }
    const loginData = {
      email: formData.email,
      password: formData.password
    };

    await login(loginData);
  };

  return (
    <form id="login-form" onSubmit={handleLogin} className="flex flex-col gap-4 mt-2">
    <div>
      <h2>Login</h2>
      <p className="mt-2">Welcome back!<br /> Log in to your account below.</p>
      {validationError && <p className="text-red-500 mt-2">{validationError}</p>}
    </div>
    <div className="flex flex-col gap-2">
    <label htmlFor="email">Email</label>
    <input type="email" id="email" placeholder="Enter your email" onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="border-0 border-b-2 border-primary-subtle rounded-none" />
    <label htmlFor="password">Password</label>
    <input type="password" id="password" placeholder="Enter your password" onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="border-0 border-b-2 border-primary-subtle rounded-none" />
    </div>
    <button type="submit" form="login-form" className="mt-4" disabled={isLoading}>
      Sign In <SignInIcon className="inline-block ml-2" height={20} width={20} />
    </button>
    {error && <p className="text-red-500 mt-2">{error.message || "Login failed"}</p>}
    </form>
  )
};

export default LoginForm;