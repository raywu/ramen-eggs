import type { Metadata } from "next";
import Nav from "@/components/Nav";
import OrderForm from "@/components/OrderForm";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Order Form — Asianova Collective",
  description:
    "Place your weekly ramen egg order. Fresh, gluten-free ramen eggs delivered in Oakland & Berkeley, CA.",
};

export default function OrderFormPage() {
  return (
    <>
      <Nav />
      <main className="pt-16">
        <OrderForm />
      </main>
      <Footer />
    </>
  );
}
