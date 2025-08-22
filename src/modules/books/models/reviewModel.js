import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema({
  book_id: { type: String, required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  description: { type: String, required: true },
  private: {type: Boolean, default: false},
  rating: { type: Number, min: 1, max: 5 , required: true},  
},
{
  timestamps: true, // Agrega los campos createdAt y updatedAt automáticamente
}
);

const Review = mongoose.model("Review", reviewSchema);
export default Review;
