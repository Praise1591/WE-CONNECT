import React, { useState } from 'react';

function FileManager() {
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleUpload = (event) => {
    const files = Array.from(event.target.files);
    const newFiles = files.map((file) => ({
      id: Math.random().toString(36).substr(2, 9), // Simple unique ID
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file), // Creates a downloadable blob URL
      fileObject: file, // Keep reference if needed
    }));

    setUploadedFiles((prev) => [...prev, ...newFiles]);
  };

  const handleDownload = (file) => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (id) => {
    setUploadedFiles((prev) => prev.filter((file) => file.id !== id));
    // Note: Revoke object URL to free memory if desired
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>File Manager</h1>

      {/* Upload Section */}
      <section style={{ marginBottom: '40px', padding: '20px', border: '2px dashed #ccc', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
        <h2>Upload Files</h2>
        <p>Drag and drop files here or click to select. Any file type is supported.</p>
        <input
          type="file"
          multiple
          onChange={handleUpload}
          style={{ display: 'block', margin: '20px 0' }}
        />
        <small>Hold Ctrl/Cmd to select multiple files.</small>
      </section>

      {/* Uploaded Files / Download Section */}
      <section>
        <h2>Uploaded Files ({uploadedFiles.length})</h2>
        {uploadedFiles.length === 0 ? (
          <p>No files uploaded yet.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {uploadedFiles.map((file) => (
              <li
                key={file.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px',
                  marginBottom: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  backgroundColor: '#fff',
                }}
              >
                <div>
                  <strong>{file.name}</strong>
                  <br />
                  <small>
                    {file.type || 'Unknown type'} • {formatFileSize(file.size)}
                  </small>
                </div>
                <div>
                  <button
                    onClick={() => handleDownload(file)}
                    style={{ marginRight: '10px', padding: '8px 12px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Download
                  </button>
                  <button
                    onClick={() => handleDelete(file.id)}
                    style={{ padding: '8px 12px', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default FileManager;