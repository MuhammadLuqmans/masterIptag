import { motion } from 'framer-motion';

// Dati fittizi per le recensioni
const fakeReviews = [
  { text: "Esperienza d'uso fluida e intuitiva. Veramente un ottimo lavoro!", name: "Marco G.", initials: "MG" },
  { text: "Mi piace il design pulito e moderno, è un piacere navigare sul sito.", name: "Anna F.", initials: "AF" },
  { text: "Velocità e reattività eccezionali. Non ho riscontrato nessun problema.", name: "Luca B.", initials: "LB" },
  { text: "Un'interfaccia utente ben pensata. Ogni funzione è al posto giusto.", name: "Chiara M.", initials: "CM" },
  { text: "Le animazioni sono un tocco di classe, rendono l'esperienza più dinamica.", name: "Roberto S.", initials: "RS" },
  { text: "Ho trovato tutto quello che cercavo in pochi clic, la UX è perfetta.", name: "Giulia P.", initials: "GP" },
  { text: "Semplice, efficace e visivamente accattivante. Complimenti!", name: "Andrea V.", initials: "AV" },
  { text: "La migliore UX che abbia mai provato. Semplice da capire per chiunque.", name: "Elena T.", initials: "ET" },
];

// Funzione per generare un valore casuale
const getRandomValue = (min, max) => Math.random() * (max - min) + min;

// Componente per la singola card di recensione
const ReviewCard = ({ review, delay }) => {
  const top = getRandomValue(10, 80);
  const left = getRandomValue(10, 80);
  const rotation = getRandomValue(-10, 10) + 'deg';

  return (
    <motion.div
              className={`
                absolute
                top-[${top}%]
                left-[${left}%]
                transform
                -translate-x-1/2
                -translate-y-1/2
                -rotate-6
                w-[270px]
                h-20
                rounded-xl
                bg-accent-500
                bg-opacity-20
                shadow-lg
                z-10
                flex
                items-center
                justify-start
                text-primary-900
                border-2
                border-accent-500
                border-opacity-50
                px-4
                gap-3
                backdrop-blur-sm
                transition-all
                duration-300
                sm:-rotate-11
                sm:left-[${left}%]
                md:left-[${left}%]
              `}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: delay }}
            >
              <div className="w-12 h-12 rounded-full bg-secondary-500 flex items-center justify-center flex-shrink-0 relative">
                <img
                  src="/profile-picture.jpg"
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => {
                    e.target.classList.add("hidden");
                    e.target.nextSibling.classList.remove("hidden");
                  }}
                />
                <div className="w-full h-full hidden absolute top-0 left-0 rounded-full items-center justify-center bg-gradient-to-tr from-warning-500 to-destructive-500 text-secondary-500 font-semibold text-lg">
                  RL
                </div>
                <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-accent-500 border-2 border-secondary-500"></div>
              </div>
              <div className="flex flex-col justify-center">
                <div className="text-sm font-light text-primary-600 leading-tight">{review.name}</div>
                <div className="text-base font-bold text-primary-900 leading-snug">{review.text}</div>
              </div>
            </motion.div>
  );
};

// Componente carosello principale
const SpacedReviews = () => {
  return (
    <div className="
      relative
      w-full
      h-full
      min-h-[600px]
      overflow-hidden
    ">
      {fakeReviews.map((review, index) => (
        <ReviewCard key={index} review={review} delay={index * 0.2} />
      ))}
    </div>
  );
};

export default SpacedReviews;