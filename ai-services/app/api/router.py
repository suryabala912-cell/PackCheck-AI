from fastapi import APIRouter, UploadFile, File, HTTPException, status
from datetime import datetime
import io
from PIL import Image
from app.schemas.extraction import OCRExtractionResponse
from app.services.ocr_service import OCRService
from app.services.text_normalizer import TextNormalizer
from app.services.declaration_extractor import DeclarationExtractor
from app.services.rule_engine import ComplianceRuleEngine
from app.core.config import settings
from app.core.logging import logger

router = APIRouter(prefix="/api/v1", tags=["Extraction"])

@router.post(
    "/extract",
    response_model=OCRExtractionResponse,
    status_code=status.HTTP_200_OK,
    summary="Perform OCR text extraction, normalization, declaration parsing, and preliminary rule compliance evaluation"
)
async def extract_image_ocr(file: UploadFile = File(...)):
    """
    Validates uploaded image file size and dimensions, performs OCR text extraction,
    normalizes text, evaluates declarations and preliminary Legal Metrology compliance rules safely.
    """
    if not file.filename:
        logger.warning("Upload attempt without filename")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Filename missing in uploaded file"
        )
    
    contents = await file.read()
    size_bytes = len(contents)
    
    # 1. Validate File Size
    if size_bytes == 0:
        logger.warning(f"Empty file upload attempt: {file.filename}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded image file is empty"
        )
        
    if size_bytes > settings.MAX_UPLOAD_SIZE_BYTES:
        max_mb = settings.MAX_UPLOAD_SIZE_BYTES / (1024 * 1024)
        logger.warning(f"File size limit exceeded for {file.filename}: {size_bytes} bytes (Max: {max_mb}MB)")
        raise HTTPException(
            status_code=status.HTTP_413_CONTENT_TOO_LARGE,
            detail=f"Image size exceeds maximum permitted limit of {max_mb:.1f}MB"
        )
    
    # 2. Validate Image Format & Dimensions
    content_type = file.content_type or "unknown"
    is_valid_image = False
    img_width, img_height = 0, 0
    
    try:
        image = Image.open(io.BytesIO(contents))
        img_width, img_height = image.size
        
        # Verify image integrity
        image.verify()
        is_valid_image = True
        if image.format:
            content_type = f"image/{image.format.lower()}"
    except Exception as exc:
        logger.warning(f"Invalid image content for file {file.filename}: {str(exc)}")
        is_valid_image = False

    if not is_valid_image:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid image format. Supported formats: JPEG, PNG, WEBP, BMP"
        )

    # 3. Validate Dimensions (Min & Max bounds)
    if (img_width < settings.MIN_IMAGE_DIMENSION or 
        img_height < settings.MIN_IMAGE_DIMENSION or 
        img_width > settings.MAX_IMAGE_DIMENSION or 
        img_height > settings.MAX_IMAGE_DIMENSION):
        logger.warning(f"Image dimensions out of valid bounds for {file.filename}: {img_width}x{img_height}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"Image dimensions ({img_width}x{img_height}) must be between "
                f"{settings.MIN_IMAGE_DIMENSION}x{settings.MIN_IMAGE_DIMENSION} and "
                f"{settings.MAX_IMAGE_DIMENSION}x{settings.MAX_IMAGE_DIMENSION} pixels."
            )
        )
    
    # 4. Safe Execution of OCR Pipeline
    try:
        ocr_result = OCRService.extract_ocr_data(contents)
    except Exception as exc:
        logger.error(f"OCR service execution failed for {file.filename}: {str(exc)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing OCR on the uploaded image."
        )
    
    # 5. Normalize OCR Text & Calculate Overall Quality Status
    normalized_text = TextNormalizer.normalize_ocr_text(ocr_result["raw_text"])
    overall_conf, quality_status = TextNormalizer.calculate_overall_confidence(
        ocr_result["words"], ocr_result["lines"]
    )
    
    # 6. Execute Declaration Field Extractor
    declarations = DeclarationExtractor.extract_declarations(ocr_result)
    
    # 7. Execute Compliance Rule Engine
    compliance_report = ComplianceRuleEngine.evaluate_compliance(declarations)
    
    logger.info(
        f"Processed {file.filename} ({img_width}x{img_height}, {size_bytes}B) - "
        f"Engine: {ocr_result['ocr_engine']}, Status: {quality_status}, Compliance: {compliance_report.overall_status}"
    )
    
    return OCRExtractionResponse(
        status="SUCCESS",
        filename=file.filename,
        content_type=content_type,
        size_bytes=size_bytes,
        ocr_engine=ocr_result["ocr_engine"],
        raw_text=ocr_result["raw_text"],
        normalized_text=normalized_text,
        overall_ocr_confidence=overall_conf,
        ocr_quality_status=quality_status,
        word_count=ocr_result["word_count"],
        words=ocr_result["words"],
        lines=ocr_result["lines"],
        declarations=declarations,
        compliance_report=compliance_report,
        message=ocr_result["message"],
        timestamp=datetime.now().isoformat()
    )
