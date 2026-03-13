import { SignUp } from '@clerk/nextjs';
import AuthLayout from '@/components/auth/AuthLayout';

export default function SignUpPage() {
  return (
    <AuthLayout 
      title="Get Started"
      subtitle="Create your AI Mixer Pro account"
    >
      <div className="space-y-4">
        <SignUp 
          appearance={{ 
            variables: {
              '--color-background': 'var(--bg-secondary)',
              '--color-text': 'var(--text-primary)',
              '--color-border': 'var(--border-default)',
              '--color-border-destructive': 'var(--accent-secondary)',
              '--color-text-destructive': 'var(--accent-secondary)',
              '--color-background-destructive': 'var(--bg-tertiary)',
              '--color-text-success': 'var(--accent-primary)',
              '--color-background-success': 'var(--bg-tertiary)',
              '--color-text-warning': 'var(--accent-warning)',
              '--color-background-warning': 'var(--bg-tertiary)',
              '--color-text-primary': 'var(--accent-primary)',
              '--color-background-primary': 'var(--bg-tertiary)',
              '--color-text-secondary': 'var(--text-secondary)',
              '--color-background-secondary': 'var(--bg-tertiary)',
              '--radius-input': 'var(--radius-md)',
              '--radius-button': 'var(--radius-full)',
              '--border-width-input': '1px',
            } 
          }}
        />
      </div>
    </AuthLayout>
  );
}