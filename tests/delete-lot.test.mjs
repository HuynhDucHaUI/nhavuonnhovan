import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

// Exercise the exact statements used by the action against SQLite with FKs on.
const source = readFileSync(new URL('../app/admin/lots/actions.ts', import.meta.url), 'utf8');
const statements = [...source.matchAll(/env\.DB\.prepare\(`(DELETE FROM inventory_(?:movements|lots)[^`]+)`\)/g)].map((match) => match[1]);
assert.equal(statements.length, 2);
function setup() {
  const db = new DatabaseSync(':memory:');
  db.exec(`PRAGMA foreign_keys=ON;
    CREATE TABLE inventory_lots (id INTEGER PRIMARY KEY, initial_quantity INTEGER, quantity_remaining INTEGER, created_at TEXT);
    CREATE TABLE inventory_movements (id INTEGER PRIMARY KEY, lot_id INTEGER REFERENCES inventory_lots(id) ON DELETE RESTRICT, type TEXT, quantity INTEGER, note TEXT, created_at TEXT);
    INSERT INTO inventory_lots VALUES (5,55,55,'2026-01-01');`);
  return db;
}
function movement(db, type = 'in', quantity = 55, note = 'Tạo lô mới', created = '2026-01-01') {
  db.prepare('INSERT INTO inventory_movements (lot_id,type,quantity,note,created_at) VALUES (5,?,?,?,?)').run(type, quantity, note, created);
}
function remove(db, id = 5) {
  db.exec('BEGIN');
  try {
    db.prepare(statements[0]).run(id, 'Tạo lô mới', id, id);
    const result = db.prepare(statements[1]).run(id, id);
    db.exec('COMMIT');
    return result.changes;
  } catch (error) { db.exec('ROLLBACK'); throw error; }
}
function counts(db) { return [db.prepare('SELECT count(*) AS n FROM inventory_lots').get().n, db.prepare('SELECT count(*) AS n FROM inventory_movements').get().n]; }

test('deletes a new lot and its initial movement', () => { const db = setup(); movement(db); assert.equal(remove(db), 1); assert.deepEqual(counts(db), [0, 0]); });
test('deletes a lot without movements', () => { const db = setup(); assert.equal(remove(db), 1); assert.deepEqual(counts(db), [0, 0]); });
for (const [name, type, qty, note, date] of [
  ['sale', 'sale', -1, '', '2026-01-02'],
  ['additional stock with misleading note', 'in', 55, 'Tạo lô mới', '2026-01-02'],
  ['adjustment', 'adjust', 1, '', '2026-01-02'],
]) test(`preserves lot and history after ${name}`, () => { const db = setup(); movement(db); movement(db, type, qty, note, date); assert.equal(remove(db), 0); assert.deepEqual(counts(db), [1, 2]); });
test('does not mistake a single unrelated movement for initial stock', () => { const db = setup(); movement(db, 'sale', 55); assert.equal(remove(db), 0); assert.deepEqual(counts(db), [1, 1]); });
test('preserves inconsistent stock even with initial movement', () => { const db = setup(); movement(db); db.exec('UPDATE inventory_lots SET quantity_remaining=54'); assert.equal(remove(db), 0); assert.deepEqual(counts(db), [1, 1]); });
test('rolls back initial movement deletion if another foreign key blocks the lot', () => { const db = setup(); movement(db); db.exec('CREATE TABLE other (lot_id INTEGER REFERENCES inventory_lots(id)); INSERT INTO other VALUES (5)'); assert.throws(() => remove(db)); assert.deepEqual(counts(db), [1, 1]); });
test('missing lot does not alter data', () => { const db = setup(); movement(db); assert.equal(remove(db, 99), 0); assert.deepEqual(counts(db), [1, 1]); });
