import React, { useState } from 'react';
import { scanApi } from '../api/scanApi';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import StatusBadge from '../components/StatusBadge';
import ImageBoundingBoxViewer from '../components/ImageBoundingBoxViewer';
import DeclarationCard from '../components/DeclarationCard';
import RuleResultCard from '../components/RuleResultCard';
import { UploadCloud, Image as ImageIcon, Scan, CheckCircle2, ShieldAlert, FileText, ArrowRight, RotateCcw } from 'lucide-react';

export default function ScanPage({ currentUser, onNavigate }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [productName, setProductName] = useState('Packaged Commodity');
  const [category, setCategory] = useState('Grocery');
  const [isImported, setIsImported] = useState(false);

  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState(null);
  const [scanResult, setScanResult] = useState(null);
  const [activeDeclarationKey, setActiveDeclarationKey] = useState(null);

  const handleFileChange = (selectedFile) => {
    if (!selectedFile) return;
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, WEBP).');
      return;
    }
    setFile(selectedFile);
    setPreviewUrl(URL.createObjectURL(selectedFile));
    setError(null);
    setScanResult(null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please choose or drop a package label image to analyze.');
      return;
    }

    setAnalyzing(true);
    setError(null);

    try {
      const officerId = currentUser?.id || 1;
      const response = await scanApi.analyzeScan(file, productName, category, isImported, officerId);
      setScanResult(response);
    } catch (err) {
      console.error('Scan analysis error:', err);
      const msg = err.response?.data?.error || err.response?.data?.message || err.message || 'Scan analysis failed.';
      setError(msg);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1">
            <Scan className="w-4 h-4" />
            Automated Label Inspection
          </div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">
            New Package Image Analysis
          </h1>
          <p className="text-xs text-slate-400">
            Upload a packaged commodity label image for OCR extraction and Legal Metrology Rules, 2011 rule verification.
          </p>
        </div>

        {scanResult && (
          <button
            onClick={() => {
              setScanResult(null);
              setFile(null);
              setPreviewUrl(null);
            }}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5 self-start"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Scan Another Image
          </button>
        )}
      </div>

      <ErrorMessage message={error} onDismiss={() => setError(null)} />

      {/* Main Upload Form & View Grid */}
      {!scanResult ? (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* File Picker & Dropzone (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Package Label Image File
            </label>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all flex flex-col items-center justify-center min-h-[320px] ${
                previewUrl
                  ? 'border-cyan-500/60 bg-slate-950/80'
                  : 'border-slate-800 hover:border-cyan-500/40 bg-slate-900/60 hover:bg-slate-900'
              }`}
            >
              {previewUrl ? (
                <div className="space-y-4 w-full flex flex-col items-center">
                  <img
                    src={previewUrl}
                    alt="Package Preview"
                    className="max-h-64 rounded-lg object-contain border border-slate-800 shadow-md"
                  />
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-300 font-mono truncate max-w-xs">{file?.name}</span>
                    <label className="cursor-pointer text-xs text-cyan-400 hover:underline font-semibold">
                      Change File
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e.target.files[0])}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-slate-950 flex items-center justify-center border border-slate-800 text-cyan-400 shadow-inner">
                    <UploadCloud className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-200">
                      Click to upload or drag & drop image
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Supports JPG, PNG, WEBP high-resolution product labels
                    </p>
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e.target.files[0])}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Commodity Details Form (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
            <h2 className="text-base font-bold text-slate-100 border-b border-slate-800 pb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              Commodity Metadata
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Product Name
              </label>
              <input
                type="text"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                placeholder="e.g. Whole Wheat Flour 5kg"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              >
                <option value="Grocery">Grocery / Food Item</option>
                <option value="Cosmetics">Cosmetics & Personal Care</option>
                <option value="Electronics">Electronics & Hardware</option>
                <option value="Pharmaceuticals">Pharmaceuticals & Healthcare</option>
                <option value="Retail Goods">General Retail Goods</option>
              </select>
            </div>

            <div className="flex items-center gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              <input
                type="checkbox"
                id="isImportedCheck"
                checked={isImported}
                onChange={(e) => setIsImported(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 focus:ring-cyan-400 bg-slate-900 border-slate-700"
              />
              <label htmlFor="isImportedCheck" className="text-xs text-slate-200 font-medium cursor-pointer">
                Commodity is Imported into India (Triggers Rule 6(2) country of origin & importer declaration checks)
              </label>
            </div>

            <button
              type="submit"
              disabled={analyzing || !file}
              className="w-full py-3.5 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
            >
              {analyzing ? (
                <LoadingSpinner message="Extracting OCR & Evaluating Rules..." size="small" />
              ) : (
                <>
                  <Scan className="w-4 h-4" />
                  Analyze Label Image
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        /* Results View */
        <div className="space-y-8 animate-fade-in">
          
          {/* Summary Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-bold text-cyan-400 bg-cyan-950 px-2.5 py-1 rounded border border-cyan-800">
                  {scanResult.scan_reference_number}
                </span>
                <StatusBadge status={scanResult.preliminary_assessment} type="assessment" />
                <StatusBadge status={scanResult.review_status} type="review" />
              </div>
              <h2 className="text-xl font-extrabold text-slate-100">{scanResult.product_name} ({scanResult.category})</h2>
              <p className="text-xs text-slate-400">
                OCR Confidence: <strong className="text-emerald-400">{Math.round((scanResult.overall_ocr_confidence || 0.95) * 100)}%</strong> • Status: <strong className="text-slate-200">{scanResult.ocr_quality_status || 'OPTIMAL'}</strong>
              </p>
            </div>

            <button
              onClick={() => onNavigate(`/scans/${scanResult.scan_reference_number}`)}
              className="px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors flex items-center gap-1.5 self-start md:self-auto"
            >
              Open Full Scan Details <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Statutory Disclaimer Banner */}
          <div className="bg-amber-950/40 border border-amber-800/60 p-4 rounded-xl text-xs text-amber-200 flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <span>
              <strong>Statutory Compliance Disclaimer:</strong> {scanResult.disclaimer || "AI preliminary assessment — human officer verification required under Legal Metrology Rules, 2011."}
            </span>
          </div>

          {/* Bounding Box Visualizer & Declarations Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Image Bounding Box Visualizer (7 cols) */}
            <div className="lg:col-span-7">
              <ImageBoundingBoxViewer
                imageUrl={scanResult.image_url}
                declarations={scanResult.declarations || []}
                activeKey={activeDeclarationKey}
                onSelectKey={(key) => setActiveDeclarationKey(key)}
              />
            </div>

            {/* Extracted Declarations Cards (5 cols) */}
            <div className="lg:col-span-5 space-y-4">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Extracted Mandatory Declarations</span>
                <span className="text-slate-500 font-mono">({scanResult.declarations?.length || 0} fields)</span>
              </h3>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                {scanResult.declarations?.map((decl, idx) => (
                  <DeclarationCard
                    key={idx}
                    declaration={decl}
                    isSelected={activeDeclarationKey === (decl.declaration_key || decl.field_name)}
                    onSelect={(key) => setActiveDeclarationKey(key)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Rule Evaluation Results Section */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              Legal Metrology Compliance Rule Evaluation
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {scanResult.rule_evaluations?.map((rule, idx) => (
                <RuleResultCard key={idx} rule={rule} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
