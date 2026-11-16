import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test } from 'vitest';
import { ProjectGalleryOverlayEnhanced, ProjectGalleryStack } from './gallery.jsx';
import {
  getGalleryOverflowCount,
  getMediaOrientation,
  getNextGalleryIndex,
  getPreviousGalleryIndex,
  getSwipeDirection,
  getVisibleGalleryItems,
  normalizeGalleryItems,
  normalizeProjectItem,
  parseGalleryUrls,
} from './project-gallery';

afterEach(() => {
  cleanup();
});

describe('parseGalleryUrls', () => {
  test('trims lines and removes blanks', () => {
    expect(
      parseGalleryUrls(`
        https://media.example.com/demo/one.png

        https://media.example.com/demo/two.gif
      `)
    ).toEqual([
      'https://media.example.com/demo/one.png',
      'https://media.example.com/demo/two.gif',
    ]);
  });

  test('returns an empty array for empty input', () => {
    expect(parseGalleryUrls('   \n \n')).toEqual([]);
  });

  test('preserves gallery order exactly as entered by the admin', () => {
    expect(
      parseGalleryUrls([
        ' https://media.example.com/demo/first.png ',
        '',
        'https://media.example.com/demo/second.gif',
      ].join('\n'))
    ).toEqual([
      'https://media.example.com/demo/first.png',
      'https://media.example.com/demo/second.gif',
    ]);
  });
});

describe('normalizeGalleryItems', () => {
  test('normalizes string and object inputs into gallery items', () => {
    expect(
      normalizeGalleryItems([
        ' https://media.example.com/demo/one.png ',
        { url: 'https://media.example.com/demo/two.gif', caption: 'Motion demo' },
        { url: '   ', caption: 'Ignored' },
      ])
    ).toEqual([
      { url: 'https://media.example.com/demo/one.png', caption: '', kind: 'image' },
      { url: 'https://media.example.com/demo/two.gif', caption: 'Motion demo', kind: 'image' },
    ]);
  });

  test('marks direct video urls as video media', () => {
    expect(
      normalizeGalleryItems([
        { url: 'https://media.example.com/demo/video/demo-reel.mp4', caption: 'Looping reel' },
      ])
    ).toEqual([
      {
        url: 'https://media.example.com/demo/video/demo-reel.mp4',
        caption: 'Looping reel',
        kind: 'video',
      },
    ]);
  });
});

describe('normalizeProjectItem', () => {
  test('normalizes featured flag and gallery structure', () => {
    expect(
      normalizeProjectItem({
        name: 'Mizan',
        featured: 'yes',
        gallery: ['1.png', { url: '2.png', caption: 'Second' }],
      })
    ).toEqual({
      name: 'Mizan',
      featured: false,
      gallery: [
        { url: '1.png', caption: '', kind: 'image' },
        { url: '2.png', caption: 'Second', kind: 'image' },
      ],
    });
  });
});

describe('gallery stack helpers', () => {
  const items = ['a', 'b', 'c', 'd', 'e'];

  test('shows only the first three preview items', () => {
    expect(getVisibleGalleryItems(items)).toEqual(['a', 'b', 'c']);
  });

  test('computes overflow count beyond the visible stack', () => {
    expect(getGalleryOverflowCount(items)).toBe(2);
    expect(getGalleryOverflowCount(['a', 'b', 'c'])).toBe(0);
  });
});

describe('overlay index helpers', () => {
  test('wraps forward from the end to the start', () => {
    expect(getNextGalleryIndex(2, 3)).toBe(0);
  });

  test('wraps backward from the start to the end', () => {
    expect(getPreviousGalleryIndex(0, 3)).toBe(2);
  });

  test('detects media orientation from natural size', () => {
    expect(getMediaOrientation(800, 400)).toBe('landscape');
    expect(getMediaOrientation(300, 700)).toBe('portrait');
    expect(getMediaOrientation(500, 500)).toBe('square');
  });

  test('detects horizontal swipe direction', () => {
    expect(getSwipeDirection({ startX: 200, startY: 10, endX: 100, endY: 20 })).toBe('left');
    expect(getSwipeDirection({ startX: 100, startY: 10, endX: 180, endY: 20 })).toBe('right');
    expect(getSwipeDirection({ startX: 100, startY: 10, endX: 120, endY: 80 })).toBe(null);
  });
});

describe('ProjectGalleryStack', () => {
  test('renders only three stacked preview cards even when more media exists', () => {
    render(
      <ProjectGalleryStack
        projectName="Mizan"
        items={['1.png', '2.png', '3.png', '4.png', '5.png']}
        onOpen={function() {}}
      />
    );

    expect(screen.getAllByRole('button')).toHaveLength(3);
    expect(screen.getByText('+2')).toBeInTheDocument();
  });

  test('opens the overlay from the clicked preview index', async () => {
    const user = userEvent.setup();
    let onOpenIndex = null;

    render(
      <ProjectGalleryStack
        projectName="Mizan"
        items={['1.png', '2.png', '3.png', '4.png']}
        onOpen={function(index) { onOpenIndex = index; }}
      />
    );

    await user.click(screen.getByRole('button', { name: /open mizan gallery image 2/i }));
    expect(onOpenIndex).toBe(1);
  });

  test('hides the stack when no gallery items are present', () => {
    render(
      <ProjectGalleryStack
        projectName="Mizan"
        items={[]}
        onOpen={function() {}}
      />
    );

    expect(screen.queryByLabelText(/gallery previews/i)).not.toBeInTheDocument();
  });

  test('renders gallery videos as looping muted previews', () => {
    render(
      <ProjectGalleryStack
        projectName="Mizan"
        items={[{ url: 'https://media.example.com/demo/video/demo-reel.mp4', caption: 'Reel' }]}
        onOpen={function() {}}
      />
    );

    var video = screen.getByLabelText(/open mizan gallery image 1/i).querySelector('video');
    expect(video).not.toBeNull();
    // playback is gated by IntersectionObserver (plays only on screen),
    // so the element itself must not autoplay
    expect(video.autoplay).toBe(false);
    expect(video.loop).toBe(true);
    expect(video.muted).toBe(true);
  });
});

describe('ProjectGalleryOverlayEnhanced', () => {
  test('moves right and left through overlay media with wrapping', async () => {
    const user = userEvent.setup();

    function Harness() {
      const _React$useState = React.useState(0);
      const index = _React$useState[0];
      const setIndex = _React$useState[1];

      return (
        <ProjectGalleryOverlayEnhanced
          projectName="Mizan"
          items={[
            { url: '1.png', caption: 'First' },
            { url: '2.png', caption: 'Second' },
            { url: '3.png', caption: 'Third' },
          ]}
          activeIndex={index}
          onChangeIndex={setIndex}
          onClose={function() {}}
        />
      );
    }

    render(<Harness />);

    await user.click(screen.getByRole('button', { name: /next gallery item/i }));
    expect(screen.getByText('2 / 3')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /previous gallery item/i }));
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  test('closes the overlay when escape is pressed', () => {
    let closed = false;

    render(
      <ProjectGalleryOverlayEnhanced
        projectName="Mizan"
        items={[{ url: '1.png', caption: 'Only' }]}
        activeIndex={0}
        onChangeIndex={function() {}}
        onClose={function() { closed = true; }}
      />
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(closed).toBe(true);
  });

  test('shows the active caption and allows selecting from sidebar thumbnails', async () => {
    const user = userEvent.setup();

    function Harness() {
      const _React$useState = React.useState(0);
      const index = _React$useState[0];
      const setIndex = _React$useState[1];

      return (
        <ProjectGalleryOverlayEnhanced
          projectName="Mizan"
          items={[
            { url: '1.png', caption: 'First caption' },
            { url: '2.png', caption: 'Second caption' },
          ]}
          activeIndex={index}
          onChangeIndex={setIndex}
          onClose={function() {}}
        />
      );
    }

    render(<Harness />);

    expect(screen.getByText('First caption', { selector: '.project-gallery-caption' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /open mizan gallery thumbnail 2/i }));
    expect(screen.getByText('Second caption', { selector: '.project-gallery-caption' })).toBeInTheDocument();
  });

  test('renders video items inside the overlay as looping media', () => {
    render(
      <ProjectGalleryOverlayEnhanced
        projectName="Mizan"
        items={[{ url: 'https://media.example.com/demo/video/demo-reel.mp4', caption: 'Motion demo' }]}
        activeIndex={0}
        onChangeIndex={function() {}}
        onClose={function() {}}
      />
    );

    var video = screen.getByRole('dialog').querySelector('.project-gallery-active-stage video');
    expect(video).not.toBeNull();
    // playback is gated by IntersectionObserver (plays only on screen),
    // so the element itself must not autoplay
    expect(video.autoplay).toBe(false);
    expect(video.loop).toBe(true);
    expect(video.muted).toBe(true);
  });
});
