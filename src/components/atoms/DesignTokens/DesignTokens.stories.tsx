import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import './DesignTokens.css';

const meta: Meta = {
  title: 'Design System/Tokens',
  tags: ['autodocs'],
};

export default meta;

type Story = StoryObj;

export const Colors: Story = {
  render: () => (
    <div className="tokens-page">
      <h1 className="tokens-page__title">WC26 Design Tokens</h1>
      <p className="tokens-page__subtitle">FIFA World Cup 2026 Official Brand Colors</p>

      <section className="tokens-section">
        <h2 className="tokens-section__title">Primary Colors</h2>
        <p className="tokens-section__desc">Black - the official WC26 brand primary</p>
        <div className="color-grid">
          {[100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
            <div key={shade} className="color-card">
              <div
                className="color-card__swatch"
                style={{ backgroundColor: `var(--color-primary-${shade})` }}
              />
              <div className="color-card__info">
                <span className="color-card__name">Primary {shade}</span>
                <span className="color-card__value">var(--color-primary-{shade})</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="tokens-section">
        <h2 className="tokens-section__title">Accent - Electric Blue</h2>
        <p className="tokens-section__desc">Tournament energy & action</p>
        <div className="color-grid">
          {[100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
            <div key={shade} className="color-card">
              <div
                className="color-card__swatch"
                style={{ backgroundColor: `var(--color-accent-${shade})` }}
              />
              <div className="color-card__info">
                <span className="color-card__name">Accent {shade}</span>
                <span className="color-card__value">var(--color-accent-{shade})</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="tokens-section">
        <h2 className="tokens-section__title">Secondary - Magenta</h2>
        <p className="tokens-section__desc">Passion & culture</p>
        <div className="color-grid">
          {[100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
            <div key={shade} className="color-card">
              <div
                className="color-card__swatch"
                style={{ backgroundColor: `var(--color-secondary-${shade})` }}
              />
              <div className="color-card__info">
                <span className="color-card__name">Secondary {shade}</span>
                <span className="color-card__value">var(--color-secondary-{shade})</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="tokens-section">
        <h2 className="tokens-section__title">Tertiary - Orange</h2>
        <p className="tokens-section__desc">Warmth & excitement</p>
        <div className="color-grid">
          {[100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
            <div key={shade} className="color-card">
              <div
                className="color-card__swatch"
                style={{ backgroundColor: `var(--color-tertiary-${shade})` }}
              />
              <div className="color-card__info">
                <span className="color-card__name">Tertiary {shade}</span>
                <span className="color-card__value">var(--color-tertiary-{shade})</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="tokens-section">
        <h2 className="tokens-section__title">Gold - Trophy</h2>
        <p className="tokens-section__desc">Victory & celebration</p>
        <div className="color-grid">
          {[100, 200, 300, 400, 500, 600, 700, 800, 900].map((shade) => (
            <div key={shade} className="color-card">
              <div
                className="color-card__swatch"
                style={{ backgroundColor: `var(--color-gold-${shade})` }}
              />
              <div className="color-card__info">
                <span className="color-card__name">Gold {shade}</span>
                <span className="color-card__value">var(--color-gold-{shade})</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="tokens-section">
        <h2 className="tokens-section__title">Semantic Colors</h2>
        <div className="color-grid color-grid--semantic">
          <div className="color-card color-card--semantic">
            <div
              className="color-card__swatch"
              style={{ backgroundColor: 'var(--color-success)' }}
            />
            <div className="color-card__info">
              <span className="color-card__name">Success</span>
              <span className="color-card__value">var(--color-success)</span>
            </div>
          </div>
          <div className="color-card color-card--semantic">
            <div className="color-card__swatch" style={{ backgroundColor: 'var(--color-error)' }} />
            <div className="color-card__info">
              <span className="color-card__name">Error</span>
              <span className="color-card__value">var(--color-error)</span>
            </div>
          </div>
          <div className="color-card color-card--semantic">
            <div
              className="color-card__swatch"
              style={{ backgroundColor: 'var(--color-warning)' }}
            />
            <div className="color-card__info">
              <span className="color-card__name">Warning</span>
              <span className="color-card__value">var(--color-warning)</span>
            </div>
          </div>
          <div className="color-card color-card--semantic">
            <div className="color-card__swatch" style={{ backgroundColor: 'var(--color-info)' }} />
            <div className="color-card__info">
              <span className="color-card__name">Info</span>
              <span className="color-card__value">var(--color-info)</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  ),
};

export const Gradients: Story = {
  render: () => (
    <div className="tokens-page">
      <h1 className="tokens-page__title">WC26 Gradients</h1>
      <p className="tokens-page__subtitle">Tournament energy gradients</p>

      <div className="gradient-grid">
        <div className="gradient-card">
          <div className="gradient-card__swatch gradient-card__swatch--primary" />
          <div className="gradient-card__info">
            <span className="gradient-card__name">Primary</span>
            <span className="gradient-card__value">Blue → Magenta</span>
          </div>
        </div>
        <div className="gradient-card">
          <div className="gradient-card__swatch gradient-card__swatch--energy" />
          <div className="gradient-card__info">
            <span className="gradient-card__name">Energy</span>
            <span className="gradient-card__value">Blue → Orange</span>
          </div>
        </div>
        <div className="gradient-card">
          <div className="gradient-card__swatch gradient-card__swatch--trophy" />
          <div className="gradient-card__info">
            <span className="gradient-card__name">Trophy</span>
            <span className="gradient-card__value">Gold → Orange</span>
          </div>
        </div>
        <div className="gradient-card">
          <div className="gradient-card__swatch gradient-card__swatch--celebration" />
          <div className="gradient-card__info">
            <span className="gradient-card__name">Celebration</span>
            <span className="gradient-card__value">Gold → Magenta → Blue</span>
          </div>
        </div>
      </div>
    </div>
  ),
};

export const Typography: Story = {
  render: () => (
    <div className="tokens-page">
      <h1 className="tokens-page__title">Typography</h1>
      <p className="tokens-page__subtitle">Press Start 2P (all text)</p>

      <section className="tokens-section">
        <h2 className="tokens-section__title">Pixel Font - Headings</h2>
        <div className="type-specimen">
          <div className="type-specimen__row">
            <span className="type-specimen__size">XL</span>
            <h1 className="type-specimen__text">Heading XL - 2rem</h1>
          </div>
          <div className="type-specimen__row">
            <span className="type-specimen__size">LG</span>
            <h2 className="type-specimen__text">Heading LG - 1.5rem</h2>
          </div>
          <div className="type-specimen__row">
            <span className="type-specimen__size">MD</span>
            <h3 className="type-specimen__text">Heading MD - 1.25rem</h3>
          </div>
          <div className="type-specimen__row">
            <span className="type-specimen__size">SM</span>
            <h4 className="type-specimen__text">Heading SM - 1rem</h4>
          </div>
          <div className="type-specimen__row">
            <span className="type-specimen__size">XS</span>
            <h4 className="type-specimen__text" style={{ fontSize: 'var(--heading-xs)' }}>
              Heading XS - 0.75rem
            </h4>
          </div>
        </div>
      </section>

      <section className="tokens-section">
        <h2 className="tokens-section__title">Body Font - Inter</h2>
        <div className="type-specimen">
          <div className="type-specimen__row">
            <span className="type-specimen__size">4XL</span>
            <p className="type-specimen__text" style={{ fontSize: 'var(--text-4xl)' }}>
              Body 4XL - 2.5rem
            </p>
          </div>
          <div className="type-specimen__row">
            <span className="type-specimen__size">3XL</span>
            <p className="type-specimen__text" style={{ fontSize: 'var(--text-3xl)' }}>
              Body 3XL - 2rem
            </p>
          </div>
          <div className="type-specimen__row">
            <span className="type-specimen__size">2XL</span>
            <p className="type-specimen__text" style={{ fontSize: 'var(--text-2xl)' }}>
              Body 2XL - 1.5rem
            </p>
          </div>
          <div className="type-specimen__row">
            <span className="type-specimen__size">XL</span>
            <p className="type-specimen__text" style={{ fontSize: 'var(--text-xl)' }}>
              Body XL - 1.25rem
            </p>
          </div>
          <div className="type-specimen__row">
            <span className="type-specimen__size">LG</span>
            <p className="type-specimen__text" style={{ fontSize: 'var(--text-lg)' }}>
              Body LG - 1rem
            </p>
          </div>
          <div className="type-specimen__row">
            <span className="type-specimen__size">Base</span>
            <p className="type-specimen__text">Body Base - 0.875rem (default)</p>
          </div>
          <div className="type-specimen__row">
            <span className="type-specimen__size">SM</span>
            <p className="type-specimen__text" style={{ fontSize: 'var(--text-sm)' }}>
              Body SM - 0.75rem
            </p>
          </div>
          <div className="type-specimen__row">
            <span className="type-specimen__size">XS</span>
            <p className="type-specimen__text" style={{ fontSize: 'var(--text-xs)' }}>
              Body XS - 0.625rem
            </p>
          </div>
        </div>
      </section>
    </div>
  ),
};

export const Spacing: Story = {
  render: () => (
    <div className="tokens-page">
      <h1 className="tokens-page__title">Spacing</h1>
      <p className="tokens-page__subtitle">4px base unit scale</p>

      <div className="spacing-grid">
        {[
          { name: 'Space 1', value: '4px', var: '--space-1' },
          { name: 'Space 2', value: '8px', var: '--space-2' },
          { name: 'Space 3', value: '12px', var: '--space-3' },
          { name: 'Space 4', value: '16px', var: '--space-4' },
          { name: 'Space 5', value: '20px', var: '--space-5' },
          { name: 'Space 6', value: '24px', var: '--space-6' },
          { name: 'Space 8', value: '32px', var: '--space-8' },
          { name: 'Space 10', value: '40px', var: '--space-10' },
          { name: 'Space 12', value: '48px', var: '--space-12' },
          { name: 'Space 16', value: '64px', var: '--space-16' },
          { name: 'Space 20', value: '80px', var: '--space-20' },
          { name: 'Space 24', value: '96px', var: '--space-24' },
        ].map((space) => (
          <div key={space.var} className="spacing-card">
            <div className="spacing-card__bar" style={{ width: space.value }} />
            <div className="spacing-card__info">
              <span className="spacing-card__name">{space.name}</span>
              <span className="spacing-card__value">{space.value}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const Shadows: Story = {
  render: () => (
    <div className="tokens-page">
      <h1 className="tokens-page__title">Shadows</h1>
      <p className="tokens-page__subtitle">Blocky pixel shadows (no blur)</p>

      <div className="shadow-grid">
        <div className="shadow-card">
          <div className="shadow-card__box shadow-card__box--sm" />
          <span className="shadow-card__name">SM - 2px</span>
        </div>
        <div className="shadow-card">
          <div className="shadow-card__box shadow-card__box--md" />
          <span className="shadow-card__name">MD - 4px</span>
        </div>
        <div className="shadow-card">
          <div className="shadow-card__box shadow-card__box--lg" />
          <span className="shadow-card__name">LG - 6px</span>
        </div>
        <div className="shadow-card">
          <div className="shadow-card__box shadow-card__box--xl" />
          <span className="shadow-card__name">XL - 8px</span>
        </div>
      </div>

      <h2 className="tokens-section__title" style={{ marginTop: '2rem' }}>
        Colored Shadows
      </h2>
      <div className="shadow-grid">
        <div className="shadow-card">
          <div className="shadow-card__box shadow-card__box--accent" />
          <span className="shadow-card__name">Accent</span>
        </div>
        <div className="shadow-card">
          <div className="shadow-card__box shadow-card__box--secondary" />
          <span className="shadow-card__name">Secondary</span>
        </div>
        <div className="shadow-card">
          <div className="shadow-card__box shadow-card__box--gold" />
          <span className="shadow-card__name">Gold</span>
        </div>
        <div className="shadow-card">
          <div className="shadow-card__box shadow-card__box--error" />
          <span className="shadow-card__name">Error</span>
        </div>
      </div>
    </div>
  ),
};
