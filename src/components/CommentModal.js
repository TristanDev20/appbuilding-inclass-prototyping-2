import React, { useState, useEffect, useContext } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import UserContext from '../context/UserContext';
import DeleteComment from './DeleteComment'; // Import the DeleteComment component

export default function CommentModal({ show, handleClose, blogPost }) {
  const { user } = useContext(UserContext);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (blogPost && blogPost._id) {
      setLoading(true);
      console.log('Fetching comments for blogPost ID:', blogPost._id);
      
      const token = localStorage.getItem('token');
      console.log('Token found:', !!token);
      
      fetch(`https://appbuilding-inclass-prototyping-1.onrender.com/blogposts/getAllComments/${blogPost._id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => {
          console.log('Response status:', res.status);
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          console.log('Raw API response:', data);
          console.log('Is array?', Array.isArray(data));
          
          let commentsArray;
          if (Array.isArray(data)) {
            commentsArray = data;
          } else if (data.comments && Array.isArray(data.comments)) {
            commentsArray = data.comments;
          } else if (data.data && Array.isArray(data.data)) {
            commentsArray = data.data;
          } else if (data.result && Array.isArray(data.result)) {
            commentsArray = data.result;
          } else {
            console.warn('Unexpected response format:', data);
            commentsArray = [];
          }
          
          console.log('Processed comments array:', commentsArray);
          setComments(commentsArray);
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching comments:', err);
          setComments([]);
          setLoading(false);
        });
    } else {
      setComments([]);
      setLoading(false);
    }
  }, [blogPost]);

  const handleAddComment = () => {
    if (!commentText.trim()) return;
    
    fetch(`https://appbuilding-inclass-prototyping-1.onrender.com/blogposts/addComment/${blogPost._id}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({
        postId: blogPost._id,
        userId: user.id,
        comment: commentText
      })
    })
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((response) => {
        console.log('Add comment response:', response);
        
        let newComment;
        if (response.comment) {
          newComment = response.comment;
        } else if (response.blogPostId || response.postId) {
          newComment = response;
        } else {
          newComment = response;
        }
        
        const formattedComment = {
          _id: newComment._id || Date.now().toString(),
          userId: newComment.userId || user.id,
          comment: newComment.comment || commentText,
          createdAt: newComment.createdAt || new Date().toISOString()
        };
        
        setComments(prev => [...prev, formattedComment]);
        setCommentText('');
      })
      .catch(err => {
        console.error('Error adding comment:', err);
      });
  };

  const handleDeleteSuccess = (deletedCommentId) => {
    // Remove the deleted comment from the state
    setComments(prevComments => 
      prevComments.filter(comment => comment._id !== deletedCommentId)
    );
  };

  // Check if user is admin or owns the comment
  const canDeleteComment = (comment) => {
    return user && (user.isAdmin || user.id === comment.userId);
  };

  return (
    <Modal show={show} onHide={handleClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>Comments for "{blogPost?.title}"</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {loading ? (
          <p>Loading comments...</p>
        ) : comments.length > 0 ? (
          comments.map((comment, index) => (
            <div key={comment._id || index} className="mb-3">
              <div className="d-flex justify-content-between align-items-start">
                <div className="flex-grow-1">
                  <strong>User {comment.userId}:</strong>
                  <p className="mb-1">{comment.comment}</p>
                  <small className="text-muted">
                    {comment.createdAt ? new Date(comment.createdAt).toLocaleString() : ''}
                  </small>
                </div>
                {canDeleteComment(comment) && (
                  <DeleteComment
                    commentId={comment._id}
                    onDeleteSuccess={handleDeleteSuccess}
                    variant="outline-danger"
                    size="sm"
                    buttonText="Delete"
                    className="ms-2"
                  />
                )}
              </div>
              <hr />
            </div>
          ))
        ) : (
          <p>No comments yet.</p>
        )}
        
        {user && (
          <Form className="mt-4">
            <Form.Group controlId="commentText">
              <Form.Label>Add a Comment:</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
            </Form.Group>
            <Button
              variant="primary"
              className="mt-2"
              disabled={commentText.trim() === ''}
              onClick={handleAddComment}
            >
              Add Comment
            </Button>
          </Form>
        )}
      </Modal.Body>
    </Modal>
  );
}