import cv2
import numpy as np
from PIL import Image
import io
from typing import Tuple, Dict, Any, List

class ImagePreprocessor:
    @staticmethod
    def decode_image_safely(image_bytes: bytes) -> np.ndarray:
        """Decodes raw image bytes into OpenCV BGR numpy array safely"""
        if not image_bytes or len(image_bytes) == 0:
            raise ValueError("Empty image bytes")
            
        np_arr = np.frombuffer(image_bytes, np.uint8)
        img_bgr = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
        
        if img_bgr is None:
            # Fallback to PIL decoding
            pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
            img_bgr = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)
            
        return img_bgr

    @staticmethod
    def get_deskew_angle(gray: np.ndarray) -> float:
        """Calculates skew angle of text lines in a grayscale image"""
        _, thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY_INV + cv2.THRESH_OTSU)
        coords = np.column_stack(np.where(thresh > 0))
        
        if len(coords) < 50:
            return 0.0
            
        rect = cv2.minAreaRect(coords)
        angle = rect[-1]
        
        if angle < -45:
            angle = -(90 + angle)
        elif angle > 45:
            angle = 90 - angle
            
        if abs(angle) < 0.5 or abs(angle) > 45.0:
            return 0.0
            
        return float(angle)

    @classmethod
    def preprocess_variants(cls, img_bgr: np.ndarray) -> List[Dict[str, Any]]:
        """
        Applies upscaling, deskewing, noise reduction, and contrast enhancement.
        Returns multiple preprocessing variants for transparent evaluation.
        """
        orig_h, orig_w = img_bgr.shape[:2]
        
        # 1. Upscale small images (if min dimension < 300px)
        scale_factor = 1.0
        if min(orig_w, orig_h) < 300 and min(orig_w, orig_h) > 0:
            scale_factor = max(300.0 / orig_w, 300.0 / orig_h)
            target_w = int(orig_w * scale_factor)
            target_h = int(orig_h * scale_factor)
            scaled_bgr = cv2.resize(img_bgr, (target_w, target_h), interpolation=cv2.INTER_CUBIC)
        else:
            scaled_bgr = img_bgr.copy()
            
        scaled_h, scaled_w = scaled_bgr.shape[:2]
        gray = cv2.cvtColor(scaled_bgr, cv2.COLOR_BGR2GRAY)
        
        # 2. Deskew detection & rotation
        skew_angle = cls.get_deskew_angle(gray)
        if abs(skew_angle) >= 0.5:
            center = (scaled_w // 2, scaled_h // 2)
            M = cv2.getRotationMatrix2D(center, skew_angle, 1.0)
            rotated_gray = cv2.warpAffine(
                gray, M, (scaled_w, scaled_h),
                flags=cv2.INTER_CUBIC,
                borderMode=cv2.BORDER_REPLICATE
            )
            M_inv = cv2.getRotationMatrix2D(center, -skew_angle, 1.0)
        else:
            rotated_gray = gray
            M = None
            M_inv = None
            skew_angle = 0.0

        # Variant 1: Standard Otsu Thresholding + Gaussian Blur
        blurred_1 = cv2.GaussianBlur(rotated_gray, (3, 3), 0)
        _, thresh_otsu = cv2.threshold(blurred_1, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        # Variant 2: CLAHE Contrast Enhancement + Adaptive Thresholding
        clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
        clahe_img = clahe.apply(rotated_gray)
        thresh_adaptive = cv2.adaptiveThreshold(
            clahe_img, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY, 11, 2
        )
        
        # Variant 3: Contrast Normalization + Otsu
        norm_gray = cv2.normalize(rotated_gray, None, alpha=0, beta=255, norm_type=cv2.NORM_MINMAX)
        _, thresh_norm = cv2.threshold(norm_gray, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
        
        variants = [
            {
                "name": "otsu_standard",
                "image": thresh_otsu,
                "gray_image": rotated_gray,
                "orig_shape": (orig_w, orig_h),
                "scaled_shape": (scaled_w, scaled_h),
                "scale_factor": scale_factor,
                "skew_angle": skew_angle,
                "M_inv": M_inv
            },
            {
                "name": "clahe_adaptive",
                "image": thresh_adaptive,
                "gray_image": rotated_gray,
                "orig_shape": (orig_w, orig_h),
                "scaled_shape": (scaled_w, scaled_h),
                "scale_factor": scale_factor,
                "skew_angle": skew_angle,
                "M_inv": M_inv
            },
            {
                "name": "norm_otsu",
                "image": thresh_norm,
                "gray_image": rotated_gray,
                "orig_shape": (orig_w, orig_h),
                "scaled_shape": (scaled_w, scaled_h),
                "scale_factor": scale_factor,
                "skew_angle": skew_angle,
                "M_inv": M_inv
            }
        ]
        
        return variants

    @staticmethod
    def map_bbox_to_original(
        bbox_proc: Dict[str, int],
        scale_factor: float,
        orig_shape: Tuple[int, int],
        M_inv: Any = None
    ) -> Dict[str, int]:
        """
        Maps bounding box coordinates from processed space back to original image coordinates.
        Ensures coordinates never become negative or exceed original image dimensions.
        """
        orig_w, orig_h = orig_shape
        x_p, y_p, w_p, h_p = bbox_proc["x"], bbox_proc["y"], bbox_proc["width"], bbox_proc["height"]
        
        if M_inv is not None:
            pt = np.array([x_p + w_p / 2.0, y_p + h_p / 2.0, 1.0])
            pt_orig_scale = M_inv.dot(pt)
            cx_unrot, cy_unrot = pt_orig_scale[0], pt_orig_scale[1]
            x_unrot = cx_unrot - w_p / 2.0
            y_unrot = cy_unrot - h_p / 2.0
        else:
            x_unrot, y_unrot = float(x_p), float(y_p)
            
        scale = max(scale_factor, 1.0)
        x_orig = int(round(x_unrot / scale))
        y_orig = int(round(y_unrot / scale))
        w_orig = max(1, int(round(w_p / scale)))
        h_orig = max(1, int(round(h_p / scale)))
        
        # Strict non-negative and bounds clamping
        x_orig = max(0, min(x_orig, max(0, orig_w - 1)))
        y_orig = max(0, min(y_orig, max(0, orig_h - 1)))
        w_orig = max(1, min(w_orig, max(1, orig_w - x_orig)))
        h_orig = max(1, min(h_orig, max(1, orig_h - y_orig)))
        
        return {
            "x": x_orig,
            "y": y_orig,
            "width": w_orig,
            "height": h_orig
        }
