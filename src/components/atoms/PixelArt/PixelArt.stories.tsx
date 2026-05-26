import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { PixelArt } from './PixelArt';
import type { PixelArtName } from './PixelArt';

const meta: Meta<typeof PixelArt> = {
  title: 'Design System/Pixel Art',
  component: PixelArt,
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'select',
      options: [
        'football',
        'trophy',
        'stadium',
        'whistle',
        'star',
        'goal',
        'empty',
        'medal-gold',
        'medal-silver',
        'medal-bronze',
        'ball-kick',
        'referee',
        'crowd',
      ],
    },
    size: {
      control: 'range',
      min: 16,
      max: 128,
      step: 8,
    },
    animated: {
      control: 'boolean',
    },
  },
};

export default meta;

type Story = StoryObj<typeof PixelArt>;

export const AllAssets: Story = {
  render: () => (
    <div style={{ padding: '2rem' }}>
      <h1
        style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: 'var(--heading-lg)',
          marginBottom: '0.5rem',
        }}
      >
        WC26 Pixel Art Assets
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Retro pixel art sprites for the Quiniela app
      </p>

      <section style={{ marginBottom: '2rem' }}>
        <h2
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: 'var(--heading-sm)',
            color: 'var(--color-accent-500)',
            marginBottom: '1rem',
          }}
        >
          Tournament Icons
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {(['football', 'trophy', 'stadium', 'whistle', 'star', 'goal'] as PixelArtName[]).map(
            (name) => (
              <div
                key={name}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '1rem',
                  background: 'var(--bg-card)',
                  border: 'var(--border-width-md) solid var(--border-color)',
                  boxShadow: 'var(--shadow-md)',
                }}
              >
                <PixelArt name={name} size={48} animated />
                <span
                  style={{
                    fontFamily: 'var(--font-pixel)',
                    fontSize: 'var(--text-xs)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  {name}
                </span>
              </div>
            ),
          )}
        </div>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: 'var(--heading-sm)',
            color: 'var(--color-accent-500)',
            marginBottom: '1rem',
          }}
        >
          Medals
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {(['medal-gold', 'medal-silver', 'medal-bronze'] as PixelArtName[]).map((name) => (
            <div
              key={name}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '1rem',
                background: 'var(--bg-card)',
                border: 'var(--border-width-md) solid var(--border-color)',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <PixelArt name={name} size={48} animated />
              <span
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-secondary)',
                }}
              >
                {name.replace('-', ' ')}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2
          style={{
            fontFamily: 'var(--font-pixel)',
            fontSize: 'var(--heading-sm)',
            color: 'var(--color-accent-500)',
            marginBottom: '1rem',
          }}
        >
          Scene Elements
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
            gap: '1.5rem',
          }}
        >
          {(['ball-kick', 'referee', 'crowd', 'empty'] as PixelArtName[]).map((name) => (
            <div
              key={name}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '1rem',
                background: 'var(--bg-card)',
                border: 'var(--border-width-md) solid var(--border-color)',
                boxShadow: 'var(--shadow-md)',
              }}
            >
              <PixelArt name={name} size={48} animated />
              <span
                style={{
                  fontFamily: 'var(--font-pixel)',
                  fontSize: 'var(--text-xs)',
                  color: 'var(--text-secondary)',
                }}
              >
                {name.replace('-', ' ')}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  ),
};

export const Sizes: Story = {
  render: () => (
    <div style={{ padding: '2rem' }}>
      <h1
        style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: 'var(--heading-lg)',
          marginBottom: '1.5rem',
        }}
      >
        Size Variations
      </h1>
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1.5rem', flexWrap: 'wrap' }}>
        {[16, 24, 32, 48, 64, 96, 128].map((size) => (
          <div
            key={size}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <PixelArt name="trophy" size={size} animated />
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                color: 'var(--text-muted)',
              }}
            >
              {size}px
            </span>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const Animated: Story = {
  render: () => (
    <div style={{ padding: '2rem' }}>
      <h1
        style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: 'var(--heading-lg)',
          marginBottom: '1.5rem',
        }}
      >
        Animated Sprites
      </h1>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: '1.5rem',
        }}
      >
        {(['football', 'trophy', 'star', 'goal', 'ball-kick'] as PixelArtName[]).map((name) => (
          <div
            key={name}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '1.5rem',
              background: 'var(--bg-card)',
              border: 'var(--border-width-md) solid var(--border-color)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <PixelArt name={name} size={64} animated />
            <span
              style={{
                fontFamily: 'var(--font-pixel)',
                fontSize: 'var(--text-xs)',
                color: 'var(--color-accent-500)',
              }}
            >
              {name}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 'var(--text-xs)',
                color: 'var(--text-muted)',
              }}
            >
              {name === 'trophy'
                ? 'glow'
                : name === 'star'
                  ? 'bounce'
                  : name === 'goal'
                    ? 'celebrate'
                    : 'pulse'}
            </span>
          </div>
        ))}
      </div>
    </div>
  ),
};

export const HeroComposition: Story = {
  render: () => (
    <div
      style={{
        padding: '2rem',
        background: 'var(--gradient-wc26-stadium)',
        minHeight: '300px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
      }}
    >
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
        <PixelArt name="crowd" size={64} animated />
        <PixelArt name="trophy" size={96} animated />
        <PixelArt name="crowd" size={64} animated />
      </div>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <PixelArt name="football" size={32} animated />
        <PixelArt name="star" size={32} animated />
        <PixelArt name="football" size={32} animated />
      </div>
      <h1
        style={{
          fontFamily: 'var(--font-pixel)',
          fontSize: 'var(--heading-xl)',
          color: 'var(--color-gold-500)',
          textShadow: 'var(--shadow-gold)',
        }}
      >
        QUINIELA 2026
      </h1>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          color: 'var(--text-secondary)',
          fontSize: 'var(--text-lg)',
        }}
      >
        World Cup Predictions
      </p>
    </div>
  ),
};
