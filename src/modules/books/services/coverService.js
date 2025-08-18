import Cover from "../models/coverModel.js";

// Convierte una imagen a base64 y guarda en MongoDB
export const saveCoverBase64 = async (coverId, coverBase64, bookId) => {
  const cover = await Cover.findByIdAndUpdate(
    coverId,
    { coverBase64, book_id: bookId },
    { upsert: true, new: true }
  );
  return cover;
};

// Obtener cover y convertirla de base64 a Buffer
export const getCoverImage = async (coverId) => {
  const cover = await Cover.findById(coverId);
  if (!cover) throw new Error("Cover no encontrada");
  return Buffer.from(cover.coverBase64, "base64");
};
