import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Brain Hub header', () => {
  render(<App />);
  const headerElement = screen.getByText(/Brain_Hub/i);
  expect(headerElement).toBeInTheDocument();
});