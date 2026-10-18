import React, { useEffect, useRef, useState } from 'react'
import { Box, Icon, Input, Text } from '@adminjs/design-system'
import {
  RecordsTable,
  useQueryParams,
  useRecords,
  useSelectedRecords,
} from 'adminjs'
import { LocalSelect } from './form-controls.jsx'

const PER_PAGE_OPTIONS = [10, 25, 50]

const CmsList = (props) => {
  const { resource, setTag } = props
  const titleProp = resource.titleProperty?.name || resource.titleProperty?.propertyPath || 'id'

  const { storeParams, filters, parsedQuery } = useQueryParams()
  const {
    records,
    loading,
    direction,
    sortBy,
    page,
    total,
    fetchData,
    perPage,
  } = useRecords(resource.id)
  const {
    selectedRecords,
    handleSelect,
    handleSelectAll,
    setSelectedRecords,
  } = useSelectedRecords(records)

  const [query, setQuery] = useState(() => String(parsedQuery?.q || filters?.[titleProp] || ''))
  const debounceRef = useRef(null)
  const storeParamsRef = useRef(storeParams)
  storeParamsRef.current = storeParams

  useEffect(() => {
    setQuery(String(parsedQuery?.q || filters?.[titleProp] || ''))
    setSelectedRecords([])
  }, [resource.id, titleProp, setSelectedRecords])

  useEffect(() => {
    if (setTag) setTag(total.toString())
  }, [total, setTag])

  const handleQueryChange = (event) => {
    const value = event.target.value
    setQuery(value)

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const trimmed = value.trim()
      storeParamsRef.current({
        page: '1',
        q: trimmed || undefined,
      })
    }, 300)
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const handleActionPerformed = () => fetchData()

  const currentPage = Number(page) || 1
  const rowsPerPage = Number(perPage) || 10
  const totalRows = Number(total) || 0
  const totalPages = Math.max(1, Math.ceil(totalRows / rowsPerPage) || 1)
  const from = totalRows === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1
  const to = Math.min(currentPage * rowsPerPage, totalRows)

  const goToPage = (nextPage) => {
    const safe = Math.min(Math.max(1, nextPage), totalPages)
    storeParams({
      page: String(safe),
      q: parsedQuery?.q || filters?.[titleProp] || undefined,
    })
  }

  const changePerPage = (next) => {
    storeParams({
      page: '1',
      perPage: String(next),
      q: parsedQuery?.q || filters?.[titleProp] || undefined,
    })
  }

  const pageNumbers = []
  const windowSize = 5
  let start = Math.max(1, currentPage - Math.floor(windowSize / 2))
  let end = Math.min(totalPages, start + windowSize - 1)
  start = Math.max(1, end - windowSize + 1)
  for (let number = start; number <= end; number += 1) pageNumbers.push(number)

  return (
    <Box variant="grey">
      <Box mb="lg" style={{ position: 'relative', maxWidth: 420 }}>
        <Box
          style={{
            position: 'absolute',
            top: '50%',
            left: 12,
            transform: 'translateY(-50%)',
            pointerEvents: 'none',
            opacity: 0.6,
          }}
        >
          <Icon icon="Search" />
        </Box>
        <Input
          value={query}
          onChange={handleQueryChange}
          placeholder={`Search all ${resource.name}...`}
          style={{ width: '100%', paddingLeft: 36 }}
        />
      </Box>

      <Box variant="container">
        <RecordsTable
          resource={resource}
          records={records}
          actionPerformed={handleActionPerformed}
          onSelect={handleSelect}
          onSelectAll={handleSelectAll}
          selectedRecords={selectedRecords}
          direction={direction}
          sortBy={sortBy}
          isLoading={loading}
        />

        <div className="tokri-list-pagination">
          <Text className="tokri-list-pagination-summary">
            {totalRows === 0 ? 'No records' : `Showing ${from}–${to} of ${totalRows}`}
          </Text>

          <div className="tokri-list-pagination-size">
            <span>Rows</span>
            <LocalSelect
              value={String(rowsPerPage)}
              options={PER_PAGE_OPTIONS.map((option) => ({
                value: String(option),
                label: String(option),
              }))}
              onChange={(next) => changePerPage(Number(next))}
            />
          </div>

          <div className="tokri-list-pagination-pages">
            <button type="button" disabled={currentPage <= 1} onClick={() => goToPage(currentPage - 1)}>
              Prev
            </button>
            {pageNumbers.map((number) => (
              <button
                type="button"
                key={number}
                className={number === currentPage ? 'is-current' : ''}
                onClick={() => goToPage(number)}
              >
                {number}
              </button>
            ))}
            <button type="button" disabled={currentPage >= totalPages} onClick={() => goToPage(currentPage + 1)}>
              Next
            </button>
          </div>
        </div>
      </Box>
    </Box>
  )
}

export default CmsList
