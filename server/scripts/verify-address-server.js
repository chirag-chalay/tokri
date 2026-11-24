import express from 'express'
if (process.env.ADDRESS_AUTOCOMPLETE_TEST_SERVER !== '1') throw new Error('Set ADDRESS_AUTOCOMPLETE_TEST_SERVER=1 for this isolated fixture server.')
process.env.DATABASE_URL = 'mysql://invalid:invalid@127.0.0.1:1/address_browser_test'
process.env.JWT_SECRET = 'local-address-verification-only'
process.env.NODE_ENV = 'test'
process.env.MAPPLS_API_KEY = ''
const { prisma } = await import('../src/lib/prisma.js')
const { addressDirectory } = await import('../src/data/addressDirectory.js')
const { signCustomerToken } = await import('../src/services/jwt.js')
const user = { id: 'address-browser-test', phone: '9999900000', name: 'Address test', isActive: true, addresses: [] }
const network = [
  {pincode:'122009',areaLabel:'Galleria DLF Phase IV',isActive:true,morningEnabled:true,expressEnabled:false},
  {pincode:'122003',areaLabel:'Sector 45',isActive:true,morningEnabled:true,expressEnabled:false},
  {pincode:'122011',areaLabel:'Sector 56',isActive:true,morningEnabled:false,expressEnabled:true},
  {pincode:'122002',areaLabel:'DLF QE / Chakkarpur',isActive:true,morningEnabled:true,expressEnabled:true},
  {pincode:'110033',areaLabel:'Adarsh Nagar',isActive:true,morningEnabled:true,expressEnabled:false},
]
prisma.customer.findFirst = async ({where}={}) => !where || where.id === user.id || where.phone === user.phone ? structuredClone(user) : null
prisma.customer.findUnique = async () => structuredClone(user)
prisma.customer.update = async ({data}) => { Object.assign(user,data); return structuredClone(user) }
prisma.serviceablePincode.count = async () => network.length
prisma.serviceablePincode.findUnique = async ({where}) => network.find(row=>row.pincode === where.pincode) || null
prisma.serviceablePincode.findMany = async ({where}={}) => network.filter(row => !where?.pincode?.contains || row.pincode.includes(where.pincode.contains))
const { default: api } = await import('../src/routes/api.js')
const app = express()
app.set('trust proxy', 'loopback')
app.use(express.json())
app.get('/test-session', (req,res)=>res.json({ user: {...user, token: signCustomerToken(user)} }))
// Fixture state resets only; no SQL database, messaging, payment or order writes.
app.post('/test-reset', (req,res)=>{user.addresses=[];res.json({ok:true})})
app.use('/api/v1', (req, res, next) => {
  if (!/^\/(?:addresses\/search|delivery\/(?:pincodes|availability)|auth\/me|account\/addresses(?:\/[^/]+)?)$/.test(req.path)) return res.status(403).json({ message: 'Not part of isolated address verification' })
  next()
}, api)
app.use((err,req,res,next)=>res.status(err.status||500).json({message:err.message}))
app.listen(5253,'127.0.0.1',()=>console.log(`Isolated API ready; ${addressDirectory.length} sourced locations, memory-only customer/address storage`))
