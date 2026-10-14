import React, { useEffect, useMemo } from 'react'
import { Box, Button, H3, Icon, Text } from '@adminjs/design-system'
import { useNotice, useRecord } from 'adminjs'
import { LocalSelect, SearchableSelect, StatusSwitch, isFlagOn } from './form-controls.jsx'
import { INDIA_STATES } from './india-states.js'

const VEHICLE_TYPES = [
  { value: 'Bike', label: 'Bike' },
  { value: 'Scooter', label: 'Scooter' },
  { value: 'Electric bike', label: 'Electric bike' },
  { value: 'Cycle', label: 'Cycle' },
  { value: 'Van', label: 'Van' },
  { value: 'Other', label: 'Other' },
]

const STATE_OPTIONS = INDIA_STATES.map((item) => ({
  value: item.name,
  label: item.name,
}))

function FieldError({ error }) {
  if (!error?.message) return null
  return <span className="tokri-field-error">{error.message}</span>
}

const PartnerEdit = (props) => {
  const { record: initialRecord, resource, action } = props
  const addNotice = useNotice()
  const { record, handleChange, submit: handleSubmit, loading } = useRecord(
    initialRecord,
    resource.id,
  )
  const params = record?.params || {}
  const isNew = action?.name === 'new' || !record?.id
  const readOnly = action?.name === 'show'
  const hasPassword = Boolean(params.hasPassword)
  const isActive = isNew && (params.isActive === undefined || params.isActive === '')
    ? true
    : isFlagOn(params.isActive)

  useEffect(() => {
    if (isNew && (params.isActive === undefined || params.isActive === '')) {
      handleChange('isActive', true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNew])

  const errors = useMemo(() => record?.errors || {}, [record?.errors])
  const setField = (key, value) => handleChange(key, value)

  const submit = (event) => {
    event.preventDefault()
    handleSubmit()
      .then((response) => {
        const notice = response?.data?.notice
        if (notice?.type === 'error') {
          addNotice({ message: notice.message || 'Could not save partner', type: 'error' })
          return
        }
        addNotice({
          message: isNew
            ? 'Partner saved. A password email will be sent if they do not have a password yet.'
            : 'Partner updated',
          type: 'success',
        })
      })
      .catch(() => {
        addNotice({ message: 'Could not save partner. Please try again.', type: 'error' })
      })
    return false
  }

  return (
    <Box as="form" onSubmit={submit} className="tokri-coupon-form">
      <Box className="tokri-coupon-hero">
        <H3 color="white">{isNew ? 'Add delivery partner' : params.name || 'Delivery partner'}</H3>
        <Text color="white">
          Collect full KYC and contact details. They log in to the Tokriii Partner app with this email
          after setting a password from the invite mail.
        </Text>
      </Box>

      <Box className="tokri-coupon-grid">
        <section className="tokri-coupon-card">
          <h4>Account status</h4>
          <p>Inactive partners cannot log in, even if they already set a password.</p>
          <StatusSwitch
            checked={isActive}
            disabled={readOnly}
            title={isActive ? 'Active' : 'Inactive'}
            hint={isActive ? 'Can sign in to the partner app' : 'Login is blocked until you turn this on'}
            onChange={(next) => setField('isActive', next)}
          />
          {!isNew ? (
            <Text mt="lg" opacity={0.7}>
              {hasPassword ? 'Password is already set.' : 'No password yet — send the invite email after saving.'}
            </Text>
          ) : null}
        </section>

        <section className="tokri-coupon-card">
          <h4>Login details</h4>
          <p>Email is used to create and reset the partner password. No SMS is sent.</p>
          <label className="tokri-coupon-label">
            Email
            <input
              className="tokri-coupon-input"
              type="email"
              required
              readOnly={readOnly}
              value={params.email || ''}
              onChange={(event) => setField('email', event.target.value)}
              placeholder="partner@example.com"
            />
            {errors.email ? <FieldError error={errors.email} /> : (
              <span className="tokri-field-hint">Password link is sent to this inbox</span>
            )}
          </label>
          <label className="tokri-coupon-label">
            Mobile number
            <input
              className="tokri-coupon-input"
              inputMode="numeric"
              maxLength={10}
              required
              readOnly={readOnly}
              value={params.phone || ''}
              onChange={(event) => setField('phone', event.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="10-digit number"
            />
            <FieldError error={errors.phone} />
          </label>
        </section>
      </Box>

      <section className="tokri-coupon-card">
        <h4>Personal details</h4>
        <p>Name is shown on orders. Father&apos;s name and DOB help with KYC records.</p>
        <div className="tokri-coupon-two">
          <label className="tokri-coupon-label">
            Full name
            <input
              className="tokri-coupon-input"
              required
              readOnly={readOnly}
              value={params.name || ''}
              onChange={(event) => setField('name', event.target.value)}
              placeholder="Partner full name"
            />
            <FieldError error={errors.name} />
          </label>
          <label className="tokri-coupon-label">
            Father&apos;s / guardian name <span className="tokri-optional">(optional)</span>
            <input
              className="tokri-coupon-input"
              readOnly={readOnly}
              value={params.fatherName || ''}
              onChange={(event) => setField('fatherName', event.target.value)}
              placeholder="As on Aadhaar / documents"
            />
          </label>
        </div>
        <label className="tokri-coupon-label">
          Date of birth <span className="tokri-optional">(optional)</span>
          <input
            className="tokri-coupon-input"
            type="date"
            readOnly={readOnly}
            value={params.dateOfBirth || ''}
            onChange={(event) => setField('dateOfBirth', event.target.value)}
          />
        </label>
      </section>

      <section className="tokri-coupon-card">
        <h4>KYC documents</h4>
        <p>PAN and Aadhaar are required for partner onboarding.</p>
        <div className="tokri-coupon-two">
          <label className="tokri-coupon-label">
            PAN number
            <input
              className="tokri-coupon-input"
              required
              readOnly={readOnly}
              maxLength={10}
              value={params.panNumber || ''}
              onChange={(event) =>
                setField('panNumber', event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 10))
              }
              placeholder="ABCDE1234F"
            />
            <FieldError error={errors.panNumber} />
          </label>
          <label className="tokri-coupon-label">
            Aadhaar number
            <input
              className="tokri-coupon-input"
              required
              readOnly={readOnly}
              inputMode="numeric"
              maxLength={12}
              value={params.aadhaarNumber || ''}
              onChange={(event) =>
                setField('aadhaarNumber', event.target.value.replace(/\D/g, '').slice(0, 12))
              }
              placeholder="12-digit Aadhaar"
            />
            <FieldError error={errors.aadhaarNumber} />
          </label>
        </div>
      </section>

      <section className="tokri-coupon-card">
        <h4>Current address</h4>
        <p>Where the partner currently lives / operates from.</p>
        <div className="tokri-coupon-two">
          <label className="tokri-coupon-label">
            Address line 1
            <input
              className="tokri-coupon-input"
              required
              readOnly={readOnly}
              value={params.addressLine1 || ''}
              onChange={(event) => setField('addressLine1', event.target.value)}
              placeholder="House / street / area"
            />
            <FieldError error={errors.addressLine1} />
          </label>
          <label className="tokri-coupon-label">
            Address line 2 <span className="tokri-optional">(optional)</span>
            <input
              className="tokri-coupon-input"
              readOnly={readOnly}
              value={params.addressLine2 || ''}
              onChange={(event) => setField('addressLine2', event.target.value)}
              placeholder="Landmark, colony"
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
              placeholder="City"
            />
            <FieldError error={errors.city} />
          </label>
          <label className="tokri-coupon-label">
            Pincode
            <input
              className="tokri-coupon-input"
              required
              readOnly={readOnly}
              inputMode="numeric"
              maxLength={6}
              value={params.pincode || ''}
              onChange={(event) => setField('pincode', event.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="6-digit pincode"
            />
            <FieldError error={errors.pincode} />
          </label>
        </div>
        <label className="tokri-coupon-label">
          State
          <SearchableSelect
            value={params.state || ''}
            options={[{ value: '', label: 'Select state' }, ...STATE_OPTIONS]}
            onChange={(next) => setField('state', next)}
            disabled={readOnly}
            placeholder="Select state"
            searchPlaceholder="Search states"
          />
          <FieldError error={errors.state} />
        </label>
        <label className="tokri-coupon-label">
          Permanent address <span className="tokri-optional">(optional)</span>
          <textarea
            className="tokri-coupon-input tokri-textarea"
            rows={3}
            readOnly={readOnly}
            value={params.permanentAddress || ''}
            onChange={(event) => setField('permanentAddress', event.target.value)}
            placeholder="If different from current address"
          />
        </label>
      </section>

      <Box className="tokri-coupon-grid">
        <section className="tokri-coupon-card">
          <h4>Emergency contact</h4>
          <p>Someone we can call if the partner is unreachable.</p>
          <label className="tokri-coupon-label">
            Contact name <span className="tokri-optional">(optional)</span>
            <input
              className="tokri-coupon-input"
              readOnly={readOnly}
              value={params.emergencyName || ''}
              onChange={(event) => setField('emergencyName', event.target.value)}
              placeholder="Relative / friend name"
            />
          </label>
          <label className="tokri-coupon-label">
            Contact mobile <span className="tokri-optional">(optional)</span>
            <input
              className="tokri-coupon-input"
              inputMode="numeric"
              maxLength={10}
              readOnly={readOnly}
              value={params.emergencyPhone || ''}
              onChange={(event) =>
                setField('emergencyPhone', event.target.value.replace(/\D/g, '').slice(0, 10))
              }
              placeholder="10-digit number"
            />
            <FieldError error={errors.emergencyPhone} />
          </label>
        </section>

        <section className="tokri-coupon-card">
          <h4>Vehicle details</h4>
          <p>Used for delivery assignment and support.</p>
          <label className="tokri-coupon-label">
            Vehicle type <span className="tokri-optional">(optional)</span>
            <div style={{ marginTop: 6 }}>
              <LocalSelect
                value={params.vehicleType || ''}
                options={[{ value: '', label: 'Select vehicle' }, ...VEHICLE_TYPES]}
                onChange={(next) => setField('vehicleType', next)}
                disabled={readOnly}
              />
            </div>
          </label>
          <label className="tokri-coupon-label">
            Vehicle number <span className="tokri-optional">(optional)</span>
            <input
              className="tokri-coupon-input"
              readOnly={readOnly}
              value={params.vehicleNumber || ''}
              onChange={(event) =>
                setField('vehicleNumber', event.target.value.toUpperCase().slice(0, 20))
              }
              placeholder="e.g. MH12AB1234"
            />
          </label>
        </section>
      </Box>

      <section className="tokri-coupon-card">
        <h4>Bank details</h4>
        <p>For payouts and reimbursements. Optional for now, but recommended.</p>
        <div className="tokri-coupon-two">
          <label className="tokri-coupon-label">
            Account holder name <span className="tokri-optional">(optional)</span>
            <input
              className="tokri-coupon-input"
              readOnly={readOnly}
              value={params.accountHolderName || ''}
              onChange={(event) => setField('accountHolderName', event.target.value)}
              placeholder="As per bank account"
            />
          </label>
          <label className="tokri-coupon-label">
            Account number <span className="tokri-optional">(optional)</span>
            <input
              className="tokri-coupon-input"
              readOnly={readOnly}
              value={params.accountNumber || ''}
              onChange={(event) => setField('accountNumber', event.target.value.replace(/\s+/g, ''))}
              placeholder="Bank account number"
            />
          </label>
        </div>
        <label className="tokri-coupon-label">
          IFSC code <span className="tokri-optional">(optional)</span>
          <input
            className="tokri-coupon-input"
            readOnly={readOnly}
            maxLength={11}
            value={params.ifscCode || ''}
            onChange={(event) =>
              setField('ifscCode', event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11))
            }
            placeholder="SBIN0001234"
          />
          <FieldError error={errors.ifscCode} />
        </label>
      </section>

      <section className="tokri-coupon-card">
        <h4>Internal notes</h4>
        <label className="tokri-coupon-label">
          Notes <span className="tokri-optional">(optional)</span>
          <textarea
            className="tokri-coupon-input tokri-textarea"
            rows={4}
            readOnly={readOnly}
            value={params.notes || ''}
            onChange={(event) => setField('notes', event.target.value)}
            placeholder="Shift timing, hub, or anything your team should remember"
          />
        </label>
      </section>

      {readOnly ? null : (
        <Box className="tokri-coupon-actions">
          <Button variant="contained" type="submit" disabled={loading}>
            {loading ? <Icon icon="Loader" spin /> : null}
            {isNew ? 'Create partner' : 'Save partner'}
          </Button>
        </Box>
      )}
    </Box>
  )
}

export default PartnerEdit
