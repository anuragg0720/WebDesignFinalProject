const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// In-memory content store for demo purposes
let contentItems = [
  {
    id: 'support-links',
    title: 'Support & Services',
    body: 'Student support, HR, and campus planning links for Northeastern.',
    links: [
      {
        label: 'Customer Service & Support',
        url: 'https://pref.northeastern.edu/customer-service/',
      },
      {
        label: 'HR at Northeastern',
        url: 'https://hr.northeastern.edu/',
      },
      {
        label: 'Campus Planning & Real Estate',
        url: 'https://pref.northeastern.edu/campus-planning/',
      },
    ],
  },
  {
    id: 'study-links',
    title: 'Study & Programs',
    body: 'Key academic and program information for graduates and undergrads.',
    links: [
      {
        label: 'Graduate Programs',
        url: 'https://graduate.northeastern.edu/',
      },
      {
        label: 'Undergraduate Admissions',
        url: 'https://admissions.northeastern.edu/',
      },
      {
        label: 'Colleges & Schools',
        url: 'https://www.northeastern.edu/academics/colleges-and-schools/',
      },
    ],
  },
];

// GET /api/content - list content items
router.get('/content', async (req, res) => {
  res.json(contentItems);
});

// POST /api/content - create new content (faculty/admin)
router.post(
  '/content',
  auth(['faculty', 'super-admin', 'husky-admin']),
  async (req, res) => {
    const item = req.body || {};
    if (!item.id) {
      item.id = `content-${Date.now()}`;
    }
    contentItems.push(item);
    res.status(201).json(item);
  }
);

// PUT /api/content/:id - update a content item (faculty or admin)
router.put(
  '/content/:id',
  auth(['faculty', 'super-admin', 'husky-admin']),
  async (req, res) => {
    const { id } = req.params;
    const update = req.body || {};
    const index = contentItems.findIndex((c) => c.id === id);
    if (index === -1) {
      return res.status(404).json({ message: 'Content not found' });
    }
    contentItems[index] = { ...contentItems[index], ...update };
    res.json(contentItems[index]);
  }
);

// DELETE /api/content/:id - delete a content item (faculty/admin)
router.delete(
  '/content/:id',
  auth(['faculty', 'super-admin', 'husky-admin']),
  async (req, res) => {
    const { id } = req.params;
    const index = contentItems.findIndex((c) => c.id === id);
    if (index === -1) {
      return res.status(404).json({ message: 'Content not found' });
    }
    const deleted = contentItems.splice(index, 1)[0];
    res.json(deleted);
  }
);

module.exports = router;
