const Message = require('../models/Message');
const EmailService = require('../services/email.service');
const PersonalInfo = require('../models/PersonalInf.js'); // Ajoutez cette ligne

exports.getAllMessages = async (req, res, next) => {
  try {
    const { isRead } = req.query;
    
    let query = {};
    if (isRead !== undefined) {
      query.isRead = isRead === 'true';
    }
    
    const messages = await Message.find(query)
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      count: messages.length,
      unreadCount: await Message.countDocuments({ isRead: false }),
      data: messages
    });
  } catch (error) {
    next(error);
  }
};

exports.getMessageById = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    // Marquer comme lu si c'est l'admin qui voit le message
    if (req.user?.role === 'admin' && !message.isRead) {
      message.isRead = true;
      await message.save();
    }
    
    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    next(error);
  }
};

exports.createMessage = async (req, res, next) => {
  try {
    const message = new Message(req.body);
    await message.save();
    
    // Récupérer l'email du propriétaire depuis les infos personnelles
    let ownerEmail = process.env.EMAIL_USER;
    try {
      const personalInfo = await PersonalInfo.findOne();
      if (personalInfo && personalInfo.email) {
        ownerEmail = personalInfo.email;
      }
    } catch (error) {
      console.error('Failed to fetch personal info:', error);
      // Continuer avec l'email par défaut
    }
    
    // Envoyer l'email au propriétaire
    try {
      await EmailService.sendNewMessageEmail(
        ownerEmail,
        {
          name: message.name,
          email: message.email,
          subject: message.subject,
          message: message.message
        }
      );
      console.log(`Notification email sent to owner: ${ownerEmail}`);
    } catch (emailError) {
      console.error('Failed to send notification email:', emailError);
    }
    
    // Envoyer aussi une copie à l'expéditeur
    try {
      await EmailService.sendMessageConfirmation(
        message.email,
        {
          name: message.name,
          subject: message.subject
        }
      );
      console.log(`Confirmation email sent to sender: ${message.email}`);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }
    
    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Message marked as read',
      data: message
    });
  } catch (error) {
    next(error);
  }
};

exports.markAsUnread = async (req, res, next) => {
  try {
    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { isRead: false },
      { new: true }
    );
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Message marked as unread',
      data: message
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteMessage = async (req, res, next) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);
    
    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

exports.getUnreadCount = async (req, res, next) => {
  try {
    const count = await Message.countDocuments({ isRead: false });
    
    res.json({
      success: true,
      unreadCount: count
    });
  } catch (error) {
    next(error);
  }
};