import React, { useState, useMemo } from 'react';
import { useApp } from '../../../context/AppContext';
import { Book, Student } from '../../../types';
import {
  Search,
  BookOpen,
  Filter,
  CheckCircle2,
  XCircle,
  Calendar,
  Layers,
  MapPin,
  ArrowRight,
  BookmarkPlus,
  AlertCircle,
  X,
} from 'lucide-react';

export const StudentCatalog: React.FC = () => {
  const { books, currentUser, loans, createLoan, settings } = useApp();
  const student = currentUser as Student;

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [selectedAvailability, setSelectedAvailability] = useState<'all' | 'available' | 'borrowed'>('all');
  const [selectedYear, setSelectedYear] = useState('all');

  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  // Extract distinct genres & years
  const genres = useMemo(() => {
    return Array.from(new Set(books.map((b) => b.genre))).sort();
  }, [books]);

  const years = useMemo(() => {
    return Array.from(new Set(books.map((b) => b.publicationYear))).sort((a, b) => b - a);
  }, [books]);

  // Which books does this student already actively borrow?
  const myActiveBorrowedBookIds = useMemo(() => {
    return new Set(
      loans
        .filter((l) => l.studentId === student.id && l.status === 'active')
        .map((l) => l.bookId)
    );
  }, [loans, student.id]);

  // Filter books
  const filteredBooks = useMemo(() => {
    return books.filter((b) => {
      const q = searchTerm.toLowerCase();
      const matchesSearch =
        b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        b.isbn.toLowerCase().includes(q) ||
        b.publisher.toLowerCase().includes(q);

      const matchesGenre = selectedGenre === 'all' || b.genre === selectedGenre;
      const matchesYear = selectedYear === 'all' || String(b.publicationYear) === selectedYear;

      const matchesAvailability =
        selectedAvailability === 'all' ||
        (selectedAvailability === 'available' && b.availableCopies > 0) ||
        (selectedAvailability === 'borrowed' && b.availableCopies === 0);

      return matchesSearch && matchesGenre && matchesYear && matchesAvailability;
    });
  }, [books, searchTerm, selectedGenre, selectedYear, selectedAvailability]);

  const handleBorrowRequest = (book: Book) => {
    const res = createLoan(student.id, book.id);
    if (res.success) {
      setSelectedBook(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-sky-600 dark:text-sky-400" />
          Catalogue des Livres
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Consultez et recherchez parmi l'ensemble des collections documentaires de l'USMBA
        </p>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
        {/* Search Input */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher par titre, auteur, ISBN, éditeur..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
          />
        </div>

        {/* Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <select
              value={selectedGenre}
              onChange={(e) => setSelectedGenre(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
            >
              <option value="all">Toutes les disciplines</option>
              {genres.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedAvailability}
              onChange={(e) => setSelectedAvailability(e.target.value as any)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
            >
              <option value="all">Toute disponibilité</option>
              <option value="available">🟢 Disponible immédiatement</option>
              <option value="borrowed">🔴 Actuellement emprunté</option>
            </select>
          </div>

          <div>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:border-sky-500"
            >
              <option value="all">Toutes les années</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  Année {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Books Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBooks.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
            Aucun livre ne correspond aux critères de recherche sélectionnés.
          </div>
        ) : (
          filteredBooks.map((book) => {
            const isAvailable = book.availableCopies > 0;
            const alreadyBorrowedByMe = myActiveBorrowedBookIds.has(book.id);

            return (
              <div
                key={book.id}
                className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 flex flex-col justify-between gap-4 transition-all"
              >
                <div className="space-y-2.5">
                  {/* Status Indicator */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 font-mono">
                      {book.genre}
                    </span>
                    {isAvailable ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        🟢 Disponible ({book.availableCopies}/{book.totalCopies})
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                        🔴 Emprunté
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                      {book.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {book.author}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2 leading-relaxed">
                    {book.description || 'Ouvrage de référence disponible à la bibliothèque universitaire.'}
                  </p>

                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 font-mono flex items-center justify-between">
                    <span>ISBN: {book.isbn}</span>
                    <span>{book.publicationYear}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setSelectedBook(book)}
                    className="flex-1 py-2 px-3 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 transition-colors"
                  >
                    Détails
                  </button>

                  <button
                    onClick={() => handleBorrowRequest(book)}
                    disabled={!isAvailable || alreadyBorrowedByMe}
                    className="flex-1 py-2 px-3 text-xs font-semibold rounded-lg bg-sky-600 hover:bg-sky-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    {alreadyBorrowedByMe ? 'Déjà emprunté' : isAvailable ? 'Emprunter' : 'Indisponible'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Book Detail Modal */}
      {selectedBook && (() => {
        const isAvailable = selectedBook.availableCopies > 0;
        const alreadyBorrowedByMe = myActiveBorrowedBookIds.has(selectedBook.id);

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-sky-600" />
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                    Fiche du Livre
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedBook(null)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-4 text-xs">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedBook.title}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Par {selectedBook.author} · Éditions {selectedBook.publisher}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Disponibilité :</span>
                    {isAvailable ? (
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        🟢 Disponible ({selectedBook.availableCopies} exemplaires restants sur {selectedBook.totalCopies})
                      </span>
                    ) : (
                      <span className="font-semibold text-rose-600 dark:text-rose-400">
                        🔴 Tous les exemplaires sont empruntés
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Numéro ISBN :</span>
                    <span className="font-mono font-medium text-slate-800 dark:text-slate-200">
                      {selectedBook.isbn}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Année de publication :</span>
                    <span className="font-mono tabular-nums text-slate-800 dark:text-slate-200">
                      {selectedBook.publicationYear}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Discipline académique :</span>
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      {selectedBook.genre}
                    </span>
                  </div>
                  {selectedBook.location && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Emplacement en rayon :</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-sky-600" />
                        {selectedBook.location}
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <h5 className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                    Description & Sommaire
                  </h5>
                  <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                    {selectedBook.description || 'Ouvrage académique consultable à la bibliothèque universitaire.'}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-[11px] text-sky-800 dark:text-sky-300 flex items-start gap-2">
                  <BookmarkPlus className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>
                    La durée standard d'emprunt pour cet ouvrage est de{' '}
                    <strong>{settings.defaultLoanDurationDays} jours</strong>. Tout retard donnera lieu à une notification automatique.
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => setSelectedBook(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  Fermer
                </button>
                <button
                  onClick={() => handleBorrowRequest(selectedBook)}
                  disabled={!isAvailable || alreadyBorrowedByMe}
                  className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  {alreadyBorrowedByMe
                    ? 'Vous possédez déjà ce livre'
                    : isAvailable
                    ? 'Confirmer l\'emprunt'
                    : 'Actuellement indisponible'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
