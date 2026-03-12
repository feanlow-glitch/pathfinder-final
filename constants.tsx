
import { Question, CategoryKey } from './types';

export const QUESTIONS: Question[] = [
  { id: 1, text: "I like to work on cars", category: 'R' },
  { id: 2, text: "I like to do puzzles", category: 'I' },
  { id: 3, text: "I am good at working independently", category: 'I' },
  { id: 4, text: "I like to work in teams", category: 'S' },
  { id: 5, text: "I am an ambitious person, I set goals for myself", category: 'E' },
  { id: 6, text: "I like to organize things (files, desks/offices)", category: 'C' },
  { id: 7, text: "I like to build things", category: 'R' },
  { id: 8, text: "I like to read about art and music", category: 'A' },
  { id: 9, text: "I like to have clear instructions to follow", category: 'C' },
  { id: 10, text: "I like to try to influence or persuade people", category: 'E' },
  { id: 11, text: "I like to do experiments", category: 'I' },
  { id: 12, text: "I like to teach or train people", category: 'S' },
  { id: 13, text: "I like trying to help people solve their problems", category: 'S' },
  { id: 14, text: "I like to take care of animals", category: 'R' },
  { id: 15, text: "I wouldn’t mind working 8 hours per day in an office", category: 'C' },
  { id: 16, text: "I like selling things", category: 'E' },
  { id: 17, text: "I enjoy creative writing", category: 'A' },
  { id: 18, text: "I enjoy science", category: 'I' },
  { id: 19, text: "I am quick to take on new responsibilities", category: 'E' },
  { id: 20, text: "I am interested in healing people", category: 'S' },
  { id: 21, text: "I enjoy trying to figure out how things work", category: 'I' },
  { id: 22, text: "I like putting things together or assembling things", category: 'R' },
  { id: 23, text: "I am a creative person", category: 'A' },
  { id: 24, text: "I pay attention to details", category: 'C' },
  { id: 25, text: "I like to do filing or typing", category: 'C' },
  { id: 26, text: "I like to analyze things (problems/situations)", category: 'I' },
  { id: 27, text: "I like to play instruments or sing", category: 'A' },
  { id: 28, text: "I enjoy learning about other cultures", category: 'S' },
  { id: 29, text: "I would like to start my own business", category: 'E' },
  { id: 30, text: "I like to cook", category: 'R' },
  { id: 31, text: "I like acting in plays", category: 'A' },
  { id: 32, text: "I am a practical person", category: 'R' },
  { id: 33, text: "I like working with numbers or charts", category: 'C' },
  { id: 34, text: "I like to get into discussions about issues", category: 'S' },
  { id: 35, text: "I am good at keeping records of my work", category: 'C' },
  { id: 36, text: "I like to lead", category: 'E' },
  { id: 37, text: "I like working outdoors", category: 'R' },
  { id: 38, text: "I would like to work in an office", category: 'C' },
  { id: 39, text: "I'm good at math", category: 'I' },
  { id: 40, text: "I like helping people", category: 'S' },
  { id: 41, text: "I like to draw", category: 'A' },
  { id: 42, text: "I like to give speeches", category: 'E' },
];

export const CATEGORY_DESCRIPTIONS: Record<CategoryKey, { title: string, description: string, color: string, majors: string[] }> = {
  R: { 
    title: "Realistic (Doers)", 
    description: "These people are often good at mechanical or athletic jobs. They prefer to work with things, such as objects, machines, tools, plants, or animals.", 
    color: "#0284c7", 
    majors: ["Agriculture", "Health Assistant", "Computers", "Construction", "Mechanic/Machinist", "Engineering", "Food and Hospitality"]
  },
  I: { 
    title: "Investigative (Thinkers)", 
    description: "These people like to watch, learn, analyze and solve problems. They value science, knowledge, and intellectual challenge.", 
    color: "#2563eb", 
    majors: ["Marine Biology", "Engineering", "Chemistry", "Zoology", "Medicine/Surgery", "Consumer Economics", "Psychology"]
  },
  A: { 
    title: "Artistic (Creators)", 
    description: "These people like to work in unstructured situations where they can use their creativity. They have artistic, innovative, or intuitional abilities.", 
    color: "#4f46e5", 
    majors: ["Communications", "Cosmetology", "Fine and Performing Arts", "Photography", "Radio and TV", "Interior Design", "Architecture"]
  },
  S: { 
    title: "Social (Helpers)", 
    description: "These people like to work with other people, rather than things. They enjoy teaching, helping, or caring for others.", 
    color: "#0d9488", 
    majors: ["Counseling", "Nursing", "Physical Therapy", "Travel", "Advertising", "Public Relations", "Education"]
  },
  E: { 
    title: "Enterprising (Persuaders)", 
    description: "These people like to work with others and enjoy persuading and performing. They are often leaders who value influence and business success.", 
    color: "#1e3a8a", 
    majors: ["Fashion Merchandising", "Real Estate", "Marketing/Sales", "Law", "Political Science", "International Trade", "Banking/Finance"]
  },
  C: { 
    title: "Conventional (Organizers)", 
    description: "These people are very detail oriented, organized and like to work with data. They value rules, clarity, and precision in structured environments.", 
    color: "#475569", 
    majors: ["Accounting", "Court Reporting", "Insurance", "Administration", "Medical Records", "Banking", "Data Processing"]
  },
};

export const PATHWAYS_BY_CATEGORY: Record<CategoryKey, string[]> = {
  R: ["Natural Resources", "Health Services", "Industrial and Engineering Technology", "Arts and Communication"],
  I: ["Health Services", "Business", "Public and Human Services", "Industrial and Engineering Technology"],
  A: ["Public and Human Services", "Arts and Communication"],
  S: ["Health Services", "Public and Human Services"],
  E: ["Business", "Public and Human Services", "Arts and Communication"],
  C: ["Health Services", "Business", "Industrial and Engineering Technology"]
};

export const CAREER_DATABASE: Record<CategoryKey, string[]> = {
  R: [
    "Aerospace Engineering Technician", "Agricultural Equipment Operator", "Agricultural Inspector", "Aircraft Mechanic",
    "Airline Pilot", "Ambulance Driver", "Animal Breeder", "Athletes and Sports Competitor", "Automotive Master Mechanic",
    "Civil Engineer", "Commercial Pilot", "Construction Carpenter", "Cook, Restaurant", "Dental Laboratory Technician",
    "Electrician", "Engine Assembler", "Environmental Engineering Technician", "Farmworker",
    "Fire Fighter", "Glazier", "Industrial Machinery Mechanic", "Landscaping Worker", "Machinist",
    "Medical Equipment Repairer", "Millwright", "Pipe Fitter", "Plumber", "Surveyor", "Welder"
  ],
  I: [
    "Aerospace Engineer", "Anesthesiologist", "Astronomer", "Biochemist", "Biologist", "Chemical Engineer",
    "Clinical Psychologist", "Computer Hardware Engineer", "Computer Programmer", "Data Scientist", "Dentist",
    "Dietitian", "Economist", "Electrical Engineer", "Environmental Scientist", "Forensic Science Technician",
    "Geoscientist", "Hydrologist", "Industrial Engineer", "Market Research Analyst", "Mathematician",
    "Mechanical Engineer", "Medical Scientist", "Pharmacist", "Physicist", "Software Developer", "Veterinarian"
  ],
  A: [
    "Actor", "Architect", "Art Director", "Broadcast News Analyst", "Choreographer", "Commercial Designer",
    "Craft Artist", "Dancer", "Desktop Publisher", "Editor", "Fashion Designer", "Film and Video Editor",
    "Graphic Designer", "Interior Designer", "Interpreter and Translator", "Landscape Architect", "Model",
    "Music Director", "Musician", "Photographer", "Poet and Lyricist", "Radio/TV Announcer", "Technical Writer"
  ],
  S: [
    "Adult Literacy Teacher", "Athletic Trainer", "Child Care Worker", "Chiropractor", "Clergy",
    "Counseling Psychologist", "Dental Hygienist", "Educational Counselor", "Elementary School Teacher",
    "Emergency Medical Technician", "High School Teacher", "Librarian", "Nurse", "Occupational Therapist",
    "Physical Therapist", "Physician Assistant", "Psychiatric Technician", "Registered Nurse", "Social Worker",
    "Speech-Language Pathologist", "Special Education Teacher", "Tour Guide"
  ],
  E: [
    "Administrative Services Manager", "Advertising Sales Agent", "Air Traffic Controller", "Appraiser",
    "Chief Executive", "Construction Manager", "Customer Service Representative", "Curator", "Employment Interviewer",
    "Financial Manager", "Food Service Manager", "Funeral Director", "Hotel Manager", "Insurance Sales Agent",
    "Judge", "Lawyer", "Marketing Manager", "Public Relations Manager", "Purchasing Manager", "Real Estate Broker",
    "Sales Manager", "Travel Agent"
  ],
  C: [
    "Accountant", "Actuary", "Archivist", "Assessor", "Auditor", "Bill and Account Collector",
    "Bookkeeping Clerk", "Budget Analyst", "Cashier", "Computer Operator", "Cost Estimator", "Data Entry Keyer",
    "Database Administrator", "File Clerk", "Financial Analyst", "Insurance Underwriter", "Legal Secretary",
    "Loan Officer", "Medical Records Technician", "New Accounts Clerk", "Payroll Clerk", "Pharmacy Technician",
    "Postal Service Clerk", "Proofreader", "Statistical Assistant", "Tax Preparer", "Teller", "Web Developer"
  ]
};
