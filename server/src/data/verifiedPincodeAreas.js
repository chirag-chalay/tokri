// Location labels only: this table NEVER determines delivery availability.
// Existing admin labels checked on 2026-11-15 against government directories:
// https://gurugram.gov.in/std-pin-codes/
// https://www.indiapost.gov.in/Financial/DOP_PDFFiles/PostOfficesOnline.pdf (Sector 56)
// https://dmcentralnorth.delhi.gov.in/std-pin-codes/ (Adarsh Nagar)
// Only the audited label/pincode pair is accepted. New or edited labels remain
// pincode-only until verified here; never infer a locality or use a nearby code.
const verifiedLabels = new Map([
  ['122003', 'Sector 45'],
  ['122011', 'Sector 56'],
  ['122009', 'Galleria DLF Phase IV'],
  ['122002', 'DLF QE / Chakkarpur'],
  ['122018', 'South City II'],
  ['122101', 'Badshahpur'],
  ['122102', 'Bhondsi'],
  ['122001', 'Gurgaon'],
  ['122017', 'Palam Vihar'],
  ['122006', 'Railway Road'],
  ['110033', 'Adarsh Nagar'],
])

export function verifiedAreaLabel(pincode, label) {
  const trimmed = typeof label === 'string' ? label.trim() : ''
  return verifiedLabels.get(pincode) === trimmed ? trimmed : ''
}
