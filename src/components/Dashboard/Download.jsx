import React, { useState, useEffect } from 'react';
import { ref, uploadBytesResumable, getDownloadURL, listAll } from 'firebase/storage';
//import { storage } from '../firebase'; // Adjust path if your firebase.js is elsewhere

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBGnjkrRtYA6bsGrmN9zYrhsmlEdd2X8d8",
  authDomain: "we-connect-a473e.firebaseapp.com",
  projectId: "we-connect-a473e",
  storageBucket: "we-connect-a473e.firebasestorage.app",
  messagingSenderId: "165842033302",
  appId: "1:165842033302:web:abd3319b6778a4f3af80b7",
  measurementId: "G-4JEWS0BJRZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const MaterialsPage = () => {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Fetch all materials from Firebase Storage on component mount
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        const folderRef = ref(storage, 'react-materials/');
        const result = await listAll(folderRef);

        const materialList = await Promise.all(
          result.items.map(async (itemRef) => {
            const url = await getDownloadURL(itemRef);
            const extension = itemRef.name.split('.').pop().toUpperCase();
            return {
              name: itemRef.name,
              url,
              type: extension, // e.g., PDF, MP4, WEBM
            };
          })
        );

        setMaterials(materialList);
      } catch (err) {
        setError('Failed to load materials.');
        console.error(err);
      }
    };

    fetchMaterials();
  }, []);

  // Handle file selection
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (!selected) return;

    const allowedTypes = ['application/pdf', 'video/mp4', 'video/webm', 'video/ogg'];
    if (allowedTypes.includes(selected.type)) {
      setFile(selected);
      setError('');
      setSuccess('');
    } else {
      setError('Please select a PDF or video file (MP4, WebM, OGG).');
      setFile(null);
    }
  };

  // Handle upload
  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setUploadProgress(0);
    setSuccess('');
    setError('');

    // Prevent duplicate uploads
    const fileAlreadyExists = materials.some((mat) => mat.name === file.name);
    if (fileAlreadyExists) {
      setError('A file with this name already exists.');
      setUploading(false);
      return;
    }

    const storageRef = ref(storage, `react-materials/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(Math.round(progress));
      },
      (err) => {
        setError(`Upload failed: ${err.message}`);
        setUploading(false);
      },
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        setMaterials((prev) => [...prev, { name: file.name, url, type: file.name.split('.').pop().toUpperCase() }]);
        setSuccess('File uploaded successfully!');
        setFile(null);
        setUploadProgress(0);
        setUploading(false);
        // Reset file input
        document.getElementById('file-input').value = '';
      }
    );
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>React.js Learning Materials Platform</h1>
      <p style={{ textAlign: 'center', color: '#666' }}>
        Upload and download PDFs, video tutorials, and resources for learning React.js
      </p>

      {/* Upload Section */}
      <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', marginBottom: '40px', backgroundColor: '#f9f9f9' }}>
        <h2>Upload New Material</h2>
        <input
          id="file-input"
          type="file"
          accept=".pdf,video/mp4,video/webm,video/ogg"
          onChange={handleFileChange}
          style={{ display: 'block', marginBottom: '10px' }}
        />
        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: uploading || !file ? 'not-allowed' : 'pointer',
            opacity: uploading || !file ? 0.6 : 1,
          }}
        >
          {uploading ? 'Uploading...' : 'Upload File'}
        </button>

        {uploading && (
          <div style={{ marginTop: '10px' }}>
            <progress value={uploadProgress} max="100" style={{ width: '100%' }} />
            <p>{uploadProgress}% uploaded</p>
          </div>
        )}

        {success && <p style={{ color: 'green', marginTop: '10px' }}>{success}</p>}
        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      </div>

      {/* Materials List */}
      <div>
        <h2>Available Materials ({materials.length})</h2>
        {materials.length === 0 ? (
          <p>No materials uploaded yet. Be the first to contribute!</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {materials.map((material, index) => (
              <li
                key={index}
                style={{
                  border: '1px solid #eee',
                  borderRadius: '8px',
                  padding: '15px',
                  marginBottom: '10px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  backgroundColor: '#fff',
                }}
              >
                <div>
                  <strong>{material.name}</strong>
                  <span style={{ marginLeft: '10px', color: '#888', fontSize: '0.9em' }}>
                    ({material.type})
                  </span>
                </div>
                <div>
                  {material.type === 'PDF' ? (
                    <a href={material.url} target="_blank" rel="noopener noreferrer">
                      <button style={{ marginRight: '10px', padding: '8px 16px' }}>View PDF</button>
                    </a>
                  ) : (
                    <a href={material.url} target="_blank" rel="noopener noreferrer">
                      <button style={{ marginRight: '10px', padding: '8px 16px' }}>Play Video</button>
                    </a>
                  )}
                  <a href={material.url} download={material.name}>
                    <button style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white' }}>
                      Download
                    </button>
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MaterialsPage;