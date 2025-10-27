// ====== Estado (fuente de verdad) ======
const myLibrary = []; // aquí viven los objetos Book

// ====== Modelo ======
class Book {
    constructor({ title, author, pages, read }) {
        this.id = crypto.randomUUID();     // id único y estable
        this.title = title;                
        this.author = author;              
        this.pages = Number(pages);        
        this.read = Boolean(read);         
    }
    toggleRead() {
        this.read = !this.read;            // invierte el estado leído
    }
}

// ====== Selección de nodos de la UI ======
const panel = document.querySelector('#panel');
const openBtn = document.querySelector('#btn-new-book');
const cancelBtn = document.querySelector('#dialog-cancel');
const form = document.querySelector('#new-book-form');
const libraryEl = document.querySelector('#library');
const emptyState = document.querySelector('#empty-state');

const titleInput = document.querySelector('#title');
const authorInput = document.querySelector('#author');
const pagesInput = document.querySelector('#pages');
const readInput = document.querySelector('#read');

// ====== Funciones de datos ======
function addBookToLibrary({ title, author, pages, read }) {

    const book = new Book({ title, author, pages, read });
    myLibrary.push(book);
    return book.id; // por si necesitas el id recién creado
}

function removeBookById(id) {

    const idx = myLibrary.findIndex(b => b.id === id);
    if (idx !== -1) myLibrary.splice(idx, 1);
}

function getBookById(id) {
    return myLibrary.find(b => b.id === id) || null;
}

// ====== Render (solo pinta, no muta datos) ======
function renderLibrary() {
    
    // Limpiar contenedor
    libraryEl.innerHTML = '';

    // Empty state
    if (myLibrary.length === 0) {
        emptyState.style.display = '';
        return;
    }
    emptyState.style.display = 'none';

    // Crear tarjeta por cada libro
    for (const book of myLibrary) {
        const card = document.createElement('article');
        card.className = 'book-card';
        card.dataset.id = book.id; // para mapear DOM <-> objeto

        const header = document.createElement('header');
        const h3 = document.createElement('h3');
        h3.className = 'book-title';
        h3.textContent = book.title;

        const pAuthor = document.createElement('p');
        pAuthor.className = 'book-author';
        pAuthor.textContent = book.author;

        header.append(h3, pAuthor);

        const pPages = document.createElement('p');
        pPages.className = 'book-pages';
        pPages.textContent = `${book.pages} pages`;

        const pStatus = document.createElement('p');
        pStatus.className = `book-status ${book.read ? 'book-status--read' : 'book-status--unread'}`;
        pStatus.textContent = book.read ? 'Read' : 'Not read';

        const actions = document.createElement('div');
        actions.className = 'book-actions';

        const toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.textContent = book.read ? 'Mark as unread' : 'Mark as read';
        toggleBtn.dataset.action = 'toggle';
        toggleBtn.dataset.id = book.id;

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.textContent = 'Remove';
        removeBtn.dataset.action = 'remove';
        removeBtn.dataset.id = book.id;

        actions.append(toggleBtn, removeBtn);
        card.append(header, pPages, pStatus, actions);
        libraryEl.appendChild(card);
    }
}

// ====== UI: abrir/cerrar panel ======
function openPanel() {
    panel.classList.remove('is-hidden');
    // foco al primer campo
    requestAnimationFrame(() => titleInput?.focus());
}

function closePanel() {
    panel.classList.add('is-hidden');
  form.reset();
}

// ====== Wiring de eventos ======
openBtn.addEventListener('click', openPanel);
cancelBtn.addEventListener('click', closePanel);

// Submit del formulario (sin navegación)
form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Leer y validar
    const title = titleInput.value.trim();
    const author = authorInput.value.trim();
    const pages = Number(pagesInput.value);
    const read = readInput.checked;

    if (!title || !author || !(pages > 0)) {
        // Validación mínima; puedes mejorarla si quieres
        // Por ejemplo, resaltar inputs inválidos
        return;
    }

    // Crear en estado + repintar
    addBookToLibrary({ title, author, pages, read });
    renderLibrary();

    // Cerrar panel
    closePanel();
});

// Delegación de clicks en la lista (toggle/remove)
libraryEl.addEventListener('click', (e) => {
    const btn = e.target.closest('button');
    if (!btn) return;

    const action = btn.dataset.action;
    const id = btn.dataset.id;
    if (!action || !id) return;

    if (action === 'remove') {
        removeBookById(id);
        renderLibrary();
    } else if (action === 'toggle') {
        const book = getBookById(id);
        if (book) {
        book.toggleRead();
        renderLibrary();
        }
    }
});