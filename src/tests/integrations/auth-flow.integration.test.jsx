import Discover from '@pages/Discover';
import MainLayout from '@layouts/MainLayout';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import { describe, test, expect, beforeEach } from 'vitest';
import AuthProvider from '@providers/AuthProvider';
import MockAdapter from 'axios-mock-adapter';
import apiClient from '@services/apiClient';

const mock = new MockAdapter(apiClient);

describe('Authentication Flow Integration Test', () => {
  beforeEach(() => {
    mock.reset();
    mock.onPost('/auth/register').reply(200, { firstName: 'Test', lastName: 'User' });
    mock.onPost('/auth/login').reply(200, { firstName: 'Test', lastName: 'User' });
    mock.onPost('/auth/logout').reply(200, {});
    mock.onGet('/auth/check').reply(401, { message: 'Not authenticated' });
    // Catch-all for other API calls (movie feeds, etc.)
    mock.onAny().reply(200, { results: [] });
  });

  test('User can sign up, log in, and log out successfully', async () => {
    render(
      <Router>
        <AuthProvider>
          <MainLayout>
            <Discover />
          </MainLayout>
        </AuthProvider>
      </Router>
    );
    // Open sign-up modal
    const signUpButton = screen.getAllByRole('button', { name: /Sign Up/i });
    fireEvent.click(signUpButton[0]);
    // Simulate user filling out the sign-up form
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.click(screen.getByText(/Continue/i));
    fireEvent.change(screen.getByLabelText(/First Name/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/Last Name/i), { target: { value: 'User' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'Password123' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'Password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));
    // Open menu to verify logged in state
    fireEvent.click(screen.getByRole('button', { name: 'Menu' }));
    await waitFor(() => {
      expect(screen.getByText(/Logged in as Test/i)).toBeInTheDocument();
    });
    // Simulate user logging out
    fireEvent.click(screen.getByRole('button', { name: /Sign Out/i }));
    await waitFor(() => {
      const loginButtons = screen.getAllByRole('button', { name: /Login/i });
      expect(loginButtons).toHaveLength(2);
    });
    // Simulate user logging in
    const loginButtons = screen.getAllByRole('button', { name: /Login/i });
    fireEvent.click(loginButtons[0]);
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'Password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Sign In/i }));
    // Wait for login to complete
    await waitFor(() => {
      expect(screen.getByText(/Logged in as/i)).toBeInTheDocument();
    });
  });
});
