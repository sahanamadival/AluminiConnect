const Event = require('../models/Event');

const getEvents = async (req, res) => {
  try {
    const events = await Event.find({ date: { $gte: new Date() } }).sort('date');
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching events' });
  }
};

const createEvent = async (req, res) => {
  try {
    const { title, description, date, location } = req.body;
    const event = await Event.create({
      title, description, date, location, organizer: req.user._id
    });
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create event' });
  }
};

module.exports = { getEvents, createEvent };
