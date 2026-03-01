/**
 * Test file for uploadFileToDrive function
 * 
 * This test file mocks the Google Drive API and tests the file upload functionality
 */

import { Readable } from 'stream';

// Mock googleapis
jest.mock('googleapis', () => ({
  google: {
    auth: {
      JWT: jest.fn(),
    },
    drive: jest.fn(),
  },
}));

// Mock the Readable stream
jest.mock('stream', () => ({
  Readable: {
    from: jest.fn((buffer) => buffer),
  },
}));

describe('uploadFileToDrive', () => {
  // Mock drive instance
  let mockDrive: any;
  let mockFilesCreate: jest.Mock;

  // Mock file
  const createMockFile = (name: string, content: string, type: string = 'application/octet-stream'): File => {
    const blob = new Blob([content], { type });
    return new File([blob], name, { type });
  };

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Setup mock for drive.files.create
    mockFilesCreate = jest.fn();
    mockDrive = {
      files: {
        create: mockFilesCreate,
      },
    };
  });

  // Import the function from route.ts
  const { uploadFileToDrive } = require('../route');

  describe('Successful upload', () => {
    it('should upload a file successfully and return file ID', async () => {
      // Arrange
      const mockFile = createMockFile('test.stl', 'STL file content', 'application/octet-stream');
      const folderId = 'test-folder-id';
      const newFileName = 'renamed-file.stl';
      const expectedFileId = 'uploaded-file-id-123';

      mockFilesCreate.mockResolvedValue({
        data: {
          id: expectedFileId,
          name: newFileName,
          webViewLink: 'https://drive.google.com/file/view/123',
        },
      });

      // Act
      const result = await uploadFileToDrive(mockDrive, mockFile, folderId, newFileName, true);

      // Assert
      expect(result).toBe(expectedFileId);
      expect(mockFilesCreate).toHaveBeenCalledTimes(1);
      expect(mockFilesCreate).toHaveBeenCalledWith({
        requestBody: {
          name: newFileName,
          parents: [folderId],
        },
        media: {
          mimeType: 'application/octet-stream',
          body: expect.any(Buffer),
        },
        fields: 'id, name, webViewLink',
        supportsAllDrives: true,
      });
    });

    it('should use default MIME type when file type is not provided', async () => {
      // Arrange
      const mockFile = createMockFile('test.stl', 'STL content', '');
      const folderId = 'test-folder-id';
      const newFileName = 'test.stl';
      const expectedFileId = 'file-id-123';

      mockFilesCreate.mockResolvedValue({
        data: { id: expectedFileId },
      });

      // Act
      const result = await uploadFileToDrive(mockDrive, mockFile, folderId, newFileName);

      // Assert
      expect(result).toBe(expectedFileId);
      expect(mockFilesCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          media: expect.objectContaining({
            mimeType: 'application/octet-stream',
          }),
        })
      );
    });

    it('should support Shared Drives when supportsAllDrives is true', async () => {
      // Arrange
      const mockFile = createMockFile('test.stl', 'content');
      const folderId = 'shared-drive-folder-id';
      const newFileName = 'test.stl';
      const expectedFileId = 'file-id-456';

      mockFilesCreate.mockResolvedValue({
        data: { id: expectedFileId },
      });

      // Act
      const result = await uploadFileToDrive(mockDrive, mockFile, folderId, newFileName, true);

      // Assert
      expect(result).toBe(expectedFileId);
      expect(mockFilesCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          supportsAllDrives: true,
        })
      );
    });

    it('should not support Shared Drives when supportsAllDrives is false', async () => {
      // Arrange
      const mockFile = createMockFile('test.stl', 'content');
      const folderId = 'folder-id';
      const newFileName = 'test.stl';
      const expectedFileId = 'file-id-789';

      mockFilesCreate.mockResolvedValue({
        data: { id: expectedFileId },
      });

      // Act
      const result = await uploadFileToDrive(mockDrive, mockFile, folderId, newFileName, false);

      // Assert
      expect(result).toBe(expectedFileId);
      expect(mockFilesCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          supportsAllDrives: false,
        })
      );
    });
  });

  describe('Error handling', () => {
    it('should throw storage quota error when quota is exceeded', async () => {
      // Arrange
      const mockFile = createMockFile('test.stl', 'content');
      const folderId = 'folder-id';
      const newFileName = 'test.stl';

      const quotaError = new Error('Service Accounts do not have storage quota');
      mockFilesCreate.mockRejectedValue(quotaError);

      // Act & Assert
      await expect(
        uploadFileToDrive(mockDrive, mockFile, folderId, newFileName)
      ).rejects.toThrow('Service Accounts do not have storage quota. The folder must be inside a Shared Drive.');
    });

    it('should throw original error for non-quota errors', async () => {
      // Arrange
      const mockFile = createMockFile('test.stl', 'content');
      const folderId = 'folder-id';
      const newFileName = 'test.stl';

      const permissionError = new Error('Permission denied');
      mockFilesCreate.mockRejectedValue(permissionError);

      // Act & Assert
      await expect(
        uploadFileToDrive(mockDrive, mockFile, folderId, newFileName)
      ).rejects.toThrow('Permission denied');
    });

    it('should handle network errors', async () => {
      // Arrange
      const mockFile = createMockFile('test.stl', 'content');
      const folderId = 'folder-id';
      const newFileName = 'test.stl';

      const networkError = new Error('Network request failed');
      mockFilesCreate.mockRejectedValue(networkError);

      // Act & Assert
      await expect(
        uploadFileToDrive(mockDrive, mockFile, folderId, newFileName)
      ).rejects.toThrow('Network request failed');
    });
  });

  describe('File metadata', () => {
    it('should set correct file name in metadata', async () => {
      // Arrange
      const mockFile = createMockFile('original.stl', 'content');
      const folderId = 'folder-id';
      const newFileName = 'renamed-file.stl';
      const expectedFileId = 'file-id';

      mockFilesCreate.mockResolvedValue({
        data: { id: expectedFileId },
      });

      // Act
      await uploadFileToDrive(mockDrive, mockFile, folderId, newFileName);

      // Assert
      expect(mockFilesCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          requestBody: expect.objectContaining({
            name: newFileName,
          }),
        })
      );
    });

    it('should set correct parent folder ID', async () => {
      // Arrange
      const mockFile = createMockFile('test.stl', 'content');
      const folderId = 'specific-folder-id-123';
      const newFileName = 'test.stl';
      const expectedFileId = 'file-id';

      mockFilesCreate.mockResolvedValue({
        data: { id: expectedFileId },
      });

      // Act
      await uploadFileToDrive(mockDrive, mockFile, folderId, newFileName);

      // Assert
      expect(mockFilesCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          requestBody: expect.objectContaining({
            parents: [folderId],
          }),
        })
      );
    });

    it('should preserve file content in buffer', async () => {
      // Arrange
      const fileContent = 'STL file binary content';
      const mockFile = createMockFile('test.stl', fileContent);
      const folderId = 'folder-id';
      const newFileName = 'test.stl';
      const expectedFileId = 'file-id';

      mockFilesCreate.mockResolvedValue({
        data: { id: expectedFileId },
      });

      // Act
      await uploadFileToDrive(mockDrive, mockFile, folderId, newFileName);

      // Assert
      expect(mockFilesCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          media: expect.objectContaining({
            body: expect.any(Buffer),
          }),
        })
      );
    });
  });
});
