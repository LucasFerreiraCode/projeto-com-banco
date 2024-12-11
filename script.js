// Abrir ou criar o banco de dados IndexedDB
const openDatabase = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open("ContactDB", 1);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains("contacts")) {
                db.createObjectStore("contacts", { keyPath: "id", autoIncrement: true });
            }
        };

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
};

// Adicionar contato no banco
const addContact = async (contact) => {
    const db = await openDatabase();
    const transaction = db.transaction("contacts", "readwrite");
    const store = transaction.objectStore("contacts");
    store.add(contact);
};

// Obter todos os contatos do banco
const getContacts = async () => {
    const db = await openDatabase();
    const transaction = db.transaction("contacts", "readonly");
    const store = transaction.objectStore("contacts");

    return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

// Atualizar lista de contatos na interface
const updateContactList = async () => {
    const contactList = document.getElementById("contact-list");
    contactList.innerHTML = "";
    const contacts = await getContacts();

    contacts.forEach((contact) => {
        const li = document.createElement("li");
        li.textContent = `${contact.name} - ${contact.phone}`;
        contactList.appendChild(li);
    });
};

// Exportar os dados como arquivo JSON
const exportDataToFile = async () => {
    const contacts = await getContacts();
    const blob = new Blob([JSON.stringify(contacts, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "contatos.json";
    a.click();

    URL.revokeObjectURL(url);
};

// Evento de submissão do formulário
document.getElementById("contact-form").onsubmit = async (event) => {
    event.preventDefault();
    const name = document.getElementById("name").value;
    const phone = document.getElementById("phone").value;

    if (name && phone) {
        await addContact({ name, phone });
        document.getElementById("contact-form").reset();
        updateContactList();
    }
};

// Evento de clique para exportar os dados
document.getElementById("export-btn").onclick = exportDataToFile;

// Carregar contatos ao inicializar a página
document.addEventListener("DOMContentLoaded", updateContactList);