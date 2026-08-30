import React, { useState, useRef, useEffect } from 'react';
import { Eye, Layers, ZoomIn, Info } from 'lucide-react';

export default function ImageBoundingBoxViewer({ imageUrl, declarations = [], selectedBox, onSelectBox }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0, naturalWidth: 0, naturalHeight: 0 });
  const imageRef = useRef(null);

  const handleImageLoad = (e) => {
    const { clientWidth, clientHeight, naturalWidth, naturalHeight } = e.target;
    setDimensions({
      width: clientWidth,
      height: clientHeight,
      naturalWidth,
      naturalHeight,
    });
    setImageLoaded(true);
  };

  useEffect(() => {
    const handleResize = () => {
      if (imageRef.current) {
        setDimensions({
          width: imageRef.current.clientWidth,
          height: imageRef.current.clientHeight,
          naturalWidth: imageRef.current.naturalWidth,
          naturalHeight: imageRef.current.naturalHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const parseBoundingBox = (bboxJson) => {
    if (!bboxJson) return null;
    try {
      const coords = typeof bboxJson === 'string' ? JSON.parse(bboxJson) : bboxJson;
      if (Array.isArray(coords) && coords.length === 4) {
        return { x: coords[0], y: coords[1], width: coords[2], height: coords[3] };
      }
    } catch {
      return null;
    }
    return null;
  };

  const getScaledBoxStyle = (box) => {
    if (!box || dimensions.naturalWidth === 0 || dimensions.naturalHeight === 0) return {};

    let { x, y, width, height } = box;
    
    // Scale normalized coordinates [0..1]
    if (x <= 1 && y <= 1 && width <= 1 && height <= 1) {
      x = x * dimensions.width;
      y = y * dimensions.height;
      width = width * dimensions.width;
      height = height * dimensions.height;
    } else {
      // Scale absolute pixel coordinates
      const scaleX = dimensions.width / dimensions.naturalWidth;
      const scaleY = dimensions.height / dimensions.naturalHeight;
      x = x * scaleX;
      y = y * scaleY;
      width = width * scaleX;
      height = height * scaleY;
    }

    return {
      left: `${x}px`,
      top: `${y}px`,
      width: `${width}px`,
      height: `${height}px`,
    };
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">
            Package Label Visual Bounding Boxes
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Info className="w-3.5 h-3.5 text-blue-500" />
          <span>Interactive OCR Region Detection</span>
        </div>
      </div>

      {/* Image Stage Container */}
      <div className="relative bg-slate-900 rounded-xl overflow-hidden min-h-[280px] max-h-[500px] flex items-center justify-center border border-slate-200">
        {imageUrl ? (
          <div className="relative inline-block max-w-full max-h-[500px]">
            <img
              ref={imageRef}
              src={imageUrl}
              alt="Packaged Commodity Label"
              onLoad={handleImageLoad}
              className="max-w-full max-h-[500px] object-contain block mx-auto rounded-lg"
            />

            {/* Bounding Box Overlays */}
            {imageLoaded && declarations.map((dec, idx) => {
              const box = parseBoundingBox(dec.bounding_box_json);
              if (!box) return null;

              const isSelected = selectedBox && selectedBox.declaration_key === dec.declaration_key;
              const boxStyle = getScaledBoxStyle(box);

              return (
                <div
                  key={idx}
                  onClick={() => onSelectBox && onSelectBox(dec)}
                  style={boxStyle}
                  className={`absolute border-2 transition-all cursor-pointer group ${
                    isSelected
                      ? 'border-emerald-400 bg-emerald-500/25 ring-2 ring-emerald-300 z-30'
                      : 'border-cyan-400 bg-cyan-500/15 hover:border-blue-400 hover:bg-blue-500/30 z-20'
                  }`}
                  title={`${dec.declaration_key}: ${dec.extracted_value || 'Not Detected'}`}
                >
                  <span className={`absolute -top-6 left-0 px-2 py-0.5 text-[10px] font-bold rounded shadow-xs whitespace-nowrap ${
                    isSelected ? 'bg-emerald-600 text-white' : 'bg-slate-900/90 text-cyan-300'
                  }`}>
                    {dec.declaration_key}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400 space-y-2">
            <Eye className="w-8 h-8 text-slate-500" />
            <p className="text-xs">No package label image available for visual inspection.</p>
          </div>
        )}
      </div>

      {/* Declarations Key Chips */}
      {declarations.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {declarations.map((dec) => {
            const isSelected = selectedBox && selectedBox.declaration_key === dec.declaration_key;
            return (
              <button
                key={dec.declaration_key}
                onClick={() => onSelectBox && onSelectBox(dec)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                {dec.declaration_key}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
