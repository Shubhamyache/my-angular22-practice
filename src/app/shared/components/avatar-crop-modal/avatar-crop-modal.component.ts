/**
 * ═══════════════════════════════════════════════════════════════════
 * AVATAR CROP MODAL — reusable image-crop step before an upload
 * ═══════════════════════════════════════════════════════════════════
 * Wraps the shared ModalComponent (same shell every other modal in the app uses) around a
 * canvas-based cropper: drag to reposition, slider to zoom, output is a square JPEG Blob. Pure
 * client-side (Canvas 2D + Pointer Events, no external cropper library) — the crop happens
 * entirely before anything is uploaded, so it needs no backend change; ProfileSettingsComponent
 * still calls the exact same UserProfileService.uploadAvatar(file) it always did, just with the
 * cropped result instead of the raw file the user picked.
 *
 * Deliberately generic (takes any `File`, emits any cropped `Blob`) rather than profile-specific,
 * so any other "upload + crop a photo" flow in the app can reuse it later without copy-pasting
 * the canvas math.
 */
import {
  ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, ViewChild, input, output, signal
} from '@angular/core';
import { ModalComponent } from '../modal/modal.component';

const PREVIEW_SIZE = 280; // px — on-screen crop circle
const OUTPUT_SIZE = 400;  // px — exported square image
const MIN_SCALE = 1;
const MAX_SCALE = 4;

@Component({
  selector: 'app-avatar-crop-modal',
  standalone: true,
  imports: [ModalComponent],
  templateUrl: './avatar-crop-modal.component.html',
  styleUrl: './avatar-crop-modal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AvatarCropModalComponent implements OnInit, OnDestroy {
  readonly file      = input.required<File>();
  readonly cropped   = output<Blob>();
  readonly cancelled = output<void>();

  @ViewChild('previewCanvas') private canvasRef?: ElementRef<HTMLCanvasElement>;

  protected readonly previewSize = PREVIEW_SIZE;
  protected readonly minScale = MIN_SCALE;
  protected readonly maxScale = MAX_SCALE;
  protected readonly scale  = signal(1);
  protected readonly saving = signal(false);

  private image?: HTMLImageElement;
  private objectUrl = '';
  private offset = { x: 0, y: 0 };
  private dragging = false;
  private dragStart = { x: 0, y: 0 };
  private offsetStart = { x: 0, y: 0 };

  ngOnInit(): void {
    this.objectUrl = URL.createObjectURL(this.file());
    const img = new Image();
    img.onload = () => {
      this.image = img;
      this.offset = { x: 0, y: 0 };
      this.scale.set(1);
      this.draw();
    };
    img.src = this.objectUrl;
  }

  ngOnDestroy(): void {
    if (this.objectUrl) URL.revokeObjectURL(this.objectUrl);
  }

  onPointerDown(event: PointerEvent): void {
    this.dragging = true;
    this.dragStart = { x: event.clientX, y: event.clientY };
    this.offsetStart = { ...this.offset };
    (event.target as HTMLElement).setPointerCapture(event.pointerId);
  }

  onPointerMove(event: PointerEvent): void {
    if (!this.dragging) return;
    const dx = event.clientX - this.dragStart.x;
    const dy = event.clientY - this.dragStart.y;
    this.offset = this.clampOffset(this.offsetStart.x + dx, this.offsetStart.y + dy);
    this.draw();
  }

  onPointerUp(): void {
    this.dragging = false;
  }

  onScaleChange(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.scale.set(value);
    this.offset = this.clampOffset(this.offset.x, this.offset.y);
    this.draw();
  }

  /** Keeps the image from being dragged/zoomed-out past the crop circle's edge. */
  private clampOffset(x: number, y: number): { x: number; y: number } {
    if (!this.image) return { x: 0, y: 0 };
    const baseScale = this.previewSize / Math.min(this.image.naturalWidth, this.image.naturalHeight);
    const drawW = this.image.naturalWidth * baseScale * this.scale();
    const drawH = this.image.naturalHeight * baseScale * this.scale();
    const maxX = Math.max(0, (drawW - this.previewSize) / 2);
    const maxY = Math.max(0, (drawH - this.previewSize) / 2);
    return { x: Math.min(maxX, Math.max(-maxX, x)), y: Math.min(maxY, Math.max(-maxY, y)) };
  }

  private draw(): void {
    const canvas = this.canvasRef?.nativeElement;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx || !this.image) return;

    ctx.clearRect(0, 0, this.previewSize, this.previewSize);
    const baseScale = this.previewSize / Math.min(this.image.naturalWidth, this.image.naturalHeight);
    const drawW = this.image.naturalWidth * baseScale * this.scale();
    const drawH = this.image.naturalHeight * baseScale * this.scale();

    ctx.save();
    ctx.translate(this.previewSize / 2 + this.offset.x, this.previewSize / 2 + this.offset.y);
    ctx.drawImage(this.image, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  }

  /** Re-renders the exact same framing at OUTPUT_SIZE resolution (scaling offset by the same
   *  ratio) rather than just reading back the small preview canvas, so the uploaded photo isn't
   *  limited to the on-screen preview's pixel size. */
  confirmCrop(): void {
    if (!this.image || this.saving()) return;
    this.saving.set(true);

    const outCanvas = document.createElement('canvas');
    outCanvas.width = OUTPUT_SIZE;
    outCanvas.height = OUTPUT_SIZE;
    const ctx = outCanvas.getContext('2d');
    if (!ctx) {
      this.saving.set(false);
      return;
    }

    const ratio = OUTPUT_SIZE / this.previewSize;
    const baseScale = OUTPUT_SIZE / Math.min(this.image.naturalWidth, this.image.naturalHeight);
    const drawW = this.image.naturalWidth * baseScale * this.scale();
    const drawH = this.image.naturalHeight * baseScale * this.scale();

    ctx.save();
    ctx.translate(OUTPUT_SIZE / 2 + this.offset.x * ratio, OUTPUT_SIZE / 2 + this.offset.y * ratio);
    ctx.drawImage(this.image, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();

    outCanvas.toBlob(blob => {
      this.saving.set(false);
      if (blob) this.cropped.emit(blob);
    }, 'image/jpeg', 0.92);
  }

  cancel(): void {
    this.cancelled.emit();
  }
}
