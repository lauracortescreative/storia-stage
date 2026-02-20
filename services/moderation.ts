
// Comprehensive moderation categories for children's app in English, Spanish, French, and Portuguese
export const MODERATION_PATTERNS = {
  violence: [
    "kill", "murder", "blood", "death", "die", "stab", "shoot", "gun", "war", "fight", "deadly", "corpse", "slaughter", "execution", "suicide",
    "matar", "asesinato", "sangre", "muerte", "morir", "apuñalar", "disparar", "pistola", "guerra", "pelear", "mortal", "cadáver", "matanza", "ejecución", "suicidio",
    "tuer", "meurtre", "sang", "mort", "mourir", "poignarder", "tirer", "pistolet", "guerre", "battre", "mortel", "cadavre", "massacre", "exécution",
    "assassinato", "esfaquear", "atirar", "lutar", "chacina", "morreu"
  ],
  obscenity: [
    "fuck", "shit", "bitch", "cunt", "dick", "pussy", "asshole", "porn", "sexy", "nude", "naked", "sex", "bastard",
    "mierda", "puta", "coño", "polla", "verga", "pendejo", "porno", "desnudo", "sexo", "bastardo", "culiao", "concha",
    "merde", "putain", "con", "salope", "bite", "chatte", "porno", "nu", "sexe", "bâtard", "foutre",
    "porra", "caralho", "bucet", "pau", "cu", "transar", "safado", "merda", "cacete", "foda", "foder", "buceta",
    "pila", "vagina", "cabrao", "cabrão", "cona", "pilinha", "colhoes", "colhões", "pipi", "penis", "pênis",
    "parvo", "parva", "estupido", "estupida", "estúpido", "estúpida", "idiota", "imbecil", "burro", "burra", 
    "anormal", "otario", "otaria", "otário", "otária", "babaca", "escroto", "asno", "palhaço", "palhaça", "palhaco", "palhaca",
    "ass", "stupid", "idiot", "dumb", "dummy", "loser", "jerk", "moron", "imbecile", "fat", "ugly", "freak", "weirdo", "crap", "piss", "slut", "whore", "skank", "dickhead", "shithead"
  ],
  hate: [
    "nigger", "faggot", "racist", "nazi", "hitler", "hate", "terrorist", "discrimination", "retard",
    "racista", "nazi", "odio", "terrorista", "discriminación",
    "raciste", "nazi", "haine", "terroriste", "discrimination",
    "ódio", "discriminação", "odiar"
  ],
  inappropriate: [
    "alcohol", "drug", "weed", "cocaine", "heroin", "smoke", "cigarette", "beer", "wine", "vodka", "gamble", "casino",
    "droga", "cocaína", "heroína", "fumar", "cigarrillo", "cerveza", "vino", "apostar",
    "alcool", "drogue", "cocaïne", "héroïne", "fumer", "cigarette", "bière", "vin", "parier",
    "álcool", "cigarro", "cerveja", "vinho", "cassino", "beber", "bêbado"
  ]
};

const ALL_UNSAFE_WORDS = Array.from(new Set(Object.values(MODERATION_PATTERNS).flat()));

/**
 * Checks if a piece of text contains any unsafe words in supported languages.
 * Handles normalization (accents), whole-word matching, and basic obfuscation.
 */
export function checkSafety(text: string): string | undefined {
  if (!text) return undefined;
  
  // 1. Normalize text: lowercase, remove accents, and remove common punctuation for bypass checks
  const lowerText = text.toLowerCase();
  const normalizedText = lowerText.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  // Cleaned text removes dots, dashes, and extra spaces to catch "m.e.r.d.a"
  const ultraCleanedText = normalizedText.replace(/[^a-z0-9]/g, "");

  return ALL_UNSAFE_WORDS.find(word => {
    const normalizedWord = word.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    // Check 1: Direct word boundary match (whole words only)
    // This catches "ass" but not "glass" or "class"
    const wordRegex = new RegExp(`\\b${word}\\b`, 'i');
    if (wordRegex.test(lowerText)) return true;

    // Check 2: Normalized word boundary match (catches "miérda")
    const normWordRegex = new RegExp(`\\b${normalizedWord}\\b`, 'i');
    if (normWordRegex.test(normalizedText)) return true;

    // Check 3: Catch simple obfuscation (e.g., "m e r d a" or "m.e.r.d.a")
    // Only apply to words longer than 3 characters to avoid false positives (like "ass" in "glass" or "burro" in "burrow")
    if (normalizedWord.length > 3 && ultraCleanedText.includes(normalizedWord)) {
      return true;
    }

    return false;
  });
}
