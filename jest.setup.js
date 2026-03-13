// Jest setup file
require('@testing-library/jest-dom');

// Mock @clerk/nextjs/server
jest.mock('@clerk/nextjs/server', () => ({
  auth: jest.fn(),
}));

// Mock global fetch for API route tests
global.fetch = jest.fn();

// Ensure Request is available (jsdom should provide this)
if (typeof Request === 'undefined') {
  global.Request = class Request {
    constructor(url, options = {}) {
      this.url = url;
      this.method = options.method || 'GET';
      this.body = options.body;
      this.headers = options.headers || {};
    }

    async text() {
      return this.body;
    }

    async formData() {
      return this.body;
    }
  };
}

// Add arrayBuffer method to File class if it doesn't exist
if (typeof File !== 'undefined' && !File.prototype.arrayBuffer) {
  File.prototype.arrayBuffer = function() {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsArrayBuffer(this);
    });
  };
}
