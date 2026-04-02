/**
 * HAMZURY Service Agreement Generator
 * Generates professional service agreements for all departments.
 */

export interface AgreementParams {
  clientName: string;
  businessName: string;
  serviceName: string;
  serviceDescription: string;
  price: string;
  deliveryTimeline: string;
  date: string;
  refNumber?: string;
  department?: string;
}

export function generateAgreement(params: AgreementParams): string {
  const { clientName, businessName, serviceName, serviceDescription, price, deliveryTimeline, date, refNumber, department } = params;
  const ref = refNumber || `HMZ-${new Date().getFullYear().toString().slice(-2)}/${new Date().getMonth() + 1}-${String(Math.floor(1000 + Math.random() * 9000))}`;
  const formattedDate = new Date(date).toLocaleDateString("en-NG", { year: "numeric", month: "long", day: "numeric" });
  const deptAccount = department === "bizdoc"
    ? { bank: "Moniepoint", name: "BIZDOC LTD", number: "8067149356" }
    : { bank: "Moniepoint", name: "Hamzury Ltd.", number: "8034620520" };

  return `SERVICE AGREEMENT
Reference: ${ref}
Date: ${formattedDate}

HAMZURY INNOVATION HUB
3rd Floor, Plan Aid Academy, Kado, Abuja, Nigeria
Phone: +234 803 462 0520 | Email: info@hamzury.com | Web: hamzury.com

CLIENT
Name: ${clientName}
Business: ${businessName}

1. SERVICE SCOPE
Service: ${serviceName}
Description: ${serviceDescription}
Any work outside this scope will be quoted separately.

2. DELIVERY TIMELINE
Expected: ${deliveryTimeline}
If the Client delays providing required information, the timeline extends by the same number of days.

3. PAYMENT
Total Fee: ${price}
Payment: 70% deposit before work begins, 30% balance on delivery.
Bank: ${deptAccount.bank}
Account Name: ${deptAccount.name}
Account Number: ${deptAccount.number}
Work begins only after deposit is confirmed.

4. CLIENT RESPONSIBILITIES
- Provide all necessary documents and information promptly
- Respond to requests within 48 hours
- Confirm receipt of deliverables
- Inform HAMZURY immediately of any changes to requirements
- Ensure all provided documents are accurate

5. REVISIONS
Two (2) rounds of revisions are included. Additional revisions are charged at standard rate. Major scope changes are quoted separately.

6. CANCELLATION
- Within 24 hours of agreement: 50% refund of deposit
- After work begins: No refund
- After delivery: No refund

7. CONFIDENTIALITY
Both parties keep confidential any proprietary information shared. HAMZURY may reference the Client as a past client with permission.

8. LIABILITY
HAMZURY's liability is limited to fees paid. HAMZURY is not liable for business outcomes, regulatory changes, or delays by third parties (government agencies, etc.).

9. INTELLECTUAL PROPERTY
Upon full payment, custom work becomes Client property. HAMZURY retains rights to templates and methodologies used.

10. DISPUTE RESOLUTION
Disputes are handled through good-faith discussion first (7 days), then written notice, then mediation. Governed by laws of the Federal Republic of Nigeria.

SIGNATURES

For the Client:
Name: ___________________________  Date: _______________
Signature: _______________________

For HAMZURY Innovation Hub:
Name: ___________________________  Date: _______________
Signature: _______________________  Position: ____________

Reference: ${ref}
`;
}
