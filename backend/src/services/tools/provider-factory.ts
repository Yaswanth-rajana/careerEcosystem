import { CONVERSION_PROVIDER, CLOUDCONVERT_API_KEY } from './constants';
import { ConversionProvider } from './conversion-provider';
import { CloudConvertConversionProvider } from './cloudconvert-provider';
import { GotenbergConversionProvider } from './gotenberg-provider';
import { MockConversionProvider } from './mock-conversion-provider';

export class ConversionProviderFactory {
  private static get instance(): ConversionProvider | null {
    return (globalThis as any).__conversionProviderInstance || null;
  }

  private static set instance(val: ConversionProvider | null) {
    (globalThis as any).__conversionProviderInstance = val;
  }

  public static getProvider(): ConversionProvider {
    if (this.instance) {
      return this.instance;
    }

    const providerType = (process.env.CONVERSION_PROVIDER || CONVERSION_PROVIDER || '').toLowerCase();
    const apiKey = process.env.CLOUDCONVERT_API_KEY || CLOUDCONVERT_API_KEY;

    if (providerType === 'mock') {
      this.instance = new MockConversionProvider();
    } else if (providerType === 'gotenberg') {
      this.instance = new GotenbergConversionProvider();
    } else if (apiKey) {
      this.instance = new CloudConvertConversionProvider(apiKey);
    } else if (providerType === 'cloudconvert' && apiKey) {
      this.instance = new CloudConvertConversionProvider(apiKey);
    } else {
      // In development when no external CloudConvert API key is configured and no Gotenberg container is running,
      // fallback to MockConversionProvider to allow offline browser conversion without 503 errors.
      console.warn('[CONVERSION_PROVIDER] No CLOUDCONVERT_API_KEY configured. Falling back to MockConversionProvider for seamless local development.');
      this.instance = new MockConversionProvider();
    }

    return this.instance;
  }

  /**
   * Sets custom provider (for testing or runtime override).
   */
  public static setProvider(provider: ConversionProvider | null): void {
    this.instance = provider;
  }
}
