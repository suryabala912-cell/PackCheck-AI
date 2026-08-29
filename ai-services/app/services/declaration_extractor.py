import re
from typing import Dict, Any, List, Optional

FIELD_NAMES = [
    "MANUFACTURER_ADDRESS",
    "COMMODITY_NAME",
    "NET_QUANTITY",
    "MFG_DATE",
    "MRP",
    "UNIT_SALE_PRICE",
    "CONSUMER_CARE",
    "COUNTRY_OF_ORIGIN"
]

CONFIDENCE_THRESHOLD = 0.65

class DeclarationExtractor:
    @staticmethod
    def _compute_bounding_box_for_snippet(snippet: str, words: List[Dict[str, Any]]) -> Optional[Dict[str, int]]:
        """Maps matched source snippet text back to word tokens to calculate bounding box envelope"""
        if not snippet or not words:
            return None
        
        snippet_clean = snippet.lower()
        matched_boxes = []
        
        for w in words:
            word_text = w.get("text", "").lower()
            if word_text and word_text in snippet_clean:
                bbox = w.get("bounding_box")
                if bbox and isinstance(bbox, dict):
                    matched_boxes.append(bbox)
                    
        if not matched_boxes:
            return None
            
        x_min = min(b["x"] for b in matched_boxes)
        y_min = min(b["y"] for b in matched_boxes)
        x_max = max(b["x"] + b["width"] for b in matched_boxes)
        y_max = max(b["y"] + b["height"] for b in matched_boxes)
        
        return {
            "x": max(0, x_min),
            "y": max(0, y_min),
            "width": max(1, x_max - x_min),
            "height": max(1, y_max - y_min)
        }

    @classmethod
    def extract_declarations(cls, ocr_result: Dict[str, Any]) -> List[Dict[str, Any]]:
        """
        Analyzes OCR lines, words, and raw/normalized text to extract packaged commodity declaration fields.
        Supports OCR noise variations without performing legal compliance evaluations.
        """
        lines = ocr_result.get("lines", [])
        words = ocr_result.get("words", [])
        
        extracted_fields: Dict[str, Dict[str, Any]] = {}
        
        for field in FIELD_NAMES:
            extracted_fields[field] = {
                "field_name": field,
                "extracted_value": None,
                "confidence": 0.0,
                "source_text": None,
                "bounding_box": None,
                "detection_status": "NOT_DETECTED"
            }

        # Enhanced Patterns handling OCR noise & variations
        # 1. NET_QUANTITY
        net_qty_regex = re.compile(
            r'(?i)(?:net\s*(?:qty|quantity|wt|weight|vol|volume)|n\.?\s*[qw]\.?|net)\s*:?\s*([0-9]+(?:\.[0-9]+)?\s*(?:kg|g|gm|gms|l|ml|litres|liter|N|pcs|units))\b'
        )
        net_qty_fallback = re.compile(r'(?i)\b([0-9]+(?:\.[0-9]+)?\s*(?:kg|g|gm|l|ml|litres|N))\b')
        
        # 2. MFG_DATE
        mfg_date_regex = re.compile(
            r'(?i)(?:mfg|mfd|pkd|packed|m\.?f\.?g\.?|m\.?f\.?d\.?|date\s*of\s*mfg|mfg\s*date)?\s*:?\s*\b((?:0[1-9]|1[0-2])[\/\.-](?:20[2-3][0-9]|[2-3][0-9])|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s*[\/\.-]?\s*20[2-3][0-9])\b'
        )

        # 3. MRP
        mrp_regex = re.compile(
            r'(?i)(?:mrp|m\.?\s*r\.?\s*p\.?|mr\s*p|max\s*retail\s*price|maximum\s*retail\s*price)\s*:?\s*(?:rs\.?|₹)?\s*([0-9]+(?:\.[0-9]{2})?)\s*(\(?\s*incl\.?\s*of\s*all\s*taxes\)?|inclusive\s*of\s*all\s*taxes)?'
        )
        mrp_fallback = re.compile(r'(?i)(?:rs\.?|₹)\s*([0-9]+(?:\.[0-9]{2})?)')

        # 4. UNIT_SALE_PRICE
        usp_regex = re.compile(
            r'(?i)(?:usp|u\.?\s*s\.?\s*p\.?|unit\s*sale\s*price|unit\s*price)\s*:?\s*(?:rs\.?|₹)?\s*([0-9]+(?:\.[0-9]+)?)\s*(?:\/|\s*per\s*)([a-zA-Z]+)'
        )
        usp_fallback = re.compile(r'(?i)(?:rs\.?|₹)?\s*([0-9]+(?:\.[0-9]+)?)\s*\/\s*(?:g|kg|ml|l|N)')

        # 5. CONSUMER_CARE
        consumer_care_regex = re.compile(
            r'(?i)(?:consumer\s*care|customer\s*care|helpline|complaints|feedback|toll\s*free)\s*:?\s*([^\n]+)'
        )
        phone_email_regex = re.compile(
            r'(?i)(\b(?:\+91[-\s]?)?[6-9][0-9]{9}\b|1800[-\s]?[0-9]{3}[-\s]?[0-9]{4}|\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b)'
        )

        # 6. COUNTRY_OF_ORIGIN
        origin_regex = re.compile(
            r'(?i)(?:country\s*of\s*origin|made\s*in|product\s*of|origin)\s*:?\s*([A-Za-z\s]+)'
        )

        # 7. MANUFACTURER_ADDRESS
        mfr_regex = re.compile(
            r'(?i)(?:mfd\.?\s*by|manufactured\s*by|packed\s*by|pkd\.?\s*by|imported\s*by|marketed\s*by|mktd\.?\s*by|address)\s*:?\s*([^\n]+)'
        )

        # 8. COMMODITY_NAME
        commodity_regex = re.compile(
            r'(?i)(?:commodity|generic\s*name|common\s*name|product\s*name|item)\s*:?\s*([^\n]+)'
        )

        # Process lines for field detection
        for line_obj in lines:
            line_text = line_obj.get("text", "").strip()
            line_conf = line_obj.get("avg_confidence", 0.80)
            
            if not line_text:
                continue

            # Check NET_QUANTITY
            if extracted_fields["NET_QUANTITY"]["detection_status"] == "NOT_DETECTED":
                match = net_qty_regex.search(line_text) or net_qty_fallback.search(line_text)
                if match:
                    val = match.group(1).strip() if match.groups() else match.group(0).strip()
                    conf = line_conf
                    status = "DETECTED" if conf >= CONFIDENCE_THRESHOLD else "LOW_CONFIDENCE"
                    extracted_fields["NET_QUANTITY"] = {
                        "field_name": "NET_QUANTITY",
                        "extracted_value": val,
                        "confidence": conf,
                        "source_text": line_text,
                        "bounding_box": cls._compute_bounding_box_for_snippet(line_text, words),
                        "detection_status": status
                    }

            # Check MFG_DATE
            if extracted_fields["MFG_DATE"]["detection_status"] == "NOT_DETECTED":
                match = mfg_date_regex.search(line_text)
                if match and match.group(1):
                    val = match.group(1).strip()
                    conf = line_conf
                    status = "DETECTED" if conf >= CONFIDENCE_THRESHOLD else "LOW_CONFIDENCE"
                    extracted_fields["MFG_DATE"] = {
                        "field_name": "MFG_DATE",
                        "extracted_value": val,
                        "confidence": conf,
                        "source_text": line_text,
                        "bounding_box": cls._compute_bounding_box_for_snippet(line_text, words),
                        "detection_status": status
                    }

            # Check MRP
            if extracted_fields["MRP"]["detection_status"] == "NOT_DETECTED":
                match = mrp_regex.search(line_text) or mrp_fallback.search(line_text)
                if match:
                    val = line_text
                    conf = line_conf
                    status = "DETECTED" if conf >= CONFIDENCE_THRESHOLD else "LOW_CONFIDENCE"
                    extracted_fields["MRP"] = {
                        "field_name": "MRP",
                        "extracted_value": val,
                        "confidence": conf,
                        "source_text": line_text,
                        "bounding_box": cls._compute_bounding_box_for_snippet(line_text, words),
                        "detection_status": status
                    }

            # Check UNIT_SALE_PRICE
            if extracted_fields["UNIT_SALE_PRICE"]["detection_status"] == "NOT_DETECTED":
                match = usp_regex.search(line_text) or usp_fallback.search(line_text)
                if match:
                    val = line_text
                    conf = line_conf
                    status = "DETECTED" if conf >= CONFIDENCE_THRESHOLD else "LOW_CONFIDENCE"
                    extracted_fields["UNIT_SALE_PRICE"] = {
                        "field_name": "UNIT_SALE_PRICE",
                        "extracted_value": val,
                        "confidence": conf,
                        "source_text": line_text,
                        "bounding_box": cls._compute_bounding_box_for_snippet(line_text, words),
                        "detection_status": status
                    }

            # Check CONSUMER_CARE
            if extracted_fields["CONSUMER_CARE"]["detection_status"] == "NOT_DETECTED":
                match = consumer_care_regex.search(line_text) or phone_email_regex.search(line_text)
                if match:
                    val = line_text
                    conf = line_conf
                    status = "DETECTED" if conf >= CONFIDENCE_THRESHOLD else "LOW_CONFIDENCE"
                    extracted_fields["CONSUMER_CARE"] = {
                        "field_name": "CONSUMER_CARE",
                        "extracted_value": val,
                        "confidence": conf,
                        "source_text": line_text,
                        "bounding_box": cls._compute_bounding_box_for_snippet(line_text, words),
                        "detection_status": status
                    }

            # Check COUNTRY_OF_ORIGIN
            if extracted_fields["COUNTRY_OF_ORIGIN"]["detection_status"] == "NOT_DETECTED":
                match = origin_regex.search(line_text)
                if match:
                    val = match.group(1).strip() if match.group(1) else line_text
                    conf = line_conf
                    status = "DETECTED" if conf >= CONFIDENCE_THRESHOLD else "LOW_CONFIDENCE"
                    extracted_fields["COUNTRY_OF_ORIGIN"] = {
                        "field_name": "COUNTRY_OF_ORIGIN",
                        "extracted_value": val,
                        "confidence": conf,
                        "source_text": line_text,
                        "bounding_box": cls._compute_bounding_box_for_snippet(line_text, words),
                        "detection_status": status
                    }

            # Check MANUFACTURER_ADDRESS
            if extracted_fields["MANUFACTURER_ADDRESS"]["detection_status"] == "NOT_DETECTED":
                match = mfr_regex.search(line_text)
                if match:
                    val = match.group(1).strip() if match.group(1) else line_text
                    conf = line_conf
                    status = "DETECTED" if conf >= CONFIDENCE_THRESHOLD else "LOW_CONFIDENCE"
                    extracted_fields["MANUFACTURER_ADDRESS"] = {
                        "field_name": "MANUFACTURER_ADDRESS",
                        "extracted_value": val,
                        "confidence": conf,
                        "source_text": line_text,
                        "bounding_box": cls._compute_bounding_box_for_snippet(line_text, words),
                        "detection_status": status
                    }

            # Check COMMODITY_NAME
            if extracted_fields["COMMODITY_NAME"]["detection_status"] == "NOT_DETECTED":
                match = commodity_regex.search(line_text)
                if match:
                    val = match.group(1).strip() if match.group(1) else line_text
                    conf = line_conf
                    status = "DETECTED" if conf >= CONFIDENCE_THRESHOLD else "LOW_CONFIDENCE"
                    extracted_fields["COMMODITY_NAME"] = {
                        "field_name": "COMMODITY_NAME",
                        "extracted_value": val,
                        "confidence": conf,
                        "source_text": line_text,
                        "bounding_box": cls._compute_bounding_box_for_snippet(line_text, words),
                        "detection_status": status
                    }

        return list(extracted_fields.values())
