import React from 'react'
import { Box, Button, H3, Icon, Text } from '@adminjs/design-system'
import { useNotice, useRecord } from 'adminjs'
import { StatusSwitch, isFlagOn } from './form-controls.jsx'

function FieldError({ error }) {
  if (!error?.message) return null
  return <span className="tokri-field-error">{error.message}</span>
}

const AppReleaseEdit = (props) => {
  const { record: initialRecord, resource } = props
  const addNotice = useNotice()
  const { record, handleChange, submit: handleSubmit, loading } = useRecord(initialRecord, resource.id)
  const params = record?.params || {}
  const errors = record?.errors || {}
  const platform = params.platform || record?.id || 'app'
  const setField = (key, value) => handleChange(key, value)

  const submit = (event) => {
    event.preventDefault()
    handleSubmit()
      .then((response) => {
        const notice = response?.data?.notice
        if (notice) addNotice(notice)
      })
      .catch((error) => {
        addNotice({ message: error.message || 'Could not save the app update rule', type: 'error' })
      })
  }

  return (
    <Box as="form" onSubmit={submit} className="tokri-coupon-form">
      <Box className="tokri-coupon-hero">
        <H3 color="white">{platform === 'ios' ? 'iPhone' : 'Android'} update</H3>
        <Text color="white">
          Leave this off until the new app is actually available in the store. Raising the minimum
          before that sends people to a store page with nothing to download.
        </Text>
      </Box>

      <section className="tokri-coupon-card">
        <h4>Turn this platform on</h4>
        <p>Off means the app opens normally, even if the numbers below are filled in.</p>
        <StatusSwitch
          checked={isFlagOn(params.enabled)}
          onLabel="On"
          offLabel="Off"
          title={isFlagOn(params.enabled) ? 'Checking versions' : 'Not checking'}
          hint={isFlagOn(params.enabled) ? 'The app will read these rules' : 'No update screen is shown'}
          onChange={(next) => setField('enabled', next)}
        />
      </section>

      <section className="tokri-coupon-card">
        <h4>Build numbers</h4>
        <p>Use the build number, not the name 1.0.3. Android calls it version code. iPhone uses the build number.</p>
        <div className="tokri-coupon-two">
          <label className="tokri-coupon-label">
            Latest build
            <input
              className="tokri-coupon-input"
              inputMode="numeric"
              value={params.latestBuild ?? 0}
              onChange={(event) => setField('latestBuild', event.target.value)}
            />
            <span className="tokri-field-hint">Older builds see Update and Not now.</span>
            <FieldError error={errors.latestBuild} />
          </label>
          <label className="tokri-coupon-label">
            Minimum build
            <input
              className="tokri-coupon-input"
              inputMode="numeric"
              value={params.minimumBuild ?? 0}
              onChange={(event) => setField('minimumBuild', event.target.value)}
            />
            <span className="tokri-field-hint">Anything older must update. Use 0 while you are not forcing anyone.</span>
            <FieldError error={errors.minimumBuild} />
          </label>
        </div>
        <label className="tokri-coupon-label">
          Blocked builds
          <input
            className="tokri-coupon-input"
            value={params.blockedBuilds || ''}
            onChange={(event) => setField('blockedBuilds', event.target.value)}
            placeholder="7, 9"
          />
          <span className="tokri-field-hint">Only these exact builds are stopped. Other older builds can keep working.</span>
        </label>
        <label className="tokri-coupon-label">
          Ask again after (hours)
          <input
            className="tokri-coupon-input"
            inputMode="numeric"
            value={params.remindAfterHours ?? 24}
            onChange={(event) => setField('remindAfterHours', event.target.value)}
          />
          <span className="tokri-field-hint">After Not now, the soft prompt stays quiet for this long.</span>
          <FieldError error={errors.remindAfterHours} />
        </label>
      </section>

      <section className="tokri-coupon-card">
        <h4>Update message</h4>
        <label className="tokri-coupon-label">
          Title
          <input
            className="tokri-coupon-input"
            value={params.title || ''}
            onChange={(event) => setField('title', event.target.value)}
          />
        </label>
        <label className="tokri-coupon-label">
          Message
          <textarea
            className="tokri-coupon-input"
            rows={3}
            value={params.message || ''}
            onChange={(event) => setField('message', event.target.value)}
          />
        </label>
      </section>

      <section className="tokri-coupon-card">
        <h4>Pause the app</h4>
        <p>Use this for an outage. It does not send anyone to the store.</p>
        <StatusSwitch
          checked={isFlagOn(params.maintenance)}
          onLabel="Paused"
          offLabel="Open"
          title={isFlagOn(params.maintenance) ? 'App is paused' : 'App is open'}
          hint={isFlagOn(params.maintenance) ? 'People see this message instead of the shop' : 'Maintenance screen is hidden'}
          onChange={(next) => setField('maintenance', next)}
        />
        <label className="tokri-coupon-label">
          Pause title
          <input
            className="tokri-coupon-input"
            value={params.maintenanceTitle || ''}
            onChange={(event) => setField('maintenanceTitle', event.target.value)}
          />
        </label>
        <label className="tokri-coupon-label">
          Pause message
          <textarea
            className="tokri-coupon-input"
            rows={3}
            value={params.maintenanceMessage || ''}
            onChange={(event) => setField('maintenanceMessage', event.target.value)}
          />
        </label>
      </section>

      <Box className="tokri-coupon-actions">
        <Button variant="contained" type="submit" disabled={loading}>
          {loading ? <Icon icon="Loader" spin /> : null}
          Save rule
        </Button>
      </Box>
    </Box>
  )
}

export default AppReleaseEdit
