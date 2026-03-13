import { test, expect } from '@playwright/test';

// Extend expect with custom matchers if needed

test.describe('Upload and Processing Flow', () => {
  test.describe.configure({ mode: 'serial' });

  test.beforeEach(async ({ page }) => {
    // Mock authentication for all tests
    await page.addInitScript(() => {
      // Mock Clerk authentication
      Object.defineProperty(window, 'Clerk', {
        value: {
          user: () => ({
            id: 'test-user-123',
            firstName: 'Test',
            lastName: 'User',
            emailAddresses: [{ emailAddress: 'test@example.com' }],
          }),
          session: () => ({
            id: 'test-session-123',
            status: 'active',
          }),
        },
        writable: true,
      });
    });
  });

  test('complete audio processing journey', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');

    // Wait for page to load
    await page.waitForSelector('[data-testid="batch-upload"]', { timeout: 5000 });

    // Verify upload area is visible
    const uploadArea = page.locator('[data-testid="upload-area"]');
    await expect(uploadArea).toBeVisible();

    // Simulate file upload (we'll use a mock file for testing)
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test-audio.wav',
      mimeType: 'audio/wav',
      buffer: Buffer.from('fake audio data'),
    });

    // Wait for upload to complete
    await page.waitForSelector('[data-status="UPLOADED"]', { timeout: 10000 });

    // Verify track appears in the list
    const trackItem = page.locator('button:has-text("test-audio.wav")');
    await expect(trackItem).toBeVisible();

    // Select the track for processing
    await trackItem.click();

    // Enable processing options
    const stemSeparationCheckbox = page.locator('input[name="enableStemSeparation"]');
    const masteringCheckbox = page.locator('input[name="enableMastering"]');

    await stemSeparationCheckbox.check();
    await masteringCheckbox.check();

    // Click process button
    const processButton = page.locator('button:has-text("Process")');
    await expect(processButton).toBeEnabled();
    await processButton.click();

    // Wait for processing to start
    await page.waitForSelector('[data-status="PROCESSING"]', { timeout: 5000 });

    // Wait for processing completion
    await page.waitForSelector('[data-status="COMPLETED"]', { timeout: 120000 });

    // Verify stems are available
    const stemsSection = page.locator('[data-testid="stems-section"]');
    await expect(stemsSection).toBeVisible();

    const stemItems = page.locator('[data-stem]');
    const stemCount = await stemItems.count();
    expect(stemCount).toBeGreaterThan(0);

    // Download processed file
    const downloadPromise = page.waitForEvent('download');
    await page.locator('button:has-text("Download")').first().click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.wav');
  });

  test('should reject invalid file types', async ({ page }) => {
    await page.goto('/dashboard');

    // Try to upload an invalid file type
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'test.txt',
      mimeType: 'text/plain',
      buffer: Buffer.from('Not an audio file'),
    });

    // Wait for error message
    await page.waitForSelector('[data-testid="upload-error"]', { timeout: 5000 });

    // Verify error is displayed
    const errorMessage = page.locator('[data-testid="upload-error"]');
    await expect(errorMessage).toContainText('Invalid file type');
  });

  test('should enforce file size limits', async ({ page }) => {
    await page.goto('/dashboard');

    // Create a file larger than 500MB
    const largeBuffer = Buffer.alloc(501 * 1024 * 1024); // 501MB
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'large-audio.wav',
      mimeType: 'audio/wav',
      buffer: largeBuffer,
    });

    // Wait for error message
    await page.waitForSelector('[data-testid="upload-error"]', { timeout: 5000 });

    // Verify error is displayed
    const errorMessage = page.locator('[data-testid="upload-error"]');
    await expect(errorMessage).toContainText('File too large');
  });

  test('should handle batch processing', async ({ page }) => {
    await page.goto('/dashboard');

    // Upload multiple files
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles([
      {
        name: 'track1.wav',
        mimeType: 'audio/wav',
        buffer: Buffer.from('audio data 1'),
      },
      {
        name: 'track2.wav',
        mimeType: 'audio/wav',
        buffer: Buffer.from('audio data 2'),
      },
      {
        name: 'track3.wav',
        mimeType: 'audio/wav',
        buffer: Buffer.from('audio data 3'),
      },
    ]);

    // Wait for all uploads to complete
    await page.waitForTimeout(3000);

    // Select all pending tracks
    const selectAllButton = page.locator('button:has-text("Select All Pending")');
    await selectAllButton.click();

    // Click batch process button
    const batchProcessButton = page.locator('button:has-text("Process 3 Tracks")');
    await expect(batchProcessButton).toBeEnabled();
    await batchProcessButton.click();

    // Wait for batch processing to complete
    await page.waitForSelector('[data-testid="batch-completed"]', { timeout: 60000 });

    // Verify all tracks are processed
    const completedTracks = page.locator('[data-status="COMPLETED"]');
    await expect(completedTracks).toHaveCount(3);
  });

  test('should show progress during processing', async ({ page }) => {
    await page.goto('/dashboard');

    // Upload a file
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'progress-test.wav',
      mimeType: 'audio/wav',
      buffer: Buffer.from('audio data'),
    });

    // Wait for upload
    await page.waitForSelector('[data-status="UPLOADED"]', { timeout: 5000 });

    // Select and process
    const trackButton = page.locator('button:has-text("progress-test.wav")');
    await trackButton.click();

    const processButton = page.locator('button:has-text("Process 1 Track")');
    await processButton.click();

    // Wait for processing to start
    await page.waitForSelector('[data-status="PROCESSING"]', { timeout: 5000 });

    // Verify progress bar is visible and updating
    const progressBar = page.locator('[data-testid="progress-bar"]');
    await expect(progressBar).toBeVisible();

    // Wait a moment and check progress updates
    await page.waitForTimeout(2000);

    // Get progress value
    const progressValue = await progressBar.getAttribute('aria-valuenow');
    expect(Number(progressValue)).toBeGreaterThan(0);
    expect(Number(progressValue)).toBeLessThanOrEqual(100);
  });
});
