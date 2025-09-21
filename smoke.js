const {
  db, createItem, readItems, readItemById, updateItem, deleteItem, softDeleteItem, resetDB
} = require("./crudArray");

// começa limpo
resetDB();

// CREATE
console.log("== CREATE ==");
console.log(createItem({ nome: "Produto A", preco: 100 }));
console.log(createItem({ nome: "Produto B", preco: 50 }));
console.log(createItem({ nome: "Café Especial", preco: 30 }));

// READ (lista)
console.log("\n== READ (lista) ==");
console.log(readItems({ q: "pro", sortBy: "preco", sortDir: "asc", page: 1, pageSize: 10 }));

// READ by ID
console.log("\n== READ (id=2) ==");
console.log(readItemById("2"));

// UPDATE
console.log("\n== UPDATE (id=2) ==");
console.log(updateItem("2", { preco: 59.9 }));

// SOFT DELETE
console.log("\n== SOFT DELETE (id=1) ==");
console.log(softDeleteItem("1"));

// DELETE definitivo
console.log("\n== DELETE (id=3) ==");
console.log(deleteItem("3"));

// Estado final do "banco" (array)
console.log("\n== DB FINAL ==");
console.table(db.items);