
# 🧠 MindFlow - Verbal Fluency & Mnemonics Master

MindFlow è un'applicazione web avanzata progettata per il potenziamento cognitivo, focalizzata sulla **fluenza verbale** e sull'apprendimento delle **mnemotecniche** professionali. L'app utilizza l'intelligenza artificiale (Google Gemini) per fungere da tutor interattivo vocale.

## 🚀 Funzionalità Principali

### 1. Modulo Fluenza Verbale
Esercizi rapidi per migliorare l'accesso lessicale e la plasticità neurale:
- **Fluenza Fonemica e Semantica**: Generazione di parole per lettera o categoria.
- **Associazioni a Catena**: Creazione di ponti logici tra concetti.
- **Tecnica della Perifrasi**: Descrizione di oggetti senza usare parole chiave.
- **Shadowing**: Ripetizione in tempo reale per migliorare il ritmo linguistico.

### 2. Modulo Mnemotecniche (Conversione Fonetica)
Un percorso guidato in 3 livelli per padroneggiare la tecnica di Leibniz:
- **Apprendimento Base**: Memorizzazione dei suoni associati ai numeri 1-0 con supporto visivo.
- **Ping-Pong Mentale**: Sfida di riflessi vocali tra numeri e suoni per automatizzare la conversione.
- **Il Gioco delle Targhe**: Trasformazione di sequenze numeriche (2, 3, 4 cifre) in immagini vive e parole P.A.V. (Paradosso, Azione, Vivido).

## 🛠️ Tecnologie Utilizzate
- **React 19** (con hooks avanzati e gestione dei riferimenti).
- **Tailwind CSS**: Design moderno, responsivo e orientato alla UX "Aesthetic".
- **Google Gemini API**: 
  - `gemini-3-flash`: Per la logica del tutor e la valutazione cognitiva.
  - `gemini-2.5-flash-preview-tts`: Per la sintesi vocale del coach.
- **Web Speech API**: Per il riconoscimento vocale dell'utente.

## 📦 Installazione e Setup

1. Clona il repository:
   ```bash
   git clone https://github.com/TUO_USERNAME/MindFlow.git
   ```
2. Configura la tua API Key di Gemini come variabile d'ambiente (`API_KEY`).
3. Apri `index.html` in un browser moderno (si consiglia l'uso di un server locale come VS Code Live Server).

## 🔒 Sicurezza
L'app richiede l'accesso al **microfono** per gli esercizi interattivi. La chiave API deve essere gestita tramite variabili d'ambiente per evitare l'esposizione in ambienti di produzione pubblici.

---
Sviluppato con ❤️ per l'apprendimento accelerato.
