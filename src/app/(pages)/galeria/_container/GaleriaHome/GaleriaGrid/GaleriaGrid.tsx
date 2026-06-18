'use client';

// ---Dependencies
import { type ReactElement } from 'react';
import { Image } from 'antd';
import dayjs from 'dayjs';
// ---Config
import style from './GaleriaGrid.module.scss';

interface GalleryItem {
  date: string;
  peso: number | null;
  images: Array<{ base64: string; createdAt: string }>;
}

interface Props {
  items: GalleryItem[];
}

export function GaleriaGrid({ items }: Props): ReactElement {
  // -----------------------RENDER
  return (
    <div className={style.GaleriaGrid}>
      {items.map((item) => (
        <div key={item.date} className="date-group">
          <h3>{dayjs(item.date).format('DD-MMM-YYYY')}</h3>
          <div className="images-row">
            <Image.PreviewGroup>
              {item.images.map((pic, i) => (
                <Image
                  key={i}
                  src={pic.base64}
                  width={100}
                  height={100}
                  style={{ objectFit: 'cover', borderRadius: 8 }}
                />
              ))}
            </Image.PreviewGroup>
          </div>
        </div>
      ))}
    </div>
  );
}
