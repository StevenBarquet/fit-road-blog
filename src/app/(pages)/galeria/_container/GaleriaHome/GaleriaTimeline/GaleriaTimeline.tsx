'use client';

// ---Dependencies
import { type ReactElement } from 'react';
import { Image } from 'antd';
import { CalendarOutlined, DashboardOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
// ---Config
import style from './GaleriaTimeline.module.scss';

interface GalleryItem {
  date: string;
  peso: number | null;
  images: Array<{ base64: string; createdAt: string }>;
}

interface Props {
  items: GalleryItem[];
}

export function GaleriaTimeline({ items }: Props): ReactElement {
  // -----------------------RENDER
  return (
    <div className={style.GaleriaTimeline}>
      {items.map((item) => (
        <div key={item.date} className="timeline-entry">
          <div className="timeline-dot" />
          <div className="entry-content">
            <div className="entry-header">
              <span className="entry-date">
                <CalendarOutlined /> {dayjs(item.date).format('DD-MMM-YYYY')}
              </span>
              {item.peso && (
                <span className="entry-peso">
                  <DashboardOutlined /> {item.peso} kg
                </span>
              )}
            </div>
            <div className="entry-images">
              <Image.PreviewGroup>
                {item.images.map((pic, i) => (
                  <Image
                    key={i}
                    src={pic.base64}
                    width={90}
                    height={90}
                    style={{ objectFit: 'cover', borderRadius: 10 }}
                  />
                ))}
              </Image.PreviewGroup>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
