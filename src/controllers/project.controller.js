const Project = require('../models/Project');

exports.getAllProjects = async (req, res, next) => {
  try {
    const { category, isFeatured } = req.query;
    let query = {};

    const isAdmin = req.user && req.user.role === 'admin';
    const showHidden = req.query.showHidden === 'true';

    // Seul un admin authentifié peut voir les projets inactifs
    if (!(isAdmin && showHidden)) {
      query.isActive = true;
    }

    if (category && category !== 'all') query.category = category;
    if (isFeatured) query.isFeatured = isFeatured === 'true';

    const projects = await Project.find(query).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, count: projects.length, data: projects });
  } catch (error) {
    next(error);
  }
};


exports.toggleActive = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

    project.isActive = !project.isActive;
    await project.save();

    res.json({
      success: true,
      message: `Project ${project.isActive ? 'active' : 'inactive'}`,
      data: project
    });
  } catch (error) {
    next(error);
  }
};

exports.getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    res.json({ success: true, data: project });
  } catch (error) {
    next(error);
  }
};

exports.createProject = async (req, res, next) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.status(201).json({ success: true, message: 'Project created successfully', data: project });
  } catch (error) {
    next(error);
  }
};

exports.updateProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: false }
    );
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    res.json({ success: true, message: 'Project updated successfully', data: project });
  } catch (error) {
    next(error);
  }
};

exports.deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    res.json({ success: true, message: 'Project deleted successfully' });
  } catch (error) {
    next(error);
  }
};

exports.updateOrder = async (req, res, next) => {
  try {
    const { order } = req.body;
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { order },
      { new: true }
    );
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    res.json({ success: true, message: 'Order updated successfully', data: project });
  } catch (error) {
    next(error);
  }
};

exports.toggleFeatured = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }
    project.isFeatured = !project.isFeatured;
    await project.save();
    res.json({
      success: true,
      message: `Project ${project.isFeatured ? 'featured' : 'unfeatured'} successfully`,
      data: project
    });
  } catch (error) {
    next(error);
  }
};