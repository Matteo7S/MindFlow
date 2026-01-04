
import { ExerciseConfig, ExerciseType } from './types';

export const FLUENCY_EXERCISES: ExerciseConfig[] = [
  {
    id: ExerciseType.PHONEMIC,
    title: 'Fluenza Fonemica',
    description: 'Parole che iniziano con una lettera specifica. Stimola l\'area frontale.',
    icon: '🔤',
    defaultTime: 60,
  },
  {
    id: ExerciseType.SEMANTIC,
    title: 'Fluenza Semantica',
    description: 'Parole per categoria semantica. Stimola il lobo temporale.',
    icon: '🐾',
    defaultTime: 60,
  },
  {
    id: ExerciseType.CHAIN_ASSOCIATION,
    title: 'Associazioni a Catena',
    description: 'Crea ponti logici tra parole consecutive.',
    icon: '🔗',
    defaultTime: 90,
  },
  {
    id: ExerciseType.SPIDER_ASSOCIATION,
    title: 'Il Ragno',
    description: 'Associazioni rapide attorno a un concetto centrale.',
    icon: '🕸️',
    defaultTime: 30,
  },
  {
    id: ExerciseType.PERIPHRASIS,
    title: 'Tecnica della Perifrasi',
    description: 'Descrivi oggetti evitando parole ovvie (stile Taboo).',
    icon: '🚫',
    defaultTime: 60,
  },
  {
    id: ExerciseType.FLASH_DESCRIPTION,
    title: 'Descrizione Flash',
    description: 'Stream of consciousness descrittivo di scene reali.',
    icon: '📸',
    defaultTime: 60,
  },
  {
    id: ExerciseType.SYNONYMS,
    title: 'Sinonimi al Volo',
    description: 'Evoluzione del registro linguistico in tempo reale.',
    icon: '✍️',
    defaultTime: 45,
  },
  {
    id: ExerciseType.SHADOWING,
    title: 'Shadowing',
    description: 'Ripetizione "a ombra" per plasticità neurale.',
    icon: '👥',
    defaultTime: 120,
  },
];

export const MNEMONIC_EXERCISES: ExerciseConfig[] = [
  {
    id: ExerciseType.MNEMONIC_NUMBERS_LEARN,
    title: '1. Apprendimento 1-0',
    description: 'Impara i suoni base della conversione fonetica Leibniz.',
    icon: '🕯️',
    defaultTime: 300,
    theory: `### Livello 1: I Fondamenti (1-0)
La conversione fonetica trasforma i numeri (astratti) in suoni consonantici (concreti).

**La Tabella di Riferimento:**
- **1 (T, D):** Una candela o sbarra. Suono dentale.
- **2 (N):** Due gambette verticali. Suono nasale.
- **3 (M):** Tre gambette (M ruotata).
- **4 (R):** La parola "quattRo". Suono vibrante.
- **5 (L):** Mano (5 dita) o L romana (50). Suono liquido.
- **6 (C/G dolci):** Il 6 in corsivo ha la pancia come una g.
- **7 (K/G dure):** Linee spigolose, pezzo della K.
- **8 (F/V):** Curve della f corsiva. Suono labio-dentale.
- **9 (P/B):** Speculare alla P o b rovesciata.
- **0 (S/Z):** Parola "Zero" o ruota sgonfia (Sssss).`
  },
  {
    id: ExerciseType.MNEMONIC_NUMBERS_PINGPONG,
    title: '2. Ping-Pong Mentale',
    description: 'Test riflessi rapidi: converti al volo numeri in suoni e viceversa.',
    icon: '🏓',
    defaultTime: 200,
    theory: `### Livello 2: Ping-Pong Mentale
Una volta imparati i suoni, devi renderli istantanei. Non devi "pensare", devi "vedere" il suono.

**L'esercizio:**
Il Tutor dirà un numero (es. "Cinque") e tu dovrai rispondere col suono ("L"). 
Poi invertirà: il Tutor dirà un suono (es. "R") e tu dirai il numero ("Quattro").
L'obiettivo è la velocità di esecuzione.`
  },
  {
    id: ExerciseType.MNEMONIC_NUMBERS_TARGHE,
    title: '3. Il Gioco delle Targhe',
    description: 'Crea parole P.A.V. da sequenze numeriche di 2, 3 e 4 cifre.',
    icon: '🚗',
    defaultTime: 400,
    theory: `### Livello 3: Creare Parole (Targhe)
Qui trasformiamo i suoni in immagini visualizzabili (P.A.V.: Paradosso, Azione, Vivido).

**Il Metodo:**
Prendi una sequenza (es. 35).
1. Estrai i suoni: 3=M, 5=L.
2. Inserisci vocali: MeLa, MuLo, MieLe.
3. Visualizza: Una MELA gigante che esplode.

**Progressione:**
Inizieremo con 2 cifre guidate, poi passeremo a 3 e 4 cifre per testare la tua creatività mnemonica.`
  },
  {
    id: ExerciseType.MNEMONIC_LOCI,
    title: 'Palazzo della Memoria',
    description: 'Usa lo spazio per ordinare le informazioni.',
    icon: '🏰',
    defaultTime: 400,
    theory: `### Il Palazzo della Memoria (Tecnica dei Loci)
Sfrutta la memoria spaziale (ippocampo) per ordinare i dati.

**Livello Base: Il Palazzo del Corpo**
Usa il tuo corpo come archivio. Esempio spesa: Baguette (sulla testa), Latte (dagli occhi), Batterie (nel naso). Tocca fisicamente le parti per richiamare i dati.

**Livello Intermedio: La Tua Stanza**
Definisci 10 punti fissi in senso orario (Letto, Comodino, Finestra...). Associa un'immagine bizzarra a ogni mobile.

**Livello Avanzato: Il Palazzo Virtuale**
Usa mappe di videogiochi, case di serie TV o Google Street View come archivi infiniti per materie diverse.`
  },
  {
    id: ExerciseType.MNEMONIC_NAMES,
    title: 'Nomi e Volti',
    description: 'Trasforma etichette astratte in immagini vive sul viso.',
    icon: '👤',
    defaultTime: 300,
    theory: `### Memorizzare Nomi e Volti
Rendi concreto un nome e "attaccalo" al viso.

**Livello Base: Osservazione Selettiva**
Trova un "difetto" o caratteristica unica (naso, orecchie, capelli). Costringiti a guardare davvero la persona.

**Livello Intermedio: Trasformazione del Nome**
Trova un sosia visivo per il nome. Marco -> Marco Polo; Silvia -> Selva; Luca -> Lucchetto.

**Livello Avanzato: Il "Link" sul Viso**
Unisci caratteristica fisica e immagine del nome con un'azione P.A.V. (Paradosso, Azione, Vivido).
Esempio: Luca (lucchetto) con naso a patata -> Un enorme lucchetto appeso al suo naso.`
  }
];

export const ALL_EXERCISES = [...FLUENCY_EXERCISES, ...MNEMONIC_EXERCISES];
