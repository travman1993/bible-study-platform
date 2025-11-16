import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BibleSearch } from '../BibleSearch';

describe('BibleSearch Component', () => {
  
  test('renders search input and button', () => {
    const mockOnSearch = jest.fn();
    render(<BibleSearch onSearch={mockOnSearch} />);
    
    expect(screen.getByPlaceholderText(/Search:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Search/i })).toBeInTheDocument();
  });

  test('shows error when search input is empty', async () => {
    const mockOnSearch = jest.fn();
    render(<BibleSearch onSearch={mockOnSearch} />);
    
    const button = screen.getByRole('button', { name: /Search/i });
    fireEvent.click(button);
    
    await waitFor(() => {
      expect(screen.getByText(/Please enter a Bible passage/i)).toBeInTheDocument();
    });
  });

  test('updates input value when user types', async () => {
    const mockOnSearch = jest.fn();
    const user = userEvent.setup();
    render(<BibleSearch onSearch={mockOnSearch} />);
    
    const input = screen.getByPlaceholderText(/Search:/i);
    await user.type(input, 'John 3:16');
    
    expect(input.value).toBe('John 3:16');
  });

  test('calls onSearch with passage when form is submitted', async () => {
    const mockOnSearch = jest.fn();
    const user = userEvent.setup();
    
    // Mock fetch for Bible API
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          verses: [
            { number: 16, text: 'For God so loved the world...' }
          ]
        })
      })
    );

    render(<BibleSearch onSearch={mockOnSearch} />);
    
    const input = screen.getByPlaceholderText(/Search:/i);
    const button = screen.getByRole('button', { name: /Search/i });
    
    await user.type(input, 'John 3:16');
    await user.click(button);

    await waitFor(() => {
      expect(mockOnSearch).toHaveBeenCalled();
    });
  });

  test('shows loading state while searching', async () => {
    const mockOnSearch = jest.fn();
    const user = userEvent.setup();
    
    global.fetch = jest.fn(
      () => new Promise(resolve => setTimeout(() => resolve({
        ok: true,
        json: () => Promise.resolve({ verses: [] })
      }), 1000))
    );

    render(<BibleSearch onSearch={mockOnSearch} />);
    
    const input = screen.getByPlaceholderText(/Search:/i);
    const button = screen.getByRole('button', { name: /Search/i });
    
    await user.type(input, 'John 3:16');
    await user.click(button);

    expect(screen.getByRole('button', { name: /Searching/i })).toBeDisabled();
  });

  test('displays error message on API failure', async () => {
    const mockOnSearch = jest.fn();
    const user = userEvent.setup();
    
    global.fetch = jest.fn(() =>
      Promise.reject(new Error('Network error'))
    );

    render(<BibleSearch onSearch={mockOnSearch} />);
    
    const input = screen.getByPlaceholderText(/Search:/i);
    const button = screen.getByRole('button', { name: /Search/i });
    
    await user.type(input, 'John 3:16');
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Network error/i)).toBeInTheDocument();
    });
  });
});