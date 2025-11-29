// src/hooks/useLibraryData.js
import { useEffect, useState, useMemo } from 'react';
import { API_BASE_URL } from '../config/apiConfig';

const useLibraryData = ({ storeId = null, searchTerm = '' } = {}) => {
  // State for data
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [stores, setStores] = useState([]);
  const [inventory, setInventory] = useState([]);

  // Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [storesRes, booksRes, authorsRes, inventoryRes] = await Promise.all([
          fetch(`${API_BASE_URL}/stores`),
          fetch(`${API_BASE_URL}/books`),
          fetch(`${API_BASE_URL}/authors`),
          fetch(`${API_BASE_URL}/inventory`)
        ]);

        const storesData = await storesRes.json();
        const booksData = await booksRes.json();
        const authorsData = await authorsRes.json();
        const inventoryData = await inventoryRes.json();

        setStores(storesData);
        setBooks(booksData);
        setAuthors(authorsData);
        setInventory(inventoryData);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    fetchData();
  }, []);

  // Create lookup maps
  const authorMap = useMemo(() => {
    return authors.reduce((map, author) => {
      map[author.id] = { ...author, name: `${author.first_name} ${author.last_name}` };
      return map;
    }, {});
  }, [authors]);

  const storeMap = useMemo(() => {
    return stores.reduce((map, store) => {
      map[store.id] = store;
      return map;
    }, {});
  }, [stores]);

  // Filter books for a specific store (for Inventory page)
  const storeBooks = useMemo(() => {
    if (!storeId) return books;

    const storeInventory = inventory.filter((item) => item.store_id.toString() === storeId.toString());

    let filteredBooks = books
      .filter((book) => storeInventory.some((item) => item.book_id.toString() === book.id.toString()))
      .map((book) => {
        const inventoryItem = storeInventory.find((item) => item.book_id.toString() === book.id.toString());
        return { ...book, price: inventoryItem ? inventoryItem.price : null, invId: inventoryItem ? inventoryItem.id : null };
      });
    if (searchTerm.trim()) {
      const lowerSearch = searchTerm.toLowerCase();
      filteredBooks = filteredBooks.filter((book) =>
        Object.values({ ...book, author_name: authorMap[book.author_id]?.name || 'Unknown Author' })
          .some((value) => String(value).toLowerCase().includes(lowerSearch))
      );
    }
    console.log("filteredBooks", filteredBooks);

    return filteredBooks;
  }, [storeId, books, inventory, searchTerm, authorMap]);

  // Map books to their stores (for Browse page)
  const booksWithStores = useMemo(() => {
    return books.map((book) => {
      const bookInventory = inventory.filter((item) => item.book_id === book.id);
      const bookStores = bookInventory.map((item) => ({
        name: storeMap[item.store_id]?.name || 'Unknown Store',
        price: item.price,
      }));

      return {
        title: book.name,
        author: authorMap[book.author_id]?.name || 'Unknown Author',
        stores: bookStores,
      };
    });
  }, [books, inventory, authorMap, storeMap]);

  // Loading state
  const isLoading = !books.length || !authors.length || !stores.length || !inventory.length;

  return {
    books,
    setBooks,
    authors,
    stores,
    inventory,
    setInventory,
    authorMap,
    storeMap,
    storeBooks,
    booksWithStores,
    isLoading,
    currentStore: stores.find((store) => store.id === storeId),
  };
};

export default useLibraryData;