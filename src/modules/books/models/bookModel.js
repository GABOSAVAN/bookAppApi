import mongoose from "mongoose";

const bookSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // usamos el id de OpenLibrary
  title: { type: String, required: true },
  author: { type: String },
  cover: { type: String },
  publication_date: { type: String },
});

const Book = mongoose.model("Book", bookSchema);
export default Book;
