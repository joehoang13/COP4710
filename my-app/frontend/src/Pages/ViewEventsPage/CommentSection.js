import React from "react";
import { Box, Button, TextField, Typography, Rating } from "@mui/material";
import CommentList from "./CommentList";

const CommentSection = ({
  event,
  expandedComments,
  onToggleComments,
  comments,
  onEditComment,
  onDeleteComment,
  onSaveCommentEdit,
  user,
  onCommentChange,
  onCommentSubmit,
  onRatingChange,
  onRatingSubmit,
  onNewCommentChange,
}) => {
  return (
    <Box sx={{ px: 2, pb: 2 }}>
      <Button onClick={() => onToggleComments(event.id)} sx={{ mb: 2 }}>
        {expandedComments[event.id] ? "Collapse Comments" : "Expand Comments"}
      </Button>

      {expandedComments[event.id] && (
        <>
          <CommentList
            event={event}
            comments={event.comments}
            onEditComment={onEditComment}
            onDeleteComment={onDeleteComment}
            onSaveCommentEdit={onSaveCommentEdit}
            user={user}
            onCommentChange={onCommentChange}
          />
        </>
      )}

      <Typography variant="subtitle1" sx={{ mt: 2 }}>
        Leave a Comment
      </Typography>
      <TextField
        fullWidth
        multiline
        minRows={3}
        placeholder="Write your comment here..."
        value={comments[event.id] || ""}
        onChange={(e) => onNewCommentChange(event.id, e.target.value)}
      />
      <Button
        variant="contained"
        sx={{ mt: 1 }}
        onClick={() => onCommentSubmit(event.id)}
      >
        Submit Comment
      </Button>

      <Typography variant="subtitle1" sx={{ mt: 3 }}>
        Average Rating:{" "}
        {event.avg_rating ? parseFloat(event.avg_rating).toFixed(1) : "0.0"}
      </Typography>
      <Rating
        name={`rating-${event.id}`}
        value={event.avg_rating ? Math.round(event.avg_rating) : 0}
        precision={1}
        onChange={(e, newValue) =>
          onRatingChange(event.id, Math.round(newValue))
        }
      />

      <Button
        variant="contained"
        sx={{ ml: 2, mt: 1 }}
        onClick={() => onRatingSubmit(event.id)}
      >
        Submit Rating
      </Button>
    </Box>
  );
};

export default CommentSection;
