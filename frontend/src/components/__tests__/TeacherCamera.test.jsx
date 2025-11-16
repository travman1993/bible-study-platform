import { render, screen, fireEvent } from '@testing-library/react';
import { TeacherCamera } from '../TeacherCamera';

// Mock navigator.mediaDevices
const mockGetUserMedia = jest.fn();
Object.defineProperty(window.navigator, 'mediaDevices', {
  value: {
    getUserMedia: mockGetUserMedia
  },
  writable: true
});

describe('TeacherCamera Component', () => {
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders camera placeholder when not teacher', () => {
    render(<TeacherCamera isTeacher={false} />);
    expect(screen.getByText(/Camera is not available/i)).toBeInTheDocument();
  });

  test('renders camera controls when teacher', () => {
    render(<TeacherCamera isTeacher={true} socket={null} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  test('shows teacher badge when isTeacher is true', () => {
    render(<TeacherCamera isTeacher={true} socket={null} />);
    expect(screen.getByText('LIVE')).toBeInTheDocument();
  });

  test('camera button toggles camera on/off', () => {
    mockGetUserMedia.mockResolvedValue({
      getTracks: () => []
    });

    render(<TeacherCamera isTeacher={true} socket={null} />);
    
    const cameraButton = screen.getByTitle('Turn on camera');
    fireEvent.click(cameraButton);
    
    expect(mockGetUserMedia).toHaveBeenCalledWith({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    });
  });

  test('disables mic button when camera is off', () => {
    render(<TeacherCamera isTeacher={true} socket={null} />);
    
    const micButton = screen.getByTitle('Unmute');
    expect(micButton).toBeDisabled();
  });

  test('displays camera error when getUserMedia fails', async () => {
    mockGetUserMedia.mockRejectedValue(new Error('Permission denied'));

    render(<TeacherCamera isTeacher={true} socket={null} />);
    
    const cameraButton = screen.getByTitle('Turn on camera');
    fireEvent.click(cameraButton);

    // Wait for error to display
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(screen.queryByText(/Permission denied/i)).toBeInTheDocument();
  });
});