import { Building2, GraduationCap, BriefcaseBusiness, IndianRupee, Landmark, Wallet, Briefcase, Home, Car, RefreshCw } from "lucide-react";
import type { EmploymentType, LoanType } from "@/lib/applicationTypes";

export const STATE_CITIES: Record<string, string[]> = {
  "Andhra Pradesh": ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Kakinada", "Rajahmundry", "Tirupati", "Kadapa", "Anantapur", "Eluru", "Ongole", "Vizianagaram", "Machilipatnam", "Adoni", "Tenali", "Proddatur", "Chittoor", "Hindupur", "Bhimavaram", "Srikakulam", "Nandyal", "Tadepalligudem", "Narasaraopet"],
  "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Tawang", "Ziro", "Bomdila", "Along", "Tezu", "Namsai", "Roing", "Daporijo", "Changlang", "Khonsa", "Seppa", "Anini"],
  "Assam": ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Nagaon", "Tinsukia", "Tezpur", "Bongaigaon", "Karimganj", "Sivasagar", "Goalpara", "Dhubri", "North Lakhimpur", "Diphu", "Barpeta", "Golaghat", "Nalbari", "Mangaldai", "Haflong", "Kokrajhar"],
  "Bihar": ["Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Darbhanga", "Purnia", "Arrah", "Begusarai", "Katihar", "Munger", "Chapra", "Sasaram", "Hajipur", "Bihar Sharif", "Dehri", "Siwan", "Motihari", "Saharsa", "Bettiah", "Nawada", "Bagaha", "Buxar", "Kishanganj", "Jehanabad", "Aurangabad"],
  "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg", "Rajnandgaon", "Jagdalpur", "Raigarh", "Ambikapur", "Chirmiri", "Dhamtari", "Mahasamund", "Kawardha", "Kanker", "Kondagaon", "Mungeli", "Bemetara", "Balod", "Janjgir"],
  "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda", "Bicholim", "Curchorem", "Sanquelim", "Canacona", "Quepem", "Sanguem", "Valpoi", "Pernem"],
  "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh", "Gandhinagar", "Anand", "Nadiad", "Morbi", "Mehsana", "Bharuch", "Navsari", "Surendranagar", "Porbandar", "Valsad", "Gandhidham", "Godhra", "Palanpur", "Vapi", "Veraval", "Dahod", "Botad"],
  "Haryana": ["Faridabad", "Gurugram", "Panipat", "Ambala", "Yamunanagar", "Rohtak", "Hisar", "Karnal", "Sonipat", "Panchkula", "Bhiwani", "Bahadurgarh", "Sirsa", "Jind", "Thanesar", "Kaithal", "Rewari", "Palwal", "Hansi", "Narnaul", "Fatehabad", "Mahendragarh"],
  "Himachal Pradesh": ["Shimla", "Dharamshala", "Mandi", "Solan", "Nahan", "Bilaspur", "Hamirpur", "Palampur", "Baddi", "Sundarnagar", "Kullu", "Manali", "Chamba", "Una", "Paonta Sahib", "Kangra", "Keylong", "Rampur", "Rohru", "Parwanoo"],
  "Jharkhand": ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh", "Deoghar", "Giridih", "Ramgarh", "Medininagar", "Phusro", "Dumka", "Chaibasa", "Chatra", "Godda", "Lohardaga", "Pakur", "Sahebganj", "Jamtara", "Gumla", "Simdega"],
  "Karnataka": ["Bengaluru", "Mysuru", "Mangaluru", "Hubballi", "Dharwad", "Belagavi", "Kalaburagi", "Davangere", "Ballari", "Shivamogga", "Tumakuru", "Udupi", "Vijayapura", "Raichur", "Hassan", "Mandya", "Chitradurga", "Gadag", "Haveri", "Bagalkot", "Chikkamagaluru", "Bidar", "Yadgir", "Ramanagara", "Kodagu"],
  "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam", "Kannur", "Alappuzha", "Palakkad", "Malappuram", "Kottayam", "Kasaragod", "Pathanamthitta", "Idukki", "Wayanad", "Ernakulam", "Munnar", "Guruvayur", "Thalassery", "Mattancherry", "Perinthalmanna"],
  "Madhya Pradesh": ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain", "Sagar", "Dewas", "Satna", "Ratlam", "Rewa", "Katni", "Singrauli", "Burhanpur", "Khandwa", "Morena", "Bhind", "Chhindwara", "Guna", "Shivpuri", "Vidisha", "Damoh", "Mandsaur", "Chhatarpur", "Neemuch", "Datia"],
  "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik", "Aurangabad", "Solapur", "Kolhapur", "Amravati", "Navi Mumbai", "Sangli", "Malegaon", "Jalgaon", "Akola", "Latur", "Dhule", "Ahmednagar", "Chandrapur", "Parbhani", "Nanded", "Ichalkaranji", "Jalna", "Bhiwandi", "Panvel", "Satara", "Beed", "Yavatmal", "Wardha", "Ratnagiri", "Gondia"],
  "Manipur": ["Imphal", "Thoubal", "Bishnupur", "Churachandpur", "Kakching", "Senapati", "Ukhrul", "Tamenglong", "Chandel", "Jiribam", "Moreh", "Moirang", "Nambol"],
  "Meghalaya": ["Shillong", "Tura", "Jowai", "Nongstoin", "Williamnagar", "Baghmara", "Resubelpara", "Nongpoh", "Mairang", "Mawkyrwat", "Khliehriat", "Ampati"],
  "Mizoram": ["Aizawl", "Lunglei", "Champhai", "Serchhip", "Kolasib", "Lawngtlai", "Saiha", "Mamit", "Saitual", "Hnahthial", "Khawzawl"],
  "Nagaland": ["Kohima", "Dimapur", "Mokokchung", "Tuensang", "Wokha", "Zunheboto", "Mon", "Phek", "Kiphire", "Longleng", "Peren", "Chumukedima"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Berhampur", "Sambalpur", "Puri", "Balasore", "Baripada", "Bhadrak", "Jharsuguda", "Jeypore", "Bargarh", "Angul", "Kendrapara", "Dhenkanal", "Paradip", "Rayagada", "Koraput", "Phulbani", "Sundargarh"],
  "Punjab": ["Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", "Pathankot", "Hoshiarpur", "Batala", "Moga", "Abohar", "Malerkotla", "Khanna", "Phagwara", "Muktsar", "Barnala", "Rajpura", "Firozpur", "Kapurthala", "Faridkot", "Mansa", "Sangrur", "Nawanshahr", "Gurdaspur"],
  "Rajasthan": ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Bikaner", "Ajmer", "Bhilwara", "Alwar", "Bharatpur", "Sikar", "Pali", "Sri Ganganagar", "Jhunjhunu", "Tonk", "Kishangarh", "Beawar", "Hanumangarh", "Chittorgarh", "Nagaur", "Bundi", "Churu", "Barmer", "Dholpur", "Sawai Madhopur", "Banswara", "Dungarpur", "Jaisalmer", "Mount Abu", "Pushkar"],
  "Sikkim": ["Gangtok", "Namchi", "Mangan", "Gyalshing", "Rangpo", "Singtam", "Jorethang", "Naya Bazar", "Ravangla", "Pelling", "Lachung", "Lachen", "Yuksom"],
  "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tirunelveli", "Erode", "Vellore", "Thoothukudi", "Thanjavur", "Dindigul", "Tiruppur", "Ranipet", "Sivakasi", "Karur", "Nagercoil", "Kanchipuram", "Kumbakonam", "Cuddalore", "Hosur", "Ooty", "Ambur", "Pollachi", "Krishnagiri", "Rajapalayam"],
  "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam", "Ramagundam", "Mahbubnagar", "Nalgonda", "Adilabad", "Suryapet", "Miryalaguda", "Siddipet", "Jagtial", "Mancherial", "Kamareddy", "Bhongir", "Bodhan", "Zaheerabad", "Medak", "Wanaparthy"],
  "Tripura": ["Agartala", "Udaipur", "Dharmanagar", "Kailashahar", "Belonia", "Ambassa", "Khowai", "Sabroom", "Sonamura", "Amarpur", "Teliamura", "Bishalgarh", "Kamalpur"],
  "Uttar Pradesh": ["Lucknow", "Kanpur", "Agra", "Varanasi", "Meerut", "Prayagraj", "Ghaziabad", "Noida", "Bareilly", "Aligarh", "Moradabad", "Gorakhpur", "Saharanpur", "Jhansi", "Muzaffarnagar", "Mathura", "Firozabad", "Ayodhya", "Shahjahanpur", "Rampur", "Loni", "Unnao", "Bulandshahr", "Sambhal", "Amroha", "Hardoi", "Fatehpur", "Hapur", "Etawah", "Mirzapur", "Budaun", "Bahraich", "Sitapur", "Sultanpur", "Deoria", "Azamgarh", "Basti", "Gonda", "Ballia", "Banda"],
  "Uttarakhand": ["Dehradun", "Haridwar", "Rishikesh", "Haldwani", "Roorkee", "Rudrapur", "Kashipur", "Nainital", "Mussoorie", "Pithoragarh", "Almora", "Bageshwar", "Chamoli", "Champawat", "Tehri", "Uttarkashi", "Pauri", "Srinagar", "Lansdowne", "Kotdwar"],
  "West Bengal": ["Kolkata", "Howrah", "Asansol", "Siliguri", "Durgapur", "Bardhaman", "Malda", "Baharampur", "Habra", "Kharagpur", "Shantiniketan", "Darjeeling", "Jalpaiguri", "Balurghat", "Basirhat", "Bankura", "Purulia", "Raiganj", "Cooch Behar", "Haldia", "Krishnanagar", "Midnapore", "Ranaghat", "Contai", "Bolpur"],
  "Delhi": ["New Delhi", "Central Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi", "North East Delhi", "North West Delhi", "South East Delhi", "South West Delhi", "Shahdara", "Dwarka", "Rohini", "Lajpat Nagar", "Karol Bagh", "Connaught Place", "Chandni Chowk", "Saket", "Vasant Kunj", "Mehrauli"]
};

export const STATE_PIN_PREFIXES: Record<string, string[]> = {
  "Andhra Pradesh": ["51", "52", "53"],
  "Arunachal Pradesh": ["79"],
  "Assam": ["78"],
  "Bihar": ["80", "81", "82", "83", "84", "85"],
  "Chhattisgarh": ["49"],
  "Goa": ["40"],
  "Gujarat": ["36", "37", "38", "39"],
  "Haryana": ["12", "13"],
  "Himachal Pradesh": ["17"],
  "Jharkhand": ["81", "82", "83"],
  "Karnataka": ["56", "57", "58", "59"],
  "Kerala": ["67", "68", "69"],
  "Madhya Pradesh": ["45", "46", "47", "48"],
  "Maharashtra": ["40", "41", "42", "43", "44"],
  "Manipur": ["79"],
  "Meghalaya": ["79"],
  "Mizoram": ["79"],
  "Nagaland": ["79"],
  "Odisha": ["75", "76", "77"],
  "Punjab": ["14", "15", "16"],
  "Rajasthan": ["30", "31", "32", "33", "34"],
  "Sikkim": ["73"],
  "Tamil Nadu": ["60", "61", "62", "63", "64"],
  "Telangana": ["50", "51"],
  "Tripura": ["79"],
  "Uttar Pradesh": ["20", "21", "22", "23", "24", "25", "26", "27", "28"],
  "Uttarakhand": ["24", "25", "26"], 
  "West Bengal": ["70", "71", "72", "73", "74"],
  "Delhi": ["11"]
};

export const CITY_PIN_PREFIXES: Record<string, string[]> = {
  "Indore": ["452", "453"],
  "Bhopal": ["462"],
  "Mumbai": ["400", "401"],
  "Pune": ["411", "412"],
  "Bengaluru": ["560"],
  "Chennai": ["600"],
  "Hyderabad": ["500", "501", "502"],
  "Kolkata": ["700"],
  "Ahmedabad": ["380", "382"],
  "Jaipur": ["302", "303"],
  "Lucknow": ["226"],
  "New Delhi": ["110"],
  "Surat": ["394", "395"],
};

export const RELIGIONS = [
  "Hinduism", "Islam", "Christianity", "Sikhism", "Buddhism", "Jainism", "Other"
];

export const EMPLOYMENT_OPTIONS: { value: EmploymentType; label: string; icon: any }[] = [
  { value: "SALARIED", label: "Salaried", icon: Building2 },
  { value: "PROFESSIONAL", label: "Professional", icon: GraduationCap },
  { value: "SELF_EMPLOYED", label: "Business", icon: BriefcaseBusiness },
];

export const PRODUCT_OPTIONS: { value: LoanType; label: string; icon: any }[] = [
  { value: "PERSONAL_LOAN", label: "Personal Loan", icon: Wallet },
  { value: "BUSINESS_LOAN", label: "Business Loan", icon: Briefcase },
  { value: "HOME_LOAN", label: "Home Loan", icon: Home },
  { value: "LAP", label: "Loan Against Property", icon: Building2 },
  { value: "AUTO_LOAN", label: "Auto Loan", icon: Car },
  { value: "BT_TOP_UP", label: "BT|Top Up", icon: RefreshCw },
];
