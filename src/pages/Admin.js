import React, { useEffect, useState, useContext } from 'react';
import { Table, Button, Container } from 'react-bootstrap';
import Swal from 'sweetalert2';
import UserContext from '../context/UserContext';

import AddBlogPost from '../components/AddBlogPost';
import DeleteBlogPost from '../components/DeleteBlogPost';
import CommentModal from '../components/CommentModal';
import DeleteComment from '../components/DeleteComment';
import BlogPostSearch from '../components/BlogPostSearch';

export default function Admin() {
  const { user } = useContext(UserContext);
  const [posts, setPosts] = useState([]);


  // Comments modal
  const [selectedPost, setSelectedPost] = useState(null);
  const [showCommentModal, setShowCommentModal] = useState(false);

  // Search Blog Post
  const [searchedBlogPost, setSearchedBlogPost] = useState(null);


  
  const fetchBlogPosts = () => {
    fetch('https://appbuilding-inclass-prototyping-1.onrender.com/blogposts/getAllBlogPost', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(res => res.json())
      .then(data => {
        setPosts(data);
      })
      .catch(err => {
        Swal.fire('Error', 'Failed to fetch posts.', 'error');
      });
  };

  
  useEffect(() => {
    fetchBlogPosts();
  }, []);

  
  const handlePostAdded = () => {
    fetchBlogPosts();
  };

  // Handle view comments
	const handleOpenComments = (post) => {
  	setSelectedPost(post);
 	 setShowCommentModal(true);
	};



	// Handle close comments modal
	const handleCloseComments = () => {
 	setShowCommentModal(false);
  	setSelectedPost(null);
	};

  // Handle Search Blog Post 
  const handleSearchResult = (blogPost) => {
  setSearchedBlogPost(blogPost);
  console.log('Admin received blog post:', blogPost);
  };
  

  return (
    <Container className="mt-4">
      <h2>Admin Dashboard - Blog Posts</h2>

      <div className="d-flex justify-content-right mb-4">
        <AddBlogPost onPostAdded={handlePostAdded} />
      </div>

      <div>
      <BlogPostSearch 
                onSearchResult={handleSearchResult}
                showResult={true}
                className="mb-3"
                variant="primary"
              />
      </div>


      <Table striped bordered hover responsive className="mt-3">
        <thead>
          <tr>
            <th>Title</th>
            <th>Content</th>
            <th>Author</th>
            <th style={{ width: '100px' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {posts.length > 0 ? (
            posts.map((post) => (
              <tr key={post._id}>
                <td>{post.title}</td>
                <td>{post.content}</td>
                <td>{post.author?.name || post.author}</td>
                <td>
  				<DeleteBlogPost
    			post={post}
   				 onDeleted={(id) => setPosts(prev => prev.filter(p => p._id !== id))}
  				/>
  				<Button 
  				className="mt-2"
  				variant="outline-secondary" 
  				onClick={() => handleOpenComments(post)}
				>Comments</Button>
				</td>

              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center">
                No blog posts found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>
      {/* Comments Modal */}
			<CommentModal 
			show={showCommentModal} 
 			handleClose={handleCloseComments} 
  			blogPost={selectedPost}
			/>
    </Container>
  );
}
