import { apiClient } from '@/shared/lib/api-client'

export interface FiscalDocument {
  id: number
  freight_id: number
  type: string
  type_label?: string
  status: string
  status_label?: string
  access_key: string
  protocol_number?: string | null
  has_xml: boolean
  has_pdf: boolean
  authorized_at?: string | null
  cancelled_at?: string | null
  created_at?: string
}

interface FiscalDocumentResponse {
  data: FiscalDocument
  message?: string
}

interface FiscalDocumentListResponse {
  data: FiscalDocument[]
}

export const fiscalApi = {
  async list(freightId: number): Promise<FiscalDocument[]> {
    const { data } = await apiClient.get<FiscalDocumentListResponse>(
      `/freights/${freightId}/fiscal-documents`,
    )
    return data.data
  },

  async emitCte(freightId: number): Promise<FiscalDocument> {
    const { data } = await apiClient.post<FiscalDocumentResponse>(
      `/freights/${freightId}/fiscal-documents/cte`,
    )
    return data.data
  },

  async cancel(freightId: number, documentId: number, reason: string): Promise<FiscalDocument> {
    const { data } = await apiClient.post<FiscalDocumentResponse>(
      `/freights/${freightId}/fiscal-documents/${documentId}/cancel`,
      { reason },
    )
    return data.data
  },

  downloadXmlPath(freightId: number, documentId: number): string {
    return `/freights/${freightId}/fiscal-documents/${documentId}/xml`
  },

  downloadPdfPath(freightId: number, documentId: number): string {
    return `/freights/${freightId}/fiscal-documents/${documentId}/pdf`
  },
}
