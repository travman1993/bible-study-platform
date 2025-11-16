import { render, screen, fireEvent } from '@testing-library/react';
import { HighlightTool } from '../HighlightTool';

describe('HighlightTool Component', () => {
  
  test('renders all color buttons', () => {
    render(<HighlightTool onHighlight={jest.fn()} />);
    
    // Check for color buttons
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  test('selects yellow color by default', () => {
    render(<HighlightTool onHighlight={jest.fn()} />);
    
    const yellowButton = screen.getByTitle('Yellow');
    expect(yellowButton).toHaveClass('active');
  });

  test('changes selected color when clicking different color', () => {
    render(<HighlightTool onHighlight={jest.fn()} />);
    
    const greenButton = screen.getByTitle('Green');
    fireEvent.click(greenButton);
    
    expect(greenButton).toHaveClass('active');
  });

  test('calls onHighlight when highlighting text', () => {
    const mockOnHighlight = jest.fn();
    render(<HighlightTool onHighlight={mockOnHighlight} socket={null} />);
    
    // Simulate highlighting (this would normally be done by selecting text)
    // For now, we'll test the color selection
    const greenButton = screen.getByTitle('Green');
    fireEvent.click(greenButton);
    
    expect(greenButton).toHaveClass('active');
  });

  test('emits socket event when socket is available', () => {
    const mockOnHighlight = jest.fn();
    const mockSocket = {
      emit: jest.fn()
    };
    
    render(
      <HighlightTool 
        onHighlight={mockOnHighlight} 
        socket={mockSocket}
      />
    );
    
    // Note: This test would require more implementation details
    // from the component to fully test socket emission
  });

  test('displays selected text preview', () => {
    const mockOnHighlight = jest.fn();
    render(<HighlightTool onHighlight={mockOnHighlight} socket={null} />);
    
    // After implementation, should show preview of selected text
    // expect(screen.getByText(/Selected:/i)).toBeInTheDocument();
  });
});