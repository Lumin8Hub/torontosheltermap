export type ShelterCategory =
  | "Youth Shelter"
  | "Adult Shelter"
  | "Donation Centre"
  | "Drop-In Centre";

export interface Shelter {
  id: string;
  name: string;
  address: string;
  category: ShelterCategory;
  services: string;
  lat: number;
  lon: number;
}

export const SHELTERS: Shelter[] = [
  { id: "covenant-house", name: "Covenant House Toronto", address: "20 Gerrard St E", category: "Youth Shelter", services: "Emergency shelter and transitional housing for youth.", lat: 43.6586, lon: -79.3812 },
  { id: "evas-phoenix", name: "Eva's Phoenix", address: "60 Brant St", category: "Youth Shelter", services: "Transitional housing and employment facility for youth.", lat: 43.6453, lon: -79.3989 },
  { id: "native-child", name: "Native Child & Family Services", address: "558 Bathurst St", category: "Youth Shelter", services: "Youth housing support focusing on Indigenous youth.", lat: 43.6548, lon: -79.4086 },
  { id: "sherbourne-health", name: "Sherbourne Health", address: "333 Sherbourne St", category: "Youth Shelter", services: "Housing assistance and support for 2SLGBTQ+ youth.", lat: 43.6606, lon: -79.3698 },
  { id: "woodgreen", name: "WoodGreen Emergency Shelter", address: "95 Wellesley St E", category: "Youth Shelter", services: "Emergency shelter; supports for mental health and housing.", lat: 43.6657, lon: -79.3803 },
  { id: "ymca-wagner", name: "YMCA Wagner Green Shelter", address: "7 Vanauley St", category: "Youth Shelter", services: "Young men; harm reduction and trauma-informed care.", lat: 43.6491, lon: -79.3976 },
  { id: "ywca-woodlawn", name: "YWCA 1st Stop Woodlawn", address: "80 Woodlawn Ave E", category: "Youth Shelter", services: "Young women (16-25) and adult women (26+).", lat: 43.6842, lon: -79.3888 },
  { id: "christie-ossington", name: "Christie Ossington Centre", address: "850 & 854 Bloor St W", category: "Adult Shelter", services: "Men's short-term emergency shelter.", lat: 43.6622, lon: -79.4239 },
  { id: "dixon-hall", name: "Dixon Hall (The Schoolhouse)", address: "349 George St", category: "Adult Shelter", services: "Overnight emergency shelter for men.", lat: 43.6601, lon: -79.3742 },
  { id: "fred-victor-fatima", name: "Fred Victor (Fatima House)", address: "1059 College St", category: "Adult Shelter", services: "Emergency shelter for women.", lat: 43.6528, lon: -79.4326 },
  { id: "homes-first", name: "Homes First Society", address: "545 Lake Shore Blvd W", category: "Adult Shelter", services: "Adult shelter with enhanced case management.", lat: 43.6358, lon: -79.3986 },
  { id: "red-door", name: "Red Door Shelters", address: "Queen St E Area", category: "Adult Shelter", services: "Families needing emergency housing and medical support.", lat: 43.661, lon: -79.34 },
  { id: "sa-gateway", name: "Salvation Army Gateway", address: "107 Jarvis St", category: "Adult Shelter", services: "Men's emergency shelter.", lat: 43.6528, lon: -79.3719 },
  { id: "sa-maxwell", name: "Salvation Army Maxwell Meighen", address: "135 Sherbourne St", category: "Adult Shelter", services: "Multi-service shelter for men.", lat: 43.6534, lon: -79.3683 },
  { id: "scott-mission", name: "Scott Mission Men's Shelter", address: "346 Spadina Ave", category: "Adult Shelter", services: "Men's overnight shelter and meals.", lat: 43.6549, lon: -79.3988 },
  { id: "ssvp", name: "Society of St. Vincent de Paul", address: "70 Gerrard St E", category: "Adult Shelter", services: "Mary's Home emergency shelter for women.", lat: 43.659, lon: -79.3794 },
  { id: "st-simons", name: "St Simon's Clubbehouse", address: "556 Sherbourne St", category: "Adult Shelter", services: "Adult emergency shelter.", lat: 43.668, lon: -79.374 },
  { id: "street-haven", name: "Street Haven at the Crossroads", address: "87 Pembroke St", category: "Adult Shelter", services: "Emergency and long-term housing for women.", lat: 43.6588, lon: -79.3725 },
  { id: "robertson-house", name: "Toronto Shelter (Robertson House)", address: "291 Sherbourne St", category: "Adult Shelter", services: "Short-term emergency shelter for women and families.", lat: 43.6585, lon: -79.3691 },
  { id: "seaton-house", name: "Toronto Shelter (Seaton House)", address: "339 George St", category: "Adult Shelter", services: "Men's shelter (subject to George St Revitalization changes).", lat: 43.6596, lon: -79.3743 },
  { id: "womens-res", name: "Toronto Shelter (Women's Res)", address: "674 Dundas St W", category: "Adult Shelter", services: "Emergency shelter for women.", lat: 43.6517, lon: -79.4034 },
  { id: "ywca-davenport", name: "YWCA Davenport", address: "348 Davenport Rd", category: "Adult Shelter", services: "Homeless shelter for women offering trauma-informed care.", lat: 43.6766, lon: -79.4011 },
  { id: "covenant-donation", name: "Covenant House Toronto (Donation)", address: "21 McGill St", category: "Donation Centre", services: "Prefers $5-$25 gift/Presto cards for youth over physical clothing.", lat: 43.6597, lon: -79.3804 },
  { id: "double-take", name: "Double Take Thrift Store", address: "310 Gerrard St E", category: "Donation Centre", services: "Accepts clothing and textiles for upcycling studio.", lat: 43.66, lon: -79.3653 },
  { id: "fred-victor-community", name: "Fred Victor Community Services", address: "Various (HQ: 36 Lombard St)", category: "Donation Centre", services: "Email donations@fredvictor.org to arrange drop-off.", lat: 43.6515, lon: -79.3752 },
  { id: "holy-trinity", name: "Holy Trinity Church Hub", address: "10 Trinity Sq", category: "Donation Centre", services: "Accepts clothing to support unhoused, BIPOC, and queer individuals.", lat: 43.6541, lon: -79.3816 },
  { id: "pwa", name: "People With AIDS Foundation", address: "163 Queen St E, 2nd Fl", category: "Donation Centre", services: "Clothing, electronics, toys, and food.", lat: 43.6539, lon: -79.3722 },
  { id: "suits-me-fine", name: "Suits Me Fine (CAMH)", address: "1001 Queen St W", category: "Donation Centre", services: "Professional/casual clothing to support mental health clients.", lat: 43.6441, lon: -79.4172 },
  { id: "vv-edward", name: "Value Village (Edward Street)", address: "18 Edward St", category: "Donation Centre", services: "General used clothing and household items.", lat: 43.6565, lon: -79.3824 },
  { id: "vv-queen-east", name: "Value Village (Queen St East)", address: "924 Queen St E", category: "Donation Centre", services: "General used clothing and household items.", lat: 43.6601, lon: -79.3436 },

  { id: "corner-drop-in", name: "The Corner Drop-in", address: "260 Augusta Ave", category: "Drop-In Centre", services: "Meals, showers, laundry, harm reduction, WiFi, computers.", lat: 43.6555, lon: -79.4017 },
  { id: "evangel-hall", name: "Evangel Hall Mission", address: "552 Adelaide St W", category: "Drop-In Centre", services: "Meals, take-out window, showers, laundry, clothing.", lat: 43.6457, lon: -79.4007 },
  { id: "lawyers-feed", name: "Lawyers Feed the Hungry", address: "130 Queen St W", category: "Drop-In Centre", services: "Meals provided on select days (Tues, Wed, Thu, Sun).", lat: 43.6525, lon: -79.3855 },
  { id: "meeting-place", name: "The Meeting Place", address: "588 Queen St W", category: "Drop-In Centre", services: "Daytime drop-in for adults (18+), case management, meals.", lat: 43.6478, lon: -79.4029 },
  { id: "cecil-community", name: "Cecil Community Centre", address: "58 Cecil St", category: "Drop-In Centre", services: "Community drop-in space and social activities.", lat: 43.6571, lon: -79.3987 },
  { id: "all-saints", name: "All Saints Church-Community Centre", address: "315 Dundas St E", category: "Drop-In Centre", services: "Daytime indoor drop-in, meals, community support.", lat: 43.6586, lon: -79.3724 },
  { id: "good-shepherd", name: "Good Shepherd Centre", address: "412 Queen St E", category: "Drop-In Centre", services: "Meals, medical support, emergency clothing.", lat: 43.6566, lon: -79.3681 },
  { id: "haven-toronto", name: "Haven Toronto", address: "170 Jarvis St", category: "Drop-In Centre", services: "Daytime drop-in dedicated exclusively to elder men (50+).", lat: 43.6553, lon: -79.3736 },
  { id: "loft-416", name: "LOFT 416 Drop-In Centre", address: "416 Dundas St E", category: "Drop-In Centre", services: "Meals, community support, health linkages.", lat: 43.6601, lon: -79.3686 },
  { id: "st-john-compassionate", name: "St. John the Compassionate", address: "155 Broadview Ave", category: "Drop-In Centre", services: "Meals, community support, bakery, social space.", lat: 43.6601, lon: -79.3514 },
  { id: "council-fire", name: "Toronto Council Fire Native Centre", address: "439 Dundas St E", category: "Drop-In Centre", services: "Indigenous-focused drop-in, meals, cultural programs.", lat: 43.6604, lon: -79.3673 },
  { id: "holy-trinity-drop", name: "Church of the Holy Trinity", address: "19 Trinity Sq", category: "Drop-In Centre", services: "Take-away meals, clothing, harm reduction, hygiene kits.", lat: 43.6541, lon: -79.3816 },
  { id: "redeemer", name: "Church of the Redeemer", address: "162 Bloor St W", category: "Drop-In Centre", services: "Common Table weekday meal program, indoor drop-in.", lat: 43.6700, lon: -79.3905 },
  { id: "met-united", name: "Met United", address: "56 Queen St E", category: "Drop-In Centre", services: "Indoor drop-in during meal times (Fridays).", lat: 43.6532, lon: -79.3782 },
  { id: "sanctuary", name: "Sanctuary Toronto", address: "25 Charles St E", category: "Drop-In Centre", services: "Indoor drop-in during meal times, community care, health.", lat: 43.6700, lon: -79.3835 },
  { id: "st-basils", name: "St. Basil's Out of the Cold", address: "50 St. Joseph St", category: "Drop-In Centre", services: "Indoor drop-in during meal times (early week).", lat: 43.6661, lon: -79.3856 },
  { id: "dale-ministries", name: "The Dale Ministries", address: "245 Dunn Ave", category: "Drop-In Centre", services: "Indoor drop-in, lunches, snacks, community games.", lat: 43.6391, lon: -79.4327 },
  { id: "lamp-chc", name: "LAMP Community Health Centre", address: "156 Sixth St", category: "Drop-In Centre", services: "Adult drop-in, health and social services integrations.", lat: 43.5947, lon: -79.5036 },
  { id: "parc", name: "Parkdale Activity-Recreation (PARC)", address: "1499 Queen St W", category: "Drop-In Centre", services: "Meals, showers, harm reduction, phones, WiFi.", lat: 43.6388, lon: -79.4327 },
  { id: "st-francis-table", name: "St. Francis' Table", address: "1322 Queen St W", category: "Drop-In Centre", services: "Indoor drop-in during meal times.", lat: 43.6406, lon: -79.4267 },
  { id: "the-stop", name: "The Stop Community Food Centre", address: "1884 Davenport Rd", category: "Drop-In Centre", services: "Meals, food bank, community support.", lat: 43.6753, lon: -79.4498 },
  { id: "the-519", name: "The 519", address: "519 Church St", category: "Drop-In Centre", services: "2SLGBTQ+ communities. Specialized Trans drop-in and meals.", lat: 43.6664, lon: -79.3811 },
  { id: "fv-womens", name: "Fred Victor Women's Drop-In", address: "67 Adelaide St E", category: "Drop-In Centre", services: "Women and trans women. Meals, support services, advocacy.", lat: 43.6505, lon: -79.3766 },
  { id: "syme-woolner", name: "Syme Woolner (Jane's Place)", address: "2468 Eglinton Ave W", category: "Drop-In Centre", services: "Families and local neighborhood residents.", lat: 43.6920, lon: -79.4670 },
  { id: "dixon-respite", name: "Dixon Hall (George St Respite)", address: "354 George St", category: "Drop-In Centre", services: "Low-barrier, 24/7 resting spaces, meals, and basic necessities.", lat: 43.6600, lon: -79.3741 },
  { id: "st-felix", name: "St. Felix Centre", address: "69 Fraser Ave", category: "Drop-In Centre", services: "Low-barrier, 24/7 access (coordinated through Central Intake).", lat: 43.6386, lon: -79.4196 },
];

export const CATEGORY_COLORS: Record<ShelterCategory, string> = {
  "Youth Shelter": "#3498db",
  "Adult Shelter": "#e74c3c",
  "Donation Centre": "#2ecc71",
  "Drop-In Centre": "#f39c12",
};
