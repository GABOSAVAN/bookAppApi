import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  selection_id: { type: mongoose.Schema.Types.ObjectId, ref: "Selection" },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  description: { type: String },
  rating: { type: Number, min: 1, max: 5 },
});

const Review = mongoose.model("Review", reviewSchema);
export default Review;
