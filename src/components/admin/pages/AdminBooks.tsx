import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { Book } from '../../../types';
import {
  BookOpen,
  Search,
  Plus,
  QrCode,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Filter,
  Eye,
  ScanLine,
} from 'lucide-react';
import { QRCodeModal } from '../../common/QRCodeModal';
import { QRScannerModal, ScannedBookData } from '../../common/QRScannerModal';

export const AdminBooks: React.FC = () => {
  const { books, addBook, updateBook, deleteBook, loans } = useApp();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [selectedAvailability, setSelectedAvailability] = useState<'all' | 'available' | 'unavailable'>('all');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [qrCodeBook, setQrCodeBook] = useState<Book | null>(null);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);

  // Form inputs
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: 'Informatique',
    isbn: '',
    publisher: '',
    publicationYear: 2024,
    description: '',
    totalCopies: 1,
    location: '',
  });

  // Extract distinct genres
  const genres = useMemo(() => {
    return Array.from(new Set(books.map((b) => b.genre))).sort();
  }, [books]);

  // Filtered books
  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      const matchesSearch =
        b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.isbn.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesGenre = selectedGenre === 'all' || b.genre === selectedGenre;

      const matchesAvailability =
        selectedAvailability === 'all' ||
        (selectedAvailability === 'available' && b.availableCopies > 0) ||
        (selectedAvailability === 'unavailable' && b.availableCopies === 0);

      return matchesSearch && matchesGenre && matchesAvailability;
    });
  }, [books, searchTerm, selectedGenre, selectedAvailability]);

  // Handle open add / edit modal
  const handleOpenAddModal = () => {
    setEditingBook(null);
    setFormData({
      title: '',
      author: '',
      genre: genres[0] || 'Informatique',
      isbn: `978-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
      publisher: 'Éditions Universitaires',
      publicationYear: new Date().getFullYear(),
      description: '',
      totalCopies: 2,
      location: 'Rayon Central',
    });
    setIsFormOpen(true);
  };

  const handleOpenEditModal = (book: Book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      genre: book.genre,
      isbn: book.isbn,
      publisher: book.publisher,
      publicationYear: book.publicationYear,
      description: book.description,
      totalCopies: book.totalCopies,
      location: book.location || '',
    });
    setIsFormOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.author.trim() || !formData.isbn.trim()) {
      return;
    }

    if (editingBook) {
      updateBook(editingBook.id, formData);
    } else {
      addBook(formData);
    }
    setIsFormOpen(false);
  };

  const handleScanSuccess = ({ book }: { book?: ScannedBookData }) => {
    setIsScannerOpen(false);
    if (book) {
      setEditingBook(null);
      setFormData({
        title: book.title || '',
        author: book.author || '',
        genre: book.genre || 'Informatique',
        isbn: book.isbn || '',
        publisher: book.publisher || 'Éditions Universitaires',
        publicationYear: book.publicationYear || new Date().getFullYear(),
        description: book.description || '',
        totalCopies: book.totalCopies || 1,
        location: 'Rayon B - Informatique',
      });
      setIsFormOpen(true);
    }
  };

  const handleConfirmDelete = () => {
    if (bookToDelete) {
      deleteBook(bookToDelete.id);
      setBookToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            Catalogue des Livres
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Inventaire complet, gestion des exemplaires et ajout par scanner QR code
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsScannerOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xs transition-colors"
          >
            <ScanLine className="w-4 h-4 text-sky-600 dark:text-sky-400" />
            Scanner le QR code du livre
          </button>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Ajouter manuellement
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Search */}
        <div className="sm:col-span-6 relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par titre, auteur, ISBN..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
          />
        </div>

        {/* Genre filter */}
        <div className="sm:col-span-3">
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
          >
            <option value="all">Toutes les disciplines</option>
            {genres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>

        {/* Availability filter */}
        <div className="sm:col-span-3">
          <select
            value={selectedAvailability}
            onChange={(e) => setSelectedAvailability(e.target.value as any)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
          >
            <option value="all">Toute disponibilité</option>
            <option value="available">🟢 Disponible uniquement</option>
            <option value="unavailable">🔴 Tous empruntés</option>
          </select>
        </div>
      </div>

      {/* Books Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">Titre & Auteur</th>
                <th className="py-3 px-4">Discipline</th>
                <th className="py-3 px-4">ISBN</th>
                <th className="py-3 px-4 text-center">Année</th>
                <th className="py-3 px-4 text-center">Disponibilité</th>
                <th className="py-3 px-4 text-center">Prêts</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredBooks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Aucun livre ne correspond à votre recherche.
                  </td>
                </tr>
              ) : (
                filteredBooks.map((book) => {
                  const isAvailable = book.availableCopies > 0;
                  return (
                    <tr
                      key={book.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900 dark:text-white">
                          {book.title}
                        </p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">
                          {book.author}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-mono text-slate-600 dark:text-slate-300">
                          {book.genre}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600 dark:text-slate-300">
                        {book.isbn}
                      </td>
                      <td className="py-3 px-4 text-center font-mono tabular-nums text-slate-600 dark:text-slate-300">
                        {book.publicationYear}
                      </td>
                      <td className="py-3 px-4 text-center">
                        {isAvailable ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            🟢 Disponible ({book.availableCopies}/{book.totalCopies})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                            🔴 Emprunté (0/{book.totalCopies})
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-mono tabular-nums font-semibold text-slate-900 dark:text-white">
                        {book.borrowCount}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setQrCodeBook(book)}
                            title="Afficher et imprimer le QR Code"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(book)}
                            title="Modifier les informations"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setBookToDelete(book)}
                            title="Supprimer du catalogue"
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Book Form Modal (Add / Edit) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                {editingBook ? 'Modifier les informations du livre' : 'Ajouter un nouvel ouvrage'}
              </h3>
              <button
                onClick={() => setIsFormOpen(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Titre du livre *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Introduction aux algorithmes"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Auteur(s) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    placeholder="Ex: Thomas Cormen"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Discipline / Genre *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.genre}
                    onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    placeholder="Ex: Informatique, Droit, Médecine"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Numéro ISBN *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.isbn}
                    onChange={(e) => setFormData({ ...formData, isbn: e.target.value })}
                    placeholder="978-..."
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Année de publication
                  </label>
                  <input
                    type="number"
                    value={formData.publicationYear}
                    onChange={(e) =>
                      setFormData({ ...formData, publicationYear: parseInt(e.target.value) || 2024 })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Éditeur
                  </label>
                  <input
                    type="text"
                    value={formData.publisher}
                    onChange={(e) => setFormData({ ...formData, publisher: e.target.value })}
                    placeholder="Ex: Pearson, Dunod, MIT Press"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Nombre total d'exemplaires *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.totalCopies}
                    onChange={(e) =>
                      setFormData({ ...formData, totalCopies: Math.max(1, parseInt(e.target.value) || 1) })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-mono text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Résumé
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Résumé de l'ouvrage..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors"
                >
                  {editingBook ? 'Enregistrer les modifications' : 'Ajouter le livre'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {bookToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center animate-in fade-in">
            <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950/60 text-rose-600 mx-auto flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Confirmer la suppression
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-2">
              Êtes-vous sûr de vouloir retirer <strong className="text-slate-900 dark:text-white">"{bookToDelete.title}"</strong> du catalogue ?
            </p>
            <div className="flex gap-2 justify-center mt-6">
              <button
                onClick={() => setBookToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 rounded-lg transition-colors"
              >
                Oui, supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Book QR Code Modal */}
      {qrCodeBook && (
        <QRCodeModal
          isOpen={!!qrCodeBook}
          onClose={() => setQrCodeBook(null)}
          title={qrCodeBook.title}
          subtitle={`ISBN: ${qrCodeBook.isbn} · ${qrCodeBook.author}`}
          data={JSON.stringify({
            id: qrCodeBook.id,
            isbn: qrCodeBook.isbn,
            title: qrCodeBook.title,
            author: qrCodeBook.author,
            genre: qrCodeBook.genre,
            publicationYear: qrCodeBook.publicationYear,
          })}
        />
      )}

      {/* QR Scanner Modal for Book */}
      {isScannerOpen && (
        <QRScannerModal
          isOpen={isScannerOpen}
          onClose={() => setIsScannerOpen(false)}
          mode="book"
          onScanSuccess={handleScanSuccess}
        />
      )}
    </div>
  );
};
