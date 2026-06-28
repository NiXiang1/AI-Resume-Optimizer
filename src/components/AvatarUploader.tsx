/* eslint-disable @next/next/no-img-element */

"use client";

import { useRef, useState } from "react";

type AvatarUploaderProps = {
  value?: string;
  originalImage?: string;
  onChange: (value: string) => void;
  onOriginalImageChange: (value: string) => void;
};

const acceptedTypes = ["image/jpeg", "image/png", "image/webp"];
const acceptedExtensions = [".jpg", ".jpeg", ".png", ".webp"];
const maxSize = 2 * 1024 * 1024;
const cropSize = 240;
const outputSize = 480;
const minScale = 1;
const maxScale = 4;

type ImageSize = {
  width: number;
  height: number;
};

export default function AvatarUploader({ value, originalImage, onChange, onOriginalImageChange }: AvatarUploaderProps) {
  const [error, setError] = useState("");
  const [cropSource, setCropSource] = useState("");
  const [imageSize, setImageSize] = useState<ImageSize | null>(null);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState<{ pointerId: number; x: number; y: number; offsetX: number; offsetY: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const fileName = file.name.toLowerCase();
    const isValidType = acceptedTypes.includes(file.type) || acceptedExtensions.some((extension) => fileName.endsWith(extension));

    if (!isValidType) {
      setError("只支持 JPG、PNG 或 WEBP 格式的头像图片。");
      event.target.value = "";
      return;
    }

    if (file.size > maxSize) {
      setError("头像图片不能超过 2MB，请压缩后再上传。");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      onOriginalImageChange(result);
      await openCropper(result);
    };
    reader.onerror = () => {
      setError("图片读取失败，请重新选择一张头像。");
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  async function openCropper(source: string) {
    try {
      const image = await loadImage(source);
      setCropSource(source);
      setImageSize({ width: image.naturalWidth, height: image.naturalHeight });
      setScale(1);
      setOffset(await getInitialOffset(source, image));
      setError("");
    } catch {
      setError("图片读取失败，请重新选择一张头像。");
    }
  }

  function handlePointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (!cropSource) {
      return;
    }

    event.currentTarget.setPointerCapture(event.pointerId);
    setDragStart({
      pointerId: event.pointerId,
      x: event.clientX,
      y: event.clientY,
      offsetX: offset.x,
      offsetY: offset.y
    });
  }

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragStart || dragStart.pointerId !== event.pointerId) {
      return;
    }

    setOffset({
      x: dragStart.offsetX + event.clientX - dragStart.x,
      y: dragStart.offsetY + event.clientY - dragStart.y
    });
  }

  function handlePointerEnd(event: React.PointerEvent<HTMLDivElement>) {
    if (dragStart?.pointerId === event.pointerId) {
      setDragStart(null);
    }
  }

  function handleWheel(event: React.WheelEvent<HTMLDivElement>) {
    if (!cropSource) {
      return;
    }

    event.preventDefault();
    const nextScale = clamp(scale - event.deltaY * 0.002, minScale, maxScale);
    setScale(nextScale);
  }

  function resetCrop() {
    setScale(1);
    setOffset({ x: 0, y: 0 });
  }

  function centerCrop() {
    setOffset({ x: 0, y: 0 });
  }

  function removeAvatar() {
    onChange("");
    onOriginalImageChange("");
    setCropSource("");
    setImageSize(null);
    setError("");
  }

  async function confirmCrop() {
    if (!cropSource || !imageSize) {
      return;
    }

    try {
      const croppedAvatar = await cropImage(cropSource, imageSize, scale, offset);
      onChange(croppedAvatar);
      setCropSource("");
      setError("");
    } catch {
      setError("头像裁剪失败，请重新上传图片。");
    }
  }

  const imageStyle = imageSize ? getCropImageStyle(imageSize, scale, offset, cropSize) : undefined;
  const previewImageStyle = imageSize ? getCropImageStyle(imageSize, scale, offset, 96) : undefined;
  const hasOriginalImage = Boolean(originalImage);

  return (
    <div className="avatar-uploader resume-field-wide">
      <div className="avatar-uploader-head">
        <span>头像</span>
        <p>支持 JPG / PNG / WEBP，大小不超过 2MB。上传后会保留完整原图，确认使用前不会修改头像。</p>
      </div>

      <div className="avatar-uploader-body">
        <div className="avatar-uploader-preview">
          {value ? <img src={value} alt="头像预览" /> : hasOriginalImage ? <img src={originalImage} alt="原始头像预览" /> : <span>头像预览</span>}
        </div>

        <div className="avatar-uploader-controls">
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFileChange} />
          <button type="button" onClick={() => inputRef.current?.click()}>
            上传头像
          </button>
          {hasOriginalImage ? (
            <button type="button" className="secondary" onClick={() => openCropper(originalImage || "")}>
              重新裁剪
            </button>
          ) : null}
          {value || hasOriginalImage ? (
            <button type="button" className="secondary" onClick={removeAvatar}>
              移除头像
            </button>
          ) : null}
        </div>
      </div>

      {cropSource && imageStyle && previewImageStyle ? (
        <div className="avatar-cropper">
          <div className="avatar-cropper-layout">
            <div
              className="avatar-cropper-stage"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerEnd}
              onPointerCancel={handlePointerEnd}
              onWheel={handleWheel}
            >
              <img src={cropSource} alt="待裁剪头像" draggable={false} style={imageStyle} />
            </div>

            <div className="avatar-cropper-live">
              <span>圆形预览</span>
              <div>
                <img src={cropSource} alt="圆形裁剪预览" draggable={false} style={previewImageStyle} />
              </div>
            </div>
          </div>

          <label className="avatar-cropper-zoom">
            <span>缩放</span>
            <input type="range" min={minScale} max={maxScale} step="0.01" value={scale} onChange={(event) => setScale(Number(event.target.value))} />
          </label>

          <div className="avatar-cropper-actions">
            <button type="button" onClick={confirmCrop}>
              确认使用头像
            </button>
            <button type="button" className="secondary" onClick={resetCrop}>
              重置
            </button>
            <button type="button" className="secondary" onClick={centerCrop}>
              一键居中
            </button>
            <button type="button" className="secondary" onClick={() => setCropSource("")}>
              取消
            </button>
          </div>
        </div>
      ) : null}

      <label className="avatar-uploader-url">
        <span>图片 URL / base64</span>
        <input value={value || ""} onChange={(event) => onChange(event.target.value)} placeholder="可粘贴图片链接，或上传后自动生成 base64" />
      </label>

      {error ? <p className="avatar-uploader-error">{error}</p> : null}
    </div>
  );
}

async function cropImage(src: string, imageSize: ImageSize, scale: number, offset: { x: number; y: number }) {
  const image = await loadImage(src);
  const canvas = document.createElement("canvas");
  canvas.width = outputSize;
  canvas.height = outputSize;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Canvas context unavailable");
  }

  const baseScale = getFitScale(imageSize);
  const displayWidth = imageSize.width * baseScale * scale;
  const displayHeight = imageSize.height * baseScale * scale;
  const outputRatio = outputSize / cropSize;
  const drawWidth = displayWidth * outputRatio;
  const drawHeight = displayHeight * outputRatio;
  const drawX = (outputSize - drawWidth) / 2 + offset.x * outputRatio;
  const drawY = (outputSize - drawHeight) / 2 + offset.y * outputRatio;

  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, outputSize, outputSize);
  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, drawX, drawY, drawWidth, drawHeight);

  return canvas.toDataURL("image/png", 0.95);
}

function getCropImageStyle(imageSize: ImageSize, scale: number, offset: { x: number; y: number }, viewportSize: number) {
  const baseScale = getFitScale(imageSize, viewportSize);
  const offsetRatio = viewportSize / cropSize;

  return {
    width: `${imageSize.width * baseScale * scale}px`,
    height: `${imageSize.height * baseScale * scale}px`,
    transform: `translate(-50%, -50%) translate(${offset.x * offsetRatio}px, ${offset.y * offsetRatio}px)`
  };
}

function getFitScale(imageSize: ImageSize, viewportSize = cropSize) {
  return Math.min(viewportSize / imageSize.width, viewportSize / imageSize.height);
}

async function getInitialOffset(source: string, image: HTMLImageElement) {
  const face = await detectFace(source);

  if (!face) {
    return { x: 0, y: 0 };
  }

  const baseScale = getFitScale({ width: image.naturalWidth, height: image.naturalHeight });
  const imageCenterX = image.naturalWidth / 2;
  const imageCenterY = image.naturalHeight / 2;
  const faceCenterX = face.x + face.width / 2;
  const faceCenterY = face.y + face.height / 2;

  return {
    x: (imageCenterX - faceCenterX) * baseScale,
    y: (imageCenterY - faceCenterY) * baseScale
  };
}

async function detectFace(source: string) {
  const FaceDetectorConstructor = (window as unknown as {
    FaceDetector?: new (options?: { fastMode?: boolean; maxDetectedFaces?: number }) => {
      detect: (image: HTMLImageElement) => Promise<Array<{ boundingBox: DOMRectReadOnly }>>;
    };
  }).FaceDetector;

  if (!FaceDetectorConstructor) {
    return null;
  }

  try {
    const image = await loadImage(source);
    const detector = new FaceDetectorConstructor({ fastMode: true, maxDetectedFaces: 1 });
    const faces = await detector.detect(image);
    const box = faces[0]?.boundingBox;

    return box
      ? {
          x: box.x,
          y: box.y,
          width: box.width,
          height: box.height
        }
      : null;
  } catch {
    return null;
  }
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}
