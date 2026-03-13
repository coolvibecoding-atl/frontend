import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BatchUpload } from '@/components/BatchUpload';

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Upload: () => React.createElement('div', { 'data-testid': 'upload-icon' }),
  FileAudio: () => React.createElement('div', { 'data-testid': 'file-audio-icon' }),
  CheckCircle: () => React.createElement('div', { 'data-testid': 'check-circle-icon' }),
  XCircle: () => React.createElement('div', { 'data-testid': 'x-circle-icon' }),
  Clock: () => React.createElement('div', { 'data-testid': 'clock-icon' }),
  Loader2: () => React.createElement('div', { 'data-testid': 'loader-icon' }),
}));

// Mock UI components
jest.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, disabled, ...props }: any) => 
    React.createElement('button', { onClick, disabled, type: 'button', ...props }, children),
}));

jest.mock('@/components/ui/progress', () => ({
  Progress: ({ value, className }: any) =>
    React.createElement('div', { className, 'data-testid': 'progress-bar' },
      React.createElement('div', { style: { width: `${value}%` } })
    ),
}));

jest.mock('@/components/ui/card', () => ({
  Card: ({ children, className }: any) =>
    React.createElement('div', { className }, children),
  CardContent: ({ children, className }: any) =>
    React.createElement('div', { className }, children),
  CardDescription: ({ children, className }: any) =>
    React.createElement('div', { className }, children),
  CardHeader: ({ children, className }: any) =>
    React.createElement('div', { className }, children),
  CardTitle: ({ children, className }: any) =>
    React.createElement('div', { className }, children),
}));

describe('BatchUpload', () => {
  const mockTracks = [
    { id: '1', name: 'track1.wav', status: 'UPLOADED', progress: 0, createdAt: new Date() },
    { id: '2', name: 'track2.wav', status: 'UPLOADED', progress: 0, createdAt: new Date() },
    { id: '3', name: 'track3.wav', status: 'PROCESSING', progress: 50, createdAt: new Date() },
    { id: '4', name: 'track4.wav', status: 'COMPLETED', progress: 100, createdAt: new Date() },
  ];

  const defaultProps = {
    tracks: mockTracks,
    onProcessBatch: jest.fn(),
    isProcessing: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render with tracks', () => {
      render(<BatchUpload {...defaultProps} />);

      expect(screen.getByText('track1.wav')).toBeInTheDocument();
      expect(screen.getByText('track2.wav')).toBeInTheDocument();
      expect(screen.getByText('track3.wav')).toBeInTheDocument();
      expect(screen.getByText('track4.wav')).toBeInTheDocument();
    });

    it('should render empty state when no tracks', () => {
      const emptyProps = {
        tracks: [],
        onProcessBatch: jest.fn(),
        isProcessing: false,
      };

      render(<BatchUpload {...emptyProps} />);

      expect(screen.getByText('No tracks uploaded yet')).toBeInTheDocument();
    });

    it('should display correct track counts in summary', () => {
      render(<BatchUpload {...defaultProps} />);

      expect(screen.getByText('Pending:')).toBeInTheDocument();
      expect(screen.getAllByText('2').length).toBeGreaterThan(0); // 2 pending tracks
      expect(screen.getByText('Processing:')).toBeInTheDocument();
      expect(screen.getAllByText('1').length).toBeGreaterThan(0); // 1 processing track
      expect(screen.getByText('Completed:')).toBeInTheDocument();
      expect(screen.getAllByText('1').length).toBeGreaterThan(0); // 1 completed track
    });
  });

  describe('Track Selection', () => {
    it('should toggle track selection on click', () => {
      render(<BatchUpload {...defaultProps} />);

      const trackButton = screen.getByText('track1.wav').closest('button');
      expect(trackButton).not.toHaveClass('border-blue-500');

      fireEvent.click(trackButton!);
      expect(trackButton).toHaveClass('border-blue-500');

      fireEvent.click(trackButton!);
      expect(trackButton).not.toHaveClass('border-blue-500');
    });

    it('should select all pending tracks', () => {
      render(<BatchUpload {...defaultProps} />);

      const selectAllButton = screen.getByText(/Select All Pending/);
      fireEvent.click(selectAllButton);

      // Both pending tracks should be selected
      const track1Button = screen.getByText('track1.wav').closest('button');
      const track2Button = screen.getByText('track2.wav').closest('button');
      expect(track1Button).toHaveClass('border-blue-500');
      expect(track2Button).toHaveClass('border-blue-500');
    });

    it('should clear selection', () => {
      render(<BatchUpload {...defaultProps} />);

      // Select a track first
      const trackButton = screen.getByText('track1.wav').closest('button');
      fireEvent.click(trackButton!);
      expect(trackButton).toHaveClass('border-blue-500');

      // Clear selection
      const clearButton = screen.getByText('Clear Selection');
      fireEvent.click(clearButton);

      expect(trackButton).not.toHaveClass('border-blue-500');
    });

    it('should update process button text based on selection count', () => {
      render(<BatchUpload {...defaultProps} />);

      // Initially no selection
      expect(screen.getByText('Process 0 Tracks')).toBeInTheDocument();

      // Select one track
      const trackButton = screen.getByText('track1.wav').closest('button');
      fireEvent.click(trackButton!);
      expect(screen.getByText('Process 1 Track')).toBeInTheDocument();

      // Select second track
      const track2Button = screen.getByText('track2.wav').closest('button');
      fireEvent.click(track2Button!);
      expect(screen.getByText('Process 2 Tracks')).toBeInTheDocument();
    });
  });

  describe('Batch Processing', () => {
    it('should call onProcessBatch with selected track IDs', async () => {
      const mockProcessBatch = jest.fn().mockResolvedValue(undefined);

      render(
        <BatchUpload
          tracks={mockTracks}
          onProcessBatch={mockProcessBatch}
          isProcessing={false}
        />
      );

      // Select tracks
      const track1Button = screen.getByText('track1.wav').closest('button');
      const track2Button = screen.getByText('track2.wav').closest('button');
      fireEvent.click(track1Button!);
      fireEvent.click(track2Button!);

      // Click process button
      const processButton = screen.getByText(/Process 2 Tracks/);
      fireEvent.click(processButton);

      await waitFor(() => {
        expect(mockProcessBatch).toHaveBeenCalledWith(['1', '2']);
      });
    });

    it('should disable process button when no tracks selected', () => {
      render(<BatchUpload {...defaultProps} />);

      const processButton = screen.getByText(/Process 0 Tracks/);
      expect(processButton).toBeDisabled();
    });

    it('should disable process button when processing', () => {
      const mockProcessBatch = jest.fn();

      render(
        <BatchUpload
          tracks={mockTracks}
          onProcessBatch={mockProcessBatch}
          isProcessing={true}
        />
      );

      const processButton = screen.getByText(/Process 0 Tracks/);
      expect(processButton).toBeDisabled();
    });

    it('should show processing state', async () => {
      const mockProcessBatch = jest.fn().mockImplementation(
        () => new Promise(resolve => setTimeout(resolve, 100))
      );

      render(
        <BatchUpload
          tracks={mockTracks}
          onProcessBatch={mockProcessBatch}
          isProcessing={false}
        />
      );

      // Select a track
      const trackButton = screen.getByText('track1.wav').closest('button');
      fireEvent.click(trackButton!);

      // Click process button
      const processButton = screen.getByText(/Process 1 Track/);
      fireEvent.click(processButton);

      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText('Processing...')).toBeInTheDocument();
      });
    });

    it('should show completed state after successful processing', async () => {
      const mockProcessBatch = jest.fn().mockResolvedValue(undefined);

      render(
        <BatchUpload
          tracks={mockTracks}
          onProcessBatch={mockProcessBatch}
          isProcessing={false}
        />
      );

      // Select a track
      const trackButton = screen.getByText('track1.wav').closest('button');
      fireEvent.click(trackButton!);

      // Click process button
      const processButton = screen.getByText(/Process 1 Track/);
      fireEvent.click(processButton);

      // Should show completed message
      await waitFor(() => {
        expect(screen.getByText('Completed!')).toBeInTheDocument();
      }, { timeout: 3000 });
    });
  });

  describe('Progress Updates', () => {
    it('should display progress for processing tracks', () => {
      render(<BatchUpload {...defaultProps} />);

      const processingTrack = screen.getByText('track3.wav').closest('button');
      expect(processingTrack).toBeInTheDocument();

      // Progress bar should be visible
      const progressBar = screen.getByTestId('progress-bar');
      expect(progressBar).toBeInTheDocument();
    });

    it('should not show progress bar for completed tracks', () => {
      render(<BatchUpload {...defaultProps} />);

      const completedTrack = screen.getByText('track4.wav').closest('button');
      expect(completedTrack).toBeInTheDocument();

      // Progress bar should not be visible for completed track
      const progressBars = screen.queryAllByTestId('progress-bar');
      expect(progressBars.length).toBe(1); // Only for processing track
    });
  });

  describe('Status Icons', () => {
    it('should display correct icon for each status', () => {
      render(<BatchUpload {...defaultProps} />);

      // Should have icons for different statuses
      const clockIcons = screen.getAllByTestId('clock-icon');
      expect(clockIcons.length).toBeGreaterThan(0); // UPLOADED status
      const loaderIcons = screen.getAllByTestId('loader-icon');
      expect(loaderIcons.length).toBeGreaterThan(0); // PROCESSING status
      const checkIcons = screen.getAllByTestId('check-circle-icon');
      expect(checkIcons.length).toBeGreaterThan(0); // COMPLETED status
    });
  });

  describe('Keyboard Navigation', () => {
    it('should toggle selection with Enter key', () => {
      render(<BatchUpload {...defaultProps} />);

      const trackButton = screen.getByText('track1.wav').closest('button');
      expect(trackButton).not.toHaveClass('border-blue-500');

      fireEvent.keyUp(trackButton!, { key: 'Enter' });
      expect(trackButton).toHaveClass('border-blue-500');
    });

    it('should toggle selection with Space key', () => {
      render(<BatchUpload {...defaultProps} />);

      const trackButton = screen.getByText('track1.wav').closest('button');
      expect(trackButton).not.toHaveClass('border-blue-500');

      fireEvent.keyDown(trackButton!, { key: ' ' });
      expect(trackButton).toHaveClass('border-blue-500');
    });
  });
});
