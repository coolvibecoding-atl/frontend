# AI Mixer Pro Design System

## Brand Identity

### Color Palette - Warm Organic Studio Wood Theme

```css
/* Primary Colors */
--bg-primary: #0a0c0f;        /* Deep charcoal base */
--bg-secondary: #12151a;       /* Elevated surface */
--bg-tertiary: #1a1e26;       /* Card backgrounds */
--bg-elevated: #222830;       /* Hover states */

/* Accent Colors - Studio Wood */
--accent-primary: #A0522D;     /* Sienna - main brand */
--accent-secondary: #CD853F;  /* Peru - secondary */
--accent-tertiary: #DEB887;   /* Burlywood - highlights */
--accent-warning: #D2691E;    /* Chocolate - alerts */

/* Text Colors */
--text-primary: #FDF5E6;       /* Old Lace - main text */
--text-secondary: #D2B48C;   /* Tan - secondary */
--text-muted: #BCAAA4;        /* Muted warm */

/* Borders */
--border-default: #2a3040;
--border-hover: #3a4560;
```

### Typography

- **Display Font**: Space Grotesk (headings)
- **Body Font**: Inter (paragraphs)
- **Mono Font**: JetBrains Mono (code/technical)

### Spacing Scale

```
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

---

## Components

### Button Variants

#### Primary Button
```jsx
<button className="btn-primary">
  {/* Background: var(--accent-primary) */}
  {/* Color: var(--bg-primary) */}
  {/* Padding: var(--space-3) var(--space-6) */}
  {/* Border-radius: var(--radius-full) */}
  {/* Hover: shadow-glow-lg + translateY(-1px) */}
</button>
```

#### Secondary Button
```jsx
<button className="btn-secondary">
  {/* Background: transparent */}
  {/* Border: 1px solid var(--border-default) */}
  {/* Hover: border-color -> accent-primary */}
</button>
```

### Panel Component
```jsx
<div className="panel">
  {/* Background: var(--surface-solid) */}
  {/* Border: 1px solid var(--border-default) */}
  {/* Border-radius: var(--radius-xl) */}
</div>
```

### Glass Effect
```jsx
<div className="glass">
  {/* Background: var(--surface-glass) */}
  {/* Backdrop-filter: blur(20px) */}
  {/* Border: 1px solid var(--border-default) */}
</div>
```

---

## Animation Guidelines

### Reduced Motion Support
Always support `prefers-reduced-motion`:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Animation Patterns

1. **Fade In Up** - For section entries
```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6 }}
/>
```

2. **Stagger Children** - For lists
```jsx
<motion.div
  transition={{ duration: 0.3, delay: index * 0.05 }}
/>
```

3. **Scale In** - For modals
```jsx
<motion.div
  initial={{ opacity: 0, scale: 0.95 }}
  animate={{ opacity: 1, scale: 1 }}
/>
```

---

## Accessibility

### Touch Targets
- Minimum 48x48px for all interactive elements
- Mobile navigation buttons
- Form controls
- CTAs

### Focus States
```css
--focus-ring: 0 0 0 2px var(--bg-primary), 0 0 0 4px var(--accent-primary);
--focus-ring-sm: 0 0 0 2px var(--bg-primary), 0 0 0 3px var(--accent-primary);
```

### ARIA Patterns
- Use `aria-label` for icon-only buttons
- Use `aria-expanded` for collapsible elements
- Use `aria-controls` to link controls to content

---

## Utility Classes

### Text Gradient
```jsx
<span className="text-gradient">
  {/* Linear gradient from accent-primary to accent-tertiary */}
</span>
```

### Glow Effect
```jsx
<div className="shadow-glow">
  {/* Box-shadow with accent-primary at 25% opacity */}
</div>
```

### Container
```jsx
<div className="container">
  {/* max-width: 1280px */}
  {/* padding: var(--space-6) on mobile */}
</div>
```

---

## Responsive Breakpoints

```css
/* Mobile First */
sm: 640px   /* Small phones */
md: 768px   /* Tablets */
lg: 1024px  /* Laptops */
xl: 1280px  /* Desktops */
2xl: 1536px /* Large screens */
```

---

## Empty State Pattern

Use the `EmptyState` component for consistent empty states:

```jsx
<EmptyState
  icon={Music}
  title="Your studio is empty"
  description="Upload your first track..."
  action={{
    label: 'Upload Track',
    href: '/mixer'
  }}
  variant="centered"
/>
```

---

## Audio Visualization

### Waveform Bar
```jsx
<div className="waveform-bar">
  {/* Height animated between 20-80% */}
  {/* Gradient from accent-primary to accent-tertiary */}
</div>
```

### VU Meter
```jsx
<div className="vu-meter">
  {/* 12 segments with green/yellow/red states */}
</div>
```

---

## Section Templates

### Hero Section
- Full viewport height
- Centered content
- CTA buttons
- Trust badges

### Feature Grid
- 3-column grid (desktop)
- Icon + title + description
- Benefit-driven copy

### Pricing Cards
- 3 tiers with popular highlight
- Feature list
- CTA button
- Benefit statement

### Testimonials
- Grid layout
- Avatar, name, role
- Quote text
- Metrics/results

---

## Best Practices

1. **Always use semantic HTML** - `<nav>`, `<main>`, `<section>`, `<article>`
2. **Maintain color contrast** - Minimum 4.5:1 for text
3. **Support keyboard navigation** - All interactive elements focusable
4. **Provide clear CTAs** - Action-oriented, benefit-focused
5. **Use consistent spacing** - Follow the spacing scale
6. **Test on mobile** - Touch targets, responsive layouts
