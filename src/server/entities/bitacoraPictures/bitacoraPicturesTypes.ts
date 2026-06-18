export interface BitacoraPictureItem {
  base64: string;
  createdAt: string;
}

export interface ModelBitacoraPictures {
  images: BitacoraPictureItem[];
}

export interface BitacoraPicturesFromDB extends ModelBitacoraPictures {
  id: string;
}
