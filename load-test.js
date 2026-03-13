import autocannon from 'autocannon';
import fs from 'fs';
import path from 'path';

const RESULTS_DIR = './load-test-results';

async function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function createTestAudioFile() {
  const wavHeader = Buffer.from([
    0x52, 0x49, 0x46, 0x46,
    0x24, 0x00, 0x00, 0x00,
    0x57, 0x41, 0x56, 0x45,
    0x66, 0x6d, 0x74, 0x20,
    0x10, 0x00, 0x00, 0x00,
    0x01, 0x00,
    0x01, 0x00,
    0x40, 0x1f, 0x00, 0x00,
    0x40, 0x1f, 0x00, 0x00,
    0x01, 0x00,
    0x08, 0x00,
    0x64, 0x61, 0x74, 0x61,
    0x00, 0x00, 0x00, 0x00
  ]);
  const data = Buffer.from([0x00, 0xFF, 0x7F, 0x80].repeat(100));
  return Buffer.concat([wavHeader, data]);
}

async function runTest(name, options) {
  console.log(`\n=== ${name} ===`);
  console.log(`URL: ${options.url}`);
  console.log(`Connections: ${options.connections}`);
  console.log(`Duration: ${options.duration}s`);

  const instance = autocannon({
    ...options,
    setupClient: (client) => {
      if (options.setupClient) {
        options.setupClient(client);
      }
    }
  });

  autocannon.track(instance, { renderProgressBar: true });

  return new Promise((resolve, reject) => {
    instance.on('done', (result) => {
      console.log(`\n${name} Results:`);
      console.log(`  Requests/sec: ${result.requests.perSecond.toFixed(2)}`);
      console.log(`  Latency (avg/ms): ${result.latency.mean.toFixed(2)}`);
      console.log(`  Latency (p95/ms): ${result.latency.p95.toFixed(2)}`);
      console.log(`  Latency (p99/ms): ${result.latency.p99.toFixed(2)}`);
      console.log(`  Throughput (MB/s): ${result.throughput.mean.toFixed(2)}`);
      console.log(`  Errors: ${result.errors}`);
      console.log(`  Timeouts: ${result.timeoutErrors}`);
      
      resolve(result);
    });
    
    instance.on('error', (err) => {
      console.error(`Error in ${name}:`, err);
      reject(err);
    });
  });
}

async function runLoadTest() {
  const baseUrl = process.env.TARGET_URL || 'http://localhost:3000';
  
  console.log(`Starting load tests against: ${baseUrl}`);
  console.log('========================================');
  
  ensureDir(RESULTS_DIR);
  
  const results = {
    timestamp: new Date().toISOString(),
    target: baseUrl,
    tests: {}
  };

  try {
    // Test 1: Health check endpoint
    results.tests.health = await runTest('Health Check Endpoint', {
      url: `${baseUrl}/api/health`,
      method: 'GET',
      connections: 100,
      duration: 30
    });

    // Test 2: Homepage
    results.tests.homepage = await runTest('Homepage', {
      url: baseUrl,
      method: 'GET',
      connections: 100,
      duration: 30
    });

    // Test 3: Static assets (if available)
    results.tests.static = await runTest('Static Assets', {
      url: `${baseUrl}/_next/static/chunks/main.js`,
      method: 'GET',
      connections: 50,
      duration: 30
    });

    // Test 4: API endpoint with POST
    const testFile = await createTestAudioFile();
    results.tests.upload = await runTest('Upload Endpoint', {
      url: `${baseUrl}/api/upload`,
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
      },
      body: `------WebKitFormBoundary7MA4YWxkTrZu0gW\r
Content-Disposition: form-data; name="file"; filename="test.wav"\r
Content-Type: audio/wav\r
\r\n`,
      setupClient: (client) => {
        client.setBody(Buffer.concat([
          Buffer.from(`------WebKitFormBoundary7MA4YWxkTrZu0gW\r
Content-Disposition: form-data; name="file"; filename="test.wav"\r
Content-Type: audio/wav\r
\r\n`),
          testFile,
          Buffer.from('\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW--\r\n')
        ]));
      },
      connections: 20,
      duration: 30
    });

    // Save results
    const resultsFile = path.join(RESULTS_DIR, `results-${Date.now()}.json`);
    fs.writeFileSync(resultsFile, JSON.stringify(results, null, 2));
    console.log(`\n\nResults saved to: ${resultsFile}`);

    // Print summary
    console.log('\n========================================');
    console.log('LOAD TEST SUMMARY');
    console.log('========================================');
    for (const [testName, result] of Object.entries(results.tests)) {
      console.log(`${testName}:`);
      console.log(`  RPS: ${result.requests.perSecond.toFixed(2)}`);
      console.log(`  Avg Latency: ${result.latency.mean.toFixed(2)}ms`);
      console.log(`  P95 Latency: ${result.latency.p95.toFixed(2)}ms`);
    }

  } catch (error) {
    console.error('Load test failed:', error);
    const errorFile = path.join(RESULTS_DIR, `error-${Date.now()}.json`);
    fs.writeFileSync(errorFile, JSON.stringify({ error: error.message }, null, 2));
    process.exit(1);
  }
}

runLoadTest();
