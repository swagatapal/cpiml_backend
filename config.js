module.exports = {
  mongoURI: process.env.MONGO_URI || 'mongodb+srv://swagatapal1980_db_user:DI6Utn9loUVpHTHd@cluster0.bfsq2ah.mongodb.net/cpim_liberation?retryWrites=true&w=majority',
  port: process.env.PORT || 5002,
  jwtSecret: process.env.JWT_SECRET || 'supersecretjwttoken',
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dchdlduob',
    api_key: process.env.CLOUDINARY_API_KEY || '312641738325816',
    api_secret: process.env.CLOUDINARY_API_SECRET || 'ql50-dKrWZkDkPYd_RmIQXekja8'
  },
  firebase: {
    serviceAccount: process.env.FIREBASE_SERVICE_ACCOUNT || '' // IMPORTANT: Store your Firebase service account key JSON as a single-line string in this environment variable.
  }
};


