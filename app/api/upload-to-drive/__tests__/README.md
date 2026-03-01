# Upload File to Drive Tests

This directory contains tests for the `uploadFileToDrive` function.

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test uploadFileToDrive.test.ts
```

## Test Coverage

The tests cover:

1. **Successful uploads**
   - File upload with correct metadata
   - Default MIME type handling
   - Shared Drive support
   - Regular Drive support

2. **Error handling**
   - Storage quota errors
   - Permission errors
   - Network errors

3. **File metadata**
   - File name setting
   - Parent folder ID
   - File content preservation

## Mocking

The tests use Jest mocks to:
- Mock the Google Drive API (`googleapis`)
- Mock file streams
- Avoid making real API calls

## Notes

- The `uploadFileToDrive` function needs to be exported from `route.ts` to be directly testable
- Currently, the test includes a copy of the function logic for testing purposes
- Consider exporting the function or creating a separate utility module for better testability
