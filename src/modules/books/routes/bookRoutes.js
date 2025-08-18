import { Router } from "express";
import auth from "../../users/middlewares/auth.js"
import {
  search,
  lastSearch,
  addToLibrary,
  getLibraryBook,
  updateLibraryBook,
  deleteLibraryBook,
  listLibrary,
  getCover,
} from "../controllers/bookController.js";

const router = Router();

// Buscar en OpenLibrary
router.get("/search", auth.setUser, search);

// Últimas búsquedas
router.get("/last-search", auth.authVerify, lastSearch);

// Librería personal
router.post("/my-library", auth.authVerify, addToLibrary);
router.get("/my-library", auth.authVerify, listLibrary);
router.get("/my-library/:id", getLibraryBook);
router.put("/my-library/:id", auth.setUser, updateLibraryBook);
router.delete("/my-library/:id", deleteLibraryBook);

// Portadas
router.get("/library/front-cover/:cover_id", getCover);

export default router;
