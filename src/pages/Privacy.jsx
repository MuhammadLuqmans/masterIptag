// Privacy.jsx
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Privacy() {
  const location = useLocation();
  const navigate = useNavigate();
  const placeId = location.state?.placeId;

  const handleBackClick = (e) => {
    e.preventDefault();
    if (placeId) {
      navigate(`/login/${placeId}`);
    } else {
      navigate("/login");
    }
  };

  return (
    <div
      className="privacy-wrapper"
      style={{ maxWidth: 800, margin: "0 auto", padding: "1rem" }}
    >
      {/* Freccia senza gambo per tornare indietro */}
      <div style={{ textAlign: "left", marginBottom: "1rem" }}>
        <a href="#" onClick={handleBackClick} aria-label="Torna indietro">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            stroke="#FF0054"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ cursor: "pointer" }}
          >
            <path d="M20 6L10 16L20 26" />
          </svg>
        </a>
      </div>

      <div
        className="scrollable-content"
        style={{ maxHeight: "80vh", overflowY: "auto" }}
      >
        <h1>Privacy Policy di Reviu'</h1>
        <p>
          <strong>Ultimo aggiornamento:</strong> 28-11-2025
        </p>

        <h2>1. Tipologia di Dati Raccolti</h2>
        <h3>1.1 Dati di Autenticazione</h3>
        <ul>
          <li>
            Utilizziamo Firebase Authentication per l'autenticazione anonima
            degli utenti
          </li>
          <li>
            Generiamo e conserviamo un identificativo utente unico (UID) e
            l'username impostato su Google per ogni dispositivo
          </li>
        </ul>

        <h3>1.2 Dati dei Feedback</h3>
        <ul>
          <li>Quando invii un feedback (negativo o positivo), conserviamo:</li>
          <ul>
            <li>Il contenuto del feedback</li>
            <li>Timestamp del feedback</li>
            <li>Il tuo identificativo utente anonimo</li>
            <li>L'username impostato su Google</li>
          </ul>
        </ul>

        <h2>2. Come Utilizziamo i Tuoi Dati</h2>
        <h3>2.1 Fornitura del Servizio</h3>
        <ul>
          <li>Visualizzare il tuo Username e le tue coins.</li>
          <li>
            Le coins rappresentano esclusivamente un sistema di punteggio
            interno all'app, senza alcun valore economico, legale o di credito
            reale.
          </li>
          <li>Permetterti di inviare feedback per le attività.</li>
        </ul>

        <h3>2.2 Miglioramento del Servizio</h3>
        <ul>
          <li>Identificare e risolvere problemi tecnici dell'app</li>
          <li>Aggiornare e mantenere la qualità dei dati</li>
        </ul>

        <h3>2.3 Comunicazioni</h3>
        <ul>
          <li>Rispondere alle tue segnalazioni quando necessario</li>
        </ul>

        <h2>3. Condivisione dei Dati</h2>
        <h3>3.1 Non Vendiamo i Tuoi Dati</h3>
        <p>
          Non vendiamo, affittiamo o scambiamo i tuoi dati personali con terze
          parti per scopi commerciali.
        </p>

        <h3>3.2 Servizi di Terze Parti Utilizzati</h3>
        <p>
          L'app utilizza i seguenti servizi di terze parti che potrebbero
          raccogliere dati:
        </p>
        <ul>
          <li>Firebase (Google): Autenticazione anonima, database, hosting</li>
          <li>Firebase App Check: Verifica sicurezza app</li>
        </ul>
        <p>
          Ogni servizio di terze parti ha la propria privacy policy che ti
          invitiamo a consultare.
        </p>

        <h2>4. Conservazione dei Dati</h2>
        <h3>4.1 Durata di Conservazione</h3>
        <ul>
          <li>
            Dati dei feedback: conservati finché necessari per migliorare il
            servizio, nel rispetto del principio di minimizzazione dei dati del
            GDPR
          </li>
          <li>
            Dati di autenticazione: conservati fino alla richiesta di
            cancellazione
          </li>
        </ul>

        <h3>4.2 Cancellazione Dati e Diritto all'Oblio</h3>
        <p>
          Puoi richiedere la cancellazione completa dei tuoi dati in qualsiasi
          momento inviando una email a{" "}
          <a href="mailto:info@reviu.it">info@reviu.it</a> con oggetto
          "Richiesta Cancellazione Dati GDPR".
        </p>
        <p>Nella richiesta devi includere:</p>
        <ul>
          <li>Il motivo della richiesta di cancellazione</li>
          <li>
            Qualsiasi informazione che ci aiuti a identificare i tuoi dati (es.
            periodo di utilizzo dell'app, tipo di feedback inviati)
          </li>
        </ul>
        <p>Una volta ricevuta la richiesta:</p>
        <ul>
          <li>
            Procederemo alla cancellazione completa entro 30 giorni (come
            previsto dal GDPR)
          </li>
          <li>Ti invieremo conferma dell'avvenuta cancellazione</li>
        </ul>
        <p>La cancellazione includerà:</p>
        <ul>
          <li>Eliminazione dell'identificativo associato al feedback</li>
          <li>
            Cancellazione del tuo account Firebase (Username, E-mail, Coins). Si
            precisa che le coins sono un dato relativo al sistema di punteggio
            interno e non rappresentano valore economico o legale.
          </li>
        </ul>
        <p>
          <strong>Nota:</strong> Alcuni dati potrebbero rimanere in forma
          anonima e aggregata per scopi statistici, senza alcun collegamento
          alla tua identità.
        </p>

        <h2>5. I Tuoi Diritti (GDPR)</h2>
        <p>Hai diritto a:</p>
        <ul>
          <li>
            <strong>Accesso:</strong> Richiedere una copia di tutti i tuoi dati
            personali
          </li>
          <li>
            <strong>Rettifica:</strong> Correggere dati inesatti o incompleti
          </li>
          <li>
            <strong>Cancellazione:</strong> Richiedere la cancellazione completa
            dei tuoi dati ("diritto all'oblio")
          </li>
          <li>
            <strong>Limitazione:</strong> Limitare il trattamento dei tuoi dati
          </li>
          <li>
            <strong>Portabilità:</strong> Ottenere i tuoi dati in formato
            leggibile
          </li>
          <li>
            <strong>Opposizione:</strong> Opporti al trattamento dei tuoi dati
          </li>
          <li>
            <strong>Revoca consenso:</strong> Revocare il consenso in qualsiasi
            momento
          </li>
        </ul>
        <p>
          Per esercitare questi diritti, invia una email a{" "}
          <a href="mailto:info@reviu.it">info@reviu.it</a> specificando
          chiaramente quale diritto vuoi esercitare. Per la cancellazione dati,
          segui la procedura dettagliata nella sezione 4.2.
        </p>

        <h2>6. Sicurezza dei Dati</h2>
        <p>
          Implementiamo misure di sicurezza appropriate per proteggere i tuoi
          dati:
        </p>
        <ul>
          <li>Crittografia dei dati in transito e a riposo</li>
          <li>Autenticazione sicura tramite Firebase</li>
          <li>Controlli di accesso ai server</li>
          <li>Monitoraggio della sicurezza</li>
        </ul>

        <h2>7. Privacy dei Minori</h2>
        <p>
          La webapp non è destinata a minori di 13 anni. Non raccogliamo
          consapevolmente dati di minori. Se vieni a conoscenza che un minore ha
          fornito dati, contattaci immediatamente.
        </p>
      </div>
    </div>
  );
}

export default Privacy;
