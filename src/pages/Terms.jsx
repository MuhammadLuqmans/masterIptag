// Terms.jsx
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

function Terms() {
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
      className="terms-wrapper"
      style={{ maxWidth: 800, margin: "0 auto", padding: "1rem" }}
    >
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
        <h1>Termini di Servizio di Reviu'</h1>
        <p>
          <strong>Ultimo aggiornamento:</strong> 25-09-2025
        </p>

        <p>
          Benvenuti su Reviu', un'applicazione che offre un servizio completo
          per la gestione dei feedback nelle attività, incluso rating,
          ottenimento monete, e giochi all'interno della web app utilizzando le
          monete guadagnate. Utilizzando la nostra applicazione, accettate i
          seguenti Termini di Servizio.
        </p>

        <h2>1. Accettazione dei Termini</h2>
        <p>
          Utilizzando Reviu' ("la web app"), l'utente dichiara di aver letto,
          compreso e accettato i presenti Termini di Servizio e la nostra
          Privacy Policy. Se non si accettano i termini, si prega di non
          utilizzare l'applicazione.
        </p>

        <h2>2. Licenza d'Uso</h2>
        <p>
          Concediamo all'utente una licenza limitata, non esclusiva, revocabile
          e non trasferibile per l'uso di Reviu'. Questa licenza è destinata
          esclusivamente all'uso personale e non commerciale, in conformità con
          questi Termini di Servizio.
        </p>

        <h2>3. Funzionalità dell'Applicazione</h2>
        <h3>3.1 Servizio Feedback</h3>
        <ul>
          <li>
            Inserimento a cadenza settimanale di un feedback per l'attività.
          </li>
          <li>
            Ogni feedback sarà condiviso esclusivamente con il proprietario
            dell'attività, senza pubblicazione pubblica.
          </li>
          <li>
            Scelta di rating non invasivo, l'utente potrà liberamente esprimere
            il proprio giudizio.
          </li>
          <li>
            La descrizione non è obbligatoria se il feedback è positivo; diventa invece obbligatoria se negativo.
          </li>
        </ul>

        <h3>3.2 Sistema di Guadagno Monete</h3>
        <ul>
          <li>
            Un utente, sia in caso di feedback negativo che positivo, otterrà
            una moneta.
          </li>
          <li>
            Ogni moneta potrà essere utilizzata solo ed esclusivamente
            nell'attività a cui è stato fornito il feedback.
          </li>
          <li>
            La moneta potrà essere utilizzata all'interno di una ruota della
            fortuna, che determina in modo pseudo-casuale vincite o perdite.
          </li>
          <li>
            Le monete rappresentano esclusivamente un sistema di punteggio
            interno all'app, senza alcun valore economico, legale o di credito
            reale.
          </li>
        </ul>

        <h3>3.3 Sistema di Ruota della Fortuna</h3>
        <ul>
          <li>
            La ruota della fortuna sceglie vincite e perdite in modo
            pseudo-casuale.
          </li>
          <li>
            Le vincite ottenute dalla ruota non sono convertibili in premi in
            denaro.
          </li>
          <li>
            Il gioco ha finalità esclusivamente ludiche e promozionali, non
            rappresenta gioco d'azzardo e non richiede alcuna autorizzazione.
          </li>
        </ul>

        <h3>3.4 Autenticazione e Account</h3>
        <ul>
          <li>
            Registrazione anonima automatica per abilitare l'invio di
            segnalazioni e feedback.
          </li>
          <li>Gestione dell'identità utente tramite Firebase.</li>
        </ul>

        <h2>4. Uso Accettabile e Restrizioni</h2>
        <h3>4.1 Uso Consentito</h3>
        <ul>
          <li>
            Gli utenti possono utilizzare la web app per:
            <ul>
              <li>
                Guadagnare punti spendibili all'interno della web app per
                tentare di vincere sconti dell'attività stessa.
              </li>
              <li>Inviare feedback costruttivi, veritieri e rispettosi.</li>
            </ul>
          </li>
        </ul>

        <h3>4.2 Uso Vietato</h3>
        <ul>
          <li>
            Gli utenti NON devono:
            <ul>
              <li>
                Utilizzare l'applicazione in modi illeciti, dannosi o
                fraudolenti.
              </li>
              <li>
                Inviare feedback falsi, offensivi, diffamatori o inappropriati.
              </li>
              <li>
                Copiare, modificare, distribuire, vendere o sfruttare in altro
                modo il software o i contenuti dell'app senza autorizzazione.
              </li>
              <li>
                Tentare di interferire con il funzionamento dell'app o accedere
                a sistemi non autorizzati.
              </li>
              <li>
                Violare i diritti di proprietà intellettuale o utilizzare dati
                personali di terzi senza consenso.
              </li>
              <li>
                Utilizzare l'app per attività commerciali non autorizzate o
                manipolare il sistema di feedback o monetizzazione.
              </li>
            </ul>
          </li>
        </ul>

        <h2>5. Servizi di Terze Parti</h2>
        <p>
          L'app utilizza diversi servizi di terze parti, ciascuno soggetto ai
          rispettivi Termini di Servizio:
        </p>
        <ul>
          <li>
            Firebase (Google): Autenticazione anonima, database, storage,
            sicurezza.
          </li>
          <li>Firebase App Check: Verifica sicurezza app.</li>
        </ul>
        <p>
          L'uso di questi servizi è soggetto ai loro rispettivi termini e
          privacy policy. Reviu' non è responsabile per le pratiche di questi
          fornitori di servizi.
        </p>

        <h2>6. Contenuto Generato dagli Utenti</h2>
        <h3>6.1 Segnalazioni e Feedback</h3>
        <p>Inviando segnalazioni o feedback tramite la web app, l'utente:</p>
        <ul>
          <li>
            Garantisce che il contenuto è veritiero e non viola alcuna legge o
            diritto di terzi.
          </li>
          <li>
            Concede all'attività interessata il diritto di utilizzare il
            contenuto per migliorare il servizio.
          </li>
          <li>
            Mantiene la responsabilità legale per il contenuto inviato,
            sollevando Reviu' da ogni responsabilità.
          </li>
        </ul>

        <h2>7. Privacy e Protezione Dati</h2>
        <p>
          L'uso della web app è soggetto alla nostra Privacy Policy, che
          descrive come raccogliamo, utilizziamo e proteggiamo i vostri dati. Vi
          invitiamo a leggerla attentamente.
        </p>

        <h2>8. Limitazioni di Responsabilità</h2>
        <h3>8.1 Disclaimer Generale</h3>
        <p>
          Non garantiamo vincite sicure; la web app è progettata per scegliere
          in modo pseudo-casuale i vincitori.
        </p>
        <h3>8.2 Esclusione di Responsabilità</h3>
        <p>Reviu' non sarà responsabile per:</p>
        <ul>
          <li>
            Danni diretti, indiretti, incidentali, consequenziali o punitivi
            derivanti dall'uso o incapacità di usare l'app.
          </li>
          <li>
            Interruzioni del servizio, errori, malfunzionamenti o perdite di
            dati.
          </li>
          <li>Contenuti generati dagli utenti o attività di terze parti.</li>
          <li>
            Qualsiasi altro danno risultante dall'uso improprio o non
            autorizzato dell'app.
          </li>
        </ul>
        <p>
          L'uso della web app avviene a rischio e responsabilità esclusiva
          dell'utente.
        </p>

        <h2>9. Modifiche al Servizio e ai Termini</h2>
        <h3>9.1 Modifiche al Servizio</h3>
        <p>Ci riserviamo il diritto di:</p>
        <ul>
          <li>
            Modificare, sospendere o interrompere la web app o le sue
            funzionalità in qualsiasi momento.
          </li>
          <li>
            Cambiare le modalità di autenticazione o introdurre nuove
            funzionalità.
          </li>
        </ul>

        <h3>9.2 Modifiche ai Termini</h3>
        <p>
          Possiamo aggiornare questi termini periodicamente. Le modifiche
          significative saranno comunicate con almeno 30 giorni di anticipo
          tramite email o notifica all'interno dell'app.
        </p>
        <p>
          L'uso continuato dell'app dopo le modifiche costituisce accettazione
          dei nuovi termini.
        </p>

        <h2>10. Risoluzione e Sospensione</h2>
        <p>
          Ci riserviamo il diritto di sospendere o terminare l'accesso all'app
          per utenti che:
        </p>
        <ul>
          <li>Violano questi Termini di Servizio.</li>
          <li>Inviare contenuti inappropriati, offensivi o dannosi.</li>
          <li>Utilizzano la web app in modo abusivo o fraudolento.</li>
          <li>Compromettono la sicurezza del servizio.</li>
        </ul>

        <h2>11. Proprietà Intellettuale</h2>
        <p>
          Tutti i diritti di proprietà intellettuale relativi all'app, inclusi
          design, codice, contenuti e marchi, appartengono a Reviu' o ai
          rispettivi titolari licenzianti.
        </p>

        <h2>12. Legge Applicabile e Risoluzione Controversie</h2>
        <h3>12.1 Legge Applicabile</h3>
        <p>Questi Termini sono disciplinati dalle leggi italiane.</p>
        <h3>12.2 Risoluzione Alternativa</h3>
        <p>
          Incoraggiamo la risoluzione amichevole delle controversie tramite
          contatto diretto prima di intraprendere azioni legali.
        </p>

        <h2>13. Disposizioni Generali</h2>
        <h3>13.1 Separabilità</h3>
        <p>
          Se una parte di questi termini viene dichiarata non valida, le
          restanti rimangono valide.
        </p>
        <h3>13.2 Rinuncia</h3>
        <p>
          La mancata applicazione di una disposizione non costituisce rinuncia
          al diritto di applicarla successivamente.
        </p>
        <h3>13.3 Intero Accordo</h3>
        <p>
          Questi Termini di Servizio e la Privacy Policy costituiscono l'intero
          accordo tra le parti; eventuali modifiche devono essere concordate per
          iscritto e firmate da entrambe le parti.”
        </p>

        <h2>14. Contatti e Supporto</h2>
        <p>
          Per domande sui Termini di Servizio, supporto tecnico o segnalazioni:
        </p>
        <p>Email: info@reviu.it</p>

        <p>Grazie per aver scelto Reviu'!</p>
      </div>
    </div>
  );
}

export default Terms;
