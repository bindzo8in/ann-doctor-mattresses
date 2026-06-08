"use client";

import React, { useEffect, useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Edit3, Truck, Calendar, DollarSign, User, Printer } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { formatPrice } from "@/lib/price";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  
  // Pagination State
  const [cursorHistory, setCursorHistory] = useState<(string | null)[]>([null]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Detail Sheet state
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [status, setStatus] = useState("");
  const [courierName, setCourierName] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Branch Assignment state
  const [branches, setBranches] = useState<any[]>([]);
  const [canAssignBranch, setCanAssignBranch] = useState(false);
  const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);

  useEffect(() => {
    import("@/actions/branches").then(module => {
      module.getBranches().then(res => {
        setBranches(res);
        setCanAssignBranch(true);
      }).catch(() => {
        setCanAssignBranch(false); // Likely not a SUPER_ADMIN
      });
    });
  }, []);

  // Print Shipping Label State
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isAssignBranchModalOpen, setIsAssignBranchModalOpen] = useState(false);
  const [printFromName, setPrintFromName] = useState("Ann Doctor Mattresses");
  const [printFromPhone, setPrintFromPhone] = useState("+91 98765 43210");
  const [printFromAddress1, setPrintFromAddress1] = useState("Geographic Hub: South India");
  const [printFromAddress2, setPrintFromAddress2] = useState("Email: support@anndoctor.in");

  const [printToName, setPrintToName] = useState("");
  const [printToPhone, setPrintToPhone] = useState("");
  const [printToAddress1, setPrintToAddress1] = useState("");
  const [printToAddress2, setPrintToAddress2] = useState("");
  const [printToCity, setPrintToCity] = useState("");
  const [printToState, setPrintToState] = useState("");
  const [printToPincode, setPrintToPincode] = useState("");
  const [printNotes, setPrintNotes] = useState("");
  const [printIncludeItems, setPrintIncludeItems] = useState(true);
  const [printLabelType, setPrintLabelType] = useState("PREPAID");

  // Code 39 Barcode Generator (returns SVG string representation)
  const generateBarcodeSVG = (text: string) => {
    const alphabet: Record<string, string> = {
      '0': '101001101101', '1': '110100101011', '2': '101100101011', '3': '110110010101',
      '4': '101001101011', '5': '110100110101', '6': '101100110101', '7': '101001011011',
      '8': '110100101101', '9': '101100101101', 'A': '110101001011', 'B': '101101001011',
      'C': '110110100101', 'D': '101011001011', 'E': '110101100101', 'F': '101101100101',
      'G': '101010011011', 'H': '110101001101', 'I': '101101001101', 'J': '101011001101',
      'K': '110101010011', 'L': '101101010011', 'M': '110110101001', 'N': '101011010011',
      'O': '110101101001', 'P': '101101101001', 'Q': '101010110011', 'R': '110101011001',
      'S': '101101011001', 'T': '101011011001', 'U': '110010101011', 'V': '100110101011',
      'W': '110011010101', 'X': '100101101011', 'Y': '110010110101', 'Z': '100110110101',
      '-': '100101011011', '.': '110010101101', ' ': '100110101101', '*': '100101101101',
      '$': '100100100101', '/': '100100101002', '+': '100101001002', '%': '101001001002'
    };
    
    const cleanText = `*${text.toUpperCase()}*`;
    let result = '';
    for (let i = 0; i < cleanText.length; i++) {
      const char = cleanText[i];
      const pattern = alphabet[char] || alphabet[' '];
      result += pattern + '0';
    }
    
    const barWidth = 2;
    const barHeight = 60;
    let x = 10;
    let rects = '';
    for (let i = 0; i < result.length; i++) {
      if (result[i] === '1') {
        rects += `<rect x="${x}" y="5" width="${barWidth}" height="${barHeight}" fill="black" />`;
      }
      x += barWidth;
    }
    
    const width = x + 10;
    return `
      <svg width="100%" height="90" viewBox="0 0 ${width} 90" xmlns="http://www.w3.org/2000/svg">
        ${rects}
        <text x="${width / 2}" y="82" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle" fill="black">${text.toUpperCase()}</text>
      </svg>
    `;
  };

  const handlePrintLabel = () => {
    if (!selectedOrder) return;

    const barcodeSvgString = generateBarcodeSVG(selectedOrder.orderNumber);

    const printWindow = window.open("", "_blank", "width=600,height=800");
    if (!printWindow) {
      toast.error("Popup blocked! Please allow popups for this site to print.");
      return;
    }

    // Build items list HTML
    let itemsHtml = "";
    if (printIncludeItems && selectedOrder.items && selectedOrder.items.length > 0) {
      itemsHtml = `
        <div class="items-section">
          <div class="section-title">Package Contents (Items)</div>
          <table class="items-table">
            <thead>
              <tr>
                <th style="width: 80%;">Item Description</th>
                <th style="width: 20%; text-align: right;">Qty</th>
              </tr>
            </thead>
            <tbody>
              ${selectedOrder.items.slice(0, 3).map((item: any) => {
                const isBogo = item.quantityFree > 0;
                const qtyText = isBogo 
                  ? `${item.quantity} total <span style="font-size: 8px; font-weight: normal;">(${item.quantityPurchased} Paid + ${item.quantityFree} Free)</span>`
                  : `${item.quantity}`;
                return `
                  <tr>
                    <td>
                      <strong>${item.productName}</strong>
                      ${isBogo ? '<div style="font-size: 8px; font-weight: bold; color: #000;">* BOGO Applied</div>' : ''}
                    </td>
                    <td style="text-align: right; font-weight: bold;">${qtyText}</td>
                  </tr>
                `;
              }).join("")}
              ${selectedOrder.items.length > 3 ? `
                <tr>
                  <td colspan="2" style="text-align: center; font-style: italic; padding-top: 4px; font-weight: bold;">
                    + ${selectedOrder.items.length - 3} more items (See Invoice)
                  </td>
                </tr>
              ` : ""}
            </tbody>
          </table>
        </div>
      `;
    }

    let notesHtml = "";
    if (printNotes) {
      notesHtml = `
        <div class="notes-section">
          <strong>Delivery Notes/Instructions:</strong> ${printNotes}
        </div>
      `;
    }

    printWindow.document.head.innerHTML = `
      <title>Shipping Label - ${selectedOrder.orderNumber}</title>
      <style>
        @page {
          size: 4in 6in;
          margin: 0;
        }
        html, body {
          margin: 0;
          padding: 0;
          width: 4in;
          height: 6in;
          box-sizing: border-box;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
          background-color: #fff;
          color: #000;
        }
        .label-container {
          border: 3px solid #000;
          width: 4in;
          height: 6in;
          box-sizing: border-box;
          padding: 8px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .header {
          border-bottom: 2px solid #000;
          padding-bottom: 4px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .logo {
          font-weight: 900;
          font-size: 11px;
          letter-spacing: 0.5px;
          text-transform: uppercase;
        }
        .badge {
          border: 2px solid #000;
          padding: 2px 6px;
          font-weight: 900;
          font-size: 11px;
          text-transform: uppercase;
          background-color: #000;
          color: #fff;
        }
        .barcode-section {
          border-bottom: 2px solid #000;
          padding: 4px 0;
          text-align: center;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .barcode-svg {
          max-height: 60px;
          width: 90%;
        }
        .addresses {
          flex-grow: 1;
          display: flex;
          flex-direction: column;
        }
        .section-title {
          font-size: 8px;
          text-transform: uppercase;
          font-weight: 900;
          color: #000;
          margin-bottom: 2px;
          letter-spacing: 0.5px;
          border-bottom: 1px solid #000;
          width: fit-content;
          padding-bottom: 1px;
        }
        .from-section {
          border-bottom: 1px dashed #000;
          padding: 4px 0;
          font-size: 9px;
        }
        .to-section {
          padding: 6px 0;
          flex-grow: 1;
        }
        .address-name {
          font-size: 12px;
          font-weight: 900;
          margin-bottom: 2px;
          text-transform: uppercase;
        }
        .address-details {
          font-size: 10px;
          font-weight: 500;
          line-height: 1.3;
        }
        .address-phone {
          font-size: 11px;
          font-weight: 900;
          margin-top: 4px;
          border: 1.5px solid #000;
          display: inline-block;
          padding: 1px 6px;
          text-transform: uppercase;
        }
        .items-section {
          border-top: 2px solid #000;
          padding-top: 4px;
          font-size: 8px;
        }
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 2px;
        }
        .items-table th {
          border-bottom: 1px solid #000;
          text-align: left;
          font-weight: 900;
          font-size: 8px;
          text-transform: uppercase;
        }
        .items-table td {
          padding: 2px 0;
          vertical-align: top;
          font-size: 8px;
          border-bottom: 0.5px solid #eee;
        }
        .notes-section {
          border-top: 1.5px solid #000;
          padding-top: 3px;
          font-size: 7.5px;
          margin-top: 4px;
          line-height: 1.2;
        }
      </style>
    `;

    printWindow.document.body.innerHTML = `
      <div class="label-container">
        <div class="header">
          <div class="logo">Ann Doctor Mattresses</div>
          <div class="badge">${printLabelType}</div>
        </div>
        
        <div class="barcode-section">
          <div class="barcode-svg">
            ${barcodeSvgString}
          </div>
        </div>
        
        <div class="addresses">
          <div class="from-section">
            <div class="section-title">Sender (From)</div>
            <div class="address-name">${printFromName}</div>
            <div class="address-details">
              ${printFromAddress1}${printFromAddress2 ? ", " + printFromAddress2 : ""}
              ${printFromPhone ? "<br/>Phone: " + printFromPhone : ""}
            </div>
          </div>
          
          <div class="to-section">
            <div class="section-title">Ship To (Recipient)</div>
            <div class="address-name">${printToName}</div>
            <div class="address-details">
              ${printToAddress1}
              ${printToAddress2 ? "<br/>" + printToAddress2 : ""}
              <br/>
              <strong style="font-size: 11px;">${printToCity.toUpperCase()}, ${printToState.toUpperCase()} - ${printToPincode}</strong>
            </div>
            <div class="address-phone">Phone: ${printToPhone}</div>
          </div>
        </div>
        
        ${itemsHtml}
        ${notesHtml}
      </div>
    `;

    printWindow.setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);

    setIsPrintModalOpen(false);
  };

  const fetchOrders = (cursor: string | null = null) => {
    setIsLoading(true);
    
    const url = cursor 
      ? `/api/admin/orders?cursor=${cursor}&limit=10` 
      : "/api/admin/orders?limit=10";

    fetch(url, { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (data.orders) {
          setOrders(data.orders);
          setNextCursor(data.nextCursor || null);
        } else {
          setOrders(Array.isArray(data) ? data : []);
          setNextCursor(null);
        }
      })
      .catch(err => {
        console.error(err);
        toast.error("Failed to load orders");
      })
      .finally(() => {
        setIsLoading(false);
        setIsLoadingMore(false);
      });
  };

  const handleNextPage = () => {
    if (!nextCursor) return;
    const nextHistory = [...cursorHistory.slice(0, currentIndex + 1), nextCursor];
    setCursorHistory(nextHistory);
    setCurrentIndex(currentIndex + 1);
    fetchOrders(nextCursor);
  };

  const handlePrevPage = () => {
    if (currentIndex <= 0) return;
    const prevIndex = currentIndex - 1;
    setCurrentIndex(prevIndex);
    fetchOrders(cursorHistory[prevIndex]);
  };

  useEffect(() => {
    fetchOrders(null);
  }, []);

  const handleOpenSheet = (order: any) => {
    setSelectedOrder(order);
    setStatus(order.status);
    setCourierName(order.courierName || "");
    setTrackingNumber(order.trackingNumber || "");
    setTrackingUrl(order.trackingUrl || "");
    setSelectedBranchId(order.branchId || null);

    // Default print label setup
    const addr = order.shippingAddress || {};
    setPrintToName(addr.fullName || "");
    setPrintToPhone(addr.phone || "");
    setPrintToAddress1(addr.addressLine1 || "");
    setPrintToAddress2(addr.addressLine2 || "");
    setPrintToCity(addr.city || "");
    setPrintToState(addr.state || "");
    setPrintToPincode(addr.postalCode || "");
    setPrintNotes(order.notes || "");
    setPrintLabelType("PREPAID");
  };

  const handleUpdateOrder = async (e?: React.FormEvent, directStatus?: string) => {
    if (e) e.preventDefault();
    if (!selectedOrder) return;

    const targetStatus = directStatus || status;

    // Validate that order has a branch before moving to assigned or later statuses
    const requiresBranch = ["ASSIGNED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(targetStatus);
    if (requiresBranch && !selectedOrder.branchId) {
      toast.error(`You must assign a branch before changing status to ${targetStatus}`);
      return;
    }

    try {
      setIsUpdating(true);
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: directStatus || status,
          courierName,
          trackingNumber,
          trackingUrl,
        }),
      });

      if (res.ok) {
        toast.success("Order updated successfully");
        fetchOrders(cursorHistory[currentIndex]);
        if (directStatus) {
          setStatus(directStatus);
          setSelectedOrder({ ...selectedOrder, status: directStatus });
        }
      } else {
        toast.error("Failed to update order");
      }
      setSelectedOrder(null);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update order");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAssignBranch = async () => {
    if (!selectedOrder) return;
    try {
      setIsUpdating(true);
      import("@/actions/orders").then(async (module) => {
        await module.assignOrderToBranch(selectedOrder.id, selectedBranchId || null);
        
        // Also automatically update status to ASSIGNED
        if (selectedOrder.status === "PENDING_ASSIGNMENT" && selectedBranchId) {
          await fetch(`/api/admin/orders/${selectedOrder.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "ASSIGNED" }),
          });
        }
        
        toast.success("Branch assigned successfully");
        fetchOrders(cursorHistory[currentIndex]);
        setSelectedOrder(null);
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to assign branch");
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (orderStatus: string) => {
    switch (orderStatus) {
      case "PENDING_PAYMENT":
        return <Badge className="bg-amber-100 text-amber-800 border-amber-200">Pending Payment</Badge>;
      case "PAID":
        return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Paid</Badge>;
      case "PENDING_ASSIGNMENT":
        return <Badge className="bg-orange-100 text-orange-800 border-orange-200">Pending Assignment</Badge>;
      case "ASSIGNED":
        return <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">Assigned</Badge>;
      case "PROCESSING":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Processing</Badge>;
      case "SHIPPED":
        return <Badge className="bg-teal-100 text-teal-800 border-teal-200">Shipped</Badge>;
      case "OUT_FOR_DELIVERY":
        return <Badge className="bg-purple-100 text-purple-800 border-purple-200">Out for Delivery</Badge>;
      case "DELIVERED":
        return <Badge className="bg-slate-900 text-white">Delivered</Badge>;
      case "CANCELLED":
        return <Badge variant="destructive">Cancelled</Badge>;
      case "REFUNDED":
        return <Badge className="bg-rose-100 text-rose-800 border-rose-200">Refunded</Badge>;
      default:
        return <Badge variant="outline">{orderStatus}</Badge>;
    }
  };

  const statusOptions = [
    { label: "Pending Payment", value: "PENDING_PAYMENT" },
    { label: "Paid / Confirmation Pending", value: "PAID" },
    { label: "Pending Branch Assignment", value: "PENDING_ASSIGNMENT" },
    { label: "Branch Assigned", value: "ASSIGNED" },
    { label: "Processing", value: "PROCESSING" },
    { label: "Shipped", value: "SHIPPED" },
    { label: "Out for Delivery", value: "OUT_FOR_DELIVERY" },
    { label: "Delivered", value: "DELIVERED" },
    { label: "Cancelled", value: "CANCELLED" },
    { label: "Refunded", value: "REFUNDED" },
  ];

  const getNextStatusOptions = (currentStatus: string) => {
    switch (currentStatus) {
      case "PENDING_PAYMENT":
        return [
          { value: "PAID", label: "Mark as Paid", variant: "default" },
          { value: "CANCELLED", label: "Cancel Order", variant: "destructive" }
        ];
      case "PAID":
        return [
          { value: "PENDING_ASSIGNMENT", label: "Pending Assignment", variant: "default" },
          { value: "REFUNDED", label: "Refund Order", variant: "destructive" }
        ];
      case "PENDING_ASSIGNMENT":
        return [
          { value: "OPEN_ASSIGN_MODAL", label: "Assign Branch", variant: "default" },
          { value: "CANCELLED", label: "Cancel Order", variant: "destructive" }
        ];
      case "ASSIGNED":
        return [
          { value: "PROCESSING", label: "Start Processing", variant: "default" },
          { value: "CANCELLED", label: "Cancel Order", variant: "destructive" }
        ];
      case "PROCESSING":
        return [
          { value: "SHIPPED", label: "Mark as Shipped", variant: "default" },
          { value: "CANCELLED", label: "Cancel Order", variant: "destructive" }
        ];
      case "SHIPPED":
        return [
          { value: "OUT_FOR_DELIVERY", label: "Out for Delivery", variant: "default" }
        ];
      case "OUT_FOR_DELIVERY":
        return [
          { value: "DELIVERED", label: "Mark as Delivered", variant: "default" }
        ];
      case "DELIVERED":
        return [
          { value: "REFUNDED", label: "Refund Order", variant: "destructive" }
        ];
      case "CANCELLED":
      case "REFUNDED":
        return [];
      default:
        return [];
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="animate-spin w-8 h-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Orders Management</h1>
          <p className="text-sm text-slate-500">Track user payments, assign shipping details, and modify status.</p>
        </div>
        <Button onClick={() => fetchOrders(null)} variant="outline" size="sm">
          Refresh List
        </Button>
      </div>

      <div className="border rounded-2xl overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold text-slate-700">Order ID</TableHead>
              <TableHead className="font-semibold text-slate-700">Customer</TableHead>
              <TableHead className="font-semibold text-slate-700">Date</TableHead>
              <TableHead className="font-semibold text-slate-700">Total Amount</TableHead>
              <TableHead className="font-semibold text-slate-700">Status</TableHead>
              <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No orders found.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id} className="hover:bg-slate-50/50 cursor-pointer" onClick={() => handleOpenSheet(order)}>
                  <TableCell className="font-bold text-slate-900">{order.orderNumber}</TableCell>
                  <TableCell className="text-sm">
                    <div className="font-medium text-slate-800">{order.customer?.name || "Unknown"}</div>
                    <div className="text-slate-400 text-xs">{order.customer?.email}</div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-500">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric"
                    })}
                  </TableCell>
                  <TableCell className="font-semibold text-slate-800">
                    ₹{formatPrice(Number(order.totalAmount))}
                  </TableCell>
                  <TableCell>{getStatusBadge(order.status)}</TableCell>
                  <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                    <Button variant="outline" size="sm" onClick={() => handleOpenSheet(order)} className="gap-1.5">
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevPage}
          disabled={currentIndex === 0 || isLoading}
        >
          Previous
        </Button>
        <div className="text-sm font-medium px-2">Page {currentIndex + 1}</div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextPage}
          disabled={!nextCursor || isLoading}
        >
          Next
        </Button>
      </div>

      {/* Slide-out Order Details & Edit Sheet */}
      <Sheet open={selectedOrder !== null} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <SheetContent className="overflow-y-auto w-full max-w-lg sm:max-w-md bg-white border-l">
          <SheetHeader className="border-b pb-4">
            <SheetTitle className="text-lg font-bold text-slate-900">
              Manage Order: {selectedOrder?.orderNumber}
            </SheetTitle>
            <SheetDescription className="text-xs">
              Update payment validation, delivery status, and tracking coordinates.
            </SheetDescription>
          </SheetHeader>

          {selectedOrder && (
            <form onSubmit={handleUpdateOrder} className="space-y-6 py-4">
              {/* Order Info Stats */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border">
                <div>
                  <div className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
                    <User className="w-3 h-3" /> Customer
                  </div>
                  <div className="font-semibold text-slate-800 text-xs mt-0.5 line-clamp-1">{selectedOrder.customer?.name}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase font-semibold text-slate-400 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> Total Amount
                  </div>
                  <div className="font-semibold text-slate-800 text-xs mt-0.5">₹{formatPrice(Number(selectedOrder.totalAmount))}</div>
                </div>
              </div>

              {/* Order Items Summary */}
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div className="space-y-3 border-t pt-4">
                  <h3 className="text-xs uppercase font-bold text-slate-400">Order Items</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {selectedOrder.items.map((item: any) => {
                      const isBogo = item.quantityFree > 0;
                      return (
                        <div key={item.id} className="text-xs border rounded p-2 bg-slate-50 space-y-1 font-medium">
                          <div className="flex justify-between font-bold text-slate-800">
                            <span>{item.productName}</span>
                            <span>₹{formatPrice(Number(item.totalPaid || (Number(item.price) * item.quantity)))}</span>
                          </div>
                          {isBogo ? (
                            <div className="space-y-0.5 text-slate-600">
                              <div className="flex justify-between text-emerald-600">
                                <span>BOGO: Buy {item.quantityPurchased} Get {item.quantityFree} Free</span>
                                <span>Saved ₹{formatPrice(Number(item.unitPrice * item.quantityFree))}</span>
                              </div>
                              <div>Total Delivered: {item.quantity} units</div>
                            </div>
                          ) : (
                            <div className="text-slate-500">
                              Qty: {item.quantity} @ ₹{formatPrice(Number(item.price))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Status Update UI */}
              <div className="space-y-4">
                <div className="flex justify-between items-center bg-slate-50 p-3 rounded-lg border">
                  <div>
                    <p className="text-[10px] uppercase font-semibold text-slate-500 mb-1">Current Status</p>
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                  {status !== selectedOrder.status && (
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-semibold text-blue-500 mb-1">Proposed Change</p>
                      {getStatusBadge(status)}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">Quick Actions (Next Steps)</label>
                  <div className="flex flex-wrap gap-2">
                    {getNextStatusOptions(selectedOrder.status).length > 0 ? (
                      getNextStatusOptions(selectedOrder.status).map(opt => (
                        <Button
                          key={opt.value}
                          type="button"
                          variant={opt.variant as any || "outline"}
                          size="sm"
                          onClick={() => {
                            if (opt.value === "OPEN_ASSIGN_MODAL") {
                              setIsAssignBranchModalOpen(true);
                            } else {
                              handleUpdateOrder(undefined, opt.value);
                            }
                          }}
                          disabled={isUpdating}
                          className={status === opt.value ? "ring-2 ring-primary ring-offset-1" : ""}
                        >
                          {opt.label}
                        </Button>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500 italic">No quick actions available.</span>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <label className="text-[10px] uppercase font-semibold text-slate-400 mb-1 block">Manual Override</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="flex h-8 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    {statusOptions.map((opt) => {
                      const reqBranch = ["ASSIGNED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(opt.value);
                      const disabled = reqBranch && !selectedOrder.branchId;
                      return (
                        <option key={opt.value} value={opt.value} disabled={disabled}>
                          {opt.label} {disabled ? "(Requires Branch)" : ""}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Courier Tracking Details */}
              <div className="space-y-4 border-t pt-4">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-slate-400" /> Shipping & Tracking
                </h3>
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">Courier Partner Name</label>
                  <Input
                    value={courierName}
                    onChange={(e) => setCourierName(e.target.value)}
                    placeholder="E.g. Delhivery, BlueDart"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">Tracking Number</label>
                  <Input
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="E.g. 1234567890"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-700">Tracking URL</label>
                  <Input
                    type="url"
                    value={trackingUrl}
                    onChange={(e) => setTrackingUrl(e.target.value)}
                    placeholder="https://track.delhivery.com/..."
                  />
                </div>
              </div>

              {/* Shipping Address Summary */}
              {selectedOrder.shippingAddress && (
                <div className="border-t pt-4 text-xs space-y-1 text-slate-600">
                  <div className="font-semibold text-slate-800">Delivery Address:</div>
                  <p className="font-medium">{selectedOrder.shippingAddress.fullName}</p>
                  <p>{selectedOrder.shippingAddress.addressLine1}</p>
                  {selectedOrder.shippingAddress.addressLine2 && <p>{selectedOrder.shippingAddress.addressLine2}</p>}
                  <p>{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.postalCode}</p>
                  <p>Phone: {selectedOrder.shippingAddress.phone}</p>
                </div>
              )}

              {/* Branch Assignment */}
              {canAssignBranch && (
                <div className="border-t pt-4 space-y-3">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                    Branch Assignment
                  </h3>
                  <div className="flex items-center gap-2">
                    <select
                      value={selectedBranchId || selectedOrder.branchId || ""}
                      onChange={(e) => setSelectedBranchId(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-slate-200 bg-white px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="">Unassigned</option>
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                    <Button 
                      type="button" 
                      onClick={handleAssignBranch} 
                      disabled={isUpdating || (selectedBranchId || "") === (selectedOrder.branchId || "")}
                    >
                      Assign
                    </Button>
                  </div>
                </div>
              )}

              {/* Actions Button Panel */}
              <div className="sticky bottom-0 bg-white space-y-2 border-t pt-4 pb-2 z-10 mt-6">
                {["PAID", "PENDING_ASSIGNMENT", "ASSIGNED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(selectedOrder.status) && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsPrintModalOpen(true)}
                    className="w-full gap-2 border-slate-300 hover:bg-slate-50 text-slate-800"
                  >
                    <Printer className="w-4 h-4" /> Print Shipping Label
                  </Button>
                )}

                <Button type="submit" disabled={isUpdating} className="w-full">
                  {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </SheetContent>
      </Sheet>

      {/* Assign Branch Modal */}
      <Dialog open={isAssignBranchModalOpen} onOpenChange={setIsAssignBranchModalOpen}>
        <DialogContent className="sm:max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900">Assign to Branch</DialogTitle>
            <DialogDescription className="text-slate-500">
              Select a branch to handle this order. The status will automatically move to Assigned.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-slate-700">Select Branch</label>
              <select
                value={selectedBranchId || ""}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              >
                <option value="">-- Choose a branch --</option>
                {branches.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <Button 
              className="w-full" 
              onClick={() => {
                if (!selectedBranchId) {
                  toast.error("Please select a branch first");
                  return;
                }
                handleAssignBranch();
                setIsAssignBranchModalOpen(false);
              }}
              disabled={isUpdating || !selectedBranchId}
            >
              {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Confirm Assignment
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Print Shipping Label Modal */}
      <Dialog open={isPrintModalOpen} onOpenChange={setIsPrintModalOpen}>
        <DialogContent className="sm:max-w-4xl w-full p-4 sm:p-6 bg-white overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Printer className="w-5 h-5 text-slate-600" /> Print Shipping Label
            </DialogTitle>
            <DialogDescription className="text-slate-500">
              Customize label details and print a 4" x 6" shipping sticker.
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              {/* Left Column: Label Preview */}
              <div className="border border-slate-200 bg-slate-50 p-4 rounded-xl flex flex-col items-center justify-center">
                <div className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Live Sticker Preview (4" x 6")</div>
                
                {/* Visual Representation of Sticker */}
                <div className="bg-white text-black border-[3px] border-black w-full max-w-[300px] aspect-[2/3] p-3 flex flex-col justify-between overflow-hidden shadow-md font-sans shrink-0">
                  {/* Header */}
                  <div className="border-b-2 border-black pb-1 flex justify-between items-center">
                    <span className="font-extrabold text-[11px] uppercase tracking-wide">Ann Doctor Mattresses</span>
                    <span className="border-2 border-black bg-black text-white text-[10px] px-1.5 py-0.5 font-black uppercase rounded-sm">{printLabelType}</span>
                  </div>

                  {/* Barcode Section */}
                  <div className="border-b-2 border-black py-1 text-center flex justify-center items-center">
                    <div className="w-full max-h-[60px]" dangerouslySetInnerHTML={{ __html: generateBarcodeSVG(selectedOrder.orderNumber) }} />
                  </div>

                  {/* Address Grid */}
                  <div className="flex-grow flex flex-col justify-start py-1 space-y-2">
                    {/* From Address */}
                    <div className="border-b border-dashed border-black pb-1.5">
                      <div className="text-[7px] uppercase font-black tracking-wider text-slate-700">Sender (From)</div>
                      <div className="font-bold text-[9px] truncate">{printFromName}</div>
                      <div className="text-[8px] text-slate-800 leading-normal line-clamp-2">
                        {printFromAddress1}{printFromAddress2 ? ", " + printFromAddress2 : ""}
                        {printFromPhone && ` | Ph: ${printFromPhone}`}
                      </div>
                    </div>

                    {/* To Address */}
                    <div className="flex-grow pb-1">
                      <div className="text-[7px] uppercase font-black tracking-wider text-slate-700">Ship To (Recipient)</div>
                      <div className="font-extrabold text-[12px] uppercase text-black leading-tight line-clamp-1">{printToName}</div>
                      <div className="text-[10px] font-semibold text-black leading-normal line-clamp-2 mt-0.5">
                        {printToAddress1}
                        {printToAddress2 && `, ${printToAddress2}`}
                      </div>
                      <div className="text-[11px] font-black text-black mt-1">
                        {printToCity.toUpperCase()}, {printToState.toUpperCase()} - {printToPincode}
                      </div>
                      {printToPhone && (
                        <div className="mt-1 border border-black font-extrabold text-[10px] px-1.5 py-0.5 w-fit uppercase rounded-sm">
                          Phone: {printToPhone}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Package Items */}
                  {printIncludeItems && selectedOrder.items && selectedOrder.items.length > 0 && (
                    <div className="border-t-2 border-black pt-1">
                      <div className="text-[7px] uppercase font-black tracking-wider text-slate-700">Package Contents</div>
                      <div className="text-[7.5px] max-h-[60px] overflow-hidden space-y-0.5 mt-0.5">
                        {selectedOrder.items.slice(0, 3).map((item: any) => {
                          const isBogo = item.quantityFree > 0;
                          return (
                            <div key={item.id} className="flex justify-between font-bold leading-tight">
                              <span className="truncate pr-1">• {item.productName}</span>
                              <span className="shrink-0">Qty: {item.quantity}{isBogo ? " (BOGO)" : ""}</span>
                            </div>
                          );
                        })}
                        {selectedOrder.items.length > 3 && (
                          <div className="text-center font-bold italic text-[6px] mt-1 text-slate-700">
                            + {selectedOrder.items.length - 3} more items (See Invoice)
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {printNotes && (
                    <div className="border-t border-black pt-1 text-[7px] font-medium leading-normal italic line-clamp-2">
                      <strong>Notes:</strong> {printNotes}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Customization Controls */}
              <div className="space-y-4">
                <div className="bg-slate-50 p-3 rounded-lg border text-xs font-semibold text-slate-700">
                  You can edit the details below to adjust what appears on the printed label. These edits are only used for this print job and won't modify the database record.
                </div>

                <div className="space-y-3 overflow-y-auto max-h-[50vh] pr-1">
                  {/* Sender Settings */}
                  <div className="space-y-2.5 border-b pb-3">
                    <h4 className="text-xs uppercase font-bold text-slate-500">Sender Details (From)</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600">Company Name</label>
                        <Input value={printFromName} onChange={(e) => setPrintFromName(e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600">Contact Phone</label>
                        <Input value={printFromPhone} onChange={(e) => setPrintFromPhone(e.target.value)} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600">Address Line 1</label>
                        <Input value={printFromAddress1} onChange={(e) => setPrintFromAddress1(e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600">Address Line 2</label>
                        <Input value={printFromAddress2} onChange={(e) => setPrintFromAddress2(e.target.value)} />
                      </div>
                    </div>
                  </div>

                  {/* Recipient Settings */}
                  <div className="space-y-2.5 border-b pb-3">
                    <h4 className="text-xs uppercase font-bold text-slate-500">Recipient Details (To)</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600">Customer Name</label>
                        <Input value={printToName} onChange={(e) => setPrintToName(e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600">Customer Phone</label>
                        <Input value={printToPhone} onChange={(e) => setPrintToPhone(e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600">Address Line 1</label>
                      <Input value={printToAddress1} onChange={(e) => setPrintToAddress1(e.target.value)} />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600">Address Line 2</label>
                      <Input value={printToAddress2} onChange={(e) => setPrintToAddress2(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600">City</label>
                        <Input value={printToCity} onChange={(e) => setPrintToCity(e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600">State</label>
                        <Input value={printToState} onChange={(e) => setPrintToState(e.target.value)} />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600">Pincode</label>
                        <Input value={printToPincode} onChange={(e) => setPrintToPincode(e.target.value)} />
                      </div>
                    </div>
                  </div>

                  {/* General Configuration */}
                  <div className="space-y-3 pt-1">
                    <h4 className="text-xs uppercase font-bold text-slate-500">Sticker Options</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-600">Label Payment Badge</label>
                        <select
                          value={printLabelType}
                          onChange={(e) => setPrintLabelType(e.target.value)}
                          className="flex h-8 w-full rounded-md border border-input bg-transparent px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                        >
                          <option value="PREPAID">Prepaid</option>
                          <option value="COD">COD</option>
                        </select>
                      </div>
                      <div className="flex items-center gap-2 h-full pt-4">
                        <Checkbox
                          id="includeItems"
                          checked={printIncludeItems}
                          onCheckedChange={(checked) => setPrintIncludeItems(!!checked)}
                        />
                        <label htmlFor="includeItems" className="text-xs font-semibold text-slate-700 cursor-pointer select-none">
                          Include package items list
                        </label>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-600">Delivery Notes / Instructions</label>
                      <Input value={printNotes} onChange={(e) => setPrintNotes(e.target.value)} placeholder="E.g. Handle with care" />
                    </div>
                  </div>
                </div>

                {/* Print Dialog Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" className="flex-1" onClick={() => setIsPrintModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="flex-1 gap-2" onClick={handlePrintLabel}>
                    <Printer className="w-4 h-4" /> Print Label
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
