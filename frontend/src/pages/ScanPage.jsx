import React, { useState } from 'react';
import { 
  Upload, 
  Scan, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Loader2, 
  Image as ImageIcon,
  Tag,
  ShieldCheck,
  Scale,
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { scanApi } from '../api/scanApi';
import DeclarationCard from '../components/DeclarationCard';
import RuleResultCard from '../components/RuleResultCard';
import ImageBoundingBoxViewer from '../components/ImageBoundingBoxViewer';
import StatusBadge from '../components/StatusBadge';
import ErrorMessage from '../components/ErrorMessage';

export default function ScanPage({ onNavigate }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [productName, setProductName] = useState('');
  const [category, setCategory] = useState('FOOD_BEVERAGE');
  const [isImported, setIsImported] = useState(false);

  const [analyzing, setAnalyzing] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [error, setError] = useState(null);
  const [selectedBox, setSelectedBox] = useState(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setScanResult(null);
      setError(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setScanResult(null);
      setError(null);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select or upload a commodity label image first.');
      return;
    }

    setAnalyzing(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', file);
    if (productName) formData.append('product_name', productName);
    if (category) formData.append('category', category);
    formData.append('is_imported', String(isImported));

    try {
      const result = await scanApi.analyzeScan(formData);
      setScanResult(result);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to complete scan analysis. Please check AI microservice connectivity.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
    setProductName('');
    setCategory('FOOD_BEVERAGE');
    setIsImported(false);
    setScanResult(null);
    setError(null);
    setSelectedBox(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 mb-1">
            <Scan className="w-3.5 h-3.5" />
            <span>AI Label Extraction & Verification Engine</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            New Package Label Scan
          </h1>
          <p className="text-sm text-slate-600">
            Upload a packaged commodity label image for automated OCR extraction and Legal Metrology rule verification.
          </p>
        </div>

        {scanResult && (
          <button
            onClick={handleReset}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Scan Another Label</span>
          </button>
        )}
      </div>

      {error && <ErrorMessage message={error} />}

      {/* Main Grid Layout */}
      {!scanResult ? (
        <form onSubmit={handleAnalyze} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Image Upload Drop Zone */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-blue-600" />
              <span>Package Label Image Upload</span>
            </h3>

            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="relative border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/60 hover:bg-blue-50/30 transition-all rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[300px] cursor-pointer group"
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />

              {previewUrl ? (
                <div className="space-y-3">
                  <img
                    src={previewUrl}
                    alt="Uploaded Label Preview"
                    className="max-h-64 rounded-xl object-contain mx-auto border border-slate-200 shadow-xs"
                  />
                  <div className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 inline-block">
                    Selected File: {file?.name}
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-4 bg-white rounded-full text-blue-600 shadow-xs border border-slate-200 group-hover:scale-110 transition inline-block">
                    <Upload className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      Drag & Drop package label image here
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Supports JPG, PNG, WEBP (High-resolution packaging labels recommended)
                    </p>
                  </div>
                  <span className="inline-block px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-xs group-hover:bg-blue-700 transition">
                    Browse File
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Inspection Metadata Inputs */}
          <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Tag className="w-5 h-5 text-blue-600" />
                <span>Commodity Metadata</span>
              </h3>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Product / Commodity Name
                </label>
                <input
                  type="text"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  placeholder="e.g. Premium Basmati Rice 5kg"
                  className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Commodity Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 transition outline-none"
                >
                  <option value="FOOD_BEVERAGE">Food & Beverage</option>
                  <option value="COSMETICS">Cosmetics & Personal Care</option>
                  <option value="ELECTRONICS">Electronics & Electricals</option>
                  <option value="PHARMACEUTICALS">Pharmaceuticals / Health</option>
                  <option value="GENERAL">General Packaged Goods</option>
                </select>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl cursor-pointer hover:bg-slate-100 transition">
                  <input
                    type="checkbox"
                    checked={isImported}
                    onChange={(e) => setIsImported(e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <div>
                    <div className="text-xs font-bold text-slate-900">Imported Commodity Package</div>
                    <div className="text-[11px] text-slate-500">Applies Rule 6(2) importer declaration mandates</div>
                  </div>
                </label>
              </div>
            </div>

            {/* Submit Analyze Button */}
            <div className="pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={analyzing || !file}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                {analyzing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Running AI OCR & Legal Rule Verification...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Run Preliminary Analysis</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      ) : (
        /* Analysis Results Output View */
        <div className="space-y-8 animate-fade-in">
          
          {/* Assessment Banner */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <StatusBadge status={scanResult.preliminary_assessment} />
                <span className="text-xs font-mono font-bold text-slate-500">
                  Ref: {scanResult.scan_reference_number}
                </span>
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                {scanResult.product_name || 'Unspecified Commodity Label'}
              </h2>
              <p className="text-xs text-slate-500">
                Analyzed on {new Date(scanResult.scan_timestamp || Date.now()).toLocaleString()}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => onNavigate(`/scans/${scanResult.scan_reference_number}`)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
              >
                <FileText className="w-4 h-4" />
                <span>View Full Inspection Report</span>
              </button>
            </div>
          </div>

          {/* Visual Bounding Boxes Section */}
          <ImageBoundingBoxViewer
            imageUrl={scanResult.image_url || previewUrl}
            declarations={scanResult.extracted_declarations || []}
            selectedBox={selectedBox}
            onSelectBox={(dec) => setSelectedBox(dec)}
          />

          {/* Extracted Declarations Grid */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              <span>Extracted Statutory Declarations ({scanResult.extracted_declarations?.length || 0})</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {scanResult.extracted_declarations?.map((dec, idx) => (
                <DeclarationCard
                  key={idx}
                  declaration={dec}
                  onSelectBox={(d) => setSelectedBox(d)}
                />
              ))}
            </div>
          </div>

          {/* Rule Compliance Evaluation Results */}
          <div className="space-y-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Scale className="w-5 h-5 text-blue-600" />
              <span>Legal Metrology Rule Evaluations ({scanResult.rule_evaluation_results?.length || 0})</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {scanResult.rule_evaluation_results?.map((res, idx) => (
                <RuleResultCard key={idx} ruleResult={res} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
