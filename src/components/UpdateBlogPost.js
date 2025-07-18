import React, { useState, useContext } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import Swal from 'sweetalert2';
import UserContext from '../context/UserContext';

export default function UpdateBlogPost({ blogPost, onPostUpdated }) {
  const { user } = useContext(UserContext);
  const [show, setShow] = useState(false);
  const [title, setTitle] = useState(blogPost.title || '');
  const [content, setContent] = useState(blogPost.content || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleClose = () => {
    if (!isSubmitting) {
      setShow(false);
      // Reset form to original values when closing
      setTitle(blogPost.title || '');
      setContent(blogPost.content || '');
    }
  };

  const handleShow = () => {
    // Check if user is the author before showing modal
    if (!user || !user.id) {
      Swal.fire({
        icon: 'warning',
        title: 'Not Authenticated',
        text: 'You must be logged in to update a blog post.',
        allowOutsideClick: false,
        allowEscapeKey: false
      });
      return;
    }

    // Get the author ID from the blog post
    const authorId = typeof blogPost.author === 'object' 
      ? (blogPost.author._id || blogPost.author.id) 
      : blogPost.author;

    if (user.id !== authorId) {
      Swal.fire({
        icon: 'error',
        title: 'Unauthorized',
        text: 'You can only update your own blog posts.',
        allowOutsideClick: false,
        allowEscapeKey: false
      });
      return;
    }

    setShow(true);
  };

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

    // Double-check authorization
    if (!user || !user.id) {
      setIsSubmitting(false);
      handleClose();
      
      setTimeout(() => {
        showAlert({
          icon: 'warning',
          title: 'Not Authenticated',
          text: 'You must be logged in to update a blog post.'
        });
      }, 300);
      return;
    }

    // Get the author ID from the blog post
    const authorId = typeof blogPost.author === 'object' 
      ? (blogPost.author._id || blogPost.author.id) 
      : blogPost.author;

    if (user.id !== authorId) {
      setIsSubmitting(false);
      handleClose();
      
      setTimeout(() => {
        showAlert({
          icon: 'error',
          title: 'Unauthorized',
          text: 'You can only update your own blog posts.'
        });
      }, 300);
      return;
    }

    const updatedBlogPostData = {
      title: title.trim(),
      content: content.trim(),
      updatedDate: new Date().toISOString()
    };

    try {
      const response = await fetch(`https://appbuilding-inclass-prototyping-1.onrender.com/blogposts/updateBlogPost/${blogPost._id || blogPost.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updatedBlogPostData)
      });

      const data = await response.json();

      // Debug: Log the response to see what we're getting
      // console.log('Update Response status:', response.status);
      // console.log('Update Response data:', data);

      // Check for success - be flexible with success conditions
      if (response.ok && (data._id || data.id || data.success || data.message === 'Blog post updated successfully')) {
        // Success - close modal first, then show success message
        handleClose();
        setIsSubmitting(false);
        
        setTimeout(() => {
          showAlert({
            icon: 'success',
            title: 'Blog Post Updated!',
            text: 'Your blog post has been successfully updated.'
          }).then(() => {
            onPostUpdated(data);
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
            text: data.message || `Server responded with: ${JSON.stringify(data)}` || 'Something went wrong while updating your blog post.'
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

  // Check if current user is the author to show the button
  const authorId = typeof blogPost.author === 'object' 
    ? (blogPost.author._id || blogPost.author.id) 
    : blogPost.author;
  const isAuthor = user && user.id && (user.id === authorId);

  // Don't render the button if user is not the author
  if (!isAuthor) {
    return null;
  }

  return (
    <>
      <Button variant="outline-primary" size="sm" onClick={handleShow}>
        Update
      </Button>

      <Modal 
        show={show} 
        onHide={handleClose}
        backdrop={isSubmitting ? 'static' : true}
        keyboard={!isSubmitting}
      >
        <Modal.Header closeButton={!isSubmitting}>
          <Modal.Title>Update Blog Post</Modal.Title>
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
                    Updating...
                  </>
                ) : (
                  'Update Post'
                )}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
}