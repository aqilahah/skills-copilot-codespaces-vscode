// Create web server

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const { randomBytes } = require('crypto');

// Create express app
const app = express();
// Parse json body
app.use(bodyParser.json());

// Create comments object
const commentsByPostId = {};

// Get all comments for a post
app.get('/posts/:id/comments', (req, res) => {
  // Return comments for post id
  res.status(200).send(commentsByPostId[req.params.id] || []);
});

// Create a comment for a post
app.post('/posts/:id/comments', async (req, res) => {
  // Generate random id for comment
  const commentId = randomBytes(4).toString('hex');
  // Get content from request body
  const { content } = req.body;
  // Get comments for post id
  const comments = commentsByPostId[req.params.id] || [];
  // Add new comment
  comments.push({ id: commentId, content, status: 'pending' });
  // Store new comments
  commentsByPostId[req.params.id] = comments;
  // Emit event to event bus
  await axios.post('http://localhost:4005/events', {
    type: 'CommentCreated',
    data: { id: commentId, content, postId: req.params.id, status: 'pending' },
  });

  // Return created comment
  res.status(201).send(comments);
});

// Handle events from event bus
app.post('/events', async (req, res) => {
  // Get event type and data
  const { type, data } = req.body;
  // Check event type
  if (type === 'CommentModerated') {
    // Get comments for post id
    const comments = commentsByPostId[data.postId];
    // Get comment from comments
    const comment = comments.find((comment) => comment.id === data.id);
    // Update comment status
    comment.status = data.status;
    // Emit event to event bus
    await axios.post('http://localhost:4005/events', {
      type: 'CommentUpdated',
      data,
    });
  }
  // Send ok response
  res.send({});
});

// Listen on port 4001
app.listen(4001, () => {
  console.log('Listening on port 400