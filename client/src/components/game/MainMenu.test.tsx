import { render, screen } from '@testing-library/react';
import MainMenu from './MainMenu';

vi.mock('../../lib/stores/useFooty', () => ({
  useFooty: () => ({ setGameState: vi.fn() }),
}));

describe('MainMenu', () => {
  it('renders title and menu items', () => {
    render(<MainMenu />);
    expect(screen.getByText(/AUSSIE RULES FOOTY/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Exhibition Match/i })).toBeInTheDocument();
  });
});

