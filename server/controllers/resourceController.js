const Resource = require('../models/Resource');

const getResources = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = { user: req.user.id };
    if (category) filter.category = category;
    const resources = await Resource.find(filter).sort({ starred: -1, createdAt: -1 });
    res.json({ success: true, data: resources });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const createResource = async (req, res) => {
  try {
    const { title, url, category, notes, starred } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'title is required' });
    const resource = await Resource.create({ user: req.user.id, title, url, category, notes, starred });
    res.status(201).json({ success: true, data: resource });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const updateResource = async (req, res) => {
  try {
    const resource = await Resource.findOne({ _id: req.params.id, user: req.user.id });
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });
    Object.assign(resource, req.body);
    await resource.save();
    res.json({ success: true, data: resource });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

const deleteResource = async (req, res) => {
  try {
    const resource = await Resource.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!resource) return res.status(404).json({ success: false, message: 'Resource not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getResources, createResource, updateResource, deleteResource };
