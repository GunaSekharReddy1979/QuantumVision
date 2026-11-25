import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle, AlertTriangle, File, X, Loader2 } from 'lucide-react';

export default function DatasetUploader() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('idle'); // idle, uploading, processing, success, error
  const [errorMsg, setErrorMsg] = useState('');
  const inputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const removeFile = () => {
    setFile(null);
    setStatus('idle');
    setErrorMsg('');
  };

  const handleUpload = async () => {
    if (!file || !category) {
      setErrorMsg('Please select a file and a category.');
      setStatus('error');
      return;
    }
    
    setStatus('uploading');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', category);

    try {
      // Assuming backend is at localhost:8000
      const response = await fetch('http://localhost:8000/api/datasets/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.detail || 'Upload failed');
      }

      setStatus('processing');
      // Simulate processing time
      setTimeout(() => {
        setStatus('success');
      }, 2000);

    } catch (err) {
      setErrorMsg(err.message || 'An error occurred during upload.');
      setStatus('error');
    }
  };

  return (
    <div className="glass-panel p-6 rounded-xl flex flex-col space-y-4 max-w-lg w-full">
      <h3 className="text-lg font-bold text-white border-b border-white/10 pb-2">Dataset Manager</h3>
      
      <div className="flex flex-col space-y-2">
        <label className="text-sm text-muted-foreground">Disaster Category</label>
        <select 
          className="bg-slate-900 border border-white/20 text-white text-sm rounded-lg focus:ring-primary focus:border-primary block w-full p-2.5"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">Select Category...</option>
          <option value="inundation">SAR Inundation / Water Bodies</option>
          <option value="flood">Flood Extent / Severity</option>
          <option value="infrastructure">Shelters / Hospitals / Roads</option>
        </select>
      </div>

      {!file ? (
        <div 
          className={`border-2 border-dashed rounded-xl p-8 text-center flex flex-col items-center justify-center transition-colors
            ${dragActive ? 'border-primary bg-primary/10' : 'border-white/20 hover:border-white/40 hover:bg-white/5'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current.click()}
        >
          <UploadCloud size={48} className="text-muted-foreground mb-4" />
          <p className="text-white font-medium mb-1">Drag and drop file here</p>
          <p className="text-muted-foreground text-sm">or click to browse (CSV, GeoJSON, ZIP, SHP)</p>
          <input 
            ref={inputRef}
            type="file" 
            className="hidden" 
            onChange={handleChange} 
            accept=".csv,.geojson,.json,.zip,.shp"
          />
        </div>
      ) : (
        <div className="bg-slate-900/50 border border-white/10 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <File className="text-primary flex-shrink-0" size={24} />
            <div className="truncate">
              <p className="text-sm font-medium text-white truncate">{file.name}</p>
              <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
          </div>
          {status === 'idle' || status === 'error' ? (
            <button onClick={removeFile} className="text-muted-foreground hover:text-destructive transition-colors">
              <X size={20} />
            </button>
          ) : null}
        </div>
      )}

      {status === 'error' && (
        <div className="bg-destructive/20 text-destructive border border-destructive/30 p-3 rounded-lg flex items-center space-x-2 text-sm">
          <AlertTriangle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {status === 'success' && (
        <div className="bg-success/20 text-success border border-success/30 p-3 rounded-lg flex items-center space-x-2 text-sm">
          <CheckCircle size={16} />
          <span>Dataset uploaded and processed successfully.</span>
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || status === 'uploading' || status === 'processing' || status === 'success'}
        className={`w-full py-2.5 rounded-lg font-medium transition-all flex justify-center items-center space-x-2
          ${!file || status === 'uploading' || status === 'processing' || status === 'success' 
            ? 'bg-white/10 text-muted-foreground cursor-not-allowed' 
            : 'bg-primary text-primary-foreground hover:bg-primary/90'}`}
      >
        {status === 'uploading' || status === 'processing' ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>{status === 'uploading' ? 'Uploading...' : 'Processing Geospatial Data...'}</span>
          </>
        ) : status === 'success' ? (
          <span>Complete</span>
        ) : (
          <span>Upload and Validate</span>
        )}
      </button>
    </div>
  );
}
