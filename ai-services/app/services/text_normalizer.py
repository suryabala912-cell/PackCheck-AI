import re
from typing import Dict, Any, List

class TextNormalizer:
    @staticmethod
    def normalize_ocr_text(raw_text: str) -> str:
        """
        Normalizes OCR text by resolving common character confusions (O/0, l/1),
        standardizing whitespace, and unifying statutory keywords while keeping raw_text intact.
        """
        if not raw_text:
            return ""
            
        lines = raw_text.splitlines()
        normalized_lines = []
        
        for line in lines:
            # 1. Normalize whitespace
            norm_line = re.sub(r'[ \t]+', ' ', line.strip())
            if not norm_line:
                continue
                
            # 2. Normalize statutory keyword variations
            norm_line = re.sub(r'(?i)\bM\.?\s*R\.?\s*P\.?', 'MRP', norm_line)
            norm_line = re.sub(r'(?i)\bNet\s*(?:Qty|Quantity|Wt|Weight|Vol|Volume)\b', 'Net Qty', norm_line)
            norm_line = re.sub(r'(?i)\b(?:Mfg|Mfd|Pkd|Packed)\.?', 'Mfg', norm_line)
            norm_line = re.sub(r'(?i)\bRs\.?|₹', 'Rs.', norm_line)

            # Clean up potential double dots from regex replacement (e.g., MRP. -> MRP, Rs.. -> Rs.)
            norm_line = re.sub(r'MRP\.', 'MRP', norm_line)
            norm_line = re.sub(r'Mfg\.', 'Mfg', norm_line)
            norm_line = re.sub(r'Rs\.\.', 'Rs.', norm_line)

            # 3. Contextual OCR character typo fixes in numeric strings (e.g. 05/2O26 -> 05/2026, Rs 1O0 -> Rs 100)
            norm_line = re.sub(r'(?<=\d)[Oo](?=\d)', '0', norm_line)
            norm_line = re.sub(r'(?<=\d)[Oo]\b', '0', norm_line)
            norm_line = re.sub(r'\b[Oo](?=\d)', '0', norm_line)
            
            # Replace lowercase 'l' or uppercase 'I' between digits (e.g. 1l5 -> 115)
            norm_line = re.sub(r'(?<=\d)[lI](?=\d)', '1', norm_line)
            
            normalized_lines.append(norm_line)
            
        return "\n".join(normalized_lines)

    @classmethod
    def calculate_overall_confidence(cls, words: List[Dict[str, Any]], lines: List[Dict[str, Any]]) -> tuple[float, str]:
        """
        Calculates overall OCR confidence score and returns confidence quality classification:
        HIGH_CONFIDENCE (>= 0.85), MEDIUM_CONFIDENCE (0.65 - 0.849), LOW_CONFIDENCE (< 0.65)
        """
        if words:
            conf_scores = [w.get("confidence", 0.0) for w in words]
            overall_conf = round(sum(conf_scores) / len(conf_scores), 4)
        elif lines:
            conf_scores = [l.get("avg_confidence", 0.0) for l in lines]
            overall_conf = round(sum(conf_scores) / len(conf_scores), 4)
        else:
            overall_conf = 0.0
            
        if overall_conf >= 0.85:
            status = "HIGH_CONFIDENCE"
        elif overall_conf >= 0.65:
            status = "MEDIUM_CONFIDENCE"
        else:
            status = "LOW_CONFIDENCE"
            
        return overall_conf, status
