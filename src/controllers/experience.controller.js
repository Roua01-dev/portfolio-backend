// backend/controllers/experience.controller.js
const Experience = require('../models/Experience');

/**
 * GET /api/experiences
 * - ADMIN (showHidden=true) → retourne TOUT sans aucun filtre
 * - PUBLIC → seulement isActive: true
 */
exports.getAllExperiences = async (req, res, next) => {
  try {
    let query = {};

    const isAdmin = req.user && req.user.role === 'admin';
    const showHidden = req.query.showHidden === 'true';

    if (isAdmin && showHidden) {
      query = {}; // Admin avec showHidden=true → tout
    } else {
      query = { isActive: true }; // Visiteur ou admin sans flag → seulement actifs
    }

    const experiences = await Experience.find(query).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, count: experiences.length, data: experiences });
  } catch (error) {
    next(error);
  }
};

exports.getExperienceById = async (req, res, next) => {
  try {
    const experience = await Experience.findById(req.params.id);
    if (!experience) return res.status(404).json({ success: false, message: 'Experience not found' });
    res.json({ success: true, data: experience });
  } catch (error) { next(error); }
};

exports.createExperience = async (req, res, next) => {
  try {
    const experience = new Experience(req.body);
    await experience.save();
    res.status(201).json({ success: true, message: 'Experience created successfully', data: experience });
  } catch (error) { next(error); }
};

exports.updateExperience = async (req, res, next) => {
  try {
    const experience = await Experience.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: false });
    if (!experience) return res.status(404).json({ success: false, message: 'Experience not found' });
    res.json({ success: true, message: 'Experience updated successfully', data: experience });
  } catch (error) { next(error); }
};

exports.deleteExperience = async (req, res, next) => {
  try {
    const experience = await Experience.findByIdAndDelete(req.params.id);
    if (!experience) return res.status(404).json({ success: false, message: 'Experience not found' });
    res.json({ success: true, message: 'Experience deleted successfully' });
  } catch (error) { next(error); }
};

exports.updateOrder = async (req, res, next) => {
  try {
    const { order } = req.body;
    const experience = await Experience.findByIdAndUpdate(req.params.id, { order }, { new: true });
    if (!experience) return res.status(404).json({ success: false, message: 'Experience not found' });
    res.json({ success: true, message: 'Order updated successfully', data: experience });
  } catch (error) { next(error); }
};