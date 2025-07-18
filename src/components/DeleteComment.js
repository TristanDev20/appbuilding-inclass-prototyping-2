import React, { useState } from 'react';
import { Button, Modal } from 'react-bootstrap';

const DeleteComment = ({ 
  commentId, 
  onDeleteSuccess, 
  variant = "danger", 
  size = "sm", 
  showConfirmation = true,
  buttonText = "Delete",
  className = ""
}) => {
  const [showModal, setShowModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = () => {
    if (showConfirmation) {
      setShowModal(true);
    } else {
      deleteComment();
    }
  };

  const deleteComment = async () => {
    setIsDeleting(true);
    
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`https://appbuilding-inclass-prototyping-1.onrender.com/blogposts/deleteComment/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Delete comment response:', result);

      // Close modal and notify parent component
      setShowModal(false);
      if (onDeleteSuccess) {
        onDeleteSuccess(commentId);
      }

    } catch (error) {
      console.error('Error deleting comment:', error);
      alert('Failed to delete comment. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={handleDeleteClick}
        disabled={isDeleting}
        className={className}
      >
        {isDeleting ? 'Deleting...' : buttonText}
      </Button>

      {showConfirmation && (
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title>Confirm Delete</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Are you sure you want to delete this comment? This action cannot be undone.
          </Modal.Body>
          <Modal.Footer>
            <Button 
              variant="secondary" 
              onClick={() => setShowModal(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              onClick={deleteComment}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete Comment'}
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};

export default DeleteComment;