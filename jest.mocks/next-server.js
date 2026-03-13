// Mock for next/server module
class NextResponse {
  constructor(body, init = {}) {
    this.body = body;
    this.status = init.status || 200;
    this.statusText = init.statusText || 'OK';
    this.headers = new Map(Object.entries(init.headers || {}));
  }

  static json(data, init = {}) {
    const body = JSON.stringify(data);
    const response = new NextResponse(body, init);
    response._jsonData = data;
    return response;
  }

  static redirect(url, status = 307) {
    return new NextResponse(null, {
      status,
      headers: { Location: url },
    });
  }

  async json() {
    // If we stored the data directly, return it
    if (this._jsonData !== undefined) {
      return this._jsonData;
    }
    return JSON.parse(this.body);
  }

  async text() {
    return this.body;
  }
}

module.exports = {
  NextResponse,
};
