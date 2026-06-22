import { ComplaintForm } from "./complaint-form";

export const metadata = {
  title: "Help & Support | Ann Doctor Mattresses",
  description: "Get in touch with us or raise a complaint. We're here to help.",
};

export default function HelpPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl font-montserrat">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Help & Support</h1>
        <p className="mt-4 text-lg text-slate-600 max-w-2xl mx-auto">
          Need assistance with your order or facing an issue with our product? 
          Please fill out the form below and our team will get back to you promptly.
        </p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <div className="mb-8 border-b pb-4">
          <h2 className="text-2xl font-bold text-slate-900">Raise a Complaint</h2>
          <p className="text-sm text-slate-500 mt-1">
            Provide as much detail as possible to help us resolve your issue faster.
          </p>
        </div>
        
        <ComplaintForm />
      </div>
    </div>
  );
}
