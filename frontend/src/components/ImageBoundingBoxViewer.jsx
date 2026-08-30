import React, { useState, useRef, useEffect } from 'react';
import { API_BASE_URL } from '../api/apiClient';
import { Eye, Layers } from 'lucide-react';

export default function ImageBoundingBoxViewer({
  imageUrl,
  declarations = [],
  activeKey = null,
  onSelectKey = null,
}) {
  const [imageState, setImageState] = useState({
    loaded: false,
    naturalWidth: 0,
    naturalHeight: 0,
    renderedWidth: 0,
    renderedHeight: 0,
  });

  const containerRef = useRef(null);
  const imgRef = useRef(null);

  // Compute full displayable image URL
  const fullImageUrl = imageUrl
    ? imageUrl.startsWith('http')
      ? imageUrl
      : `${API_BASE_URL}${imageUrl.startsWith('/') ? '' : '/'}${imageUrl}`
    : null;

  const updateRenderedSize = () => {
    if (imgRef.current) {
      setImageState((prev) => ({
        ...prev,
        renderedWidth: imgRef.current.clientWidth,
        renderedHeight: imgRef.current.clientHeight,
      }));
    }
  };

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight, clientWidth, clientHeight } = e.target;
    setImageState({
      loaded: true,
      naturalWidth,
      naturalHeight,
      renderedWidth: clientWidth,
      renderedHeight: clientHeight,
    });
  };

  useEffect(() => {
    window.addEventListener('resize', updateRenderedSize);
    return () => window.removeEventListener('resize', updateRenderedSize);
  }, []);

  // Parse bounding box string or object
  const parseBoundingBox = (bboxData) => {
    if (!bboxData) return null;
    let bbox = bboxData;
    if (typeof bboxData === 'string') {
      try {
        bbox = JSON.parse(bboxData);
      } catch (e) {
        return null;
      }
    }
    if (Array.isArray(bbox) && bbox.length >= 4) {
      return { ymin: bbox[0], xmin: bbox[1], ymax: bbox[2], xmax: bbox[3] };
    }
    if (typeof bbox === 'object' && bbox !== null) {
      const ymin = bbox.ymin ?? bbox.y_min ?? bbox.top;
      const xmin = bbox.xmin ?? bbox.x_min ?? bbox.left;
      const ymax = bbox.ymax ?? bbox.y_max ?? bbox.bottom;
      const xmax = bbox.xmax ?? bbox.x_max ?? bbox.right;
      if (ymin !== undefined && xmin !== undefined && ymax !== undefined && xmax !== undefined) {
        return { ymin, xmin, ymax, xmax };
      }
    }
    return null;
  };

  // Convert bounding box to overlay styles
  const getBoxStyle = (decl) => {
    const bbox = parseBoundingBox(decl.bounding_box_json || decl.boundingBoxJson || decl.bounding_box || decl.boundingBox);
    if (!bbox || !imageState.renderedWidth || !imageState.renderedHeight) {
      return null;
    }

    const { ymin, xmin, ymax, xmax } = bbox;
    const isNormalized = ymax <= 1.0 && xmax <= 1.0;

    let left, top, width, height;
    if (isNormalized) {
      left = xmin * imageState.renderedWidth;
      top = ymin * imageState.renderedHeight;
      width = (xmax - xmin) * imageState.renderedWidth;
      height = (ymax - ymin) * imageState.renderedHeight;
    } else {
      const scaleX = imageState.renderedWidth / (imageState.naturalWidth || 1);
      const scaleY = imageState.renderedHeight / (imageState.naturalHeight || 1);
      left = xmin * scaleX;
      top = ymin * scaleY;
      width = (xmax - xmin) * scaleX;
      height = (ymax - ymin) * scaleY;
    }

    return {
      left: `${Math.max(0, left)}px`,
      top: `${Math.max(0, top)}px`,
      width: `${Math.max(20, width)}px`,
      height: `${Math.max(15, height)}px`,
    };
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
      <div className="flex items-center justify-between mb-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
        <span className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-cyan-400" />
          Package Label Visual Inspector
        </span>
        {imageState.loaded && (
          <span className="flex items-center gap-1.5 text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/50">
            <Layers className="w-3.5 h-3.5" />
            {imageState.naturalWidth}×{imageState.naturalHeight}px
          </span>
        )}
      </div>

      {!fullImageUrl ? (
        <div className="h-64 bg-slate-950 rounded-lg flex items-center justify-center text-slate-500 border border-slate-800">
          No image provided for visual inspection.
        </div>
      ) : (
        <div
          ref={containerRef}
          className="relative inline-block w-full overflow-hidden rounded-lg bg-slate-950 border border-slate-800 flex justify-center items-center"
        >
          <img
            ref={imgRef}
            src={fullImageUrl}
            alt="Product Label Scan"
            onLoad={handleImageLoad}
            className="max-h-[500px] w-auto max-w-full object-contain block mx-auto rounded"
          />

          {/* Render Bounding Box Overlays */}
          {imageState.loaded &&
            declarations.map((decl, idx) => {
              const key = decl.declaration_key || decl.declarationKey || decl.field_name || decl.fieldName || `decl_${idx}`;
              const style = getBoxStyle(decl);
              if (!style) return null;

              const isSelected = activeKey === key;
              const confidence = decl.ocr_confidence || decl.ocrConfidence || decl.confidence;
              const confidencePercent = confidence ? Math.round(Number(confidence) * (Number(confidence) <= 1 ? 100 : 1)) : null;

              return (
                <div
                  key={idx}
                  style={style}
                  onClick={() => onSelectKey && onSelectKey(key)}
                  className={`absolute border-2 transition-all cursor-pointer group z-10 ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-500/25 shadow-lg shadow-cyan-500/50 ring-2 ring-cyan-300'
                      : 'border-emerald-400 bg-emerald-500/15 hover:border-cyan-300 hover:bg-cyan-500/20'
                  }`}
                >
                  <div
                    className={`absolute -top-6 left-0 px-1.5 py-0.5 text-[10px] font-bold rounded whitespace-nowrap shadow-md pointer-events-none ${
                      isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-900/90 text-emerald-300 border border-emerald-500/40'
                    }`}
                  >
                    {key} {confidencePercent !== null ? `(${confidencePercent}%)` : ''}
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
