'use client';

import { Code, Copy, Check } from 'lucide-react';
import { useState } from 'react';

const apiEndpoints = [
  {
    section: 'Authentication',
    description: 'All API requests require authentication via Clerk. Include the Clerk session token in the Authorization header.',
    endpoints: [
      {
        method: 'GET',
        path: '/api/tracks',
        description: 'Retrieve all tracks for the authenticated user',
        example: {
          request: 'curl -H "Authorization: Bearer <token>" https://yourapp.com/api/tracks',
          response: `{
  "tracks": [
    {
      "id": "track_abc123",
      "name": "My Track.wav",
      "status": "COMPLETED",
      "progress": 100,
      "stemCount": 4,
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ]
}`,
        },
      },
    ],
  },
  {
    section: 'Uploads',
    description: 'Upload audio files for processing',
    endpoints: [
      {
        method: 'POST',
        path: '/api/upload',
        description: 'Upload a new audio file',
        example: {
          request: `curl -X POST -F "file=@track.wav" https://yourapp.com/api/upload`,
          response: `{
  "track": {
    "id": "track_abc123",
    "name": "track.wav",
    "status": "UPLOADED"
  }
}`,
        },
      },
    ],
  },
  {
    section: 'Processing',
    description: 'Start and monitor audio processing',
    endpoints: [
      {
        method: 'POST',
        path: '/api/process',
        description: 'Start processing a track',
        example: {
          request: `curl -X POST -H "Content-Type: application/json" -d '{"trackId":"track_abc123"}' https://yourapp.com/api/process`,
          response: `{
  "success": true,
  "jobId": "job_xyz789",
  "track": {
    "id": "track_abc123",
    "status": "PROCESSING"
  }
}`,
        },
      },
      {
        method: 'POST',
        path: '/api/batch',
        description: 'Process multiple tracks at once',
        example: {
          request: `curl -X POST -H "Content-Type: application/json" -d '{"trackIds":["track_1","track_2","track_3"]}' https://yourapp.com/api/batch`,
          response: `{
  "message": "Queued 3 of 3 tracks for processing",
  "results": [
    { "trackId": "track_1", "status": "queued" },
    { "trackId": "track_2", "status": "queued" },
    { "trackId": "track_3", "status": "queued" }
  ],
  "summary": { "total": 3, "queued": 3, "failed": 0, "skipped": 0 }
}`,
        },
      },
    ],
  },
  {
    section: 'Export',
    description: 'Download processed audio and stems',
    endpoints: [
      {
        method: 'POST',
        path: '/api/export',
        description: 'Generate download URL for stems',
        example: {
          request: `curl -X POST -H "Content-Type: application/json" -d '{"trackId":"track_abc123","stemType":"all"}' https://yourapp.com/api/export`,
          response: `{
  "downloadUrl": "/api/download?file=track_abc123/stems.zip",
  "fileName": "My Track-stems.zip"
}`,
        },
      },
    ],
  },
  {
    section: 'Billing',
    description: 'Manage subscriptions and payments',
    endpoints: [
      {
        method: 'POST',
        path: '/api/stripe/checkout',
        description: 'Create a checkout session',
        example: {
          request: `curl -X POST -H "Content-Type: application/json" -d '{"plan":"pro"}' https://yourapp.com/api/stripe/checkout`,
          response: `{
  "url": "https://checkout.stripe.com/..."
}`,
        },
      },
      {
        method: 'POST',
        path: '/api/stripe/portal',
        description: 'Open customer portal for subscription management',
        example: {
          request: 'curl -X POST https://yourapp.com/api/stripe/portal',
          response: `{
  "url": "https://billing.stripe.com/..."
}`,
        },
      },
    ],
  },
];

export default function APIDocumentation() {
  const [copiedEndpoint, setCopiedEndpoint] = useState<string | null>(null);

  const copyToClipboard = (text: string, endpoint: string) => {
    navigator.clipboard.writeText(text);
    setCopiedEndpoint(endpoint);
    setTimeout(() => setCopiedEndpoint(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-white">
      <header className="bg-[var(--bg-secondary)] border-b border-[var(--bg-tertiary)]">
        <div className="container py-8">
          <div className="flex items-center gap-3 mb-4">
            <Code className="w-8 h-8 text-[var(--accent-primary)]" />
            <h1 className="text-3xl font-bold">API Documentation</h1>
          </div>
          <p className="text-[var(--text-secondary)] text-lg max-w-2xl">
            Build powerful audio processing workflows with the AI Mixer Pro API. 
            Access stems, process tracks, and manage subscriptions programmatically.
          </p>
        </div>
      </header>

      <main className="container py-12">
        <section className="mb-12">
          <div className="panel p-6 bg-[var(--accent-primary)]/10 border-[var(--accent-primary)]/30">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[var(--accent-primary)]" />
              Authentication
            </h2>
            <p className="text-[var(--text-secondary)] mb-4">
              All API requests require authentication using Clerk. Include your session token in the Authorization header:
            </p>
            <div className="bg-[var(--bg-tertiary)] rounded-lg p-4 font-mono text-sm overflow-x-auto">
              Authorization: Bearer your_clerk_session_token
            </div>
          </div>
        </section>

        {apiEndpoints.map((section, sectionIdx) => (
          <section key={section.section} className="mb-12">
            <h2 className="text-2xl font-bold mb-2">{section.section}</h2>
            <p className="text-[var(--text-secondary)] mb-6">{section.description}</p>
            
            <div className="space-y-6">
              {section.endpoints.map((endpoint, idx) => (
                <div key={`${sectionIdx}-${idx}`} className="panel p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <span className={`px-3 py-1 rounded font-mono text-sm font-bold ${
                      endpoint.method === 'GET' ? 'bg-green-500/20 text-green-400' :
                      endpoint.method === 'POST' ? 'bg-blue-500/20 text-blue-400' :
                      'bg-gray-500/20 text-gray-400'
                    }`}>
                      {endpoint.method}
                    </span>
                    <code className="text-[var(--accent-primary)]">{endpoint.path}</code>
                  </div>
                  
                  <p className="text-[var(--text-secondary)] mb-6">{endpoint.description}</p>
                  
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-[var(--text-secondary)]">Request</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(endpoint.example.request, `${sectionIdx}-${idx}-request`)}
                          className="text-[var(--text-secondary)] hover:text-white transition-colors"
                        >
                          {copiedEndpoint === `${sectionIdx}-${idx}-request` ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <pre className="bg-[var(--bg-tertiary)] rounded-lg p-4 text-sm font-mono overflow-x-auto">
                        {endpoint.example.request}
                      </pre>
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-[var(--text-secondary)]">Response</span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(endpoint.example.response, `${sectionIdx}-${idx}-response`)}
                          className="text-[var(--text-secondary)] hover:text-white transition-colors"
                        >
                          {copiedEndpoint === `${sectionIdx}-${idx}-response` ? (
                            <Check className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <pre className="bg-[var(--bg-tertiary)] rounded-lg p-4 text-sm font-mono overflow-x-auto">
                        {endpoint.example.response}
                      </pre>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Rate Limits</h2>
          <div className="panel p-6">
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <h3 className="font-semibold mb-2 text-[var(--accent-primary)]">Free Plan</h3>
                <p className="text-[var(--text-secondary)] text-sm">
                  10 requests/minute<br />
                  50 tracks/month
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-[var(--accent-primary)]">Pro Plan</h3>
                <p className="text-[var(--text-secondary)] text-sm">
                  100 requests/minute<br />
                  Unlimited tracks
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2 text-[var(--accent-primary)]">Studio Plan</h3>
                <p className="text-[var(--text-secondary)] text-sm">
                  500 requests/minute<br />
                  Priority processing
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
