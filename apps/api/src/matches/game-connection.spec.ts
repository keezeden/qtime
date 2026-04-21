import { preserveGameConnectionState, readGameConnection } from './game-connection';

describe('readGameConnection', () => {
  it('returns persisted game server connection metadata', () => {
    const connection = readGameConnection({
      gameServer: {
        httpUrl: 'http://localhost:3002',
        websocketPath: '/games/1/connect',
        websocketUrl: 'ws://localhost:3002/games/1/connect',
        version: 0,
      },
    });

    expect(connection).toEqual({
      httpUrl: 'http://localhost:3002',
      websocketPath: '/games/1/connect',
      websocketUrl: 'ws://localhost:3002/games/1/connect',
      version: 0,
    });
  });

  it('returns null when metadata is missing or invalid', () => {
    expect(readGameConnection({})).toBeNull();
    expect(readGameConnection({ gameServer: { websocketPath: '/games/1/connect' } })).toBeNull();
  });

  it('preserves connection metadata across state replacements', () => {
    const nextState = preserveGameConnectionState(
      { gameServer: { httpUrl: 'http://localhost:3002' } },
      { phase: 'submitted' },
    );

    expect(nextState).toEqual({
      phase: 'submitted',
      gameServer: { httpUrl: 'http://localhost:3002' },
    });
  });
});
