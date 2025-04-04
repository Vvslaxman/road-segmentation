/////////////////////// IMAGE

import React, { useState } from 'react';
import axios from 'axios';
import './App.css'; // Importing the CSS for styling

function App() {
  const [image, setImage] = useState(null);
  const [segmentedImage, setSegmentedImage] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handle image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];

    if (file && file.type.startsWith('image/')) {
      setImage(file);
      setError(null); // Clear error message when a valid image is selected
    } else {
      setError('Please upload a valid image file.');
    }
  };

  // Submit image for segmentation
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!image) return alert('Please select an image!');

    setLoading(true);
    const formData = new FormData();
    formData.append('image', image);

    try {
      const response = await axios.post('http://localhost:5000/segment', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'arraybuffer',
      });

      // Convert the binary response into a Blob
      const blob = new Blob([response.data], { type: 'image/jpeg' });
      const imageUrl = URL.createObjectURL(blob);

      // Set the segmented image to be displayed
      setSegmentedImage(imageUrl);

      // Also display the original image in base64 format
      const originalImageUrl = URL.createObjectURL(image);
      setOriginalImage(originalImageUrl);
    } catch (error) {
      console.error('Error during segmentation', error);
      setError('An error occurred during segmentation. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Road Segmentation</h1>

      {/* Image upload form */}
      <form onSubmit={handleSubmit} className="upload-form">
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleImageChange} 
        />
        <button 
          type="submit" 
          disabled={loading || !image}
        >
          {loading ? 'Processing...' : 'Segment Road'}
        </button>
      </form>

      {/* Error message */}
      {error && <p className="error-message">{error}</p>}

      {/* Display the images side by side */}
      {originalImage && segmentedImage && (
        <div className="image-container">
          <div className="image-box">
            <h3>Original Image</h3>
            <img src={originalImage} alt="Original" />
          </div>
          <div className="image-box">
            <h3>Segmented Image</h3>
            <img src={segmentedImage} alt="Segmented" />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;



///////////////////////// Live Video

// import React from 'react';

// function App() {
//   return (
//     <div className="App">
//       <h1>Live Road Segmentation</h1>
//       <img
//         src="http://localhost:5000/video_feed"
//         alt="Live Segmentation Feed"
//         style={{ width: '100%', maxWidth: '800px' }}
//       />
//     </div>
//   );
// }

// export default App;


// //////////// Video
// import React, { useState } from 'react';
// import axios from 'axios';
// import './style.css';  // Import the updated CSS file

// function App() {
//   const [videoFile, setVideoFile] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const handleFileChange = (e) => {
//     setVideoFile(e.target.files[0]);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!videoFile) {
//       alert("Please select a video file!");
//       return;
//     }

//     setLoading(true);

//     const formData = new FormData();
//     formData.append('video', videoFile);

//     try {
//       const response = await axios.post('http://localhost:5000/process_video', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//         responseType: 'blob',
//       });

//       // Create a link to download the processed video
//       const downloadUrl = URL.createObjectURL(response.data);
//       const a = document.createElement('a');
//       a.href = downloadUrl;
//       a.download = 'segmented_video.mp4';
//       a.click();
//     } catch (error) {
//       console.error("Error during video processing:", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="container">
//       <h1>Road Segmentation from Video</h1>
//       <form onSubmit={handleSubmit} className="upload-form">
//         <input
//           type="file"
//           accept="video/mp4, video/x-m4v, video/*"
//           onChange={handleFileChange}
//           className="file-input"
//         />
//         <button type="submit" disabled={loading} className="upload-btn">
//           {loading ? 'Processing...' : 'Process Video'}
//         </button>
//       </form>
      
//       {loading && <div className="spinner"></div>}
//     </div>
//   );
// }

// export default App;
