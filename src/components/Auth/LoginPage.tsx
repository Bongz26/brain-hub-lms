import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { supabase } from '../../lib/supabase';
import { useNavigate, Link } from 'react-router-dom';

interface LoginForm {
  email: string;
  password: string;
}

const LoginPage: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit: SubmitHandler<LoginForm> = async (data) => {
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
    if (error) {
      setError(error.message);
    } else {
      navigate('/dashboard');
    }
    setLoading(false);
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = 'student1@example.com'; // Replace with desired email
    const password = 'StudentPass123!'; // Replace with desired password
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      setError(error.message);
    } else {
      alert('Signup successful! Check your email for confirmation.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md transform transition-all duration-300">
        <h1 className="text-3xl font-bold text-center mb-4 text-blue-600">Katleho MyTutor</h1>
        <h2 className="text-xl font-semibold text-center mb-6 text-gray-700">Log In to Your Account</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              {...register('email', { required: 'Email is required' })}
              className="block w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              {...register('password', { required: 'Password is required' })}
              className="block w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 disabled:bg-blue-300 transition-colors duration-200"
          >
            {loading ? 'Logging In...' : 'Log In'}
          </button>
        </form>
        <p className="text-center mt-4 text-sm text-gray-600">
          <Link to="/forgot-password" className="text-blue-600 hover:underline">Forgot Password?</Link>
        </p>
        <p className="text-center mt-2 text-sm text-gray-600">
          Don't have an account? 
          <button onClick={handleSignup} className="text-blue-600 hover:underline ml-1">
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;