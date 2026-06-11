export default function ReturnPolicyPage() {
  return (
    <main className="py-16 md:py-24">
      <div className="page-container max-w-4xl">
        <h1 className="text-3xl md:text-4xl font-extrabold mb-8">Return Policy</h1>
        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <p>
            We want you to be completely satisfied with your purchase from Ann Doctor Mattresses. If for any reason you are not, our Return Policy is designed to make the process as simple as possible.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8 mb-4">1. Eligibility for Returns</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Products must be returned in their original condition and packaging.</li>
            <li>Returns are accepted within 30 days from the date of delivery.</li>
            <li>Custom-sized mattresses and customized sofas are made to order and are strictly non-returnable unless there is a manufacturing defect.</li>
            <li>Accessories (pillows, protectors) must be unused and in original packaging for hygiene reasons.</li>
          </ul>

          <h2 className="text-xl font-bold text-foreground mt-8 mb-4">2. Return Process</h2>
          <p>
            To initiate a return, please contact our customer support team with your order number and reason for return. Once approved, our logistics partner will pick up the item from your delivery address.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8 mb-4">3. Refunds</h2>
          <p>
            Once we receive and inspect the returned item, we will notify you of the approval or rejection of your refund. Approved refunds will be processed back to your original method of payment within 5-7 business days.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8 mb-4">4. Trial Periods</h2>
          <p>
            If your mattress was purchased under a specific "Trial Period" promotion, please refer to the specific terms and conditions provided at the time of purchase regarding trial returns.
          </p>

          <h2 className="text-xl font-bold text-foreground mt-8 mb-4">5. Manufacturing Defects</h2>
          <p>
            If you discover a manufacturing defect, please reach out to us immediately under our Warranty Policy. We will arrange for an inspection and replace or repair the product at no additional cost.
          </p>
        </div>
      </div>
    </main>
  );
}
