
import toast from "react-hot-toast";
import { FC, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Order, OrderStatus, readOrders, updateOrder } from "../models/Order";
import { useAppDispatch } from "../redux/hooks";
import {
  addItemsToCart,
  setCartState,
} from "../redux/features/cartSlice";

const statuses: OrderStatus[] = [
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered",
];

const returnStatuses = ["Requested", "Approved", "Completed"] as const;

const returnReasons = [
  "Damaged product",
  "Wrong product received",
  "Product not as described",
  "Changed my mind",
  "Other",
];

const Orders: FC = () => {
  const dispatch = useAppDispatch();
  const location = useLocation();

  const [orders, setOrders] = useState<Order[]>(readOrders);
  const [activeReturnOrder, setActiveReturnOrder] = useState<string | null>(null);
  const [selectedReason, setSelectedReason] = useState(returnReasons[0]);

  const placedOrderId = new URLSearchParams(location.search).get("placed");

  const refreshOrders = () => setOrders(readOrders());

  // One-Tap Reorder
  const reorderOrder = (order: Order) => {
    dispatch(addItemsToCart(order.items));
    dispatch(setCartState(true));
    toast.success("Your previous order has been added to the cart!");
  };

  // Order Timeline
  const advanceStatus = (order: Order) => {
    const currentIndex = statuses.indexOf(order.status);
    if (currentIndex < 0 || currentIndex >= statuses.length - 1) return;

    updateOrder(order.id, { status: statuses[currentIndex + 1] });
    refreshOrders();
  };

  // Easy Returns
  const requestReturn = (order: Order) => {
    updateOrder(order.id, {
      returnRequest: {
        reason: selectedReason,
        status: "Requested",
        requestedAt: new Date().toISOString(),
      },
    });

    setActiveReturnOrder(null);
    refreshOrders();
  };

  const advanceReturnStatus = (order: Order) => {
    if (!order.returnRequest) return;

    const currentIndex = returnStatuses.indexOf(order.returnRequest.status);
    if (currentIndex < 0 || currentIndex >= returnStatuses.length - 1) return;

    updateOrder(order.id, {
      returnRequest: {
        ...order.returnRequest,
        status: returnStatuses[currentIndex + 1],
      },
    });

    refreshOrders();
  };

  return (
    <main className="container mx-auto min-h-[70vh] max-w-5xl px-4 py-10 font-karla dark:text-white">
      {placedOrderId && (
        <section className="mb-8 rounded-xl border border-green-200 bg-green-50 p-5 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100">
          <p className="text-sm font-bold uppercase tracking-wide">Order placed successfully</p>
          <h1 className="mt-1 text-2xl font-bold">Thank you for your order!</h1>
          <p className="mt-2">Your demo order number is <strong>{placedOrderId}</strong>.</p>
          <p className="mt-1 text-sm">This is a prototype. No real payment or delivery has been arranged.</p>
        </section>
      )}

      <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">Your purchases</p>
          <h1 className="mt-1 text-3xl font-bold md:text-4xl">Order history</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Track your demo orders and their progress.</p>
        </div>
        <Link to="/products" className="rounded-lg bg-blue-600 px-4 py-2 font-bold text-white hover:bg-blue-700">
          Continue shopping
        </Link>
      </div>

      {orders.length === 0 ? (
        <section className="rounded-xl border border-dashed border-gray-300 p-10 text-center dark:border-slate-600">
          <h2 className="text-xl font-bold">No orders yet</h2>
          <p className="mt-2 text-gray-600 dark:text-gray-300">Your completed demo purchases will appear here.</p>
          <Link to="/products" className="mt-5 inline-block font-bold text-blue-600 hover:underline">
            Explore products
          </Link>
        </section>
      ) : (
        <div className="space-y-5">
          {orders.map((order) => {
            const currentIndex = Math.max(0, statuses.indexOf(order.status));

            return (
              <article key={order.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-600 dark:bg-slate-800">
                <div className="flex flex-wrap justify-between gap-3 border-b border-gray-100 pb-4 dark:border-slate-600">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-300">Order ID</p>
                    <h2 className="font-bold">{order.id}</h2>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-300">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-800">
                      {order.status}
                    </span>
                    <p className="mt-2 text-lg font-bold">${order.total.toFixed(2)}</p>
                  </div>
                </div>

                <section className="mt-5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold">Order tracking</h3>
                    <span className="text-xs text-amber-600 dark:text-amber-400">Demo tracking</span>
                  </div>

                  <div className="mt-5 grid grid-cols-4 gap-1">
                    {statuses.map((status, index) => {
                      const completed = index <= currentIndex;

                      return (
                        <div key={status} className="text-center">
                          <div className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                            completed
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200 text-gray-500 dark:bg-slate-600 dark:text-gray-300"
                          }`}>
                            {completed ? "✓" : index + 1}
                          </div>
                          <p className={`mt-2 text-xs font-semibold ${
                            completed ? "text-blue-600 dark:text-blue-400" : "text-gray-400"
                          }`}>
                            {status}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-slate-600">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all duration-500"
                      style={{ width: `${(currentIndex / (statuses.length - 1)) * 100}%` }}
                    />
                  </div>

                  {currentIndex < statuses.length - 1 ? (
                    <button
                      onClick={() => advanceStatus(order)}
                      className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
                    >
                      Advance demo status →
                    </button>
                  ) : (
                    <p className="mt-4 text-sm font-semibold text-green-600">
                      ✓ Order delivered successfully
                    </p>
                  )}
                </section>

                <div className="mt-5 space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <img src={item.thumbnail} alt={item.title} className="h-12 w-12 rounded bg-gray-100 object-contain" />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold">{item.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-300">
                          Quantity: {item.quantity ?? 1}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 border-t border-gray-100 pt-3 text-sm text-gray-600 dark:border-slate-600 dark:text-gray-300">
                  Delivering to: {order.customer.address}, {order.customer.city} {order.customer.postalCode}
                  <br />
                  Payment: {order.customer.paymentMethod}
                </div>

                {/* One-Tap Reorder Button */}
                <div className="mt-4">
                  <button
                    onClick={() => reorderOrder(order)}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
                  >
                    ↻ Reorder
                  </button>
                </div>

                <section className="mt-5 border-t border-gray-100 pt-4 dark:border-slate-600">
                  <h3 className="font-bold">Easy Returns</h3>

                  {order.returnRequest ? (
                    <div className="mt-3 rounded-lg bg-blue-50 p-4 dark:bg-slate-700">
                      <p className="font-semibold text-blue-800 dark:text-blue-200">
                        Return {order.returnRequest.status}
                      </p>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                        Reason: {order.returnRequest.reason}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-300">
                        Requested: {new Date(order.returnRequest.requestedAt).toLocaleString()}
                      </p>

                      {order.returnRequest.status !== "Completed" && (
                        <button
                          onClick={() => advanceReturnStatus(order)}
                          className="mt-3 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
                        >
                          Advance demo return status →
                        </button>
                      )}

                      {order.returnRequest.status === "Completed" && (
                        <p className="mt-3 text-sm font-semibold text-green-600">
                          ✓ Return completed
                        </p>
                      )}
                    </div>
                  ) : order.status === "Delivered" ? (
                    <div className="mt-3">
                      {activeReturnOrder === order.id ? (
                        <div className="space-y-3">
                          <label className="block text-sm font-medium">
                            Why are you returning this product?
                          </label>
                          <select
                            value={selectedReason}
                            onChange={(event) => setSelectedReason(event.target.value)}
                            className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-800 dark:border-slate-500 dark:bg-slate-700 dark:text-white"
                          >
                            {returnReasons.map((reason) => (
                              <option key={reason} value={reason}>{reason}</option>
                            ))}
                          </select>
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => requestReturn(order)}
                              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700"
                            >
                              Submit return request
                            </button>
                            <button
                              onClick={() => setActiveReturnOrder(null)}
                              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold dark:border-slate-500"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setSelectedReason(returnReasons[0]);
                            setActiveReturnOrder(order.id);
                          }}
                          className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-bold text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700"
                        >
                          Request a return
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-300">
                      Returns become available after delivery.
                    </p>
                  )}

                  <p className="mt-3 text-xs text-gray-400">
                    Demo return workflow. No real return pickup or refund is arranged.
                  </p>
                </section>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
};

export default Orders;
