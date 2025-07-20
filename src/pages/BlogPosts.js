import React, { useState, useEffect, useContext } from 'react';
import { Container, Row, Col, Card, Button, Modal, Spinner, Alert } from 'react-bootstrap';
import UserContext from '../context/UserContext';
import AddBlogPost from '../components/AddBlogPost';
import UpdateBlogPost from '../components/UpdateBlogPost';
import DeleteBlogPost from '../components/DeleteBlogPost';
import CommentModal from '../components/CommentModal';
import BlogPostSearch from '../components/BlogPostSearch';

export default function BlogPosts() {
	const { user } = useContext(UserContext);
	const [blogposts, setBlogPosts] = useState([]);
	const [posts, setPosts] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState(null);
	
	// Blog post details modal
	const [showDetailsModal, setShowDetailsModal] = useState(false);
	const [selectedBlogPost, setSelectedBlogPost] = useState(null);
	
	// Comments modal
	const [selectedPost, setSelectedPost] = useState(null);
	const [showCommentModal, setShowCommentModal] = useState(false);

	// Search Blog Post
  	const [searchedBlogPost, setSearchedBlogPost] = useState(null);

	// Fetch blog posts from API
	const fetchBlogPosts = () => {
		setIsLoading(true);
		setError(null);
		
		fetch('https://appbuilding-inclass-prototyping-1.onrender.com/blogposts/getAllBlogPost', {
			headers: {
				Authorization: `Bearer ${localStorage.getItem('token')}`
			},
			credentials: 'include'
		})
			.then((res) => {
				if (!res.ok) {
					throw new Error(`HTTP error! status: ${res.status}`);
				}
				return res.json();
			})
			.then((data) => {
				if (Array.isArray(data)) {
					setBlogPosts(data);
				} else if (Array.isArray(data.blogposts)) {
					setBlogPosts(data.blogposts);
				} else {
					setBlogPosts([]);
				}
			})
			.catch((err) => {
				console.error('Fetch error:', err);
				setError('Failed to load blog posts. Please try again.');
				setBlogPosts([]);
			})
			.finally(() => setIsLoading(false));
	};

	useEffect(() => {
		fetchBlogPosts();
	}, []);

	// Handle post added - refresh the list
	const handlePostAdded = (newPost) => {
		// Add the new post to the beginning of the list
		setBlogPosts(prevPosts => [newPost, ...prevPosts]);
	};

	// Handle post updated - update the specific post in the list
	const handlePostUpdated = (updatedPost) => {
		setBlogPosts(prevPosts => 
			prevPosts.map(post => 
				(post._id === updatedPost._id || post.id === updatedPost.id) 
					? { ...post, ...updatedPost }
					: post
			)
		);
	};

	// Handle view blog post details
	const handleViewBlogPost = (blogpost) => {
		setSelectedBlogPost(blogpost);
		setShowDetailsModal(true);
	};

	// Handle close details modal
	const handleCloseDetailsModal = () => {
		setShowDetailsModal(false);
		setSelectedBlogPost(null);
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

	// If user is not logged in
	if (!user) {
		return (
			<Container className="text-center mt-5">
				<Alert variant="warning">
					<h4>Please login to view blog posts.</h4>
				</Alert>
			</Container>
		);
	}

	return (
		<Container className="mt-4">
			<h1 className="text-center mb-4">Blog Posts</h1>

			<div className="d-flex justify-content-center mb-4">
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
			
			{error && (
				<Alert variant="danger" className="mb-4">
					{error}
				</Alert>
			)}

			{isLoading ? (
				<div className="text-center mt-5">
					<Spinner animation="border" variant="primary" size="lg" />
					<p className="mt-3">Loading blog posts...</p>
				</div>
			) : blogposts.length === 0 ? (
				<Alert variant="info" className="text-center">
					<h4>No blog posts available</h4>
					<p>Check back later for new posts!</p>
				</Alert>
			) : (
				<Row>
					{blogposts.map((blogpost) => (
						<Col key={blogpost._id} lg={4} md={6} sm={12} className="mb-4">
							<Card className="h-100 shadow-sm">
								<Card.Body className="d-flex flex-column">
									<Card.Title className="text-primary mb-3">
										{blogpost.title}
									</Card.Title>
									<Card.Text className="mb-2">
										<strong>Author ID:</strong> {
											typeof blogpost.author === 'object' 
												? blogpost.author._id || blogpost.author.id
												: blogpost.author
										}
									</Card.Text>
									<Card.Text className="mb-2">
										<strong>Created:</strong> {new Date(blogpost.creationDate || blogpost.createdDate).toLocaleDateString()}
									</Card.Text>
									{/* Preview of content */}
									<Card.Text className="text-muted mb-3">
										{blogpost.content && blogpost.content.length > 100 
											? `${blogpost.content.substring(0, 100)}...` 
											: blogpost.content
										}
									</Card.Text>
									<div className="d-flex flex-wrap gap-2  ">
										<Button 
											variant="primary" 
											
											onClick={() => handleViewBlogPost(blogpost)}
										>
											View Post 
										</Button>
										<Button 
  										variant="outline-secondary" 
  										onClick={() => handleOpenComments(blogpost)}
										>
  										Comments
										</Button>
										<UpdateBlogPost 
											blogPost={blogpost} 
											onPostUpdated={handlePostUpdated}
											/>
										<DeleteBlogPost 
    										post={blogpost}
   				 							onDeleted={(id) => setPosts(prev => prev.filter(p => p._id !== id))}
  											/>

									</div>	
								</Card.Body>
							</Card>
						</Col>
					))}
				</Row>
			)}

			{/* Blog Post Details Modal */}
			<Modal show={showDetailsModal} onHide={handleCloseDetailsModal} size="lg">
				<Modal.Header closeButton>
					<Modal.Title>Blog Post Details</Modal.Title>
				</Modal.Header>
				<Modal.Body>
					{selectedBlogPost && (
						<div>
							<h3 className="text-primary mb-3">{selectedBlogPost.title}</h3>
							<Row>
								<Col md={12}>
									<p><strong>Author ID:</strong> {
										typeof selectedBlogPost.author === 'object' 
											? selectedBlogPost.author._id || selectedBlogPost.author.id
											: selectedBlogPost.author
									}</p>
									<p><strong>Created:</strong> {new Date(selectedBlogPost.creationDate || selectedBlogPost.createdDate).toLocaleDateString()}</p>
									{selectedBlogPost.updatedDate && (
										<p><strong>Updated:</strong> {new Date(selectedBlogPost.updatedDate).toLocaleDateString()}</p>
									)}
								</Col>
							</Row>
							<hr />
							<div>
								<h5>Content</h5>
								<p className="text-muted" style={{ whiteSpace: 'pre-wrap' }}>
									{selectedBlogPost.content}
								</p>
							</div>
						</div>
					)}
				</Modal.Body>
				<Modal.Footer>
					<Button variant="secondary" onClick={handleCloseDetailsModal}>
						Close
					</Button>
				</Modal.Footer>
			</Modal>

			{/* Comments Modal */}
			<CommentModal 
			show={showCommentModal} 
 			handleClose={handleCloseComments} 
  			blogPost={selectedPost}
			/>
		</Container>
	);
}