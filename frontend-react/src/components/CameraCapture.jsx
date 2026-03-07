import React, { useRef, useState, useEffect, useCallback } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function CameraCapture({ onDataExtracted, onClose }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);

    const [mode, setMode] = useState('camera');   // 'camera' | 'preview' | 'processing' | 'done'
    const [capturedImg, setCapturedImg] = useState(null);
    const [extracted, setExtracted] = useState(null);
    const [error, setError] = useState('');
    const [cameraReady, setCameraReady] = useState(false);
    const [facingMode, setFacingMode] = useState('environment');

    // Start camera
    const startCamera = useCallback(async (facing = facingMode) => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: facing, width: { ideal: 1920 }, height: { ideal: 1080 } }
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => setCameraReady(true);
            }
        } catch (err) {
            setError('Camera access denied. Please allow camera permission and retry.');
        }
    }, [facingMode]);

    useEffect(() => {
        startCamera();
        return () => {
            if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        };
    }, []);

    const flipCamera = () => {
        const next = facingMode === 'environment' ? 'user' : 'environment';
        setFacingMode(next);
        startCamera(next);
    };

    const capture = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d').drawImage(video, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
        setCapturedImg(dataUrl);
        setMode('preview');
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };

    const retake = () => {
        setCapturedImg(null);
        setExtracted(null);
        setError('');
        setMode('camera');
        startCamera();
    };

    const handleFileUpload = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = ev => {
            setCapturedImg(ev.target.result);
            setMode('preview');
        };
        reader.readAsDataURL(file);
    };

    const process = async () => {
        if (!capturedImg) return;
        setMode('processing');
        setError('');
        try {
            const base64 = capturedImg.split(',')[1];
            const res = await fetch(`${API_BASE}/api/ocr/extract`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: base64, mime_type: 'image/jpeg' }),
            });
            if (!res.ok) throw new Error(`Server error ${res.status}`);
            const data = await res.json();
            setExtracted(data);
            setMode('done');
        } catch (err) {
            setError('Extraction failed: ' + err.message);
            setMode('preview');
        }
    };

    const applyData = () => {
        if (extracted) onDataExtracted(extracted);
        onClose();
    };

    return (
        <div className="cam-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
            <div className="cam-modal">
                {/* Header */}
                <div className="cam-header">
                    <div className="cam-header-brand">
                        <span>📷</span>
                        <div>
                            <div className="cam-title">Camera OCR Capture</div>
                            <div className="cam-subtitle">Scan prescription / patient record</div>
                        </div>
                    </div>
                    <button className="cam-close" onClick={onClose}>✕</button>
                </div>

                {/* Body */}
                <div className="cam-body">
                    {/* Camera view */}
                    {mode === 'camera' && (
                        <div className="cam-viewfinder">
                            <video ref={videoRef} autoPlay playsInline muted className="cam-video" />
                            {!cameraReady && (
                                <div className="cam-loading">
                                    <div className="cam-spinner" /><span>Starting camera…</span>
                                </div>
                            )}
                            {/* Overlay guides */}
                            <div className="cam-guide">
                                <div className="cam-corner tl" /><div className="cam-corner tr" />
                                <div className="cam-corner bl" /><div className="cam-corner br" />
                                <div className="cam-guide-text">Align document within frame</div>
                            </div>
                            <div className="cam-controls">
                                <button className="cam-btn-flip" onClick={flipCamera} title="Flip camera">🔄</button>
                                <button className="cam-btn-capture" onClick={capture} disabled={!cameraReady}>
                                    <div className="cam-shutter" />
                                </button>
                                <label className="cam-btn-upload" title="Upload from gallery">
                                    🖼️
                                    <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                                </label>
                            </div>
                        </div>
                    )}

                    {/* Preview */}
                    {(mode === 'preview' || mode === 'processing') && (
                        <div className="cam-preview-wrap">
                            <img src={capturedImg} alt="Captured" className="cam-preview-img" />
                            {mode === 'processing' && (
                                <div className="cam-processing-overlay">
                                    <div className="cam-scan-line" />
                                    <div className="cam-processing-label">
                                        <div className="cam-spinner large" />
                                        <span>Extracting data with AI…</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Done / Results */}
                    {mode === 'done' && extracted && (
                        <div className="cam-results">
                            <div className="cam-results-hdr">
                                <span className="cam-check">✅</span>
                                <span>Data extracted successfully</span>
                            </div>
                            <div className="cam-results-grid">
                                {Object.entries(extracted)
                                    .filter(([, v]) => v && v !== '' && v !== false && v !== 0)
                                    .slice(0, 12)
                                    .map(([k, v]) => (
                                        <div key={k} className="cam-result-item">
                                            <span className="cam-result-key">{k.replace(/_/g, ' ')}</span>
                                            <span className="cam-result-val">{String(v)}</span>
                                        </div>
                                    ))}
                            </div>
                            <p className="cam-results-note">
                                * Preview shows key fields. All extracted data will be applied to the form.
                            </p>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="cam-error"><span>⚠️</span> {error}</div>
                    )}
                </div>

                {/* Footer actions */}
                <div className="cam-footer">
                    {mode === 'camera' && (
                        <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
                    )}
                    {(mode === 'preview') && (
                        <>
                            <button className="btn btn-secondary" onClick={retake}>🔄 Retake</button>
                            <button className="btn btn-primary" onClick={process}>🤖 Extract Data</button>
                        </>
                    )}
                    {mode === 'processing' && (
                        <button className="btn btn-secondary" disabled>Processing…</button>
                    )}
                    {mode === 'done' && (
                        <>
                            <button className="btn btn-secondary" onClick={retake}>📷 Scan Another</button>
                            <button className="btn btn-primary" onClick={applyData}>✅ Apply to Form</button>
                        </>
                    )}
                </div>
            </div>
            <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>
    );
}
