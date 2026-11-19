import { FC, FormEvent, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "../redux/hooks";
import { emptyCart } from "../redux/features/cartSlice";
import { Order, CustomerDetails, saveOrder } from "../models/Order";

const Checkout: FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const items = useAppSelector((state) => state.cartReducer.cartItems);
  const username = useAppSelector((state) => state.authReducer.username);
  const total = useMemo(
    () =>
      items.reduce((sum, item) => {
        const discountedPrice =
          item.price * (1 - (item.discountPercentage ?? 0) / 100);
        return sum + discountedPrice * (item.quantity ?? 1);
      }, 0),
    [items]
  );

  const [details, setDetails] = useState<CustomerDetails>({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    paymentMethod: "Cash on delivery",
  });

  const updateField = (field: keyof CustomerDetails, value: string) => {
    setDetails((current) => ({ ...current, [field]: value }));
  };

  const placeOrder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (items.length === 0) {
      toast.error("Your cart is empty.");
      navigate("/products");
      return;
    }

    const order: Order = {
      id: `SHP-${Date.now().toString().slice(-8)}`,
      username,
      createdAt: new Date().toISOString(),
      status: "Confirmed",
      customer: details,
      items: items.map((item) => ({ ...item })),
      total,
    };

    saveOrder(order);
    dispatch(emptyCart());
    toast.success("Your demo order has been placed!");
    navigate(`/orders?placed=${encodeURIComponent(order.id)}`);
  };

  if (items.length === 0) {
    return (
      <main className="container mx-auto min-h-[65vh] max-w-4xl px-4 py-12 dark:text-white">
        <h1 className="text-3xl font-bold mb-3">Your cart is empty</h1>
        <p className="mb-6">Add some products before proceeding to checkout.</p>
        <Link className="inline-block rounded bg-blue-600 px-5 py-3 font-bold text-white hover:bg-blue-700" to="/products">
          Browse products
        </Link>
      </main>
    );
  }

  const fieldClass =
    "mt-1 w-full rounded border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";

  return (
    <main className="container mx-auto min-h-[75vh] max-w-6xl px-4 py-8 font-karla dark:text-white">
      <div className="mb-7">
        <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">Shopify demo store</p>
        <h1 className="mt-1 text-3xl font-bold md:text-4xl">Checkout</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-300">Enter your delivery details and review your order.</p>
      </div>

      <form onSubmit={placeOrder} className="grid gap-8 lg:grid-cols-[1.4fr_0.9fr]">
        <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-600 dark:bg-slate-800 md:p-7">
          <h2 className="mb-5 text-xl font-bold text-gray-900 dark:text-white">Delivery information</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 sm:col-span-2">
              Full name
              <input className={fieldClass} required minLength={2} autoComplete="name" value={details.fullName} onChange={(e) => updateField("fullName", e.target.value)} placeholder="Your full name" />
            </label>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Email address
              <input className={fieldClass} type="email" required autoComplete="email" value={details.email} onChange={(e) => updateField("email", e.target.value)} placeholder="you@example.com" />
            </label>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Phone number
              <input className={fieldClass} type="tel" required pattern="[0-9+\-\s()]{7,20}" autoComplete="tel" value={details.phone} onChange={(e) => updateField("phone", e.target.value)} placeholder="Phone number" />
            </label>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200 sm:col-span-2">
              Street address
              <textarea className={fieldClass} required minLength={5} rows={3} autoComplete="street-address" value={details.address} onChange={(e) => updateField("address", e.target.value)} placeholder="House number, street and area" />
            </label>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              City
              <input className={fieldClass} required autoComplete="address-level2" value={details.city} onChange={(e) => updateField("city", e.target.value)} placeholder="City" />
            </label>
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
              Postal code
              <input className={fieldClass} required pattern="[A-Za-z0-9\s-]{4,10}" autoComplete="postal-code" value={details.postalCode} onChange={(e) => updateField("postalCode", e.target.value)} placeholder="Postal code" />
            </label>
          </div>

          <h2 className="mb-3 mt-8 text-xl font-bold text-gray-900 dark:text-white">Payment method</h2>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
            Choose a demo payment method
            <select className={fieldClass} value={details.paymentMethod} onChange={(e) => updateField("paymentMethod", e.target.value)}>
              <option>Cash on delivery</option>
              <option>UPI (demo only)</option>
              <option>Credit / debit card (demo only)</option>
            </select>
          </label>
          <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
            Demo checkout only. No payment will be collected and no real shipment will be created.
          </p>
        </section>

        <aside className="h-fit rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-600 dark:bg-slate-800 md:p-7">
          <h2 className="mb-5 text-xl font-bold text-gray-900 dark:text-white">Order summary</h2>
          <div className="space-y-4">
            {items.map((item) => {
              const price = item.price * (1 - (item.discountPercentage ?? 0) / 100);
              return (
                <div key={item.id} className="flex items-center gap-3">
                  <img src={item.thumbnail} alt={item.title} className="h-14 w-14 rounded bg-gray-100 object-contain" />
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-semibold text-gray-900 dark:text-white">{item.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-300">Qty: {item.quantity ?? 1}</p>
                  </div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">${(price * (item.quantity ?? 1)).toFixed(2)}</p>
                </div>
              );
            })}
          </div>
          <div className="my-5 border-t border-gray-200 dark:border-slate-600" />
          <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-white">
            <span>Total</span><span>${total.toFixed(2)}</span>
          </div>
          <button type="submit" className="mt-6 w-full rounded-lg bg-blue-600 px-5 py-3 font-bold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400">
            PLACE DEMO ORDER
          </button>
          <button type="button" onClick={() => navigate(-1)} className="mt-3 w-full rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-50 dark:border-slate-500 dark:text-white dark:hover:bg-slate-700">
            Back
          </button>
        </aside>
      </form>
    </main>
  );
};

export default Checkout;
