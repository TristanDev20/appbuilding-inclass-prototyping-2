import React, { useState, useContext } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import Swal from 'sweetalert2';
import UserContext from '../context/UserContext';

export default function AddBlogPost({ onPostAdded }) {
  const { user } = useContext(UserContext);
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    if (!isSubmitting) {
      setShow(false);
      // Reset form when closing
      setTitle('');
      setContent('');
    }
  };

  const handleShow = () => setShow(true);

  const showAlert = (config) => {
    return Swal.fire({
      ...config,
      allowOutsideClick: false,
      allowEscapeKey: false,
      backdrop: true
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Check user authentication
    if (!user || !user.id) {
      setIsSubmitting(false);
      handleClose();
      
      setTimeout(() => {
        showAlert({
          icon: 'warning',
          title: 'User Not Authenticated',
          text: 'You must be logged in to post a blog.'
        });
      }, 300);
      return;
    }

    const blogPostData = {
      title: title.trim(),
      content: content.trim(),
      author: user.id,
      createdDate: new Date().toISOString()
    };

    try {
      const response = await fetch('https://appbuilding-inclass-prototyping-1.onrender.com/blogposts/addBlogPost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(blogPostData)
      });

      const data = await response.json();

      // Debug: Log the response to see what we're getting
      // console.log('Response status:', response.status);
      // console.log('Response data:', data);

      // Check for success - be more flexible with success conditions
      if (response.ok && (data._id || data.id || data.success || data.message === 'Blog post created successfully')) {
        // Success - close modal first, then show success message
        handleClose();
        setIsSubmitting(false);
        
        setTimeout(() => {
          showAlert({
            icon: 'success',
            title: 'Blog Post Added!',
            text: 'Your blog post has been successfully created.'
          }).then(() => {
            onPostAdded(data);
          });
        }, 300);
      } else {
        // Error from server
        setIsSubmitting(false);
        handleClose();
        
        setTimeout(() => {
          showAlert({
            icon: 'error',
            title: 'Error',
            text: data.message || `Server responded with: ${JSON.stringify(data)}` || 'Something went wrong while creating your blog post.'
          });
        }, 300);
      }
    } catch (error) {
      // Network or other error
      setIsSubmitting(false);
      handleClose();
      
      setTimeout(() => {
        showAlert({
          icon: 'error',
          title: 'Network Error',
          text: error.message || 'Unable to reach the server. Please check your connection.'
        });
      }, 300);
    }
  };

  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        + Add Blog Post
      </Button>

      <Modal 
        show={show} 
        onHide={handleClose}
        backdrop={isSubmitting ? 'static' : true}
        keyboard={!isSubmitting}
      >
        <Modal.Header closeButton={!isSubmitting}>
          <Modal.Title>Create New Blog Post</Modal.Title>
        </Modal.Header>
        
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formTitle" className="mb-3">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter your blog post title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={isSubmitting}
                required
                maxLength={200}
              />
            </Form.Group>

            <Form.Group controlId="formContent" className="mb-3">
              <Form.Label>Content</Form.Label>
              <Form.Control
                as="textarea"
                rows={6}
                placeholder="Write your blog post content here..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                disabled={isSubmitting}
                required
                maxLength={5000}
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2">
              <Button
                variant="secondary"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="success"
                type="submit"
                disabled={!title.trim() || !content.trim() || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Creating...
                  </>
                ) : (
                  'Create Post'
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}