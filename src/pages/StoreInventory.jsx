// src/pages/InventoryPage.jsx
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Table from '../components/Table/Table';
import Modal from '../components/Modal';
import TableActions from '../components/ActionButton/TableActions';
import useLibraryData from '../hooks/useLibraryData';
import { API_BASE_URL } from '../config/apiConfig';
import { v4 as uuid } from 'uuid';
import { useAuth } from '../context/AuthContext';

const Inventory = () => {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth(); // get logged-in user

  // --- State ---
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newBookId, setNewBookId] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [editingPrices, setEditingPrices] = useState({});

  // --- Library Data ---
  const { storeBooks, books, inventory, setInventory, authorMap, currentStore, isLoading } =
    useLibraryData({ storeId, searchTerm });

  // --- Require Auth helper ---
  const requireAuth = () => {
    if (!user) {
      navigate('/login');
      return false;
    }
    return true;
  };

  // --- CRUD Handlers ---
  const handleDelete = (invId) => {
    if (!requireAuth()) return;

    if (!window.confirm('Are you sure you want to delete this book?')) return;

    const updatedInventory = inventory.filter((item) => item.invId !== invId);
    setInventory(updatedInventory);

    fetch(`${API_BASE_URL}/inventory/${invId}`, { method: 'DELETE' });
  };

  const handleEdit = (invId, currentPrice) => {
    if (!requireAuth()) return;

    setEditingPrices((prev) => ({ ...prev, [invId]: currentPrice }));
  };

  const handleSaveEdit = (invId) => {
    if (!requireAuth()) return;

    const newPrice = parseFloat(editingPrices[invId]);

    setInventory((prev) =>
      prev.map((item) => (item.invId === invId ? { ...item, price: newPrice } : item))
    );

    fetch(`${API_BASE_URL}/inventory/${invId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ price: newPrice }),
    });

    setEditingPrices((prev) => {
      const copy = { ...prev };
      delete copy[invId];
      return copy;
    });
  };

  const handleCancelEdit = (invId) => {
    setEditingPrices((prev) => {
      const copy = { ...prev };
      delete copy[invId];
      return copy;
    });
  };

  const handleAddBook = () => {
    if (!requireAuth()) return;

    if (!newBookId || !newPrice) return alert('Select a book and enter price');

    const newInventoryItem = {
      invId: uuid(),
      store_id: storeId,
      book_id: newBookId,
      price: parseFloat(newPrice),
    };

    fetch(`${API_BASE_URL}/inventory`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newInventoryItem),
    });

    setInventory([...inventory, newInventoryItem]);
    setShowModal(false);
    setNewBookId('');
    setNewPrice('');
  };

  // --- Columns ---
  const columns = useMemo(
    () => [
      { header: 'Id', accessorKey: 'invId' },
      { header: 'Book Id', accessorKey: 'id' },
      { header: 'Name', accessorKey: 'name' },
      { header: 'Pages', accessorKey: 'page_count' },
      {
        header: 'Author',
        accessorKey: 'author_id',
        cell: ({ row }) => authorMap[row.original.author_id]?.name || 'Unknown',
      },
      {
        header: 'Price',
        accessorKey: 'price',
        cell: ({ row }) => {
          const rowId = row.original.invId;
          const isEditing = editingPrices[rowId] !== undefined;

          return isEditing ? (
            <input
              type="number"
              value={editingPrices[rowId]}
              onChange={(e) =>
                setEditingPrices((prev) => ({ ...prev, [rowId]: e.target.value }))
              }
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveEdit(rowId);
                if (e.key === 'Escape') handleCancelEdit(rowId);
              }}
              className="border p-1 w-24"
              autoFocus
            />
          ) : (
            <span
              className="cursor-pointer"
              onClick={() =>
                requireAuth() &&
                setEditingPrices((prev) => ({ ...prev, [rowId]: row.original.price }))
              }
            >
              {row.original.price}
            </span>
          );
        },
      },
      {
        header: 'Actions',
        id: 'actions',
        cell: ({ row }) => (
          <TableActions
            row={row}
            onEdit={() => handleEdit(row.original.invId, row.original.price)}
            onDelete={() => handleDelete(row.original.invId)}
          />
        ),
      },
    ],
    [editingPrices, authorMap, inventory, user]
  );

  // --- JSX ---
  return (
    <div className="py-6 px-4">
      {isLoading ? (
        <div>Loading...</div>
      ) : !currentStore ? (
        <div>Store not found</div>
      ) : (
        <>
          <div className='flex justify-between items-center'>
            <div className='flex items-center gap-2 '>
              <h1 className='text-lg '>{currentStore.name} Inventory</h1>
              <input
                type="text"
                placeholder="Search books..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="border p-2 mb-4 w-full rounded"
              />
            </div>
            <button className='bg-main text-white rounded px-4 py-2'
              onClick={() => {
                requireAuth() && setShowModal(true)
              }}
            >Add to Inventory</button>
          </div>



          {storeBooks.length === 0 ? (
            <p className="text-gray-600 mt-4">No books found in this store.</p>
          ) : (
            <Table data={storeBooks} columns={columns} />
          )}

          <Modal
            title="Add Book to Store"
            save={handleAddBook}
            cancel={() => setShowModal(false)}
            show={showModal}
            setShow={setShowModal}
          >
            <div className="flex flex-col gap-4 w-full">
              <div>
                <label className="block text-gray-700 font-medium mb-1">Select Book</label>
                <select
                  value={newBookId}
                  onChange={(e) => setNewBookId(e.target.value)}
                  className="border p-2 w-full rounded"
                >
                  <option value="">-- Select Book --</option>
                  {books.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-gray-700 font-medium mb-1">Price</label>
                <input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  placeholder="Enter Price"
                  className="border p-2 w-full rounded"
                />
              </div>
            </div>
          </Modal>
        </>
      )}
    </div>
  );
};

export default Inventory;