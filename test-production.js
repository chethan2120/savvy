const http = require('http');

const PORT = 3002;
const BASE = `http://localhost:${PORT}`;

function get(path, headers = {}) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const req = http.get(`${BASE}${path}`, { headers }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({
          path,
          status: res.statusCode,
          durationMs: Date.now() - start,
          headers: res.headers,
          data,
        });
      });
    });
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error(`Timeout for ${path}`));
    });
  });
}

function post(path, body = {}, headers = {}) {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const payload = JSON.stringify(body);
    const req = http.request(
      `${BASE}${path}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
          ...headers,
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => {
          resolve({
            path,
            status: res.statusCode,
            durationMs: Date.now() - start,
            headers: res.headers,
            data,
          });
        });
      }
    );
    req.on('error', reject);
    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error(`Timeout for ${path}`));
    });
    req.write(payload);
    req.end();
  });
}

async function run() {
  console.log('--- STARTING PRODUCTION ROUTE & PERFORMANCE AUDIT ---');
  const results = [];

  // 1. PUBLIC ROUTES
  const publicRoutes = [
    '/',
    '/about-us',
    '/courses',
    '/courses/c1',
    '/course/ndt-level-2-course',
    '/blogs',
    '/blogs/ultrasonic-flaw-detection-calibration-guide',
    '/contact-us',
    '/login',
  ];

  for (const p of publicRoutes) {
    try {
      const res = await get(p);
      results.push({ type: 'PUBLIC', route: p, status: res.status, latency: `${res.durationMs}ms` });
    } catch (err) {
      results.push({ type: 'PUBLIC', route: p, status: 'ERR', error: err.message });
    }
  }

  // 2. 404 FALLBACK TESTING
  const notFoundRoutes = [
    '/non-existent-random-route',
    '/courses/non-existent-course-id-999',
    '/course/non-existent-course-slug-999',
    '/blogs/non-existent-blog-slug-999',
  ];

  for (const p of notFoundRoutes) {
    try {
      const res = await get(p);
      results.push({ type: '404_CHECK', route: p, status: res.status, latency: `${res.durationMs}ms` });
    } catch (err) {
      results.push({ type: '404_CHECK', route: p, status: 'ERR', error: err.message });
    }
  }

  // 3. API ROUTES
  const apiRoutes = [
    { method: 'GET', path: '/api/public-courses', expected: [200] },
    { method: 'GET', path: '/api/categories', expected: [200] },
    { method: 'GET', path: '/api/auth/session', expected: [200] },
    { method: 'GET', path: '/api/branding', expected: [200] },
    { method: 'GET', path: '/api/website-settings', expected: [200] },
    { method: 'GET', path: '/api/attendance', expected: [401] },
    { method: 'GET', path: '/api/accounts', expected: [401] },
    { method: 'GET', path: '/api/accounts/me', expected: [401] },
    { method: 'GET', path: '/api/enrollments', expected: [401] },
    { method: 'GET', path: '/api/registrations', expected: [401] },
    { method: 'GET', path: '/api/workspace', expected: [401] },
    { method: 'GET', path: '/api/photos', expected: [401] },
    { method: 'GET', path: '/api/contacts', expected: [401] },
    { method: 'GET', path: '/api/contacts/export', expected: [401] },
    { method: 'GET', path: '/api/certificates/invalid-cert-404', expected: [401, 404] },
    { method: 'GET', path: '/api/course-images/invalid-img-404', expected: [404] },
    { method: 'POST', path: '/api/newsletter', body: { email: 'test@example.co.uk' }, expected: [200] },
  ];

  for (const api of apiRoutes) {
    try {
      const res = api.method === 'POST' ? await post(api.path, api.body) : await get(api.path);
      const isExpected = api.expected.includes(res.status);
      results.push({
        type: 'API',
        route: api.path,
        status: res.status,
        expected: api.expected.join('/'),
        pass: isExpected,
        latency: `${res.durationMs}ms`,
      });
    } catch (err) {
      results.push({ type: 'API', route: api.path, status: 'ERR', error: err.message });
    }
  }

  // 4. PERFORMANCE MEASUREMENT TEST: 10 Consecutive Requests to Homepage & Courses
  console.log('\n--- PERFORMANCE LATENCY (TTFB) TEST ---');
  const latencies = [];
  for (let i = 0; i < 10; i++) {
    const res = await get('/');
    latencies.push(res.durationMs);
  }
  const avg = Math.round(latencies.reduce((a, b) => a + b, 0) / latencies.length);
  const min = Math.min(...latencies);
  const max = Math.max(...latencies);
  console.log(`Homepage 10x Latency: min=${min}ms, avg=${avg}ms, max=${max}ms, samples=[${latencies.join(', ')}]`);

  console.log('\n--- ROUTE AUDIT SUMMARY TABLE ---');
  console.table(results);

  // Check 404 page content
  const page404 = await get('/non-existent-page-check');
  console.log('\n404 Content Check:');
  console.log('Contains "Page Not Found":', page404.data.includes('Page Not Found'));
  console.log('Contains "Back to Home":', page404.data.includes('Back to Home'));
  console.log('Contains "Explore Courses":', page404.data.includes('Explore Courses'));

  // Check WhatsApp Widget in layout
  const home = await get('/');
  console.log('\nWhatsApp Widget Client Integration Check:');
  console.log('Home HTML includes WhatsAppWidget client bundle chunk:', home.data.includes('WhatsAppWidget') || home.data.includes('whatsapp') || home.data.includes('wa.me'));

  console.log('\nAUDIT COMPLETE.');
}

// Wait for Next.js to start
setTimeout(run, 2000);
