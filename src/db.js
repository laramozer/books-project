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

db.version(5).stores({
  books: 'id, googleId, title, author, rating, progress, currentPage, pages, yearRead, favorite, createdAt',
})

db.version(6).stores({
  books: 'id, googleId, title, author, rating, progress, currentPage, pages, yearRead, favorite, format, createdAt',
})

db.version(7).stores({
  books: 'id, googleId, title, author, rating, progress, currentPage, pages, yearRead, favorite, format, review, createdAt',
})

db.version(8).stores({
  books: 'id, googleId, title, author, rating, progress, currentPage, pages, yearRead, favorite, format, review, finishedAt, createdAt',
  goals: 'id, month',
})

db.version(9).stores({
  goalBooks: 'id, month, bookId',
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

export async function exportBooks() {
  const books = await db.books.toArray()
  const json = JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), books }, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `minha-estante-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export async function importBooks(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const data = JSON.parse(e.target.result)
        const books = data.books ?? data
        if (!Array.isArray(books)) throw new Error('Formato inválido')
        let added = 0
        for (const book of books) {
          if (!book.id || !book.title) continue
          const exists = await db.books.get(book.id)
          if (!exists) { await db.books.add(book); added++ }
        }
        resolve(added)
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = reject
    reader.readAsText(file)
  })
}

export async function setGoal(month, target) {
  const existing = await db.goals.where('month').equals(month).first()
  if (existing) {
    await db.goals.update(existing.id, { target })
  } else {
    await db.goals.add({ id: crypto.randomUUID(), month, target, createdAt: Date.now() })
  }
}

export async function deleteGoal(month) {
  const existing = await db.goals.where('month').equals(month).first()
  if (existing) await db.goals.delete(existing.id)
  await db.goalBooks.where('month').equals(month).delete()
}

export async function addBookToGoal(month, bookId) {
  const exists = await db.goalBooks.where({ month, bookId }).first()
  if (!exists) await db.goalBooks.add({ id: crypto.randomUUID(), month, bookId })
}

export async function removeBookFromGoal(month, bookId) {
  await db.goalBooks.where({ month, bookId }).delete()
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
