import { File, Paths } from 'expo-file-system'
import * as Sharing from 'expo-sharing'
import { API_BASE_URL } from '../config'
import { authHeaders } from './api'

export async function downloadOrderInvoice(orderNo, token) {
  const available = await Sharing.isAvailableAsync()
  if (!available) throw new Error('Invoice sharing is not available on this device.')

  const filename = `invoice-${String(orderNo).replace(/[^a-zA-Z0-9._-]/g, '-')}.pdf`
  const response = await fetch(
    `${API_BASE_URL}/account/orders/${encodeURIComponent(orderNo)}/invoice?download=1`,
    { headers: authHeaders(token) },
  )
  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new Error(body?.message || `Invoice download failed (${response.status}).`)
  }

  const contentType = response.headers.get('content-type') || ''
  if (!contentType.toLowerCase().includes('application/pdf')) {
    throw new Error('The server did not return a PDF invoice. Please try again later.')
  }

  const invoice = new File(Paths.cache, filename)
  invoice.create({ overwrite: true })
  await invoice.write(new Uint8Array(await response.arrayBuffer()))

  await Sharing.shareAsync(invoice.uri, {
    mimeType: 'application/pdf',
    dialogTitle: `Invoice ${orderNo}`,
    UTI: 'com.adobe.pdf',
  })
}
