// Uso: node strumenti/impronta-password.mjs "password"
// Stampa l'impronta (hash) da salvare nella colonna utenti.password_hash, ad esempio per creare un nuovo accesso di gestione.
import { impronta, verificaPassword } from '../functions/_lib/accessi.js';
const h = await impronta(process.argv[2]);
if (!(await verificaPassword(process.argv[2], h))) throw new Error('verifica fallita');
console.log(h);
