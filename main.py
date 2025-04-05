from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS for cross-origin requests
import torch
import numpy as np
from PIL import Image
import io
import cv2
from torchvision import models
import torch.nn as nn
import torchvision.transforms as T

app = Flask(__name__)

# Enable CORS for the entire app
CORS(app)  # This allows cross-origin requests from the frontend (React app)

# Load U-Net model
model_path = r"C:\Users\Administrator\Desktop\major-proj\unet.pth"  # Path to the pre-trained U-Net model
device = "cuda" if torch.cuda.is_available() else "cpu"

# Define a simple U-Net model (you can load your specific U-Net model architecture here)
class UNet(nn.Module):
    def __init__(self):
        super(UNet, self).__init__()
        self.model = models.segmentation.deeplabv3_resnet101(pretrained=True).to(device)  # Example using DeepLabV3

    def forward(self, x):
        return self.model(x)['out']

# Initialize U-Net model
unet_model = UNet().to(device)
unet_model.load_state_dict(torch.load(model_path, map_location=device))
unet_model.eval()

# Define a transformation to convert the image to tensor for the model
transform = T.Compose([
    T.ToTensor(),
    T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])  # Standard ImageNet normalization
])

# Segment Road function using U-Net
def segment_road(image):
    try:
        # Convert PIL image to OpenCV format (BGR)
        image_rgb = cv2.cvtColor(np.array(image), cv2.COLOR_RGB2BGR)

        # Transform image to tensor and add batch dimension
        input_tensor = transform(image).unsqueeze(0).to(device)

        # Predict the segmentation mask
        with torch.no_grad():
            output = unet_model(input_tensor)  # Forward pass through U-Net model
        output_predictions = output.squeeze().cpu().numpy()

        # Apply threshold to get binary mask
        road_mask = (output_predictions > 0.5).astype(np.uint8) * 255

        # Overlay road mask on the original image (highlight roads in green)
        overlay = image_rgb.copy()  # Make a copy of the original image
        overlay[road_mask > 0] = [0, 255, 0]  # Highlight roads in green

        # Convert the overlay image back to RGB for returning to the user
        overlay_rgb = cv2.cvtColor(overlay, cv2.COLOR_BGR2RGB)

        # Return the overlay image
        return overlay_rgb, None  # Return the overlay image

    except Exception as e:
        return None, str(e)

@app.route('/segment', methods=['POST'])
def segment():
    try:
        # Ensure an image is uploaded
        if 'image' not in request.files:
            return jsonify({'error': 'No image file found in the request'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400

        # Ensure the file is an image
        try:
            image = Image.open(file)
        except Exception as e:
            return jsonify({'error': f'File is not a valid image: {str(e)}'}), 400

        # Perform segmentation
        road_mask, error = segment_road(image)
        if road_mask is None:
            return jsonify({'error': f'Segmentation failed: {error}'}), 500
        
        # Convert the mask to a PIL image
        mask_image = Image.fromarray(road_mask)
        mask_image = mask_image.convert("RGB")

        # Convert the mask image to a byte stream
        img_byte_arr = io.BytesIO()
        mask_image.save(img_byte_arr, format='JPEG')
        img_byte_arr.seek(0)

        # Return the segmented image as response
        return img_byte_arr.getvalue(), 200, {'Content-Type': 'image/jpeg'}
    
    except Exception as e:
        return jsonify({'error': f'An error occurred: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True)
