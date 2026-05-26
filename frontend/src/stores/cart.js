import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useCartStore = defineStore('cart', () => {
  const cartItems = ref(JSON.parse(localStorage.getItem('cartItems') || '[]'))
  const mealType = ref(localStorage.getItem('mealType') || 'lunch')
  const orderDate = ref(localStorage.getItem('orderDate') || new Date().toISOString().split('T')[0])

  const totalPrice = computed(() => {
    return cartItems.value.reduce((sum, item) => sum + item.price * item.quantity, 0)
  })

  const totalCount = computed(() => {
    return cartItems.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  function addItem(dish, quantity = 1, remark = '') {
    const existingIndex = cartItems.value.findIndex(item =>
      item.dishId === dish.id &&
      item.taste === (dish.taste || '') &&
      item.spec === (dish.spec || '')
    )
    
    if (existingIndex > -1) {
      cartItems.value[existingIndex].quantity += quantity
    } else {
      cartItems.value.push({
        dishId: dish.id,
        dishName: dish.name,
        price: dish.price,
        image: dish.image,
        quantity,
        remark,
        taste: dish.taste || '',
        spec: dish.spec || ''
      })
    }
    saveCart()
  }

  function updateQuantity(dishId, quantity) {
    const index = cartItems.value.findIndex(item => item.dishId === dishId)
    if (index > -1) {
      if (quantity <= 0) {
        cartItems.value.splice(index, 1)
      } else {
        cartItems.value[index].quantity = quantity
      }
      saveCart()
    }
  }

  function removeItem(dishId) {
    const index = cartItems.value.findIndex(item => item.dishId === dishId)
    if (index > -1) {
      cartItems.value.splice(index, 1)
      saveCart()
    }
  }

  function clearCart() {
    cartItems.value = []
    saveCart()
  }

  function setMealType(type) {
    mealType.value = type
    localStorage.setItem('mealType', type)
  }

  function setOrderDate(date) {
    orderDate.value = date
    localStorage.setItem('orderDate', date)
  }

  function saveCart() {
    localStorage.setItem('cartItems', JSON.stringify(cartItems.value))
  }

  return {
    cartItems,
    mealType,
    orderDate,
    totalPrice,
    totalCount,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    setMealType,
    setOrderDate
  }
})
