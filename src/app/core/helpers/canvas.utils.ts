import { ElementRef } from '@angular/core';

export abstract class CanvasUtils {
  static getCanvasElements(canvasRef: ElementRef<HTMLCanvasElement>): {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
  } | null {
    const canvas = canvasRef?.nativeElement;
    if (!canvas) return null;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    return { canvas, ctx };
  }
}
