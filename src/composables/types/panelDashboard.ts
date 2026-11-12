import type { OrderListItem } from './order'

export interface PanelAgent {
  id: number
  firstname: string | null
  lastname: string | null
  email: string | null
  phone: string | null
}

export interface PanelAgentResponse {
  unit_id: number
  agent: PanelAgent | null
}

export interface PanelTopProduct {
  product_id: number
  name: string
  indeks: string | null
  image: string | null
  price: string | null
  ordered_quantity: number
}

export interface PanelDashboardResponse {
  unit_id: number
  agent: PanelAgent | null
  orders_available: boolean
  orders_last_month: number
  orders_last_year: number
  cart_products_count: number
  latest_orders: OrderListItem[]
  recent_orders: OrderListItem[]
  top_products: PanelTopProduct[]
}
