import Dexie from 'dexie'

export const db = new Dexie('MinhaEstante')

db.version(1).stores({
  books: 'id, googleId, title, author, rating, progress, createdAt',
})

db.version(2).stores({
  books: 'id, googleId, title, author, rating, progress, currentPage, pages, createdAt',
})

export async function addBook(book) {
  return db.books.add({ ...book, createdAt: Date.now() })
}

export async function deleteBook(id) {
  return db.books.delete(id)
}

export async function updateBook(id, changes) {
  return db.books.update(id, changes)
}

export async function bookExists(googleId) {
  const found = await db.books.where('googleId').equals(googleId).first()
  return !!found
}
