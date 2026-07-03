import { render, screen } from '@testing-library/react';
import App from './App';

it('renders the Pavilion shell', () => {
  render(<App />);
  expect(screen.getByTestId('phone-frame')).toBeInTheDocument();
});
