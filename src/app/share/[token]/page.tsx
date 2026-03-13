import { notFound } from 'next/navigation';
import { PrismaClient } from '@prisma/client';
import { Download, Music, Share2, Calendar, AlertCircle } from 'lucide-react';

export const dynamic = 'force-dynamic';

const prisma = new PrismaClient();

interface SharePageProps {
  params: Promise<{ token: string }>;
}

export default async function SharedTrackPage({ params }: SharePageProps) {
  const { token } = await params;

  const shareLink = await prisma.shareLink.findUnique({
    where: { token },
    include: {
      track: true,
    },
  });

  if (!shareLink) {
    notFound();
  }

  if (new Date() > shareLink.expiresAt) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-white flex items-center justify-center">
        <div className="panel p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-[var(--accent-secondary)] mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Link Expired</h1>
          <p className="text-[var(--text-secondary)]">
            This share link has expired and is no longer accessible.
          </p>
        </div>
      </div>
    );
  }

  if (shareLink.downloadCount >= (shareLink.maxDownloads || 0)) {
    return (
      <div className="min-h-screen bg-[var(--bg-primary)] text-white flex items-center justify-center">
        <div className="panel p-8 text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-[var(--accent-secondary)] mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Download Limit Reached</h1>
          <p className="text-[var(--text-secondary)]">
            This share link has reached its maximum number of downloads.
          </p>
        </div>
      </div>
    );
  }

  const expiresAt = new Date(shareLink.expiresAt);
  const daysRemaining = Math.ceil((expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-white">
      <div className="container py-16">
        <div className="max-w-2xl mx-auto">
          <div className="panel p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-xl bg-[var(--accent-primary)]/20 flex items-center justify-center">
                <Music className="w-8 h-8 text-[var(--accent-primary)]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">{shareLink.track.name}</h1>
                <p className="text-[var(--text-secondary)]">AI Mixer Pro - Shared Track</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-[var(--bg-tertiary)] rounded-lg p-4">
                <div className="flex items-center gap-2 text-[var(--text-secondary)] mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">Expires in</span>
                </div>
                <div className="text-xl font-bold">{daysRemaining} days</div>
              </div>
              <div className="bg-[var(--bg-tertiary)] rounded-lg p-4">
                <div className="flex items-center gap-2 text-[var(--text-secondary)] mb-1">
                  <Download className="w-4 h-4" />
                  <span className="text-sm">Downloads left</span>
                </div>
                <div className="text-xl font-bold">
                  {(shareLink.maxDownloads || 0) - shareLink.downloadCount}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <a
                href={`/api/download?file=${encodeURIComponent(shareLink.track.storedFilename)}&shareToken=${token}`}
                className="btn-primary w-full py-4 flex items-center justify-center gap-2 text-lg"
              >
                <Download className="w-5 h-5" />
                Download Full Mix (WAV)
              </a>
              {/* Stems download would require a different endpoint or logic, keeping placeholder for now */}
              <button
                type="button"
                className="btn-secondary w-full py-4 flex items-center justify-center gap-2"
                onClick={() => alert('Stem download feature coming soon!')}
              >
                <Share2 className="w-5 h-5" />
                Download All Stems (ZIP)
              </button>
            </div>

            <p className="text-center text-[var(--text-secondary)] text-sm mt-6">
              Powered by AI Mixer Pro • Professional Audio Stem Separation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
