require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const PersonalInfo = require('./src/models/PersonalInf.js');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seed...');

    // Clear existing data
    await User.deleteMany({});
    await PersonalInfo.deleteMany({});
    
    console.log('🗑️  Cleared existing data');

    // Create admin user
    const adminUser = await User.create({
      username: 'admin',
      email: 'rouayouneb0@gmail.com',
      password: 'Ry14019518*', // Will be hashed by the pre-save hook
      role: 'admin',
      isActive: true,
      twoFactorEnabled: false, // You can enable this later
    });

    console.log('✅ Admin user created:');
    console.log(`   Username: ${adminUser.username}`);
    console.log(`   Email: ${adminUser.email}`);
    console.log(`   Password: Ry14019518* (CHANGE THIS!)`);

    // Create personal info
    const personalInfo = await PersonalInfo.create({
      firstName: 'Roua',
      lastName: 'YOUNEB',
      email: 'rouayouneb0@gmail.com',
      phone: '+33767258859',
      location: 'Toulon, France',
      githubUrl: 'https://github.com/rouayouneb',
      linkedinUrl: 'https://linkedin.com/in/rouayouneb',
      bio: 'Graduated with a Bac+6 degree in Software Engineering after six years of intensive studies in computer systems engineering. My rigorous academic background, from a Computer Science baccalaureate to advanced training in software development, has allowed me to build strong expertise in full-stack development.',
      title: 'Computer Engineer & Software Developer',
      skills: [
        'Flutter',
        'React',
        'Node.js',
        'MongoDB',
        '.NET',
        'C#',
        'Python',
        'Firebase',
        'Git',
        'REST API',
        'UI/UX Design'
      ],
      languages: [
        { language: 'French', proficiency: 'native' },
        { language: 'Arabic', proficiency: 'native' },
        { language: 'English', proficiency: 'advanced' }
      ],
      availability: 'available'
    });

    console.log('✅ Personal info created');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n⚠️  IMPORTANT: Please change the admin password after first login!');
    console.log('   Login at: http://localhost:5000/api/auth/login');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
    process.exit(0);
  }
};

// Run the seed
connectDB().then(() => seedDatabase());