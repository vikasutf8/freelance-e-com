export const PRODUCT_IMAGE_MAX_BYTES = 2 * 1024 * 1024;
export const PRODUCT_IMAGE_MAX_DIMENSION = 1200;
export const PRODUCT_IMAGE_ACCEPT = 'image/png,image/jpeg';
const MAX_INPUT_BYTES = 10 * 1024 * 1024;

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') resolve(reader.result);
      else reject(new Error('Could not read that image.'));
    };
    reader.onerror = () => reject(new Error('Could not read that image.'));
    reader.readAsDataURL(file);
  });
}

function loadImage(source: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('That image could not be opened.'));
    image.src = source;
  });
}

function base64Bytes(dataUrl: string): number {
  const encoded = dataUrl.split(',')[1] ?? '';
  return Math.ceil((encoded.length * 3) / 4);
}

export async function prepareProductImage(file: File): Promise<string> {
  if (!['image/png', 'image/jpeg'].includes(file.type)) {
    throw new Error('Choose a PNG or JPEG image.');
  }

  if (file.size > MAX_INPUT_BYTES) {
    throw new Error('Choose an image smaller than 10 MB.');
  }

  const source = await readFileAsDataUrl(file);
  const image = await loadImage(source);
  const scale = Math.min(
    1,
    PRODUCT_IMAGE_MAX_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight),
  );
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('Image preparation is not available in this browser.');
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';
  context.fillStyle = '#FFFFFF';
  context.fillRect(0, 0, width, height);
  context.drawImage(image, 0, 0, width, height);

  for (const quality of [0.86, 0.72, 0.6, 0.48]) {
    const prepared = canvas.toDataURL('image/jpeg', quality);
    if (base64Bytes(prepared) <= PRODUCT_IMAGE_MAX_BYTES) {
      return prepared;
    }
  }

  throw new Error(
    'This image is too detailed to fit within 2 MB. Try a simpler image.',
  );
}
