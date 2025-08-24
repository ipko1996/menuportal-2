import { spawn } from 'node:child_process';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import { promisify } from 'node:util';

import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import FormData from 'form-data';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PdfService {
  private readonly gotenbergUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService
  ) {
    this.gotenbergUrl =
      this.configService.get<string>('GOTENBERG_URL') ||
      'http://localhost:3001';
  }

  /**
   * Generates a PDF from an HTML string using Gotenberg.
   * @param html The HTML content to convert.
   * @returns A Buffer containing the PDF data.
   */
  async generatePdfFromHtml(html: string): Promise<Buffer> {
    const conversionUrl = `${this.gotenbergUrl}/forms/chromium/convert/html`;
    return this.convertToPdf(conversionUrl, html);
  }

  /**
   * Generates an image (PNG) from an HTML string by first converting to PDF, then to image.
   * @param html The HTML content to convert.
   * @param imageOptions Options for image conversion
   * @returns A Buffer containing the PNG image data.
   */
  async generateImageFromHtml(
    html: string,
    imageOptions: {
      density?: number;
      quality?: number;
      format?: 'png' | 'jpg' | 'jpeg';
      page?: number;
    } = {}
  ): Promise<Buffer> {
    return this.generateImageFromHtmlViaPdf(html, imageOptions);
  }

  /**
   * PDF conversion method using Gotenberg.
   * @param url The Gotenberg endpoint URL
   * @param html The HTML content to convert
   * @returns A Buffer containing the PDF data
   */
  private async convertToPdf(url: string, html: string): Promise<Buffer> {
    const form = new FormData();
    // Gotenberg expects the HTML content as a file named 'index.html'
    form.append('files', Buffer.from(html), 'index.html');

    // PDF-specific options
    form.append('paperWidth', '8.27');
    form.append('paperHeight', '11.7');
    form.append('orientation', 'portrait');
    form.append('marginTop', '0');
    form.append('marginBottom', '0');
    form.append('marginLeft', '0');
    form.append('marginRight', '0');

    try {
      const response = await firstValueFrom(
        this.httpService.post(url, form, {
          headers: {
            ...form.getHeaders(),
          },
          responseType: 'arraybuffer',
        })
      );

      // Validate content type
      const contentType = response.headers['content-type'];
      if (contentType && !contentType.includes('application/pdf')) {
        throw new InternalServerErrorException(
          `Unexpected response type: ${contentType}. Expected: application/pdf`
        );
      }

      return response.data;
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error(
        'Gotenberg PDF conversion failed:',
        axiosError.response?.data
      );
      throw new InternalServerErrorException(
        'Failed to generate PDF document.'
      );
    }
  }

  /**
   * Converts PDF buffer to image using ImageMagick.
   * @param pdfBuffer The PDF buffer to convert
   * @param options Conversion options
   * @returns A Buffer containing the PNG image data
   */
  async convertPdfToImage(
    pdfBuffer: Buffer,
    options: {
      density?: number;
      quality?: number;
      format?: 'png' | 'jpg' | 'jpeg';
      page?: number;
    } = {}
  ): Promise<Buffer> {
    const { density = 150, quality = 90, format = 'png', page = 0 } = options;

    const tempDir = os.tmpdir();
    const tempPdfPath = path.join(tempDir, `temp_${Date.now()}.pdf`);
    const tempImagePath = path.join(tempDir, `temp_${Date.now()}.${format}`);

    try {
      // Write PDF buffer to temporary file
      await fs.promises.writeFile(tempPdfPath, pdfBuffer);

      // Convert PDF to image using ImageMagick
      await this.runImageMagick([
        '-density',
        density.toString(),
        '-quality',
        quality.toString(),
        '-background',
        'white', // Set background to white
        '-alpha',
        'remove', // Remove alpha channel (make opaque)
        `${tempPdfPath}[${page}]`, // Specify page number
        tempImagePath,
      ]);

      // Read the generated image
      return await fs.promises.readFile(tempImagePath);
    } catch (error) {
      console.error('ImageMagick conversion failed:', error);
      throw new InternalServerErrorException('Failed to convert PDF to image.');
    } finally {
      // Cleanup temporary files
      try {
        await fs.promises.unlink(tempPdfPath);
        await fs.promises.unlink(tempImagePath);
      } catch (cleanupError) {
        console.warn('Failed to cleanup temporary files:', cleanupError);
      }
    }
  }

  /**
   * Runs ImageMagick convert command with given arguments.
   * @param args Arguments for the convert command
   * @returns Promise that resolves when command completes
   */
  private runImageMagick(args: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      const convert = spawn('convert', args);

      let stderr = '';

      convert.stderr.on('data', data => {
        stderr += data.toString();
      });

      convert.on('close', code => {
        if (code === 0) {
          resolve();
        } else {
          reject(
            new Error(`ImageMagick process exited with code ${code}: ${stderr}`)
          );
        }
      });

      convert.on('error', error => {
        reject(
          new Error(`Failed to start ImageMagick process: ${error.message}`)
        );
      });
    });
  }

  /**
   * Generates an image from HTML by first converting to PDF, then to image.
   * This method provides an alternative when direct HTML-to-image conversion isn't suitable.
   * @param html The HTML content to convert
   * @param imageOptions Options for image conversion
   * @returns A Buffer containing the image data
   */
  async generateImageFromHtmlViaPdf(
    html: string,
    imageOptions: {
      density?: number;
      quality?: number;
      format?: 'png' | 'jpg' | 'jpeg';
      page?: number;
    } = {}
  ): Promise<Buffer> {
    try {
      // First convert HTML to PDF
      const pdfBuffer = await this.generatePdfFromHtml(html);

      // Then convert PDF to image
      return await this.convertPdfToImage(pdfBuffer, imageOptions);
    } catch (error) {
      console.error('HTML to image via PDF conversion failed:', error);
      throw new InternalServerErrorException(
        'Failed to generate image from HTML via PDF conversion.'
      );
    }
  }
}
