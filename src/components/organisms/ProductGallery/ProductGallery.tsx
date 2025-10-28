import { useMemo, useState } from "react";

type Props = {
  images?: string[] | undefined;
  cover: string;
  alt: string;
};

export default function ProductGallery({ images, cover, alt }: Props) {
  const all = useMemo(() => (images?.length ? images : [cover]), [images, cover]);
  const [current, setCurrent] = useState(0);

  return (
    <div className="pd-gallery">
      <div className="pd-main">
        <img src={all[current]} alt={alt} />
      </div>

      {all.length > 1 && (
        <div className="pd-thumbs">
          {all.map((src, idx) => (
            <button
              key={`${src}-${idx}`}
              type="button"
              className={`pd-thumb ${idx === current ? "active" : ""}`}
              onClick={() => setCurrent(idx)}
            >
              <img src={src} alt={`${alt} ${idx + 1}`} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
