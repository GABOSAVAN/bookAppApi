import axios from "axios";
import LastSearch from "../models/lastSearchModel.js";

const URL_BOOKS = "https://openlibrary.org/search.json?";

// Servicio para buscar en OpenLibrary
export const searchBooks = async (title, userId) => {
  const url = `${URL_BOOKS}q=${encodeURIComponent(title)}`;  
  const response = await axios.get(url);
  const docs = response.data.docs || [];

  // Guardar en lastSearchs
  if (userId) {
    console.log("guardando busqueda de usuario...");
    let lastFive = await updateLastSearchService(title, userId)
    console.log("lastFive...", lastFive)
  }

  return docs ;
};

export const updateLastSearchService = async (q, userId) => {
  if (!q || !q.trim()) {
    throw new Error("Query 'q' no puede estar vacío");
  }

  const updated = await LastSearch.findOneAndUpdate(
    { user_id: userId },
    [
      {
        $set: {
          lastFive: {
            $let: {
              vars: {
                combined: { $concatArrays: [[q], { $ifNull: ["$lastFive", []] }] }
              },
              in: { $slice: ["$$combined", 5] }
            }
          }
        }
      }
    ],
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return updated.lastFive;
};
