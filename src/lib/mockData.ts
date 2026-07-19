// src/lib/mockData.ts
import type { Question } from "./types";

const now = new Date().toISOString();

function q(partial: Omit<Question, "createdAt" | "updatedAt" | "isActive"> & { isActive?: boolean }): Question {
  return { isActive: true, createdAt: now, updatedAt: now, ...partial };
}

/** 32 seed questions — 8 per category. Used in mock mode and mirrored in supabase/seed.sql. */
export const SEED_QUESTIONS: Question[] = [
  // ── Quiz Challenge ────────────────────────────────────────────────
  q({
    id: "quiz-1",
    category: "quiz",
    questionText: "Who is known as the chief architect of the Indian Constitution?",
    options: ["Jawaharlal Nehru", "Dr. B. R. Ambedkar", "Sardar Vallabhbhai Patel", "Rajendra Prasad"],
    correctAnswer: "Dr. B. R. Ambedkar",
    explanation: "Dr. B. R. Ambedkar chaired the Drafting Committee of the Constituent Assembly.",
  }),
  q({
    id: "quiz-2",
    category: "quiz",
    questionText: "The Indian Constitution came into effect on which date?",
    options: ["15 August 1947", "26 January 1950", "26 November 1949", "2 October 1948"],
    correctAnswer: "26 January 1950",
    explanation: "It was adopted on 26 November 1949 and came into force on 26 January 1950 — celebrated as Republic Day.",
  }),
  q({
    id: "quiz-3",
    category: "quiz",
    questionText: "Who led the Salt March to Dandi in 1930?",
    options: ["Subhas Chandra Bose", "Bhagat Singh", "Mahatma Gandhi", "Lala Lajpat Rai"],
    correctAnswer: "Mahatma Gandhi",
    explanation: "The 240-mile march protested the British salt tax and sparked nationwide civil disobedience.",
  }),
  q({
    id: "quiz-4",
    category: "quiz",
    questionText: "\"A leader is one who knows the way, goes the way, and shows the way.\" Who said this?",
    options: ["John C. Maxwell", "Nelson Mandela", "Winston Churchill", "Simon Sinek"],
    correctAnswer: "John C. Maxwell",
    explanation: "John C. Maxwell is an author known for his books on leadership.",
  }),
  q({
    id: "quiz-5",
    category: "quiz",
    questionText: "Who was the first woman Prime Minister of India?",
    options: ["Sarojini Naidu", "Indira Gandhi", "Sucheta Kripalani", "Vijaya Lakshmi Pandit"],
    correctAnswer: "Indira Gandhi",
    explanation: "Indira Gandhi became Prime Minister in 1966.",
  }),
  q({
    id: "quiz-6",
    category: "quiz",
    questionText: "Nelson Mandela spent 27 years in prison before leading which country?",
    options: ["Kenya", "Ghana", "South Africa", "Nigeria"],
    correctAnswer: "South Africa",
    explanation: "Mandela became South Africa's first democratically elected president in 1994.",
  }),
  q({
    id: "quiz-7",
    category: "quiz",
    questionText: "Which fundamental right is called the \"heart and soul\" of the Indian Constitution?",
    options: ["Right to Equality", "Right to Freedom", "Right to Constitutional Remedies", "Right against Exploitation"],
    correctAnswer: "Right to Constitutional Remedies",
    explanation: "Dr. Ambedkar described Article 32 as the heart and soul of the Constitution.",
  }),
  q({
    id: "quiz-8",
    category: "quiz",
    questionText: "\"Be the change you wish to see in the world\" is popularly attributed to whom?",
    options: ["Rabindranath Tagore", "Mahatma Gandhi", "Swami Vivekananda", "APJ Abdul Kalam"],
    correctAnswer: "Mahatma Gandhi",
    explanation: "Widely attributed to Gandhi, it captures his philosophy of personal responsibility.",
  }),

  // ── Guess the Leader ──────────────────────────────────────────────
  q({
    id: "leader-1",
    category: "guess_leader",
    questionText: "Who is this?",
    imageUrl: "",
    options: ["Dr. APJ Abdul Kalam", "C. V. Raman", "Homi Bhabha", "Vikram Sarabhai"],
    correctAnswer: "Dr. APJ Abdul Kalam",
    explanation: "The 'Missile Man of India' and 11th President, beloved for inspiring students.",
  }),
  q({
    id: "leader-2",
    category: "guess_leader",
    questionText: "Who is this?",
    imageUrl: "",
    options: ["Kiran Bedi", "Indra Nooyi", "Sudha Murty", "Falguni Nayar"],
    correctAnswer: "Sudha Murty",
    explanation: "Author, philanthropist, and founding trustee of the Infosys Foundation.",
  }),
  q({
    id: "leader-3",
    category: "guess_leader",
    questionText: "Who is this?",
    imageUrl: "",
    options: ["Ratan Tata", "Narayana Murthy", "Azim Premji", "Dhirubhai Ambani"],
    correctAnswer: "Ratan Tata",
    explanation: "Industrialist and philanthropist who led the Tata Group for over two decades.",
  }),
  q({
    id: "leader-4",
    category: "guess_leader",
    questionText: "Who is this?",
    imageUrl: "",
    options: ["Rosa Parks", "Malala Yousafzai", "Greta Thunberg", "Kamala Harris"],
    correctAnswer: "Malala Yousafzai",
    explanation: "The youngest Nobel Peace Prize laureate, an advocate for girls' education.",
  }),
  q({
    id: "leader-5",
    category: "guess_leader",
    questionText: "Who is this?",
    imageUrl: "",
    options: ["Sardar Vallabhbhai Patel", "Jawaharlal Nehru", "Rajendra Prasad", "Lal Bahadur Shastri"],
    correctAnswer: "Sardar Vallabhbhai Patel",
    explanation: "The 'Iron Man of India' who unified over 560 princely states.",
  }),
  q({
    id: "leader-6",
    category: "guess_leader",
    questionText: "Who is this?",
    imageUrl: "",
    options: ["Mother Teresa", "Sarojini Naidu", "Annie Besant", "Kasturba Gandhi"],
    correctAnswer: "Mother Teresa",
    explanation: "Founder of the Missionaries of Charity, Nobel Peace Prize laureate 1979.",
  }),
  q({
    id: "leader-7",
    category: "guess_leader",
    questionText: "Who is this?",
    imageUrl: "",
    options: ["Mary Kom", "P. V. Sindhu", "Saina Nehwal", "Mithali Raj"],
    correctAnswer: "Mary Kom",
    explanation: "Six-time world champion boxer and Olympic medallist from Manipur.",
  }),
  q({
    id: "leader-8",
    category: "guess_leader",
    questionText: "Who is this?",
    imageUrl: "",
    options: ["Nelson Mandela", "Martin Luther King Jr.", "Desmond Tutu", "Kofi Annan"],
    correctAnswer: "Nelson Mandela",
    explanation: "Anti-apartheid leader and South Africa's first democratically elected president.",
  }),

  // ── Match the Pair ────────────────────────────────────────────────
  q({
    id: "match-1",
    category: "match_pair",
    questionText: "Match each leader with their achievement.",
    pairs: [
      { left: "Dr. B. R. Ambedkar", right: "Chief architect of the Indian Constitution" },
      { left: "Mother Teresa", right: "Founded the Missionaries of Charity" },
      { left: "Dr. APJ Abdul Kalam", right: "Led India's missile development programme" },
      { left: "Sardar Patel", right: "Unified the princely states of India" },
    ],
  }),
  q({
    id: "match-2",
    category: "match_pair",
    questionText: "Match each leader with their movement or milestone.",
    pairs: [
      { left: "Mahatma Gandhi", right: "Salt March to Dandi" },
      { left: "Nelson Mandela", right: "Ended apartheid in South Africa" },
      { left: "Martin Luther King Jr.", right: "\"I Have a Dream\" speech" },
      { left: "Malala Yousafzai", right: "Youngest Nobel Peace Prize laureate" },
    ],
  }),
  q({
    id: "match-3",
    category: "match_pair",
    questionText: "Match each Indian pioneer with their field.",
    pairs: [
      { left: "C. V. Raman", right: "Nobel Prize in Physics" },
      { left: "Vikram Sarabhai", right: "Father of the Indian space programme" },
      { left: "Verghese Kurien", right: "The White Revolution (Operation Flood)" },
      { left: "M. S. Swaminathan", right: "The Green Revolution in India" },
    ],
  }),
  q({
    id: "match-4",
    category: "match_pair",
    questionText: "Match each business leader with their organisation.",
    pairs: [
      { left: "Narayana Murthy", right: "Co-founded Infosys" },
      { left: "Ratan Tata", right: "Chaired the Tata Group" },
      { left: "Kiran Mazumdar-Shaw", right: "Founded Biocon" },
      { left: "Azim Premji", right: "Built Wipro into an IT leader" },
    ],
  }),
  q({
    id: "match-5",
    category: "match_pair",
    questionText: "Match each leader with their famous words.",
    pairs: [
      { left: "Mahatma Gandhi", right: "\"Be the change you wish to see\"" },
      { left: "APJ Abdul Kalam", right: "\"Dream, dream, dream\"" },
      { left: "Swami Vivekananda", right: "\"Arise, awake, and stop not\"" },
      { left: "Nelson Mandela", right: "\"It always seems impossible until it's done\"" },
    ],
  }),
  q({
    id: "match-6",
    category: "match_pair",
    questionText: "Match each sports leader with their sport.",
    pairs: [
      { left: "Mary Kom", right: "Boxing" },
      { left: "M. S. Dhoni", right: "Cricket" },
      { left: "P. V. Sindhu", right: "Badminton" },
      { left: "Viswanathan Anand", right: "Chess" },
    ],
  }),
  q({
    id: "match-7",
    category: "match_pair",
    questionText: "Match each freedom fighter with what they are remembered for.",
    pairs: [
      { left: "Rani Lakshmibai", right: "Led the defence of Jhansi in 1857" },
      { left: "Bhagat Singh", right: "Revolutionary who inspired India's youth" },
      { left: "Subhas Chandra Bose", right: "Founded the Indian National Army" },
      { left: "Sarojini Naidu", right: "The Nightingale of India" },
    ],
  }),
  q({
    id: "match-8",
    category: "match_pair",
    questionText: "Match each world leader with their country.",
    pairs: [
      { left: "Nelson Mandela", right: "South Africa" },
      { left: "Abraham Lincoln", right: "United States" },
      { left: "Jacinda Ardern", right: "New Zealand" },
      { left: "Lee Kuan Yew", right: "Singapore" },
    ],
  }),

  // ── Leadership Scenario ───────────────────────────────────────────
  q({
    id: "scenario-1",
    category: "leadership_scenario",
    questionText:
      "Your project team's presentation is tomorrow, and a teammate who was assigned a key section says they're overwhelmed and haven't started. What do you do?",
    options: [
      "Tell the professor the teammate didn't do their part",
      "Sit with them tonight, split the section, and help them finish it",
      "Do the whole section yourself without telling anyone",
      "Suggest the team presents without that section",
    ],
    correctAnswer: "Sit with them tonight, split the section, and help them finish it",
    explanation: "Great leaders support teammates under pressure instead of blaming or bypassing them.",
  }),
  q({
    id: "scenario-2",
    category: "leadership_scenario",
    questionText:
      "During a club event you organised, the sound system fails in front of a full audience. What's your first move?",
    options: [
      "Find whoever set up the system and ask what went wrong",
      "Calmly address the audience, buy time with an activity, and send someone to fix it",
      "Cancel the event and apologise",
      "Wait quietly for the technical team to notice",
    ],
    correctAnswer: "Calmly address the audience, buy time with an activity, and send someone to fix it",
    explanation: "Composure and quick delegation keep the situation moving — blame can wait.",
  }),
  q({
    id: "scenario-3",
    category: "leadership_scenario",
    questionText:
      "You notice a first-year student sitting alone at every club meeting, never speaking up. As a senior member, what do you do?",
    options: [
      "Leave them alone — they'll open up eventually",
      "Point them out in the meeting and ask them to speak",
      "Sit with them, learn their interests, and connect them to a small task they'd enjoy",
      "Tell the club head someone isn't participating",
    ],
    correctAnswer: "Sit with them, learn their interests, and connect them to a small task they'd enjoy",
    explanation: "Inclusive leaders create belonging through personal connection, not public pressure.",
  }),
  q({
    id: "scenario-4",
    category: "leadership_scenario",
    questionText:
      "Your team made an error in the event budget, and you signed off on it. The coordinator asks what happened. What do you say?",
    options: [
      "Explain that a teammate made the calculation error",
      "Own the mistake as the person who approved it, and present a fix",
      "Say the budget format was confusing",
      "Promise it won't happen again without explaining",
    ],
    correctAnswer: "Own the mistake as the person who approved it, and present a fix",
    explanation: "Accountability means owning outcomes you approved — and pairing honesty with a solution.",
  }),
  q({
    id: "scenario-5",
    category: "leadership_scenario",
    questionText:
      "Two of your closest friends on the team have a heated disagreement about the event theme, and both want you to take their side. What do you do?",
    options: [
      "Side with the friend whose idea you prefer",
      "Stay out of it completely",
      "Hear both out together, find shared goals, and guide them to a combined solution",
      "Ask the faculty coordinator to decide",
    ],
    correctAnswer: "Hear both out together, find shared goals, and guide them to a combined solution",
    explanation: "Mediating openly beats taking sides — leaders turn conflict into collaboration.",
  }),
  q({
    id: "scenario-6",
    category: "leadership_scenario",
    questionText:
      "You have an exam in three days, but your club's flagship event — which you lead — is the day before. A volunteer offers to take over some coordination. What do you do?",
    options: [
      "Refuse — a leader should handle everything personally",
      "Hand over everything and focus only on the exam",
      "Delegate clear responsibilities with a checklist, stay reachable, and protect study time",
      "Skip preparing for the exam",
    ],
    correctAnswer: "Delegate clear responsibilities with a checklist, stay reachable, and protect study time",
    explanation: "Delegation with clarity is a leadership skill — doing everything yourself isn't.",
  }),
  q({
    id: "scenario-7",
    category: "leadership_scenario",
    questionText:
      "In a group discussion, one member keeps interrupting others and dominating. The quieter members have stopped contributing. As the discussion lead, what do you do?",
    options: [
      "Let it continue — confident voices deserve the floor",
      "Publicly tell the person to stop talking",
      "Thank them for their energy, then deliberately invite each quiet member to share",
      "End the discussion early",
    ],
    correctAnswer: "Thank them for their energy, then deliberately invite each quiet member to share",
    explanation: "Redirecting without humiliating keeps everyone engaged — good facilitators balance voices.",
  }),
  q({
    id: "scenario-8",
    category: "leadership_scenario",
    questionText:
      "You discover the event poster your team published has a factual error, but it already has hundreds of shares. What do you do?",
    options: [
      "Ignore it — most people won't notice",
      "Quietly delete the post and repost the corrected version",
      "Post a clear correction, thank those who pointed it out, and update the poster",
      "Blame the design team in the group chat",
    ],
    correctAnswer: "Post a clear correction, thank those who pointed it out, and update the poster",
    explanation: "Transparent correction builds more trust than quiet deletion ever could.",
  }),
];
