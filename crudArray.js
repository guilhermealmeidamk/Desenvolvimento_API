
const db = {
  items: [],        
  nextId: 1
};


const uid = () => String(db.nextId++); // ID único incremental simples

// Limpa um objeto para que campos não desejados não passem.
function pick(obj, allowedKeys) {
  return Object.fromEntries(
    Object.entries(obj).filter(([k]) => allowedKeys.includes(k))
  );
}

// Validação simples 
function validateItem(input) {
  const errors = [];
  if (!input.nome || typeof input.nome !== "string") errors.push("nome é obrigatório (string).");
  if (input.preco != null && (typeof input.preco !== "number" || input.preco < 0)) errors.push("preco deve ser número >= 0.");
  return { ok: errors.length === 0, errors };
}

//CREATE (C)
function createItem(payload, allowedKeys = ["nome", "preco", "ativo"]) {
  const data = pick(payload, allowedKeys);
  const { ok, errors } = validateItem(data);
  if (!ok) {
    return { ok: false, status: 400, errors };
  }
  const newItem = {
    id: uid(),
    ativo: true,
    ...data
  };
  db.items.push(newItem); // push adiciona no final do array
  return { ok: true, status: 201, data: newItem };
}

//READ (R) - listar com filtros, busca, ordenação e paginação 
function readItems({
  q,                // busca textual simples em "nome"
  ativo,            // true/false
  sortBy = "id",    // "id" | "nome" | "preco"
  sortDir = "asc",  // "asc" | "desc"
  page = 1,
  pageSize = 10
} = {}) {
  let results = db.items;

  // Filtro por ativo
  if (typeof ativo === "boolean") {
    results = results.filter(i => i.ativo === ativo);
  }

  // Busca textual
  if (q && typeof q === "string" && q.trim() !== "") {
    const term = q.toLowerCase();
    results = results.filter(i => (i.nome || "").toLowerCase().includes(term));
  }

  // Ordenação (usa sort; cuidado com tipos mistos)
  results = [...results].sort((a, b) => {
    const x = a[sortBy];
    const y = b[sortBy];
    if (x == null && y == null) return 0;
    if (x == null) return 1;
    if (y == null) return -1;
    if (x < y) return sortDir === "asc" ? -1 : 1;
    if (x > y) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  // Paginação
  const total = results.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * pageSize;
  const data = results.slice(start, start + pageSize);

  return {
    ok: true,
    status: 200,
    meta: { total, page: current, pageSize, totalPages, sortBy, sortDir, q, ativo },
    data
  };
}

// READ by ID
function readItemById(id) {
  const item = db.items.find(i => i.id === String(id)); // find retorna o primeiro que bater
  if (!item) return { ok: false, status: 404, error: "Item não encontrado." };
  return { ok: true, status: 200, data: item };
}

// UPDATE (U)
function updateItem(id, payload, allowedKeys = ["nome", "preco", "ativo"]) {
  const idx = db.items.findIndex(i => i.id === String(id)); // indexOf/findIndex para achar posição
  if (idx === -1) return { ok: false, status: 404, error: "Item não encontrado." };

  const partial = pick(payload, allowedKeys);
  const candidate = { ...db.items[idx], ...partial };

  const { ok, errors } = validateItem(candidate);
  if (!ok) {
    return { ok: false, status: 400, errors };
  }

  db.items[idx] = candidate;
  return { ok: true, status: 200, data: candidate };
}

// DELETE (D) - hard delete (remove do array)
function deleteItem(id) {
  const idx = db.items.findIndex(i => i.id === String(id));
  if (idx === -1) return { ok: false, status: 404, error: "Item não encontrado." };

  // Remoção eficiente preservando ordem: splice
  const [removed] = db.items.splice(idx, 1);
  return { ok: true, status: 200, data: removed };
}

// Variante: Soft Delete (marcar inativo) 
function softDeleteItem(id) {
  const item = db.items.find(i => i.id === String(id));
  if (!item) return { ok: false, status: 404, error: "Item não encontrado." };
  item.ativo = false;
  return { ok: true, status: 200, data: item };
}

// Reset útil para testes 
function resetDB() {
  db.items.length = 0; // length = 0 limpa o array
  db.nextId = 1;
}

// Exporta para plugar nas rotas depois 
export { db, createItem, readItems, readItemById, updateItem, deleteItem, softDeleteItem, resetDB };
