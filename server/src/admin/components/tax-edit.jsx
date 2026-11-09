import React from 'react'
import { Box, Button, H3, Icon, Text } from '@adminjs/design-system'
import { useNotice, useRecord } from 'adminjs'
import { isFlagOn, StatusSwitch } from './form-controls.jsx'

const TaxEdit = (props) => {
  const { record: initialRecord, resource } = props
  const { record, handleChange, submit: handleSubmit, loading } = useRecord(
    initialRecord,
    resource.id,
  )
  const addNotice = useNotice()
  const params = record?.params || {}

  const setField = (key, value) => handleChange(key, value)

  const isTaxableBool = isFlagOn(params.isTaxable)

  const handleTaxableToggle = (value) => {
    setField('isTaxable', value)
    if (!value) {
      setField('gstRate', 0)
    } else if (Number(params.gstRate || 0) === 0) {
      setField('gstRate', 5)
    }
  }

  const onSubmit = async (event) => {
    event?.preventDefault?.()
    try {
      await handleSubmit()
      addNotice({ message: 'Tax configuration updated successfully.', type: 'success' })
    } catch (error) {
      addNotice({ message: error.message || 'Failed to update tax configuration', type: 'error' })
    }
  }

  return (
    <Box as="form" onSubmit={onSubmit} className="tokri-coupon-form">
      <Box className="tokri-coupon-head">
        <div>
          <H3>{params.productName || 'Edit Product Tax'}</H3>
          <Text opacity={0.7}>
            Configure HSN code and GST percentage for this product.
          </Text>
        </div>
      </Box>

      <section className="tokri-coupon-card">
        <h4>Product details</h4>
        <div className="tokri-coupon-grid">
          <label className="tokri-coupon-label">
            Product name
            <input
              className="tokri-coupon-input"
              value={params.productName || ''}
              disabled
              style={{ opacity: 0.7, cursor: 'not-allowed' }}
            />
          </label>
          <label className="tokri-coupon-label">
            Category
            <input
              className="tokri-coupon-input"
              value={params.categoryName || 'General'}
              disabled
              style={{ opacity: 0.7, cursor: 'not-allowed' }}
            />
          </label>
        </div>
      </section>

      <section className="tokri-coupon-card">
        <h4>Taxability status</h4>
        <StatusSwitch
          checked={isTaxableBool}
          title="Taxable"
          hint={isTaxableBool ? 'GST is included in the product price and shown on the invoice' : '0% GST (fresh fruits / exempt)'}
          onLabel="Yes"
          offLabel="No"
          onChange={handleTaxableToggle}
        />
      </section>

      <section className="tokri-coupon-card">
        <h4>GST & HSN details</h4>
        <div className="tokri-coupon-grid">
          <label className="tokri-coupon-label">
            HSN code
            <input
              className="tokri-coupon-input"
              value={params.hsnCode || '0808'}
              onChange={(event) => setField('hsnCode', event.target.value)}
              placeholder="e.g. 0802 for dry fruits, 0808 for fresh fruits"
            />
          </label>
          <label className="tokri-coupon-label">
            GST % rate
            <input
              className="tokri-coupon-input"
              type="number"
              step="0.01"
              min="0"
              max="100"
              value={params.gstRate ?? (isTaxableBool ? 5 : 0)}
              onChange={(event) => setField('gstRate', Number(event.target.value) || 0)}
              placeholder="e.g. 5 for dry fruits"
            />
          </label>
        </div>
        <Text mt="sm" opacity={0.7} fontSize="12px">
          {isTaxableBool
            ? `GST is included in the product price. Intra-state invoices split it into ${(Number(params.gstRate || 5) / 2).toFixed(1)}% CGST + ${(Number(params.gstRate || 5) / 2).toFixed(1)}% SGST; inter-state invoices show ${Number(params.gstRate || 5)}% IGST.`
            : 'Product is exempt/non-taxable (0% GST).'}
        </Text>
      </section>

      <Box className="tokri-coupon-actions">
        <Button variant="contained" type="submit" disabled={loading}>
          {loading ? <Icon icon="Loader" spin /> : null}
          Save tax settings
        </Button>
      </Box>
    </Box>
  )
}

export default TaxEdit
