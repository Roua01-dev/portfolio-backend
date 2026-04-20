const mongoose = require('mongoose');

const personalInfoSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  
  // Links
  githubUrl: {
    type: String,
    trim: true
  },
  linkedinUrl: {
    type: String,
    trim: true
  },
  twitterUrl: {
    type: String,
    trim: true
  },
  websiteUrl: {
    type: String,
    trim: true
  },
  
  // About
  bio: {
    type: String,
    required: [true, 'Bio is required']
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  
  // Profile Image
  profileImageUrl: {
    type: String,
    trim: true
  },
  
  // Resume
  resumeUrl: {
    type: String,
    trim: true
  },
  
  // Skills
  skills: [{
    type: String,
    trim: true
  }],
  
  // Languages
  languages: [{
    language: { type: String, required: true },
    proficiency: { 
      type: String, 
      enum: ['beginner', 'intermediate', 'advanced', 'native'],
      required: true
    }
  }],
  
  // Availability
  availability: {
    type: String,
    enum: ['available', 'busy', 'not_available'],
    default: 'available'
  },
  
  // Meta
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
personalInfoSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Ensure only one document exists
personalInfoSchema.statics.getInfo = async function() {
  let info = await this.findOne();
  if (!info) {
    info = await this.create({
      firstName: 'Roua',
      lastName: 'YOUNEB',
      email: 'roua@portfolio.com',
      title: 'Software Developer',
      bio: 'Passionate software developer with expertise in full-stack development.'
    });
  }
  return info;
};

module.exports = mongoose.model('PersonalInfo', personalInfoSchema);