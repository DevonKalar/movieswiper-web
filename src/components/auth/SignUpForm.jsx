import { useState } from 'react';
import { SignInIcon, GoNextIcon, GoPrevIcon } from "@icons";
import useAuth from "@providers/AuthContext";

const SignUpForm = () => {
  const {register, error: authError } = useAuth();
  const [stage, setStage] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: ''
  });
  const [errorMessage, setErrorMessage] = useState(null);

  const handleNext = () => {
    if (stage === 1 && validateStageOne()) {
      setStage(2);
      setErrorMessage(null);
    } else {
      setErrorMessage("Please fill in all fields correctly.");
    }
  };

  const handlePrev = () => {
    if (stage > 1) {
      setStage(stage - 1);
      setErrorMessage(null);
    }
  }

  const validateStageOne = () => {
    return formData.email !== '';
  }

  const validateStageTwo = () => {
    return formData.firstName !== '' 
    && formData.lastName !== '' 
    && formData.password !== '' 
    && formData.confirmPassword !== '' 
    && formData.password === formData.confirmPassword;
  }

  const handleSignUp = async () => {
    if (!validateStageTwo()) {
      setErrorMessage("Please fill in all fields correctly.");
      return;
    }
    try {
      const userData = {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password
      };
      await register(userData);
    } catch (error) {
      setErrorMessage(error.message || "Registration failed");
    }
  };

  return (
    <>
    <div>
      <h2>Sign Up</h2>
      {authError && <p className="text-red-500 mt-2">{authError.message}</p>}
    </div>

    <div>
      <p>Step {stage} of 2</p>
      <div className="progress-track bg-primary-subtle w-full h-2 rounded-full mt-2">
        <div className="progress-indicator bg-primary h-2 rounded-full"
          style={{ width: `${(stage) * 50}%` }}>
        </div>
      </div>
    </div>

    {stage === 1 && (

      <form onSubmit={(e) => { e.preventDefault(); handleNext(); }} 
      className="flex flex-col gap-2"
      >
        <label htmlFor="email">Email</label>
        <input type="email" id="email" 
          placeholder="Email" value={formData.email} 
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="border-0 border-b-2 border-primary-subtle rounded-none" 
        />
        {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
        <button type="submit" className="mt-4">
          Continue <GoNextIcon className="inline-block ml-2" height={20} width={20} />
        </button>
      </form>
      
    )}
    {stage === 2 && (
      <form onSubmit={(e) => { e.preventDefault(); handleSignUp(); }} 
        className="flex flex-col gap-4"
      >
        <div className="flex-1 flex flex-col gap-2">
          <label htmlFor="first-name">First Name</label>
          <input type="text" id="first-name" placeholder="Enter your first name" 
            value={formData.firstName} 
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
            className="border-0 border-b-2 border-primary-subtle rounded-none"
          />
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <label htmlFor="last-name">Last Name</label>
          <input type="text" id="last-name" placeholder="Enter your last name" 
            value={formData.lastName} 
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            className="border-0 border-b-2 border-primary-subtle rounded-none" 
          />
        </div>
        <label htmlFor="password">Password</label>
        <input type="password" id="password" placeholder="Enter your password" 
          value={formData.password} 
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="border-0 border-b-2 border-primary-subtle rounded-none"
        />
        <label htmlFor="confirm-password">Confirm Password</label>
        <input type="password" id="confirm-password" placeholder="Confirm Password" 
          value={formData.confirmPassword} 
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          className="border-0 border-b-2 border-primary-subtle rounded-none"
        />
        <div className="flex flex-col gap-2">
        {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
        <button type="submit" className="mt-4">
          Create Account <SignInIcon className="inline-block ml-2" height={20} width={20} />
        </button>
        <button onClick={handlePrev} 
          className="mt-2 border-2 border-primary-muted text-primary-muted bg-transparent"
        >
          Previous <GoPrevIcon className="inline-block ml-2" height={20} width={20} />
        </button>
        </div>
      </form> 
    )}
    </>
  )

};

export default SignUpForm;