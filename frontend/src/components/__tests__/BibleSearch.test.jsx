// frontend/src/components/__tests__/BibleSearch.test.jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BibleSearch } from '../BibleSearch';

describe('BibleSearch', () => {
  it('should render search input', () => {
    render(<BibleSearch onSearch={() => {}} />);
    expect(screen.getByPlaceholderText(/Search:/i)).toBeInTheDocument();
  });

  it('should show error when search is empty', () => {
    const mockOnSearch = jest.fn();
    render(<BibleSearch onSearch={mockOnSearch} />);
    
    fireEvent.click(screen.getByText(/Search/i));
    expect(screen.getByText(/Please enter/i)).toBeInTheDocument();
  });
});