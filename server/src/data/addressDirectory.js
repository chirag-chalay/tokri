// Public localities only. Never add customer address records. Location coverage
// does not imply serviceability; delivery.js remains authoritative at selection,
// save and checkout. Every entry requires a source, verified date and type.
const postal = 'https://gurugram.gov.in/std-pin-codes/'
const delhi = 'https://dmcentralnorth.delhi.gov.in/std-pin-codes/'
const record = (id, locality, pincode, source = postal, extra = {}) => ({
  id, label: locality, locality, pincode, city: 'Gurugram', state: 'Haryana',
  kind: 'locality', source, verifiedAt: '2026-11-16', ...extra,
})
export const addressDirectory = [
  record('sector45', 'Sector 45', '122003'),
  record('sector56', 'Sector 56', '122011', 'https://www.indiapost.gov.in/Financial/DOP_PDFFiles/PostOfficesOnline.pdf'),
  record('galleria', 'DLF Phase IV', '122009', postal, { label: 'Galleria DLF Phase IV', building: 'Galleria Market', kind: 'market', componentSource: 'https://dlfcityphase4-floors.dlf.in/compliance/pdf/brochure.pdf', aliases: ['DLF Phase 4', 'DLF Phase IV'] }),
  record('dlfqe', 'DLF QE', '122002'),
  record('chakkarpur', 'Chakkarpur', '122002'),
  record('dlf3', 'DLF Phase III', '122010', postal, { aliases: ['DLF Phase 3'] }),
  record('dlf2', 'DLF Phase II', '122008', postal, { aliases: ['DLF Phase 2'] }),
  record('southcity2', 'South City II', '122018', postal, { aliases: ['South City 2'] }),
  record('badshahpur', 'Badshahpur', '122101'),
  record('bhondsi', 'Bhondsi', '122102'),
  record('gurgaon', '', '122001', postal, { label: 'Gurgaon', kind: 'city' }),
  record('palamvihar', 'Palam Vihar', '122017'),
  record('railwayroad', '', '122006', postal, { label: 'Railway Road', street: 'Railway Road', kind: 'road' }),
  record('sector46', 'Sector 46', '122003', 'https://www.amity.edu/ais/aisg2/amitywebsite.pdf'),
  // The district confirms Sector 15, but not a unique pincode for all its parts.
  record('sector15', 'Sector 15', '', 'https://gurugram.gov.in/public-utility/government-primary-school-sector-15-gurugram/'),
  // This source confirms the road. Do not assign one building's pin to the road.
  record('golfcourse', '', '', 'https://environmentclearance.nic.in/auth/ECGeneral_Report.aspx?pid=12400', { label: 'Golf Course Road', street: 'Golf Course Road', kind: 'road' }),
  record('amity46', 'Sector 46', '122003', 'https://www.amity.edu/ais/aisg2/amitywebsite.pdf', { label: 'Amity International School, Sector 46', building: 'Amity International School', kind: 'building' }),
  record('adarshnagar', 'Adarsh Nagar', '110033', delhi, { city: 'Delhi', state: 'Delhi' }),
]
