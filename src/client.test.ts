import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import { buildRequest, invoke } from './client.ts';

const cases = JSON.parse(readFileSync(new URL('../test/requests.json', import.meta.url), 'utf8'));
describe('ACE Music operations', () => {
  for (const name of Object.keys(cases)) {
    it('serializes ' + name, () => {
      const [values, [endpoint, body]] = cases[name];
      expect(buildRequest(name, values)).toEqual({ endpoint, body });
    });
  }
  it('preserves the original task and partial completion', async () => {
    const result = { id: 't1', response: { status: 'partial_failed', data: [{ audio_url: 'https://example.com/a.mp3' }] } };
    const send = vi.spyOn(globalThis, 'fetch').mockResolvedValue(Response.json(result));
    try {
      expect(await invoke('fixture', 'retrieve', { task_id: 't1' })).toEqual(result);
      expect(send).toHaveBeenCalledTimes(1);
      expect(JSON.parse(String(send.mock.calls[0][1]?.body))).toEqual({ action: 'retrieve', id: 't1' });
    } finally { send.mockRestore(); }
  });
});
