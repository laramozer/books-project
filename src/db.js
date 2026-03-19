import Dexie from 'dexie'

export const db = new Dexie('MinhaEstante')

db.version(1).stores({
  books: 'id, googleId, title, author, rating, progress, currentPage, createdAt',
})

db.version(2).stores({
  books: 'id, googleId, title, author, rating, progress, currentPage, pages, createdAt',
})

db.version(3).stores({
  catalog: 'googleId, title, author, createdAt',
})

db.version(4).stores({
  books: 'id, googleId, title, author, rating, progress, currentPage, pages, yearRead, createdAt',
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

export async function addToCatalog(book) {
  const exists = await db.catalog.get(book.googleId)
  if (!exists) await db.catalog.add({ ...book, createdAt: Date.now() })
}

export async function searchCatalog(query) {
  if (!query.trim()) return []
  const q = query.toLowerCase()
  return db.catalog
    .filter((b) => b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q))
    .toArray()
}
