import React, { useEffect, useMemo, useState } from 'react'
import { Box, Button, H3, Icon } from '@adminjs/design-system'
import { ApiClient, useNotice, useRecord } from 'adminjs'
import { SearchableSelect, StatusSwitch, isFlagOn } from './form-controls.jsx'
import { INDIA_STATES } from './india-states.js'

const api = new ApiClient()

const STATE_OPTIONS = INDIA_STATES.map((item) => ({
  value: item.code,
  label: `${item.name} (${item.code})`,
}))

const PincodeEdit = (props) => {
  const { record: initialRecord, resource, action } = props
  const addNotice = useNotice()
  const { record, handleChange, submit: handleSubmit, loading } = useRecord(
    initialRecord,
    resource.id,
  )
  const params = record?.params || {}
  const isNew = action?.name === 'new' || !record?.id
  const readOnly = action?.name === 'show'
  const isActive = isNew && (params.isActive === undefined || params.isActive === '')
    ? true
    : isFlagOn(params.isActive)
  const morningEnabled = isNew && (params.morningEnabled === undefined || params.morningEnabled === '')
    ? true
    : isFlagOn(params.morningEnabled)
  const expressEnabled = isNew && (params.expressEnabled === undefined || params.expressEnabled === '')
    ? false
    : isFlagOn(params.expressEnabled)
  const [partners, setPartners] = useState([])

  useEffect(() => {
    if (isNew && (params.isActive === undefined || params.isActive === '')) {
      handleChange('isActive', true)
    }
    if (isNew && (params.morningEnabled === undefined || params.morningEnabled === '')) {
      handleChange('morningEnabled', true)
    }
    if (isNew && (params.expressEnabled === undefined || params.expressEnabled === '')) {
      handleChange('expressEnabled', false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNew])

  useEffect(() => {
    let ignore = false
    api
      .resourceAction({ resourceId: 'DeliveryPartner', actionName: 'list', params: { perPage: 200 } })
      .then((response) => {
        if (ignore) return
        const records = response.data?.records || []
        setPartners(
          records.map((item) => ({
            value: item.id || item.params?.id,
            label: isFlagOn(item.params?.isActive)
              ? item.params?.name || 'Partner'
              : `${item.params?.name || 'Partner'} (inactive)`,
          })),
        )
      })
      .catch(() => {
        if (!ignore) setPartners([])
      })
    return () => {
      ignore = true
    }
  }, [])

  const errors = useMemo(() => record?.errors || {}, [record?.errors])
  const partnerId = params.partnerId || params.partner || ''
  const setField = (key, value) => handleChange(key, value)

  const submit = (event) => {
    event.preventDefault()
    handleSubmit()
      .then((response) => {
        const notice = response?.data?.notice
        if (notice?.type === 'error') {
          addNotice({ message: notice.message || 'Could not save pincode', type: 'error' })
          return
        }
        addNotice({ message: isNew ? 'Pincode added' : 'Pincode updated', type: 'success' })
      })
      .catch(() => {
        addNotice({ message: 'Could not save pincode. Please try again.', type: 'error' })
      })
    return false
  }

  return (
    <Box as="form" onSubmit={submit} className="tokri-coupon-form">
      <Box className="tokri-coupon-hero">
        <H3 color="white">{isNew ? 'Add serviceable pincode' : `PIN ${params.pincode || ''}`}</H3>
        <p style={{ margin: 0, color: '#fff', opacity: 0.9 }}>
          Customers can save an address and check out only when this pincode is active.
        </p>
      </Box>

      <Box className="tokri-coupon-grid">
        <section className="tokri-coupon-card">
          <h4>Delivery coverage</h4>
          <p>Turn this off to stop taking orders for this PIN without deleting it.</p>
          <StatusSwitch
            checked={isActive}
            disabled={readOnly}
            title={isActive ? 'We deliver here' : 'Not delivering'}
            hint={isActive ? 'Address save and checkout are allowed' : 'Customers will see that this PIN is not serviceable'}
            onChange={(next) => setField('isActive', next)}
          />
        </section>

        <section className="tokri-coupon-card">
          <h4>Delivery options</h4>
          <p>Turn an option off to show it as coming soon at checkout. If both are off, this PIN is not deliverable.</p>
          <StatusSwitch
            checked={morningEnabled}
            disabled={readOnly}
            onLabel="On"
            offLabel="Off"
            title="Morning delivery"
            hint={morningEnabled ? 'Shoppers can choose morning delivery' : 'Shown as coming soon'}
            onChange={(next) => setField('morningEnabled', next)}
          />
          <div style={{ height: 12 }} />
          <StatusSwitch
            checked={expressEnabled}
            disabled={readOnly}
            onLabel="On"
            offLabel="Off"
            title="Express delivery"
            hint={expressEnabled ? 'Shoppers can choose Express delivery' : 'Shown as coming soon'}
            onChange={(next) => setField('expressEnabled', next)}
          />
        </section>

        <section className="tokri-coupon-card">
          <h4>Assigned partner</h4>
          <p>New orders in this PIN are auto-assigned to this partner. You can reassign later on the order.</p>
          <label className="tokri-coupon-label">
            Delivery partner <span className="tokri-optional">(optional)</span>
            <SearchableSelect
              value={partnerId}
              options={[{ value: '', label: 'No partner assigned' }, ...partners]}
              disabled={readOnly}
              onChange={(next) => {
                setField('partnerId', next)
                setField('partner', next)
              }}
              placeholder="Select a partner"
              searchPlaceholder="Search partners"
            />
          </label>
        </section>
      </Box>

      <section className="tokri-coupon-card">
        <h4>Location</h4>
        <div className="tokri-coupon-two">
          <label className="tokri-coupon-label">
            Pincode
            <input
              className="tokri-coupon-input"
              inputMode="numeric"
              maxLength={6}
              required
              readOnly={readOnly || !isNew}
              value={params.pincode || ''}
              onChange={(event) => setField('pincode', event.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="6-digit PIN"
            />
            {errors.pincode ? <span className="tokri-field-error">{errors.pincode.message}</span> : (
              <span className="tokri-field-hint">India PIN code, 6 digits</span>
            )}
          </label>
          <label className="tokri-coupon-label">
            Area name <span className="tokri-optional">(optional)</span>
            <input
              className="tokri-coupon-input"
              readOnly={readOnly}
              value={params.areaLabel || ''}
              onChange={(event) => setField('areaLabel', event.target.value)}
              placeholder="Andheri West, Bandra, …"
            />
          </label>
        </div>
        <div className="tokri-coupon-two">
          <label className="tokri-coupon-label">
            City
            <input
              className="tokri-coupon-input"
              required
              readOnly={readOnly}
              value={params.city || ''}
              onChange={(event) => setField('city', event.target.value)}
              placeholder="Mumbai"
            />
            {errors.city ? <span className="tokri-field-error">{errors.city.message}</span> : null}
          </label>
          <label className="tokri-coupon-label">
            State
            <SearchableSelect
              value={params.stateCode || params.state || ''}
              options={[{ value: '', label: 'Select state' }, ...STATE_OPTIONS]}
              disabled={readOnly}
              onChange={(next) => {
                setField('stateCode', next)
                setField('state', next)
              }}
              placeholder="Select state"
              searchPlaceholder="Search states"
            />
            {errors.state || errors.stateCode ? (
              <span className="tokri-field-error">
                {(errors.state || errors.stateCode).message}
              </span>
            ) : (
              <span className="tokri-field-hint">All Indian states and union territories</span>
            )}
          </label>
        </div>
      </section>

      {readOnly ? null : (
        <Box className="tokri-coupon-actions">
          <Button variant="contained" type="submit" disabled={loading}>
            {loading ? <Icon icon="Loader" spin /> : null}
            {isNew ? 'Add pincode' : 'Save pincode'}
          </Button>
        </Box>
      )}
    </Box>
  )
}

export default PincodeEdit
