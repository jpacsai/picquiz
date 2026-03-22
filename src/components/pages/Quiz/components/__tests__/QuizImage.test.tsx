import { createTheme, ThemeProvider } from '@mui/material/styles';
import { render, screen } from '@testing-library/react';
import type { ReactNode } from 'react';
import { describe, expect, it } from 'vitest';

import QuizImage from '../QuizImage';

const renderWithTheme = (ui: ReactNode, mode: 'light' | 'dark') =>
  render(<ThemeProvider theme={createTheme({ palette: { mode } })}>{ui}</ThemeProvider>);

describe('QuizImage', () => {
  it('renders the image with the expected alt text and source', () => {
    renderWithTheme(
      <QuizImage
        topicLabel="Muveszet"
        currentQuestionCorrectAnswer="Mona Lisa"
        currentImageUrl="https://example.com/image.jpg"
      />,
      'light',
    );

    const image = screen.getByRole('img', { name: 'Muveszet - Mona Lisa' });

    expect(image).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('uses a black background in dark mode', () => {
    const { container } = renderWithTheme(
      <QuizImage
        topicLabel="Muveszet"
        currentQuestionCorrectAnswer="Mona Lisa"
        currentImageUrl="https://example.com/image.jpg"
      />,
      'dark',
    );

    expect(container.firstChild).toHaveStyle({ backgroundColor: '#000' });
  });

  it('uses a white background in light mode', () => {
    const { container } = renderWithTheme(
      <QuizImage
        topicLabel="Muveszet"
        currentQuestionCorrectAnswer="Mona Lisa"
        currentImageUrl="https://example.com/image.jpg"
      />,
      'light',
    );

    expect(container.firstChild).toHaveStyle({ backgroundColor: '#fff' });
  });
});
