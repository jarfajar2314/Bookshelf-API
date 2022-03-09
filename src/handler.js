/* eslint-disable eqeqeq */
const { nanoid } = require('nanoid');
const _ = require('lodash');
const books = require('./books');

const addBookHandler = (request, h) => {
  const {
    name, year, author, summary, publisher, pageCount, readPage, reading,
  } = request.payload;

  const id = nanoid(16);
  const finished = (pageCount === readPage);
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  // Client tidak melampirkan properti namepada request body.
  if (!name) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku',
    });
    response.code(400);
    response.header('Access-Control-Allow-Origin', '*');
    return response;
  }

  // Client melampirkan nilai properti readPage yang lebih besar dari nilai properti pageCount.
  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    response.header('Access-Control-Allow-Origin', '*');
    return response;
  }

  const newBook = {
    id,
    name,
    year,
    author,
    summary,
    publisher,
    pageCount,
    readPage,
    finished,
    reading,
    insertedAt,
    updatedAt,
  };

  books.push(newBook);

  const isSuccess = books.filter((book) => book.id === id).length > 0;

  // Jika berhasil
  if (isSuccess) {
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id,
      },
    });
    response.code(201);
    response.header('Access-Control-Allow-Origin', '*');
    return response;
  }

  // Server gagal memasukkan buku karena alasan umum (generic error)
  const response = h.response({
    status: 'fail',
    message: 'Buku gagal ditambahkan',
  });
  response.code(500);
  response.header('Access-Control-Allow-Origin', '*');
  return response;
};

const getAllBooksHandler = (request, h) => {
  const { name, reading, finished } = request.query;

  if (name) {
    // Tampilkan seluruh buku yang mengandung nama berdasarkan nilai yang diberikan pada query ini.
    const filteredBooks = books.filter(
      (book) => book.name.toLowerCase().includes(name.toLowerCase()),
    );
    const viewBook = filteredBooks.map((book) => _.pick(book, ['id', 'name', 'publisher']));
    const response = h.response({
      status: 'success',
      data: {
        books: viewBook,
      },
    });
    response.code(200);
    response.header('Access-Control-Allow-Origin', '*');
    return response;
  }
  if (reading) {
    // Bernilai 0 atau 1. Bila 0, tampilkan buku yang sedang tidak dibaca (reading: false).
    const filteredBooks = books.filter((book) => book.reading == reading);
    const viewBook = filteredBooks.map((book) => _.pick(book, ['id', 'name', 'publisher']));
    const response = h.response({
      status: 'success',
      data: {
        books: viewBook,
      },
    });
    response.code(200);
    response.header('Access-Control-Allow-Origin', '*');
    return response;
  }
  if (finished) {
    // Bernilai 0 atau 1. Bila 0, tampilkan buku yang sudah belum selesai dibaca (finished: false).
    const filteredBooks = books.filter((book) => book.finished == finished);
    const viewBook = filteredBooks.map((book) => _.pick(book, ['id', 'name', 'publisher']));
    const response = h.response({
      status: 'success',
      data: {
        books: viewBook,
      },
    });
    response.code(200);
    response.header('Access-Control-Allow-Origin', '*');
    return response;
  }

  const viewBook = books.map((book) => _.pick(book, ['id', 'name', 'publisher']));
  const response = h.response({
    status: 'success',
    data: {
      books: viewBook,
    },
  });
  response.code(200);
  response.header('Access-Control-Allow-Origin', '*');
  return response;
};

const getBookByIdHandler = (request, h) => {
  const { id } = request.params;

  const book = books.filter((b) => b.id === id)[0];

  // Jika buku ditemukan
  if (book !== undefined) {
    const response = h.response({
      status: 'success',
      data: {
        book,
      },
    });
    response.code(200);
    response.header('Access-Control-Allow-Origin', '*');
    return response;
  }

  // Jika buku tidak ditemukan
  const response = h.response({
    status: 'fail',
    message: 'Buku tidak ditemukan',
  });
  response.code(404);
  response.header('Access-Control-Allow-Origin', '*');
  return response;
};

const editBookByIdHandler = (request, h) => {
  const { id } = request.params;

  const {
    name, year, author, summary, publisher, pageCount, readPage, reading,
  } = request.payload;
  const updatedAt = new Date().toISOString();

  // Client tidak melampirkan properti name pada request body.
  if (!name) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku',
    });
    response.code(400);
    response.header('Access-Control-Allow-Origin', '*');
    return response;
  }

  // Client melampirkan nilai properti readPage yang lebih besar dari nilai properti pageCount.
  if (readPage > pageCount) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    response.header('Access-Control-Allow-Origin', '*');
    return response;
  }

  const index = books.findIndex((book) => book.id === id);

  if (index !== -1) {
    books[index] = {
      ...books[index],
      name,
      year,
      author,
      summary,
      publisher,
      pageCount,
      readPage,
      reading,
      updatedAt,
    };

    const response = h.response({
      status: 'success',
      message: 'Buku berhasil diperbarui',
    });
    response.code(200);
    response.header('Access-Control-Allow-Origin', '*');
    return response;
  }

  // Id tidak ditemukan
  const response = h.response({
    status: 'fail',
    message: 'Gagal memperbarui buku. Id tidak ditemukan',
  });
  response.code(404);
  response.header('Access-Control-Allow-Origin', '*');
  return response;
};

const deleteBookByIdHandler = (request, h) => {
  const { id } = request.params;

  const index = books.findIndex((book) => book.id === id);

  if (index !== -1) {
    books.splice(index, 1);
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil dihapus',
    });
    response.code(200);
    response.header('Access-Control-Allow-Origin', '*');
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus. Id tidak ditemukan',
  });
  response.code(404);
  response.header('Access-Control-Allow-Origin', '*');
  return response;
};

module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  editBookByIdHandler,
  deleteBookByIdHandler,
};
