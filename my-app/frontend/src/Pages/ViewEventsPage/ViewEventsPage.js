import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Container,
  CircularProgress,
  Box,
  Button,
  Typography,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import EventCard from "./EventCard";

function ViewEventsPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState({});
  const [ratings, setRatings] = useState({});
  const [expandedComments, setExpandedComments] = useState({});
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedCommentText, setEditedCommentText] = useState("");

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
      fetchEvents(storedUser);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchEvents = async (user) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/events/available/${user.userId}`
      );
      const eventsWithComments = await Promise.all(
        response.data.map(async (event) => {
          const commentsResponse = await axios.get(
            `http://localhost:5000/events/${event.id}/comments`
          );

          // Add isEditing property to each comment
          const commentsWithEditingState = commentsResponse.data.map(
            (comment) => ({
              ...comment,
              isEditing: false, // Add isEditing field to each comment
              text: comment.comment,
            })
          );

          return { ...event, comments: commentsWithEditingState };
        })
      );
      setEvents(eventsWithComments);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleNewCommentChange = (eventId, newText) => {
    setComments((prevComments) => ({
      ...prevComments,
      [eventId]: newText,
    }));
  };

  const handleEditComment = (eventId, commentId, originalCommentText) => {
    setEvents((prevEvents) => {
      return prevEvents.map((event) => {
        if (event.id === eventId) {
          const updatedComments = event.comments.map((comment) => {
            if (comment.comment_id === commentId) {
              return { ...comment, isEditing: true, text: originalCommentText };
            }
            return comment;
          });
          return { ...event, comments: updatedComments };
        }
        return event;
      });
    });
  };

  const handleCommentChange = (eventId, commentId, newText) => {
    setEvents((prevEvents) => {
      return prevEvents.map((event) => {
        if (event.id === eventId) {
          const updatedComments = event.comments.map((comment) => {
            if (comment.comment_id === commentId) {
              return { ...comment, text: newText };
            }
            return comment;
          });
          return { ...event, comments: updatedComments };
        }
        return event;
      });
    });
  };

  const handleSaveCommentEdit = async (eventId, commentId) => {
    const updatedComment = events
      .find((event) => event.id === eventId)
      .comments.find((comment) => comment.comment_id === commentId);

    try {
      await axios.put(
        `http://localhost:5000/events/${eventId}/comments/${commentId}`,
        {
          userId: user.userId,
          comment: updatedComment.text,
        }
      );

      setEvents((prevEvents) => {
        return prevEvents.map((event) => {
          if (event.id === eventId) {
            const updatedComments = event.comments.map((comment) => {
              if (comment.comment_id === commentId) {
                return { ...comment, isEditing: false };
              }
              return comment;
            });
            return { ...event, comments: updatedComments };
          }
          return event;
        });
      });

      fetchEvents(user);
    } catch (error) {
      console.error("Error updating comment:", error);
    }
  };

  const handleRatingChange = (eventId, value) => {
    setRatings({ ...ratings, [eventId]: value });
  };

  const handleCommentSubmit = async (eventId) => {
    try {
      await axios.post(`http://localhost:5000/events/${eventId}/comments`, {
        userId: user.userId,
        comment: comments[eventId],
      });
      handleCommentChange(eventId, "");
      fetchEvents(user);
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  const handleRatingSubmit = async (eventId) => {
    try {
      await axios.post(`http://localhost:5000/events/${eventId}/rating`, {
        userId: user.userId,
        rating: ratings[eventId],
      });
      handleRatingChange(eventId, 0);
      fetchEvents(user);
    } catch (error) {
      console.error("Error submitting rating:", error);
    }
  };

  const handleToggleComments = (eventId) => {
    setExpandedComments((prev) => ({
      ...prev,
      [eventId]: !prev[eventId],
    }));
  };

  const handleDeleteComment = async (eventId, commentId) => {
    const isConfirmed = window.confirm(
      "Are you sure you want to delete this comment?"
    );
    if (!isConfirmed) {
      return;
    }

    try {
      await axios.delete(
        `http://localhost:5000/events/${eventId}/comments/${commentId}`,
        {
          data: {
            userId: user.userId, // Ensure that the user is authorized to delete
          },
        }
      );

      fetchEvents(user);
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  return (
    <Container
      className="main-container"
      sx={{
        mt: 4,
        backgroundColor: "rgba(255, 255, 255, 0.85)",
        padding: 4,
        borderRadius: 2,
      }}
    >
      <Box display="flex" justifyContent="flex-end" mb={2}>
        <Button
          variant="contained"
          color="primary"
          sx={{
            backgroundColor: "#1976d2",
            color: "white",
            "&:hover": {
              backgroundColor: "#1565c0",
            },
          }}
          onClick={() => navigate("/welcome")}
        >
          Back to Main
        </Button>
      </Box>

      <Typography variant="h4" gutterBottom>
        Available Events
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : events.length > 0 ? (
        events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            expandedComments={expandedComments}
            onToggleComments={handleToggleComments}
            onEditComment={handleEditComment}
            onDeleteComment={handleDeleteComment}
            onSaveCommentEdit={handleSaveCommentEdit}
            user={user}
            comments={comments}
            onCommentChange={handleCommentChange}
            onCommentSubmit={handleCommentSubmit}
            onRatingChange={handleRatingChange}
            onRatingSubmit={handleRatingSubmit}
            onNewCommentChange={handleNewCommentChange}
          />
        ))
      ) : (
        <Typography>No events found for your user access.</Typography>
      )}
    </Container>
  );
}

export default ViewEventsPage;
