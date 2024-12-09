import tiktokProvider from './tiktokProvider';

describe('TikTokProvider', () => {
  it('gets clip info from standard tiktok.com url', () => {
    expect(
      tiktokProvider.getIdFromUrl('https://www.tiktok.com/@scout2015/video/6718335390845095173')
    ).toEqual('6718335390845095173');
  });

  it('gets clip info from tiktok.com url without username', () => {
    expect(
      tiktokProvider.getIdFromUrl('https://www.tiktok.com/video/6718335390845095173')
    ).toEqual('6718335390845095173');
  });

  it('gets clip info from mobile vm.tiktok.com url', () => {
    expect(
      tiktokProvider.getIdFromUrl('https://vm.tiktok.com/ABC123XYZ')
    ).toEqual('ABC123XYZ');
  });

  it('returns undefined for invalid urls', () => {
    expect(
      tiktokProvider.getIdFromUrl('https://example.com')
    ).toBeUndefined();
  });

  it('returns undefined for malformed urls', () => {
    expect(
      tiktokProvider.getIdFromUrl('not-a-url')
    ).toBeUndefined();
  });

  // Testing the oEmbed API integration
  it('fetches clip info from oEmbed API', async () => {
    // Mock the fetch function
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            version: '1.0',
            type: 'video',
            title: 'Test Video',
            author_url: 'https://www.tiktok.com/@testuser',
            author_name: 'Test User',
            thumbnail_url: 'https://example.com/thumbnail.jpg',
          }),
      })
    ) as jest.Mock;

    const clip = await tiktokProvider.getClipById('6718335390845095173');
    expect(clip).toEqual({
      id: '6718335390845095173',
      title: 'Test Video',
      author: 'Test User',
      thumbnailUrl: 'https://example.com/thumbnail.jpg',
      submitters: [],
    });
  });

  it('handles failed API requests gracefully', async () => {
    // Mock a failed fetch
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
      })
    ) as jest.Mock;

    const clip = await tiktokProvider.getClipById('6718335390845095173');
    expect(clip).toBeUndefined();
  });
});