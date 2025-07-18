"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import moment from "moment";
import { getUserName, getUserID, getToken, getUser } from "../sign-in/auth";

interface Comment {
  id: string;
  userId: string;
  content: string;
  author: string;
}

interface Blog {
  id: string;
  userId: string;
  title: string;
  content: string;
  photo?: string;
  createdAt: string;
  likes: string[];
  dislikes: string[];
  author?: string;
  comments: Comment[];
}

const Blogs = () => {
  const user = getUser();
  const username = getUserName();
  const userId = getUserID();
  const token = getToken();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [commentText, setCommentText] = useState("");

  const fetchBlogs = async (currentPage: number) => {
    if (loading) return; // Prevent multiple requests
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/blogs?page=${currentPage}&limit=4&sort=desc`
      );

      if (!response.ok) {
        console.error("Failed to fetch blogs");
        toast.error("Failed to fetch blogs");
        return;
      }

      let data = await response.json();

      if (Array.isArray(data)) {
        // Fetch usernames and comments for each blog
        const blogsWithUsernamesAndComments = await Promise.all(
          data.map(async (blog) => {
            try {
              // Fetch blog author's username
              const userResponse = await fetch(
                `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/users/username/${blog.userId}`
              );
              const username = userResponse.ok
                ? await userResponse.json()
                : "Unknown";

              // console.log("Blog Author Username:", username);

              // Fetch comments for the blog
              const commentsResponse = await fetch(
                `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/blogs/${blog.id}/comments`
              );
              const comments = commentsResponse.ok
                ? await commentsResponse.json()
                : [];

              // Fetch usernames for each comment's userId
              const commentsWithUsernames = await Promise.all(
                comments.map(async (comment: Comment) => {
                  try {
                    const commentUserResponse = await fetch(
                      `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/users/username/${comment.userId}`
                    );
                    const commentUsername = commentUserResponse.ok
                      ? await commentUserResponse.json()
                      : "Unknown";

                    return { ...comment, author: commentUsername }; // Attach username to comment
                  } catch (error: any) {
                    console.error(
                      `Error fetching username for commentId: ${comment.id}`,
                      error
                    );
                    toast.error(
                      `Error fetching username for commentId: ${comment.id}`,
                      error
                    );
                    return { ...comment, author: "Unknown" }; // Fallback in case of error
                  }
                })
              );

              return {
                ...blog,
                author: username,
                comments: commentsWithUsernames,
              }; // Attach everything
            } catch (error: any) {
              console.error(
                `Error fetching data for blogId: ${blog.id}`,
                error
              );
              toast.error(`Error fetching data for blogId: ${blog.id}`, error);
              return { ...blog, author: "Unknown", comments: [] }; // Fallback values
            }
          })
        );

        // console.log("Blogs: ", blogsWithUsernamesAndComments);

        // Remove duplicates and sort blogs
        setBlogs((prevBlogs: Blog[]) => {
          const uniqueBlogs = new Map();

          // Add previous blogs first to preserve already fetched ones
          prevBlogs.forEach((blog) => uniqueBlogs.set(blog.id, blog));

          // Add new blogs from API
          blogsWithUsernamesAndComments.forEach((blog) =>
            uniqueBlogs.set(blog.id, blog)
          );

          // Convert map back to an array and sort
          return Array.from(uniqueBlogs.values()).sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        });

        setHasMore(data.length === 4);

        // console.log("Fetched Blogs: ", blogsWithUsernamesAndComments); // Log final fetched blogs
      } else {
        console.error("Unexpected API response format:", data);
        toast.error("Unexpected API response format:", data);
      }
    } catch (err: any) {
      console.error("Error fetching blogs:", err);
      toast.error("Error fetching blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs(page);
  }, [page]);

  const loadMoreBlogs = () => {
    if (!loading) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const openModal = async (blog: Blog) => {
    try {
      await fetchComments(blog.id);
      setSelectedBlog(blog);
    } catch (error: any) {
      console.error("Error fetching comments:", error);
      toast.error("Error fetching comments:", error);
    }
  };

  const closeModal = () => {
    setSelectedBlog(null);
    setCommentText("");
  };

  // Handle Like
  const handleLike = async (blogId: string, blogUserId: string) => {
    if (user === null) {
      toast.error("Please Login");
      setTimeout(() => {
        window.location.href = "/sign-in"; // Redirect to login page
      }, 2000);
      return;
    }
    if (userId === blogUserId) {
      toast.warning("You cannot like your own blog!");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/blogs/${blogId}/like`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId }),
        }
      );

      if (response.ok) {
        const data = await response.json();

        setBlogs((prevBlogs: Blog[]) =>
          prevBlogs.map((blog) =>
            blog.id === blogId
              ? {
                  ...blog,
                  likes: [...data.likes],
                  dislikes: [...data.dislikes],
                }
              : blog
          )
        );

        if (selectedBlog?.id === blogId) {
          setSelectedBlog((prevSelectedBlog) =>
            prevSelectedBlog
              ? {
                  ...prevSelectedBlog,
                  likes: [...data.likes],
                  dislikes: [...data.dislikes],
                }
              : null
          );
        }

        toast.success("Like updated!");
      } else {
        toast.error("Could not update like. Try again.");
      }
    } catch (err) {
      console.error("Error liking blog:", err);
      toast.error("An error occurred while liking the blog.");
    }
  };

  // Handle Dislike
  const handleDislike = async (blogId: string, blogUserId: string) => {
    if (user === null) {
      toast.error("Please Login");
      setTimeout(() => {
        window.location.href = "/sign-in"; // Redirect to login page
      }, 2000);
      return;
    }
    if (userId === blogUserId) {
      toast.warning("You cannot dislike your own blog!");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/blogs/${blogId}/dislike`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId }),
        }
      );

      if (response.ok) {
        const data = await response.json();

        setBlogs((prevBlogs: Blog[]) =>
          prevBlogs.map((blog) =>
            blog.id === blogId
              ? {
                  ...blog,
                  likes: [...data.likes],
                  dislikes: [...data.dislikes],
                }
              : blog
          )
        );

        if (selectedBlog?.id === blogId) {
          setSelectedBlog((prevSelectedBlog) =>
            prevSelectedBlog
              ? {
                  ...prevSelectedBlog,
                  likes: [...data.likes],
                  dislikes: [...data.dislikes],
                }
              : null
          );
        }

        toast.success("Dislike updated!");
      } else {
        toast.error("Could not update dislike. Try again.");
      }
    } catch (err) {
      console.error("Error disliking blog:", err);
      toast.error("An error occurred while disliking the blog.");
    }
  };

  const fetchComments = async (blogId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/blogs/${blogId}/comments`
      );
      if (response.ok) {
        const comments = await response.json();

        // Fetch usernames for each comment's userId
        const commentsWithUsernames = await Promise.all(
          comments.map(async (comment: Comment) => {
            try {
              const commentUserResponse = await fetch(
                `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/users/username/${comment.userId}`
              );
              const commentUsername = commentUserResponse.ok
                ? await commentUserResponse.json()
                : "Unknown";

              return { ...comment, author: commentUsername }; // Attach username to comment
            } catch (error: any) {
              console.error(
                `Error fetching username for commentId: ${comment.id}`,
                error
              );
              toast.error(
                `Error fetching username for commentId: ${comment.id}`,
                error
              );
              return { ...comment, author: "Unknown" }; // Fallback in case of error
            }
          })
        );

        // Update the specific blog's comments
        setBlogs((prevBlogs: Blog[]) =>
          prevBlogs.map((blog) =>
            blog.id === blogId
              ? { ...blog, comments: commentsWithUsernames }
              : blog
          )
        );
      } else {
        console.error("Failed to fetch comments");
        toast.error("Failed to fetch comments");
      }
    } catch (err: any) {
      console.error("Error fetching comments:", err);
      toast.error("Error fetching comments:", err);
    }
  };

  const addComment = async (blogId: string) => {
    if (user === null) {
      toast.error("Please Login");
      setTimeout(() => {
        window.location.href = "/sign-in"; // Redirect to login page
      }, 2000);
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/blogs/${blogId}/comments`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Send token here
          },
          body: JSON.stringify({ commentText, userId: userId }),
        }
      );

      if (response.ok) {
        toast.success("Comment added!");
        await fetchComments(blogId); // Refresh comments after adding

        // Find the updated blog and update selectedBlog
        setSelectedBlog((prevSelectedBlog) => {
          if (!prevSelectedBlog) return null; // Prevents spreading null

          return {
            ...prevSelectedBlog,
            comments: [
              ...prevSelectedBlog.comments,
              {
                id: crypto.randomUUID(), // Generate a unique ID for the comment
                author: username ?? "Unknown",
                content: commentText,
                userId,
              },
            ],
          };
        });

        setCommentText(""); // Clear input field
      } else {
        console.error("Failed to add comment");
        toast.error("Could not add comment. Try again.");
      }
    } catch (err) {
      console.error("Error adding comment:", err);
      toast.error("An error occurred while adding your comment.");
    }
  };

  const deleteComment = async (commentId: string, blogId: string) => {
    if (user === null) {
      toast.error("Please Login");
      setTimeout(() => {
        window.location.href = "/sign-in"; // Redirect to login page
      }, 2000);
      return;
    }
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SERVER_URL}/api/v1/blogs/comments/${commentId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Send token here
          },
          body: JSON.stringify({ userId }),
        }
      );

      if (response.ok) {
        toast.success("Comment deleted!");
        await fetchComments(blogId); // Refresh comments after deleting

        // Update selectedBlog to remove the deleted comment
        setSelectedBlog((prevSelectedBlog) =>
          prevSelectedBlog
            ? {
                ...prevSelectedBlog,
                comments: prevSelectedBlog.comments.filter(
                  (comment) => comment.id !== commentId
                ),
              }
            : prevSelectedBlog
        );
      } else {
        console.error("Failed to delete comment");
        toast.error("Could not delete comment. Try again.");
      }
    } catch (err) {
      console.error("Error deleting comment:", err);
      toast.error("An error occurred while deleting your comment.");
    }
  };

  useEffect(() => {
    if (selectedBlog) {
      fetchComments(selectedBlog.id);
    }
  }, [selectedBlog]);

  return (
    <div
      suppressHydrationWarning={true as any}
      className="container mx-auto p-8"
    >
      <br />
      <br />
      <br />
      <br />
      <h2 className="text-3xl font-bold mb-6 text-center">Blogs</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog) => (
          <div
            key={blog.id}
            className="bg-white p-4 rounded-md shadow-md relative"
          >
            <Image
              src={
                blog?.photo ||
                "https://static.vecteezy.com/system/resources/previews/015/349/601/original/blog-icon-design-free-vector.jpg"
              }
              alt={blog.title}
              className="w-full h-40 object-cover rounded-md mb-2"
              width={200}
              height={200}
            />
            <h3 className="text-xl font-bold mb-2">{blog.title}</h3>
            <p className="text-gray-600 line-clamp-3">{blog.content}</p>
            <p className="text-gray-500 text-sm">
              By {blog.author} • {moment(blog.createdAt).fromNow()}
            </p>

            {/* Like & Dislike Buttons */}
            <div className="flex items-center mt-2">
              <button
                onClick={() => handleLike(blog.id, blog.userId)}
                className={`mr-2 ${
                  Array.isArray(blog.likes) && blog.likes.includes(userId)
                    ? "text-green-700 font-bold"
                    : "text-green-500"
                }`}
              >
                👍 {Array.isArray(blog.likes) ? blog.likes.length : 0}
              </button>
              <button
                onClick={() => handleDislike(blog.id, blog.userId)}
                className={`${
                  Array.isArray(blog.dislikes) && blog.dislikes.includes(userId)
                    ? "text-red-700 font-bold"
                    : "text-red-500"
                }`}
              >
                👎 {Array.isArray(blog.dislikes) ? blog.dislikes.length : 0}
              </button>
            </div>

            <button
              onClick={() => openModal(blog)}
              className="text-blue-500 hover:underline mt-4 block"
            >
              Read More
            </button>
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="text-center mt-6">
          <button
            onClick={loadMoreBlogs}
            className="bg-emerald-600 text-white py-2 px-4 rounded-md hover:bg-emerald-700"
            disabled={loading}
          >
            {loading ? "Loading..." : "Load More Blogs"}
          </button>
        </div>
      )}

      {/* Modal for Blog Details */}
      {selectedBlog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div
            className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full relative 
                          max-h-[90vh] overflow-y-auto"
          >
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-3 right-3 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center 
                        hover:bg-red-600 transition duration-200 shadow-lg"
              title="Close"
            >
              ✖
            </button>

            {/* Blog Image */}
            {selectedBlog.photo && (
              <Image
                src={selectedBlog.photo}
                alt={selectedBlog.title}
                className="w-full h-80 object-cover rounded-md mb-4"
                width={600}
                height={400}
              />
            )}

            {/* Blog Content */}
            <h3 className="text-2xl font-bold mb-2">{selectedBlog.title}</h3>
            <p className="text-gray-700">{selectedBlog.content}</p>
            <p className="text-gray-500 text-sm mb-4">
              By {selectedBlog.author}
            </p>

            {/* Like & Dislike Buttons */}
            <div className="flex items-center mt-2">
              <button
                onClick={() => handleLike(selectedBlog.id, selectedBlog.userId)}
                className={`mr-2 ${
                  Array.isArray(selectedBlog.likes) &&
                  selectedBlog.likes.includes(userId)
                    ? "text-green-700 font-bold"
                    : "text-green-500"
                }`}
              >
                👍{" "}
                {Array.isArray(selectedBlog.likes)
                  ? selectedBlog.likes.length
                  : 0}
              </button>
              <button
                onClick={() =>
                  handleDislike(selectedBlog.id, selectedBlog.userId)
                }
                className={`${
                  Array.isArray(selectedBlog.dislikes) &&
                  selectedBlog.dislikes.includes(userId)
                    ? "text-red-700 font-bold"
                    : "text-red-500"
                }`}
              >
                👎{" "}
                {Array.isArray(selectedBlog.dislikes)
                  ? selectedBlog.dislikes.length
                  : 0}
              </button>
            </div>

            {/* Comments Section */}
            <div className="bg-gray-100 p-4 rounded-lg mt-4">
              <h4 className="text-lg font-semibold text-emerald-700 mb-3">
                Comments
              </h4>
              <div className="space-y-2">
                {selectedBlog.comments.length > 0 ? (
                  selectedBlog.comments.map((comment, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center bg-white p-3 rounded-lg shadow-sm border-l-4 border-emerald-500"
                    >
                      <p className="text-gray-700">
                        <span className="font-bold text-emerald-700">
                          {comment.author}
                        </span>
                        : {comment.content}
                      </p>

                      {/* Delete button for current user's comments */}
                      {comment.userId === userId && (
                        <button
                          onClick={() =>
                            deleteComment(comment.id, selectedBlog.id)
                          }
                          className="text-red-600 hover:text-red-800 transition duration-200"
                          title="Delete Comment"
                        >
                          🗑
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 italic">
                    No comments yet. Be the first to comment!
                  </p>
                )}
              </div>

              {/* Comment Input */}
              <div className="mt-4">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="w-full border rounded-lg p-3 focus:ring-emerald-500 focus:border-emerald-500 transition duration-200"
                  placeholder="Write a comment..."
                />
                <button
                  onClick={() => addComment(selectedBlog.id)}
                  className="mt-2 bg-emerald-600 text-white py-2 px-4 rounded-lg hover:bg-emerald-700 transition duration-200"
                >
                  Comment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default Blogs;
