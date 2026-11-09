import PDFDocument from 'pdfkit'
import { prisma } from '../lib/prisma.js'
import { calcItemTax } from '../config/charges.js'
import { formatExpectedDeliveryDate } from './delivery.js'
import { orderPricesIncludeGst } from '../utils/tax.js'

function formatMoney(value) {
  const amount = Number(value || 0)
  return `Rs. ${amount.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function formatTableMoney(value) {
  return formatMoney(value)
}

function formatDate(date) {
  if (!date) return '—'
  const d = new Date(date)
  return d.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

function parseAddress(raw) {
  if (!raw) return null
  if (typeof raw === 'object') return raw
  try {
    return JSON.parse(raw)
  } catch {
    return null
  }
}

/**
 * Loads order data along with store settings and generates a PDF invoice buffer.
 */
export async function generateOrderInvoicePdf(orderIdOrNo) {
  const order = await prisma.order.findFirst({
    where: {
      OR: [
        { id: orderIdOrNo },
        { orderNo: orderIdOrNo },
      ],
    },
    include: {
      customer: true,
      items: { orderBy: { id: 'asc' } },
    },
  })

  if (!order) {
    const error = new Error(`Order not found: ${orderIdOrNo}`)
    error.status = 404
    throw error
  }

  const settings = (await prisma.setting.findUnique({ where: { id: 1 } })) || {}
  const address = parseAddress(order.address)

  const storeName = settings.storeName || 'Tokriii'
  const storeTagline = settings.storeTagline || 'Premium Fruits for Discerning Tastes'
  const storeAddress = settings.storeAddress || 'C 617 Azadpur Fruit Market, New Delhi'
  const storeEmail = settings.storeEmail || 'support@tokriii.com'
  const storePhones = [settings.storePhone1, settings.storePhone2].filter(Boolean).join(', ') || '9580280280'

  const invoiceNo = `INV-${order.orderNo}`
  const customerName = order.customer?.name || address?.name || 'Customer'
  const customerPhone = order.customer?.phone || address?.phone || '—'
  const customerEmail = address?.email || '—'

  const addressLines = [
    address?.line1,
    address?.line2,
    [address?.city, address?.state, address?.pincode].filter(Boolean).join(', '),
    address?.landmark ? `Landmark: ${address.landmark}` : null,
  ].filter(Boolean)

  const paymentMethod =
    order.paymentCollectedAs === 'cash'
      ? 'Cash on Delivery'
      : order.paymentCollectedAs === 'qr'
        ? 'Razorpay QR'
        : order.paymentMode === 'online' || order.razorpayPaymentId
          ? 'Online (Razorpay)'
          : 'Cash on Delivery'
  const gstInclusive = orderPricesIncludeGst(order)
  const inclusiveItemTaxes = gstInclusive
    ? order.items.map((item) => calcItemTax(item, Boolean(order.isInterState)))
    : null

  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 36,
        info: {
          Title: `Invoice - ${order.orderNo}`,
          Author: storeName,
          Subject: `Tax Invoice for Order ${order.orderNo}`,
        },
      })

      const buffers = []
      doc.on('data', (chunk) => buffers.push(chunk))
      doc.on('end', () => resolve({ buffer: Buffer.concat(buffers), order, invoiceNo }))
      doc.on('error', (err) => reject(err))

      const pageWidth = doc.page.width - 72 // 523pt usable
      const left = 36
      const right = 36 + pageWidth

      // Palette
      const brandColor = '#047857' // emerald green
      const darkColor = '#0f172a'  // slate 900
      const mutedColor = '#64748b' // slate 500
      const lightBg = '#f8fafc'   // slate 50
      const borderColor = '#e2e8f0' // slate 200

      // ==========================================
      // 1. HEADER: BRAND & INVOICE TITLE
      // ==========================================
      doc.rect(left, 36, pageWidth, 4).fill(brandColor)

      let y = 50
      // Left: Store branding
      doc
        .fillColor(brandColor)
        .font('Helvetica-Bold')
        .fontSize(22)
        .text(storeName.toUpperCase(), left, y, { characterSpacing: 1 })

      doc
        .fillColor(mutedColor)
        .font('Helvetica-Oblique')
        .fontSize(9)
        .text(storeTagline, left, (y += 26))

      doc
        .fillColor(darkColor)
        .font('Helvetica')
        .fontSize(8.5)
        .text(storeAddress, left, (y += 14), { width: 230 })

      const addressHeight = doc.heightOfString(storeAddress, { width: 230 })
      y += addressHeight + 2

      doc
        .fillColor(mutedColor)
        .font('Helvetica')
        .fontSize(8.5)
        .text(`Email: ${storeEmail}  |  Phone: ${storePhones}`, left, y)

      // Right: TAX INVOICE block
      const rightColX = right - 200
      let rightY = 50

      doc
        .fillColor(darkColor)
        .font('Helvetica-Bold')
        .fontSize(16)
        .text('TAX INVOICE', rightColX, rightY, { align: 'right', width: 200 })

      rightY += 22
      doc
        .fillColor(mutedColor)
        .font('Helvetica-Bold')
        .fontSize(9)
        .text('Invoice No: ', rightColX, rightY, { width: 80, align: 'left' })
      doc
        .fillColor(darkColor)
        .font('Helvetica-Bold')
        .fontSize(9)
        .text(invoiceNo, rightColX + 70, rightY, { width: 130, align: 'right' })

      rightY += 14
      doc
        .fillColor(mutedColor)
        .font('Helvetica')
        .fontSize(8.5)
        .text('Order No: ', rightColX, rightY, { width: 80, align: 'left' })
      doc
        .fillColor(darkColor)
        .font('Helvetica')
        .fontSize(8.5)
        .text(order.orderNo, rightColX + 70, rightY, { width: 130, align: 'right' })

      rightY += 14
      doc
        .fillColor(mutedColor)
        .font('Helvetica')
        .fontSize(8.5)
        .text('Order Date: ', rightColX, rightY, { width: 80, align: 'left' })
      doc
        .fillColor(darkColor)
        .font('Helvetica')
        .fontSize(8.5)
        .text(formatDate(order.createdAt), rightColX + 70, rightY, { width: 130, align: 'right' })

      rightY += 14
      doc
        .fillColor(mutedColor)
        .font('Helvetica')
        .fontSize(8.5)
        .text('Payment: ', rightColX, rightY, { width: 80, align: 'left' })
      doc
        .fillColor(darkColor)
        .font('Helvetica')
        .fontSize(8.5)
        .text(`${paymentMethod} (${(order.paymentStatus || 'pending').toUpperCase()})`, rightColX + 70, rightY, { width: 130, align: 'right' })

      rightY += 14
      doc
        .fillColor(mutedColor)
        .font('Helvetica')
        .fontSize(8.5)
        .text('Status: ', rightColX, rightY, { width: 80, align: 'left' })
      doc
        .fillColor(brandColor)
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .text((order.status || 'pending').toUpperCase(), rightColX + 70, rightY, { width: 130, align: 'right' })

      y = Math.max(y + 14, rightY + 18)

      // Divider line
      doc
        .strokeColor(borderColor)
        .lineWidth(1)
        .moveTo(left, y)
        .lineTo(right, y)
        .stroke()

      y += 12

      // ==========================================
      // 2. BILL TO / SHIP TO & ORDER DETAILS
      // ==========================================
      const boxWidth = (pageWidth - 12) / 2
      const boxHeight = 72

      // Bill To / Customer Box
      doc.rect(left, y, boxWidth, boxHeight).fill(lightBg)
      doc.rect(left, y, boxWidth, boxHeight).strokeColor(borderColor).lineWidth(0.5).stroke()

      doc
        .fillColor(brandColor)
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .text('CUSTOMER DETAILS', left + 10, y + 8)

      doc
        .fillColor(darkColor)
        .font('Helvetica-Bold')
        .fontSize(9.5)
        .text(customerName, left + 10, y + 22)

      doc
        .fillColor(mutedColor)
        .font('Helvetica')
        .fontSize(8.5)
        .text(`Phone: +91 ${customerPhone}`, left + 10, y + 36)

      if (customerEmail && customerEmail !== '—') {
        doc.text(`Email: ${customerEmail}`, left + 10, y + 48)
      }

      // Ship To / Delivery Box
      const rightBoxX = left + boxWidth + 12
      doc.rect(rightBoxX, y, boxWidth, boxHeight).fill(lightBg)
      doc.rect(rightBoxX, y, boxWidth, boxHeight).strokeColor(borderColor).lineWidth(0.5).stroke()

      doc
        .fillColor(brandColor)
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .text('DELIVERY ADDRESS', rightBoxX + 10, y + 8)

      const addrSummary = addressLines.slice(0, 3).join(', ') || 'Address on file'
      doc
        .fillColor(darkColor)
        .font('Helvetica')
        .fontSize(8.5)
        .text(addrSummary, rightBoxX + 10, y + 22, { width: boxWidth - 20, height: 32 })

      const expectedDelivery = formatExpectedDeliveryDate(order.expectedDeliveryDate)
      doc
        .fillColor(mutedColor)
        .font('Helvetica')
        .fontSize(8)
        .text(expectedDelivery ? `Expected delivery: ${expectedDelivery}` : '', rightBoxX + 10, y + 54)

      y += boxHeight + 16

      // ==========================================
      // 3. ITEMS TABLE
      // ==========================================
      const tableScale = pageWidth / 523
      const colProductW = 103 * tableScale
      const colHsnW = 38 * tableScale
      const colQtyW = 24 * tableScale
      const colRateW = 58 * tableScale
      const colTaxableW = 56 * tableScale
      const colGstRateW = 36 * tableScale
      const colCgstW = 52 * tableScale
      const colSgstW = 52 * tableScale
      const colIgstW = 52 * tableScale
      const colTotalW = 52 * tableScale

      const colProductX = left
      const colHsnX = colProductX + colProductW
      const colQtyX = colHsnX + colHsnW
      const colRateX = colQtyX + colQtyW
      const colTaxableX = colRateX + colRateW
      const colGstRateX = colTaxableX + colTaxableW
      const colCgstX = colGstRateX + colGstRateW
      const colSgstX = colCgstX + colCgstW
      const colIgstX = colSgstX + colSgstW
      const colTotalX = colIgstX + colIgstW

      // Table Header Row
      doc.rect(left, y, pageWidth, 20).fill(brandColor)

      doc
        .fillColor('#ffffff')
        .font('Helvetica-Bold')
        .fontSize(7.5)

      doc.text('Product', colProductX + 4, y + 6, { width: colProductW - 6, align: 'left' })
      doc.text('HSN', colHsnX, y + 6, { width: colHsnW, align: 'center' })
      doc.text('Qty', colQtyX, y + 6, { width: colQtyW - 2, align: 'right' })
      doc.text('Rate', colRateX, y + 6, { width: colRateW - 2, align: 'right' })
      doc.text('Taxable Amt', colTaxableX, y + 6, { width: colTaxableW - 2, align: 'right' })
      doc.text('GST %', colGstRateX, y + 6, { width: colGstRateW - 2, align: 'right' })
      doc.text('CGST', colCgstX, y + 6, { width: colCgstW - 2, align: 'right' })
      doc.text('SGST', colSgstX, y + 6, { width: colSgstW - 2, align: 'right' })
      doc.text('IGST', colIgstX, y + 6, { width: colIgstW - 2, align: 'right' })
      doc.text('Line Total', colTotalX, y + 6, { width: colTotalW - 4, align: 'right' })

      y += 20

      // Table Rows
      let rowIndex = 0
      for (const [itemIndex, item] of order.items.entries()) {
        // Page break safety check
        if (y > doc.page.height - 150) {
          doc.addPage()
          y = 36
        }

        const rowBg = rowIndex % 2 === 0 ? '#ffffff' : '#fcfdfd'
        doc.rect(left, y, pageWidth, 22).fill(rowBg)
        doc.rect(left, y, pageWidth, 22).strokeColor(borderColor).lineWidth(0.5).stroke()

        const itemAmount = Math.round((Number(item.priceValue) * item.quantity - Number(item.discount || 0)) * 100) / 100
        const inclusiveTax = inclusiveItemTaxes?.[itemIndex]
        const itemTaxAmount = Number(inclusiveTax?.taxAmount ?? item.taxAmount ?? 0)
        const isTax = Boolean(item.isTaxable)
        const gstRateNum = Number(item.gstRate || 0)
        const itemTaxableAmount = inclusiveTax
          ? inclusiveTax.lineTaxableAmount
          : itemAmount
        const itemLineTotal = inclusiveTax
          ? inclusiveTax.lineTotal
          : itemAmount + itemTaxAmount

        const cgstAmount = inclusiveTax?.cgstAmount ?? Number(item.cgstAmount || 0)
        const sgstAmount = inclusiveTax?.sgstAmount ?? Number(item.sgstAmount || 0)
        const igstAmount = inclusiveTax?.igstAmount ?? Number(item.igstAmount || 0)
        const cgstStr = cgstAmount > 0
          ? formatTableMoney(cgstAmount)
          : (order.isInterState ? '—' : 'Rs. 0.00')
        const sgstStr = sgstAmount > 0
          ? formatTableMoney(sgstAmount)
          : (order.isInterState ? '—' : 'Rs. 0.00')
        const igstStr = igstAmount > 0
          ? formatTableMoney(igstAmount)
          : (!order.isInterState ? '—' : 'Rs. 0.00')

        doc
          .fillColor(darkColor)
          .font('Helvetica')
          .fontSize(7.5)

        doc.font('Helvetica-Bold').text(item.name, colProductX + 4, y + 6, { width: colProductW - 6, lineBreak: false })
        doc.font('Helvetica').text(item.hsnCode || '—', colHsnX, y + 6, { width: colHsnW, align: 'center' })
        doc.text(String(item.quantity), colQtyX, y + 6, { width: colQtyW - 2, align: 'right' })
        doc.text(formatTableMoney(item.priceValue), colRateX, y + 6, { width: colRateW - 2, align: 'right' })
        doc.text(formatTableMoney(itemTaxableAmount), colTaxableX, y + 6, { width: colTaxableW - 2, align: 'right' })
        doc.text(isTax && gstRateNum > 0 ? `${gstRateNum}%` : '0%', colGstRateX, y + 6, { width: colGstRateW - 2, align: 'right' })
        doc.text(cgstStr, colCgstX, y + 6, { width: colCgstW - 2, align: 'right' })
        doc.text(sgstStr, colSgstX, y + 6, { width: colSgstW - 2, align: 'right' })
        doc.text(igstStr, colIgstX, y + 6, { width: colIgstW - 2, align: 'right' })
        doc.font('Helvetica-Bold').text(formatTableMoney(itemLineTotal), colTotalX, y + 6, {
          width: colTotalW - 2,
          align: 'right',
        })

        y += 22
        rowIndex++
      }

      y += 10

      // ==========================================
      // 4. TOTALS BREAKDOWN
      // ==========================================
      const summaryW = 230
      const summaryX = right - summaryW

      const renderTotalLine = (label, value, isBold = false, color = darkColor, fontSize = 8.5) => {
        doc
          .fillColor(color)
          .font(isBold ? 'Helvetica-Bold' : 'Helvetica')
          .fontSize(fontSize)
          .text(label, summaryX, y, { width: 115, align: 'left' })
          .text(value, summaryX + 115, y, { width: 115, align: 'right' })
        y += fontSize + 4
      }

      // Left notes block
      const notesY = y
      doc
        .fillColor(brandColor)
        .font('Helvetica-Bold')
        .fontSize(8.5)
        .text('TAX & BILLING POLICY', left, notesY)
      doc
        .fillColor(mutedColor)
        .font('Helvetica')
        .fontSize(8)
        .text(
          gstInclusive
            ? '• Product prices include GST; taxable value and tax are shown separately below.'
            : '• GST is shown at applicable statutory rates per product.',
          left,
          notesY + 12,
        )
        .text('• Tokriii guarantees 100% freshness on all farm-sourced produce.', left, notesY + 24)
        .text('• This is a computer-generated tax invoice and requires no signature.', left, notesY + 36)

      // Right totals calculation
      renderTotalLine(
        `Items total${gstInclusive ? ' (incl. GST)' : ''}:`,
        formatMoney(order.itemsTotal),
      )

      if (Number(order.discount) > 0) {
        if (order.automaticDiscount) {
          renderTotalLine(`Automatic (${order.automaticDiscount.percentage}%):`, `-${formatMoney(order.automaticDiscount.discount)}`, false, '#dc2626')
          const shippingDiscount = Number(order.discount) - Number(order.automaticDiscount.discount)
          if (shippingDiscount > 0) renderTotalLine('Shipping coupon:', `-${formatMoney(shippingDiscount)}`, false, '#dc2626')
        } else {
          renderTotalLine(`Discount (${order.couponCode || 'Promo'}):`, `-${formatMoney(order.discount)}`, false, '#dc2626')
        }
      } else {
        renderTotalLine('Discount:', 'Rs. 0.00', false, mutedColor)
      }

      const taxableValue = order.items.reduce((sum, item, index) => {
        const lineAmount = Number(item.priceValue) * item.quantity - Number(item.discount || 0)
        const taxable = inclusiveItemTaxes
          ? inclusiveItemTaxes[index].lineTaxableAmount
          : lineAmount
        return sum + taxable
      }, 0)
      renderTotalLine('Taxable value:', formatMoney(taxableValue))

      const inclusiveTotal = (key) =>
        inclusiveItemTaxes?.reduce((sum, itemTax) => sum + itemTax[key], 0)
      const cgstTotalVal = inclusiveTotal('cgstAmount') ?? Number(order.cgstTotal || 0)
      const sgstTotalVal = inclusiveTotal('sgstAmount') ?? Number(order.sgstTotal || 0)
      const igstTotalVal = inclusiveTotal('igstAmount') ?? Number(order.igstTotal || 0)
      const taxTotalVal = inclusiveTotal('taxAmount') ?? Number(order.taxTotal || 0)
      const taxRates = [...new Set(order.items
        .filter((item) => item.isTaxable && Number(item.gstRate) > 0)
        .map((item) => Number(item.gstRate)))]
      const singleTaxRate = taxRates.length === 1 ? taxRates[0] : null
      const rateText = (rate) => String(Number(rate.toFixed(2)))

      renderTotalLine(
        singleTaxRate && !order.isInterState ? `CGST @ ${rateText(singleTaxRate / 2)}%:` : 'CGST:',
        order.isInterState ? '—' : formatMoney(cgstTotalVal),
      )
      renderTotalLine(
        singleTaxRate && !order.isInterState ? `SGST @ ${rateText(singleTaxRate / 2)}%:` : 'SGST:',
        order.isInterState ? '—' : formatMoney(sgstTotalVal),
      )
      renderTotalLine(
        singleTaxRate && order.isInterState ? `IGST @ ${rateText(singleTaxRate)}%:` : 'IGST:',
        !order.isInterState ? '—' : formatMoney(igstTotalVal),
      )
      renderTotalLine('Total GST:', formatMoney(taxTotalVal), true)
      if (gstInclusive && taxTotalVal > 0) {
        renderTotalLine('GST included in item prices:', 'Yes', false, mutedColor)
      }

      const isFreeDelivery = order.freeDeliveryApplied || Number(order.deliveryCharge) === 0
      const deliveryText = isFreeDelivery
        ? 'FREE (Offer)'
        : formatMoney(order.deliveryCharge)

      renderTotalLine('Delivery:', deliveryText, false, isFreeDelivery ? brandColor : darkColor)

      if (Number(order.handlingCharge) > 0) {
        renderTotalLine('Cart Handling:', formatMoney(order.handlingCharge))
      }

      if (Number(order.smallCartCharge) > 0) {
        renderTotalLine('Small Cart Fee:', formatMoney(order.smallCartCharge))
      }

      y += 2
      doc.strokeColor(brandColor).lineWidth(1.5).moveTo(summaryX, y).lineTo(right, y).stroke()
      y += 6

      renderTotalLine('Grand Total:', formatMoney(order.grandTotal), true, brandColor, 12)

      // ==========================================
      // 5. FOOTER
      // ==========================================
      const footerY = doc.page.height - 66
      doc.strokeColor(borderColor).lineWidth(0.5).moveTo(left, footerY).lineTo(right, footerY).stroke()

      doc
        .fillColor(mutedColor)
        .font('Helvetica')
        .fontSize(8)
        .text(
          `Thank you for shopping with ${storeName}! For queries, please email ${storeEmail} or WhatsApp us at +91 ${storePhones}.`,
          left,
          footerY + 8,
          { align: 'center', width: pageWidth },
        )

      doc.end()
    } catch (error) {
      reject(error)
    }
  })
}
