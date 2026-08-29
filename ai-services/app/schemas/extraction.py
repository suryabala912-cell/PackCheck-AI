from pydantic import BaseModel, Field
from typing import List, Optional
from app.schemas.compliance import OverallComplianceReport

class BoundingBox(BaseModel):
    x: int = Field(ge=0)
    y: int = Field(ge=0)
    width: int = Field(ge=1)
    height: int = Field(ge=1)

class WordExtraction(BaseModel):
    text: str
    confidence: float = Field(ge=0.0, le=1.0)
    bounding_box: BoundingBox

class LineExtraction(BaseModel):
    line_number: int
    text: str
    avg_confidence: float = Field(ge=0.0, le=1.0)

class ExtractedDeclaration(BaseModel):
    field_name: str
    extracted_value: Optional[str] = None
    confidence: float = Field(ge=0.0, le=1.0)
    source_text: Optional[str] = None
    bounding_box: Optional[BoundingBox] = None
    detection_status: str  # DETECTED, NOT_DETECTED, LOW_CONFIDENCE

class OCRExtractionResponse(BaseModel):
    status: str
    filename: str
    content_type: str
    size_bytes: int
    ocr_engine: str
    raw_text: str
    normalized_text: str
    overall_ocr_confidence: float = Field(ge=0.0, le=1.0)
    ocr_quality_status: str  # HIGH_CONFIDENCE, MEDIUM_CONFIDENCE, LOW_CONFIDENCE
    word_count: int
    words: List[WordExtraction]
    lines: List[LineExtraction]
    declarations: List[ExtractedDeclaration]
    compliance_report: Optional[OverallComplianceReport] = None
    message: str
    timestamp: str

class ErrorResponse(BaseModel):
    detail: str
