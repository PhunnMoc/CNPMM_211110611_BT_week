import { useCallback } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../store'
import { 
  useGetOrdersQuery,
  useGetOrderByIdQuery,
  useCreateOrderMutation,
  useUpdateOrderStatusMutation,
  useCancelOrderMutation 
} from '../store/api/api'
import { showToast } from '../utils/toast'
import { useDispatch } from 'react-redux'
import { AppDispatch } from '../store'

export const useOrders = (params: { page?: number; limit?: number } = {}) => {
  const {
    data,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useGetOrdersQuery({
    page: params.page || 1,
    limit: params.limit || 10,
  })

  return {
    orders: data?.orders || [],
    total: data?.total || 0,
    page: data?.page || 1,
    limit: data?.limit || 10,
    totalPages: data?.totalPages || 0,
    isLoading,
    isFetching,
    error,
    refetch,
    hasNextPage: (data?.page || 1) < (data?.totalPages || 0),
    hasPreviousPage: (data?.page || 1) > 1,
  }
}

export const useOrder = (id: number) => {
  const {
    data: order,
    error,
    isLoading,
    refetch,
  } = useGetOrderByIdQuery(id, {
    skip: !id,
  })

  return {
    order,
    isLoading,
    error,
    refetch,
  }
}

export const useOrderActions = () => {
  const dispatch = useDispatch<AppDispatch>()
  const cart = useSelector((state: RootState) => state.cart)!
  
  const [createOrderMutation] = useCreateOrderMutation()
  const [updateStatusMutation] = useUpdateOrderStatusMutation()
  const [cancelOrderMutation] = useCancelOrderMutation()

  const createOrder = useCallback(async (orderData: {
    shipping_address: string
    phone: string
    notes?: string
  }) => {
    try {
      const items = cart.items.map(item => ({
        product_id: item.id,
        quantity: item.quantity,
      }))
      
      const result = await createOrderMutation({
        items,
        ...orderData,
      }).unwrap()
      
      showToast.success('Order created successfully!')
      
      return result
    } catch (error: unknown) {
      const message = (error as any)?.data?.message || 'Failed to create order'
      showToast.error(message)
      throw error
    }
  }, [dispatch, createOrderMutation, cart.items])

  const updateOrderStatus = useCallback(async (orderId: number, status: string) => {
    try {
      const result = await updateStatusMutation({
        id: orderId,
        status,
      }).unwrap()
      
      showToast.success('Order status updated successfully!')
      
      return result
    } catch (error: unknown) {
      const message = (error as any)?.data?.message || 'Failed to update order status'
      showToast.error(message)
      throw error
    }
  }, [dispatch, updateStatusMutation])

  const cancelOrder = useCallback(async (orderId: number) => {
    try {
      const result = await cancelOrderMutation(orderId).unwrap()
      
      showToast.success('Order cancelled successfully!')
      
      return result
    } catch (error: unknown) {
      const message = (error as any)?.data?.message || 'Failed to cancel order'
      showToast.error(message)
      throw error
    }
  }, [dispatch, cancelOrderMutation])

  return {
    createOrder,
    updateOrderStatus,
    cancelOrder,
  }
}

export const useOrderStatus = (orderId: number) => {
  const { order, isLoading, error } = useOrder(orderId)
  
  const statusInfo = {
    isNew: order?.status === 'pending',
    isConfirmed: order?.status === 'confirmed',
    isPreparing: order?.status === 'preparing',
    isShipping: order?.status === 'shipping',
    isDelivered: order?.status === 'delivered',
    isCancelled: order?.status === 'cancelled',
  }
  
  const canCancel = order?.status === 'pending' && 
    new Date().getTime() - new Date(order.created_at).getTime() < 30 * 60 * 1000 // 30 minutes
  
  const statusLabel = {
    pending: 'New Order',
    confirmed: 'Confirmed',
    preparing: 'Preparing',
    shipping: 'Shipping',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
  }[order?.status || 'pending']
  
  const statusColor = {
    pending: 'text-yellow-600',
    confirmed: 'text-blue-600',
    preparing: 'text-orange-600',
    shipping: 'text-purple-600',
    delivered: 'text-green-600',
    cancelled: 'text-red-600',
  }[order?.status || 'pending']
  
  return {
    order,
    isLoading,
    error,
    statusInfo,
    canCancel,
    statusLabel,
    statusColor,
  }
}
