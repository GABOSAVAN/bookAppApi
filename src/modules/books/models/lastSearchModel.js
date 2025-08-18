import mongoose from "mongoose";

const lastSearchSchema = new mongoose.Schema({
  _id: { type: mongoose.Schema.Types.ObjectId, auto: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  lastFive: [{ type: String }],
});

const LastSearch = mongoose.model("LastSearch", lastSearchSchema);
export default LastSearch;
