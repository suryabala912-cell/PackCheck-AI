import io
import cv2
import numpy as np
from PIL import Image
import pytesseract
from pytesseract import Output
from typing import Dict, Any, List
from app.services.image_preprocessor import ImagePreprocessor

class OCRService:
    @classmethod
    def extract_ocr_data(cls, image_bytes: bytes) -> Dict[str, Any]:
        """
        Runs image preprocessing variants, performs OCR text extraction,
        calculates word confidence, and maps bounding box coordinates back to
        original image dimensions.
        """
        # 1. Safely decode uploaded image
        img_bgr = ImagePreprocessor.decode_image_safely(image_bytes)
        orig_h, orig_w = img_bgr.shape[:2]
        
        # 2. Generate preprocessing variants (upscaling, deskewing, binarization)
        variants = ImagePreprocessor.preprocess_variants(img_bgr)
        primary_variant = variants[0]  # Otsu standard
        
        processed_cv = primary_variant["image"]
        scale_factor = primary_variant["scale_factor"]
        orig_shape = primary_variant["orig_shape"]
        M_inv = primary_variant["M_inv"]
        skew_angle = primary_variant["skew_angle"]
        
        # Convert processed OpenCV image to PIL Image for Pytesseract
        pil_img = Image.fromarray(processed_cv)
        
        words: List[Dict[str, Any]] = []
        lines_dict: Dict[int, List[Dict[str, Any]]] = {}
        engine_name = "pytesseract (Tesseract OCR + OpenCV Preprocessing)"
        if abs(skew_angle) > 0.0:
            engine_name += f" [Deskew: {skew_angle:.1f}°]"
            
        message = "OCR text extraction completed successfully with image preprocessing."

        try:
            # Attempt Tesseract OCR extraction
            ocr_data = pytesseract.image_to_data(pil_img, output_type=Output.DICT)
            
            n_boxes = len(ocr_data["text"])
            for i in range(n_boxes):
                raw_word = ocr_data["text"][i]
                if not raw_word or not raw_word.strip():
                    continue
                
                conf_val = float(ocr_data["conf"][i])
                if conf_val < 0:
                    conf_val = 0.0
                
                norm_conf = round(conf_val / 100.0, 4)
                
                # Bounding box in processed/scaled image space
                bbox_proc = {
                    "x": int(ocr_data["left"][i]),
                    "y": int(ocr_data["top"][i]),
                    "width": int(ocr_data["width"][i]),
                    "height": int(ocr_data["height"][i])
                }
                
                # Map bounding box back to original image space
                bbox_orig = ImagePreprocessor.map_bbox_to_original(
                    bbox_proc=bbox_proc,
                    scale_factor=scale_factor,
                    orig_shape=orig_shape,
                    M_inv=M_inv
                )
                
                word_entry = {
                    "text": raw_word.strip(),
                    "confidence": norm_conf,
                    "bounding_box": bbox_orig
                }
                words.append(word_entry)
                
                line_idx = int(ocr_data["line_num"][i])
                if line_idx not in lines_dict:
                    lines_dict[line_idx] = []
                lines_dict[line_idx].append(word_entry)

        except (pytesseract.TesseractNotFoundError, FileNotFoundError, Exception) as e:
            # Fallback OpenCV contour region detection if Tesseract binary is missing
            engine_name = "OpenCV Preprocessing Region Detector (Tesseract Binary Not Found in PATH)"
            message = (
                "OpenCV preprocessing & region detection active. "
                "For full text decoding, install Tesseract OCR binary on system PATH."
            )
            
            # Find text region contours on preprocessed image
            kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (15, 3))
            dilated = cv2.dilate(255 - processed_cv, kernel, iterations=1)
            contours, _ = cv2.findContours(dilated, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            for idx, cnt in enumerate(contours):
                x, y, w, h = cv2.boundingRect(cnt)
                if w > 10 and h > 10:
                    bbox_proc = {"x": int(x), "y": int(y), "width": int(w), "height": int(h)}
                    bbox_orig = ImagePreprocessor.map_bbox_to_original(
                        bbox_proc=bbox_proc,
                        scale_factor=scale_factor,
                        orig_shape=orig_shape,
                        M_inv=M_inv
                    )
                    word_entry = {
                        "text": f"[Region_{idx+1}]",
                        "confidence": 0.5000,
                        "bounding_box": bbox_orig
                    }
                    words.append(word_entry)
                    lines_dict[idx + 1] = [word_entry]

        # Assemble lines
        lines: List[Dict[str, Any]] = []
        raw_line_texts: List[str] = []
        
        for line_no, line_words in lines_dict.items():
            line_str = " ".join([w["text"] for w in line_words])
            avg_conf = round(sum([w["confidence"] for w in line_words]) / len(line_words), 4) if line_words else 0.0
            
            lines.append({
                "line_number": line_no,
                "text": line_str,
                "avg_confidence": avg_conf
            })
            raw_line_texts.append(line_str)
            
        raw_text = "\n".join(raw_line_texts)
        
        return {
            "ocr_engine": engine_name,
            "raw_text": raw_text,
            "word_count": len(words),
            "words": words,
            "lines": lines,
            "message": message
        }
