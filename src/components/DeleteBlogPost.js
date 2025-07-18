import React, { useContext } from 'react';
import { Button } from 'react-bootstrap';
import Swal from 'sweetalert2';
import UserContext from '../context/UserContext';

export default function DeleteBlogPost({ post, onDeleted }) {
  const { user } = useContext(UserContext);

  // Determine author ID
  const authorId = typeof post.author === 'object' ? post.author._id || post.author.id : post.author;

  // Check if the current user is allowed to delete the post
  const canDelete = user && (user.id === authorId || user.isAdmin);

  const handleDelete = () => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'This post will be permanently deleted.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel'
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`https://appbuilding-inclass-prototyping-1.onrender.com/blogposts/DeleteBlogPost/${post._id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        })
          .then(res => {
            if (!res.ok) {
              throw new Error('Failed to delete post.');
            }
            onDeleted(post._id);
            Swal.fire('Deleted!', 'The post has been deleted.', 'success');
          })
          .catch(err => {
            console.error(err);
            Swal.fire('Error', 'Something went wrong. Please try again.', 'error');
          });
      }
    });
  };

  if (!canDelete) return null; // Don’t render anything if user is not allowed

  return (
    <Button variant="danger" onClick={handleDelete} className="sm">
      Delete
    </Button>
  );
}
