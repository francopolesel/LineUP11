import { describe, it, expect, beforeEach } from 'vitest'
import { useLineupStore } from './lineupStore'

describe('lineupStore shirt flow', () => {
  beforeEach(async () => {
    localStorage.clear();
    await useLineupStore.persist.rehydrate();
    useLineupStore.setState({ currentLineup: null, savedLineups: [] });
  });

  it('creates, sets a shirt, then clears it when picking a color', async () => {
    const api = useLineupStore.getState();
    await api.createNewLineup('Dream', '4-4-2');

    await useLineupStore.getState().updateShirt('boca');
    expect(useLineupStore.getState().currentLineup?.shirtId).toBe('boca');

    await useLineupStore.getState().updateColor('#1d4ed8');
    const current = useLineupStore.getState().currentLineup;
    expect(current?.shirtId).toBeNull();
    expect(current?.color).toBe('#1d4ed8');
  });

  it('toggling the same shirt twice clears it', async () => {
    const api = useLineupStore.getState();
    await api.createNewLineup('Dream', '4-4-2');
    const id = useLineupStore.getState().currentLineup!.shirtId;

    await useLineupStore.getState().updateShirt('river');
    expect(useLineupStore.getState().currentLineup?.shirtId).toBe('river');
    expect(id).toBeNull();
  });
})
