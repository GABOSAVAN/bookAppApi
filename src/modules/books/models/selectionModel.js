import mongoose from "mongoose";

const selectionSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  book_id: { type: String, ref: "Book" },
  hasReview: { type: Boolean, default: false }
});

const Selection = mongoose.model("Selection", selectionSchema);
export default Selection;