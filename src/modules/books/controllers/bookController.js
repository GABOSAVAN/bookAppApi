import axios from "axios";
import mongoose from "mongoose";
import { Types } from "mongoose";
import Book from "../models/bookModel.js";
import Cover from "../models/coverModel.js";
import Selection from "../models/selectionModel.js";
import Review from "../models/reviewModel.js";
import LastSearch from "../models/lastSearchModel.js";
import { searchBooks } from "../services/bookService.js";
import { saveCoverBase64, getCoverImage } from "../services/coverService.js";

// GET /api/books/search?q=:title
export const search = async (req, res) => {
  try {
    const { q } = req.query;
    const userId = req.user ? req.user : null;
    const books = await searchBooks(q, userId);

    // Revisar si algún libro ya está en selection
    const userSelections = await Selection.find({ user_id: userId });
    const selectedBookIds = userSelections.map((s) => s.book_id);

    const enriched = await Promise.all(
      books.map(async (b) => {
        const bookId = b.key.replace("/works/", "");
        let coverUrl = b.cover_i
          ? `https://covers.openlibrary.org/b/id/${b.cover_i}-M.jpg`
          : null;

        if (selectedBookIds.includes(bookId)) {
          const cover = await Cover.findById(b.cover_i);
          if (cover) {
            coverUrl = `/api/books/library/front-cover/${b.cover_i}`;
          }
        }

        return {
          id: bookId,
          title: b.title,
          author: b.author_name?.[0],
          cover_id: b.cover_i,
          publication_date: b.first_publish_year,
          coverUrl,
        };
      })
    );

    res.json(enriched);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/books/last-search/
export const lastSearch = async (req, res) => {
  try {
    console.log("ultimas busquedas del user...", req.user);
    const userId = req.user;
    const last = await LastSearch.findOne({ user_id: userId });
    res.json(last?.lastFive || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/books/my-library
export const addToLibrary = async (req, res) => {
  try {
    const { id: bookId } = req.body; // id de OpenLibrary
    const userId = req.user;
    console.log("creando selection...", req.body, "userId", userId);

    // 1. Verificar si ya existe la selección
    const existingSelection = await Selection.findOne({
      user_id: userId,
      book_id: bookId,
    });
    if (existingSelection) {
      return res
        .status(200)
        .json({ 
          status:200,
          message: "El libro ya está en tu biblioteca" 
        });
    }

    // 2. Verificar si ya existe el Book en nuestra DB
    let book = await Book.findById(bookId).populate("cover");

    if (!book) {
      // 3. Si no existe, pedir datos a OpenLibrary
      const { data } = await axios.get(
        `https://openlibrary.org/works/${bookId}.json`
      );
      const title = data.title || "Unknown Title";
      let author = "Unknown Author";

      // Intentar extraer autor directamente
      if (
        data.authors &&
        Array.isArray(data.authors) &&
        data.authors.length > 0
      ) {
        try {
          const authorKey = data.authors[0].author?.key;
          if (authorKey) {
            const authorData = await axios.get(
              `https://openlibrary.org${authorKey}.json`
            );
            author = authorData.data.name || "Unknown Author";
          }
        } catch (err) {
          console.warn("No se pudo obtener el nombre del autor", err.message);
        }
      }

      const publication_date = data.first_publish_date || null;
      const coverId = data.covers?.[0] || null;

      // 4. Guardar la portada usando coverServices
      if (coverId) {
        const coverResponse = await axios.get(
          `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`,
          { responseType: "arraybuffer" }
        );
        const coverBase64 = Buffer.from(coverResponse.data, "binary").toString(
          "base64"
        );
        await saveCoverBase64(coverId, coverBase64, bookId);
      }

      // 5. Crear el Book en nuestra DB con referencia al cover
      book = await Book.create({
        _id: bookId,
        title,
        author,
        publication_date,
        cover: coverId || null, // referencia a Cover
      });

      // Poblar cover para devolverlo completo
      book = await book.populate("cover");
    }

    // 6. Crear la selección
    const selection = await Selection.create({
      user_id: userId,
      book_id: book._id,
    });

    res.status(201).json({
      status:201,
      message: "Libro agregado a seleccion",
      book,
      selection });
  } catch (error) {
    console.error("Error en addToLibrary:", error);
    res.status(500).json({
      status:500,
      message: error.message 
    });
  }
};

// GET /api/books/my-library/:id
export const getLibraryBook = async (req, res) => {
  try {
    const selection = await Selection.findById(req.params.id)
      .populate("book_id")
      .exec();
    if (!selection) return res.status(404).json({ message: "No encontrado" });
    res.json(selection);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/books/my-library/:id
export const updateLibraryBook = async (req, res) => {
  try {
    const { description, rating } = req.body;
    const userId = req.user;
    const bookId = req.params.id;
    console.log("creando o actualizando review...", "bookId:  ", bookId, "userId:  ", userId);

    const review = await Review.findOneAndUpdate(
      { book_id: bookId , user_id: userId},
      { description, rating },
      { upsert: true, new: true }
    );

    // await Selection.findByIdAndUpdate(selectionId, { hasReview: true });

    res.json(review);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//GET reviews
export const getReviews = async (req, res) => {
  try {
    const bookId = req.params.id;
    console.log("get reviews...")
    const revs = await Review.find({ book_id: bookId });
    res.json(revs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/books/my-library/:id
export const deleteLibraryBook = async (req, res) => {
  try {
    console.log("eliminando selection y review...");
    await Selection.findByIdAndDelete(req.params.id);
    await Review.deleteOne({ selection_id: req.params.id });
    res.json({ message: "Libro eliminado de la librería" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/books/my-library
export const listLibrary = async (req, res) => {
  try {
    const { title, author, hasReview } = req.query;
    const userIdStr = req.user?.id || req.user;
    let userObjectId;
    try {
      userObjectId = new Types.ObjectId(userIdStr);
    } catch {
      return res.status(400).json({ message: "Invalid user id" });
    }

    const matchObj = { user_id: userObjectId };
    if (hasReview !== undefined) {
      matchObj.hasReview = String(hasReview).toLowerCase() === "true";
    }

    // Solo aplicar filtros si vienen
    const selections = await Selection.find(matchObj).select("_id book_id");

    if (!selections.length) return res.json([]);

    const selectionIds = selections.map((s) => s._id);

    const pipeline = [
      { $match: { _id: { $in: selectionIds } } },

      // Join con Book
      {
        $lookup: {
          from: "books",
          localField: "book_id",
          foreignField: "_id",
          as: "book",
        },
      },
      { $unwind: "$book" },

      // PASO AÑADIDO: Join con la colección de reseñas (Reviews)
      {
        $lookup: {
          from: "reviews",
          let: { bookId: "$book_id", userId: "$user_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$book_id", "$$bookId"] },
                    { $eq: ["$user_id", "$$userId"] },
                  ],
                },
              },
            },
            {
              $project: {
                _id: 1,
                rating: 1,
                description: 1,
                createdAt: 1,
              },
            },
          ],
          as: "userReview",
        },
      },
      // PASO AÑADIDO: Desenrollar el array de reseñas
      {
        $unwind: { path: "$userReview", preserveNullAndEmptyArrays: true },
      },
    ];

    if (title || author) {
      const matchBook = {};
      if (title) matchBook["book.title"] = { $regex: title, $options: "i" };
      if (author) matchBook["book.author"] = { $regex: author, $options: "i" };
      pipeline.push({ $match: matchBook });
    }

    // Join con Cover
    pipeline.push({
      $lookup: {
        from: "covers",
        localField: "book.cover",
        foreignField: "_id",
        as: "book_cover",
      },
    });
    pipeline.push({ $unwind: { path: "$book_cover", preserveNullAndEmptyArrays: true } });    

    // DTO final
    pipeline.push({
      $project: {
        _id: 1,
        book_id: {
          _id: "$book._id",
          title: "$book.title",
          author: "$book.author",
          publication_date: "$book.publication_date",
          coverUrl: {
            // Usa $ifNull para verificar si _id de la portada existe
            $ifNull: [
              { $concat: ["/api/books/library/front-cover/", "$book_cover._id"] },
              // Si es null, usa una URL de portada por defecto
              null
            ]
          }
        },
        // CAMBIO: Proyectar la reseña real del usuario
        userReview: "$userReview",
      },
    });

    const results = await Selection.aggregate(pipeline);
    res.json(results);
  } catch (error) {
    console.error("Error en listLibrary:", error);
    res.status(500).json({ message: error.message });
  }
};

// GET /api/books/library/front-cover/:cover_id
export const getCover = async (req, res) => {
  try {
    console.log("obteniendo cover en img...");
    const buffer = await getCoverImage(req.params.cover_id);
    res.writeHead(200, { "Content-Type": "image/jpeg" });
    res.end(buffer);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
