import { render, screen } from '@testing-library/react';
import { BibleDisplay } from '../BibleDisplay';

describe('BibleDisplay Component', () => {
  
  test('renders passage title', () => {
    const props = {
      passage: 'John 3:16',
      verses: [],
      highlights: []
    };
    
    render(<BibleDisplay {...props} />);
    expect(screen.getByText('John 3:16')).toBeInTheDocument();
  });

  test('displays verses when provided', () => {
    const props = {
      passage: 'John 3:16',
      verses: [
        { number: 16, text: 'For God so loved the world...' }
      ],
      highlights: []
    };
    
    render(<BibleDisplay {...props} />);
    expect(screen.getByText('For God so loved the world...')).toBeInTheDocument();
  });

  test('shows placeholder when no verses provided', () => {
    const props = {
      passage: 'John 3:16',
      verses: [],
      highlights: []
    };
    
    render(<BibleDisplay {...props} />);
    expect(screen.getByText(/Search for a Bible passage/i)).toBeInTheDocument();
  });

  test('renders multiple verses in order', () => {
    const props = {
      passage: 'John 3:16-17',
      verses: [
        { number: 16, text: 'Verse 16 text' },
        { number: 17, text: 'Verse 17 text' }
      ],
      highlights: []
    };
    
    render(<BibleDisplay {...props} />);
    expect(screen.getByText('Verse 16 text')).toBeInTheDocument();
    expect(screen.getByText('Verse 17 text')).toBeInTheDocument();
  });

  test('displays verse numbers', () => {
    const props = {
      passage: 'John 3:16',
      verses: [
        { number: 16, text: 'For God so loved the world...' }
      ],
      highlights: []
    };
    
    render(<BibleDisplay {...props} />);
    expect(screen.getByText('16')).toBeInTheDocument();
  });
});