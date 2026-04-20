require('dotenv').config();
const mongoose = require('mongoose');
const Project = require('./src/models/Project');
const Experience = require('./src/models/Experience');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connecté');
  } catch (error) {
    console.error('❌ Erreur MongoDB:', error);
    process.exit(1);
  }
};

const seedProjects = async () => {
  try {
    console.log('🌱 Seeding Projects...');

    // Supprimer les projets existants
    await Project.deleteMany({});
    console.log('🗑️  Anciens projets supprimés');

    // Créer les nouveaux projets
    const projects = [
      {
        title: 'Treanos Medical Platform',
        description: 'Complete medical platform for appointment management, patient records, and healthcare provider coordination. Built with modern technologies for optimal performance.',
        technologies: ['Flutter', 'Node.js', 'Firebase', 'REST API', 'MongoDB'],
        imageUrl: null,
        githubUrl: 'https://github.com/rouayouneb/treanos',
        liveUrl: null,
        category: 'mobile',
        isFeatured: true,
        isHidden: false,
        order: 1,
      },
      {
        title: '.NET MAUI Mobile App',
        description: 'Cross-platform mobile solution built with .NET MAUI, featuring modern UI/UX design and offline-first architecture.',
        technologies: ['.NET MAUI', 'C#', 'SQLite', 'XAML', 'MVVM'],
        imageUrl: null,
        githubUrl: null,
        liveUrl: null,
        category: 'mobile',
        isFeatured: false,
        isHidden: false,
        order: 2,
      },
      {
        title: 'AI Vision Studio',
        description: 'Advanced computer vision platform for image analysis, object detection, and facial recognition using state-of-the-art AI models.',
        technologies: ['Python', 'TensorFlow', 'OpenCV', 'Flask', 'Docker'],
        imageUrl: null,
        githubUrl: 'https://github.com/rouayouneb/ai-vision',
        liveUrl: 'https://ai-vision-demo.com',
        category: 'other',
        isFeatured: true,
        isHidden: false,
        order: 3,
      },
      {
        title: 'Enterprise Dashboard',
        description: 'Real-time analytics platform for business intelligence with interactive charts, data visualization, and custom reporting.',
        technologies: ['React', 'Node.js', 'MongoDB', 'Chart.js', 'WebSocket'],
        imageUrl: null,
        githubUrl: null,
        liveUrl: 'https://dashboard-demo.com',
        category: 'web',
        isFeatured: true,
        isHidden: false,
        order: 4,
      },
      {
        title: 'E-Commerce Platform',
        description: 'Full-featured online shopping platform with payment integration, inventory management, and customer analytics.',
        technologies: ['Angular', 'Node.js', 'PostgreSQL', 'Stripe', 'Redis'],
        imageUrl: null,
        githubUrl: null,
        liveUrl: null,
        category: 'web',
        isFeatured: false,
        isHidden: false,
        order: 5,
      },
      {
        title: 'Blazor Desktop Suite',
        description: 'Enterprise management tools suite with modular architecture, built using Blazor and DevExpress components.',
        technologies: ['Blazor', '.NET Core', 'DevExpress XAF', 'SQL Server', 'SignalR'],
        imageUrl: null,
        githubUrl: null,
        liveUrl: null,
        category: 'desktop',
        isFeatured: false,
        isHidden: false,
        order: 6,
      },
      {
        title: 'Creative Design Studio',
        description: 'Professional design tools suite with advanced features for graphic designers and creative professionals.',
        technologies: ['Electron', 'React', 'Canvas API', 'WebGL', 'Node.js'],
        imageUrl: null,
        githubUrl: 'https://github.com/rouayouneb/design-studio',
        liveUrl: null,
        category: 'desktop',
        isFeatured: false,
        isHidden: false,
        order: 7,
      },
    ];

    const createdProjects = await Project.insertMany(projects);
    console.log(`✅ ${createdProjects.length} projets créés avec succès`);

    return createdProjects;
  } catch (error) {
    console.error('❌ Erreur lors du seed des projets:', error);
    throw error;
  }
};

const seedExperiences = async () => {
  try {
    console.log('🌱 Seeding Experiences...');

    // Supprimer les expériences existantes
    await Experience.deleteMany({});
    console.log('🗑️  Anciennes expériences supprimées');

    // Créer les nouvelles expériences
    const experiences = [
      {
        company: 'Insimplo',
        position: 'Flutter, Node.js Developer Intern',
        project: 'Treanos: Medical Platform',
        duration: 'Feb 2025 - Jun 2025 · 5 mos',
        location: 'Monastir, Tunisia · Hybrid',
        skills: [
          'Flutter',
          'Node.js',
          'Firebase',
          'REST API',
          'Git',
          'GitHub',
          'UI/UX Design',
          'Agile Methodology',
        ],
        isActive: true,
        isHidden: false,
        order: 1,
      },
      {
        company: 'Vertu Entreprise Systems',
        position: '.NET MAUI Developer Intern',
        project: 'Mobile Application Development',
        duration: 'Jul 2024 - Aug 2024 · 2 mos',
        location: 'Sousse, Tunisia · Hybrid',
        skills: [
          '.NET MAUI',
          'XAML',
          'C#',
          'SQLite',
          'MVVM',
          'REST API',
          'Git',
        ],
        isActive: true,
        isHidden: false,
        order: 2,
      },
      {
        company: 'Rise.Up',
        position: '.NET Developer Intern (DevExpress XAF & Blazor)',
        project: 'Enterprise Management System',
        duration: 'Feb 2022 - Jun 2022 · 5 mos',
        location: 'Sousse, Tunisia · Hybrid',
        skills: [
          '.NET Framework',
          '.NET Core',
          'Blazor',
          'DevExpress XAF',
          'SQL Server',
          'Entity Framework',
          'C#',
        ],
        isActive: true,
        isHidden: false,
        order: 3,
      },
      {
        company: 'LEONI TUNISIA',
        position: 'Procurement and Inventory Management Intern',
        project: 'Supply Chain Management',
        duration: 'Aug 2020 - Sep 2020 · 2 mos',
        location: 'Monastir, Tunisia',
        skills: [
          'Inventory Management',
          'Supply Chain',
          'ERP Systems',
          'Data Analysis',
          'Process Optimization',
          'Microsoft Excel',
        ],
        isActive: true,
        isHidden: false,
        order: 4,
      },
    ];

    const createdExperiences = await Experience.insertMany(experiences);
    console.log(`✅ ${createdExperiences.length} expériences créées avec succès`);

    return createdExperiences;
  } catch (error) {
    console.error('❌ Erreur lors du seed des expériences:', error);
    throw error;
  }
};

const seedPortfolio = async () => {
  try {
    console.log('🌱 Démarrage du seed du portfolio...\n');

    await connectDB();

    await seedProjects();
    console.log('');
    await seedExperiences();

    console.log('\n🎉 Portfolio seedé avec succès !');
    console.log('📊 Résumé :');
    console.log(`   - Projets : ${await Project.countDocuments()}`);
    console.log(`   - Expériences : ${await Experience.countDocuments()}`);
    console.log('\n✅ Vous pouvez maintenant utiliser votre API !');
  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Connexion MongoDB fermée');
    process.exit(0);
  }
};

// Exécuter le seed
seedPortfolio();