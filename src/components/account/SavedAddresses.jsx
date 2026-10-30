import { useEffect, useState } from 'react'
import { MoreVertical, Plus } from 'lucide-react'
import { authDelete, authGet, authPost, authPut } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'
import { useAddress } from '../../context/AddressContext'
import AddressFormModal from './AddressFormModal'
import ConfirmModal from '../ConfirmModal'
import { addressLabelIcon } from './addressLabelIcon'

export default function SavedAddresses() {
  const { user } = useAuth()
  const { refreshAddresses } = useAddress()
  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [menuOpenId, setMenuOpenId] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleteTargetId, setDeleteTargetId] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const loadAddresses = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await authGet('/account/addresses', user)
      setAddresses(data.addresses || [])
    } catch (err) {
      setError(err.message || 'Could not load addresses.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAddresses()
  }, [user?.phone])

  useEffect(() => {
    const onClick = () => setMenuOpenId(null)
    document.addEventListener('click', onClick)
    return () => document.removeEventListener('click', onClick)
  }, [])

  const openCreate = () => {
    setEditingAddress(null)
    setFormOpen(true)
  }

  const openEdit = (address) => {
    setEditingAddress(address)
    setFormOpen(true)
    setMenuOpenId(null)
  }

  const handleSave = async (payload) => {
    setSaving(true)
    try {
      if (editingAddress?.id) {
        const data = await authPut(`/account/addresses/${editingAddress.id}`, user, payload)
        setAddresses((prev) => prev.map((item) => (item.id === editingAddress.id ? data.address : item)))
      } else {
        const data = await authPost('/account/addresses', user, payload)
        setAddresses((prev) => [...prev, data.address])
      }
      setFormOpen(false)
      setEditingAddress(null)
    } finally {
      setSaving(false)
    }
  }

  const requestDelete = (addressId) => {
    setMenuOpenId(null)
    setDeleteTargetId(addressId)
  }

  const confirmDelete = async () => {
    if (!deleteTargetId) return
    setDeleting(true)
    try {
      await authDelete(`/account/addresses/${deleteTargetId}`, user)
      setAddresses((prev) => prev.filter((item) => item.id !== deleteTargetId))
      await refreshAddresses()
      setDeleteTargetId(null)
    } catch (err) {
      setError(err.message || 'Could not delete address.')
      setDeleteTargetId(null)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">My addresses</h1>

      <button
        type="button"
        onClick={openCreate}
        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-mint transition hover:text-white"
      >
        <Plus size={16} />
        Add new address
      </button>

      {loading && (
        <div className="mt-8 rounded-xl border border-line bg-panel-2 px-4 py-8 text-center text-sm text-muted">
          Loading your saved addresses...
        </div>
      )}

      {!loading && error && (
        <div className="mt-8 rounded-xl border border-red-800/50 bg-red-950/40 px-4 py-6 text-sm text-red-300">
          {error}
        </div>
      )}

      {!loading && !error && addresses.length === 0 && (
        <div className="mt-8 rounded-xl border border-dashed border-line bg-panel-2 px-6 py-10 text-center">
          <p className="text-base font-semibold text-white">No saved addresses yet</p>
          <p className="mt-2 text-sm text-muted">
            Add a delivery address for early morning fruit orders.
          </p>
          <button
            type="button"
            onClick={openCreate}
            className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-black hover:bg-brand-hover"
          >
            <Plus size={16} />
            Add new address
          </button>
        </div>
      )}

      {!loading && !error && addresses.length > 0 && (
        <ul className="mt-6 divide-y divide-line overflow-visible rounded-xl border border-line bg-panel-2">
          {addresses.map((address, index) => {
            const Icon = addressLabelIcon(address.label)
            const isLast = index === addresses.length - 1
            return (
              <li key={address.id} className="relative flex items-start gap-4 px-4 py-5 sm:px-5">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-panel text-emerald-400">
                  <Icon size={20} />
                </span>

                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-white">{address.label}</p>
                  <p className="mt-1 text-sm leading-6 text-muted">{address.formatted}</p>
                </div>

                <div className="relative shrink-0">
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation()
                      setMenuOpenId((current) => (current === address.id ? null : address.id))
                    }}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted transition hover:bg-panel hover:text-white"
                    aria-label="Address options"
                  >
                    <MoreVertical size={18} />
                  </button>

                  {menuOpenId === address.id && (
                    <div
                      className={`absolute right-0 z-50 w-36 overflow-hidden rounded-xl border border-line bg-panel shadow-lg ${
                        isLast ? 'bottom-full mb-1' : 'top-full mt-1'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => openEdit(address)}
                        className="block w-full px-4 py-2.5 text-left text-sm text-white hover:bg-panel-2"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => requestDelete(address.id)}
                        className="block w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-red-950/40"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {formOpen && (
        <AddressFormModal
          initial={editingAddress}
          defaultPhone={user?.phone || ''}
          defaultName={user?.name || ''}
          saving={saving}
          onClose={() => {
            setFormOpen(false)
            setEditingAddress(null)
          }}
          onSave={handleSave}
        />
      )}

      <ConfirmModal
        open={Boolean(deleteTargetId)}
        message="Are you sure you want to delete this address?"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTargetId(null)}
        loading={deleting}
      />
    </div>
  )
}
