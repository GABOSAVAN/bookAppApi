import mongoose from "mongoose";

const coverSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // mismo id que cover_id de OpenLibrary
  coverBase64: { type: String, required: true },
  book_id: { type: String, ref: "Book" },
});

const Cover = mongoose.model("Cover", coverSchema);
export default Cover;