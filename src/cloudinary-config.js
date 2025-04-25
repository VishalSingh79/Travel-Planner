import { Cloudinary } from '@cloudinary/url-gen';

const cloudinaryConfig = {
  cloud_name: import.meta.env.VITE_REACT_APP_CLOUD_NAME,
  api_key: import.meta.env.VITE_REACT_APP_CLOUD_API_KEY,
  upload_preset: 'unsigned_uploads'
};

// Create and configure a new Cloudinary instance
const cloudinary = new Cloudinary({
  cloud: {
    cloudName: cloudinaryConfig.cloud_name
  },
  url: {
    secure: true
  }
});

export { cloudinary };
export default cloudinaryConfig;