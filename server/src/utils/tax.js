export function orderPricesIncludeGst(order) {
  const expectedTotal =
    Number(order.itemsTotal || 0) +
    Number(order.deliveryCharge || 0) +
    Number(order.handlingCharge || 0) +
    Number(order.smallCartCharge || 0) -
    Number(order.discount || 0)
  return Math.abs(Number(order.grandTotal || 0) - expectedTotal) < 0.005
}
