import React from "react";
import {
  List,
  ListItem,
  ListItemText,
  Button,
  TextField,
  Typography,
} from "@mui/material";

const CommentList = ({
  event,
  comments,
  onEditComment,
  onSaveCommentEdit,
  onDeleteComment,
  user,
  onCommentChange,
}) => {
  return (
    <div>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>
        Comments
      </Typography>
      <List
        sx={{
          maxHeight: 300,
          overflowY: "auto",
          border: "1px solid rgba(0,0,0,0.12)",
          borderRadius: 1,
        }}
      >
        {comments && comments.length > 0 ? (
          comments.map((comment) => (
            <ListItem key={comment.comment_id}>
              {comment.isEditing ? (
                <TextField
                  fullWidth
                  value={comment.text} // Use the `text` property for editing
                  onChange={(e) =>
                    onCommentChange(
                      event.id,
                      comment.comment_id,
                      e.target.value
                    )
                  } // Pass comment_id to identify which comment is being edited
                  multiline
                  minRows={3}
                />
              ) : (
                <ListItemText
                  primary={comment.comment}
                  secondary={`By: ${comment.first_name} ${comment.last_name}`}
                />
              )}
              {comment.user_id === user.userId && !comment.isEditing && (
                <>
                  <Button
                    size="small"
                    sx={{ ml: 2 }}
                    onClick={() =>
                      onEditComment(
                        event.id,
                        comment.comment_id,
                        comment.comment
                      )
                    }
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    sx={{ ml: 2 }}
                    onClick={() =>
                      onDeleteComment(event.id, comment.comment_id)
                    }
                  >
                    Delete
                  </Button>
                </>
              )}
              {comment.isEditing && (
                <Button
                  size="small"
                  sx={{ ml: 2 }}
                  onClick={() =>
                    onSaveCommentEdit(event.id, comment.comment_id)
                  }
                >
                  Save
                </Button>
              )}
            </ListItem>
          ))
        ) : (
          <Typography variant="body2" sx={{ px: 2 }}>
            No comments yet.
          </Typography>
        )}
      </List>
    </div>
  );
};

export default CommentList;
