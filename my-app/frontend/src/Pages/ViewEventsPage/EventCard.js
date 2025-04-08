import React from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Divider,
  Button,
} from "@mui/material";
import CommentSection from "./CommentSection";

const EventCard = ({
  event,
  expandedComments,
  onToggleComments,
  onEditComment,
  onDeleteComment,
  onSaveCommentEdit,
  user,
  comments,
  onCommentChange,
  onCommentSubmit,
  onRatingChange,
  onRatingSubmit,
  onNewCommentChange,
}) => {
  return (
    <Card sx={{ mb: 4 }}>
      <CardContent
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box sx={{ flex: "1 1 60%" }}>
          <Typography variant="h6">{event.name}</Typography>
          <Typography variant="body2" color="text.secondary">
            {event.description}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Type: {event.event_type_name || "N/A"} <br />
            Visibility: {event.visibility} <br />
            Time: {new Date(event.start_time).toLocaleString()} -{" "}
            {new Date(event.end_time).toLocaleString()}
          </Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>
            Contact Email: {event.contact_email || "N/A"} <br />
            Contact Phone: {event.contact_phone_number || "N/A"}
          </Typography>
        </Box>

        <Box sx={{ flex: "1 1 35%", textAlign: "right" }}>
          {event.location_name && (
            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
              Location: {event.location_name}
            </Typography>
          )}
          {event.latitude && event.longitude && (
            <iframe
              title="Event Location"
              src={`https://www.google.com/maps?q=${event.latitude},${event.longitude}&hl=es;z=14&output=embed`}
              width="100%"
              height="200"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          )}
          <Typography variant="body2" sx={{ mt: 1 }}>
            {event.address || "N/A"}
          </Typography>
        </Box>
      </CardContent>

      <Divider sx={{ my: 2 }} />

      <CommentSection
        event={event}
        expandedComments={expandedComments}
        onToggleComments={onToggleComments}
        comments={comments}
        onEditComment={onEditComment}
        onDeleteComment={onDeleteComment}
        onSaveCommentEdit={onSaveCommentEdit}
        user={user}
        onCommentChange={onCommentChange}
        onCommentSubmit={onCommentSubmit}
        onRatingChange={onRatingChange}
        onRatingSubmit={onRatingSubmit}
        onNewCommentChange={onNewCommentChange}
      />
    </Card>
  );
};

export default EventCard;
