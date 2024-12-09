import type { Clip } from '../../clipQueueSlice';
import type { ClipProvider } from '../providers';

interface TiktokOembedResponse {
  version: string;
  type: string;
  title: string;
  author_url: string;
  author_name: string;
  width: string;
  height: string;
  html: string;
  thumbnail_width: number;
  thumbnail_height: number;
  thumbnail_url: string;
  provider_url: string;
  provider_name: string;
}

class TikTokProvider implements ClipProvider {
  name = 'tiktok';

  getIdFromUrl(url: string): string | undefined {
    let uri: URL;
    try {
      uri = new URL(url);
    } catch {
      return undefined;
    }

    // Handle standard TikTok URLs (www.tiktok.com/@username/video/1234567890)
    if (uri.hostname.endsWith('tiktok.com')) {
      const matches = uri.pathname.match(/\/(?:@[\w.-]+\/)?video\/(\d+)/);
      if (matches) {
        return matches[1];
      }
    }

    // Handle shortened TikTok URLs (vm.tiktok.com/XXXXXXXXX)
    if (uri.hostname === 'vm.tiktok.com') {
      const idStart = uri.pathname.lastIndexOf('/');
      return uri.pathname.slice(idStart + 1);
    }

    return undefined;
  }

  async getClipById(id: string): Promise<Clip | undefined> {
    if (!id) {
      return undefined;
    }

    try {
      const url = `https://www.tiktok.com/oembed?url=https://www.tiktok.com/video/${id}`;
      const response = await fetch(url);
      if (!response.ok) {
        return undefined;
      }

      const data: TiktokOembedResponse = await response.json();
      
      return {
        id,
        title: data.title,
        author: data.author_name,
        thumbnailUrl: data.thumbnail_url,
        submitters: [],
      };
    } catch (error) {
      console.error('Error fetching TikTok video info:', error);
      return undefined;
    }
  }

  getUrl(id: string): string | undefined {
    return `https://www.tiktok.com/video/${id}`;
  }

  getEmbedUrl(id: string): string | undefined {
    // TikTok requires a script to be loaded for embeds to work
    // For compatibility with the existing system, we'll return a direct embed URL
    return `https://www.tiktok.com/embed/v2/${id}`;
  }

  async getAutoplayUrl(id: string): Promise<string | undefined> {
    return this.getUrl(id);
  }
}

const tiktokProvider = new TikTokProvider();
export default tiktokProvider;