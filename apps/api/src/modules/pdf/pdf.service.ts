import { spawn } from 'node:child_process';

import { HttpService } from '@nestjs/axios';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import FormData from 'form-data';
import { firstValueFrom } from 'rxjs';

import { DateRange } from '@/shared/pipes';
import { GenerateMenuQueryDto } from '@/shared/types';

import { TemplatesService } from '../template/templates.service';

export interface GeneratedFile {
  buffer: Buffer;
  fileName: string;
  contentType: string;
}

@Injectable()
export class PdfService {
  private readonly gotenbergUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly templatesService: TemplatesService
  ) {
    this.gotenbergUrl =
      this.configService.get<string>('GOTENBERG_URL') ||
      'http://localhost:3001';
  }

  async generateWeeklyMenuFile(
    restaurantId: number,
    dateRange: DateRange,
    query: GenerateMenuQueryDto
  ): Promise<GeneratedFile> {
    const { format, platform } = query;
    const finalFormat = format ?? 'pdf';

    const html = await this.templatesService.renderWeeklyMenuHtml(
      restaurantId,
      dateRange,
      platform
    );

    const buffer =
      finalFormat === 'png'
        ? await this.generateImageFromHtml(html)
        : await this.generatePdfFromHtml(html);

    const platformString = platform ? `-${platform}` : '';
    const fileName = `menu-weekly-${restaurantId}-${dateRange.year}-W${dateRange.weekNumber}${platformString}.${finalFormat}`;
    const contentType = finalFormat === 'png' ? 'image/png' : 'application/pdf';

    return { buffer, fileName, contentType };
  }

  // New method to handle daily menu generation
  async generateDailyMenuFile(
    restaurantId: number,
    dateRange: DateRange,
    query: GenerateMenuQueryDto
  ): Promise<GeneratedFile> {
    const { format, platform } = query;
    const finalFormat = format ?? 'pdf';

    const html = await this.templatesService.renderDailyMenuHtml(
      restaurantId,
      dateRange,
      platform
    );

    const buffer =
      finalFormat === 'png'
        ? await this.generateImageFromHtml(html)
        : await this.generatePdfFromHtml(html);

    const platformString = platform ? `-${platform}` : '';
    const fileName = `menu-daily-${restaurantId}-${dateRange.start}${platformString}.${finalFormat}`;
    const contentType = finalFormat === 'png' ? 'image/png' : 'application/pdf';

    return { buffer, fileName, contentType };
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
   * Generates an image from an HTML string by first converting to PDF, then to image.
   * @param html The HTML content to convert.
   * @param imageOptions Options for image conversion
   * @returns A Buffer containing the image data.
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
    form.append('files', Buffer.from(html), 'index.html');
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
          headers: form.getHeaders(),
          responseType: 'arraybuffer',
        })
      );

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
   * Converts PDF buffer to image using ImageMagick entirely in memory.
   * @param pdfBuffer The PDF buffer to convert
   * @param options Conversion options
   * @returns A Buffer containing the image data
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

    try {
      // Define the arguments for ImageMagick's 'convert' command
      const args = [
        '-density',
        density.toString(),
        '-quality',
        quality.toString(),
        '-background',
        'white',
        '-alpha',
        'remove',
        // Read from stdin ('-') and specify the page number
        `-[${page}]`,
        // Specify the output format and write to stdout ('-')
        `${format}:-`,
      ];

      // Run ImageMagick, piping the PDF buffer to its stdin
      return await this.runImageMagick(args, pdfBuffer);
    } catch (error) {
      console.error('ImageMagick in-memory conversion failed:', error);
      throw new InternalServerErrorException('Failed to convert PDF to image.');
    }
  }

  /**
   * Runs ImageMagick 'convert' command, piping input and collecting output.
   * @param args Arguments for the convert command
   * @param inputBuffer Buffer to be piped to the process's stdin
   * @returns A Promise that resolves with the output Buffer from stdout
   */
  private runImageMagick(args: string[], inputBuffer: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const convert = spawn('convert', args);

      const chunks: Buffer[] = [];
      let stderr = '';

      // Collect image data from stdout
      convert.stdout.on('data', chunk => {
        chunks.push(chunk);
      });

      // Collect error messages from stderr
      convert.stderr.on('data', data => {
        stderr += data.toString();
      });

      // Handle process exit
      convert.on('close', code => {
        if (code === 0) {
          resolve(Buffer.concat(chunks));
        } else {
          reject(
            new Error(`ImageMagick process exited with code ${code}: ${stderr}`)
          );
        }
      });

      // Handle spawn errors
      convert.on('error', error => {
        reject(
          new Error(`Failed to start ImageMagick process: ${error.message}`)
        );
      });

      // Write the PDF buffer to stdin and close it
      convert.stdin.write(inputBuffer);
      convert.stdin.end();
    });
  }

  /**
   * Generates an image from HTML by first converting to PDF, then to image.
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
      const pdfBuffer = await this.generatePdfFromHtml(html);
      return await this.convertPdfToImage(pdfBuffer, imageOptions);
    } catch (error) {
      console.error('HTML to image via PDF conversion failed:', error);
      throw new InternalServerErrorException(
        'Failed to generate image from HTML via PDF conversion.'
      );
    }
  }
}
