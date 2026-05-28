import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the Clothing Swap app title', () => {
  render(<App />);

  expect(screen.getByText(/Clothing Swap/i)).toBeInTheDocument();
});
